import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './layout/Sidebar';
import NoteList from './layout/NoteList';
import NoteEditor from './layout/NoteEditor';
import StatusBar from './layout/StatusBar';
import SplashScreen from './layout/SplashScreen';
import AuthPage from './layout/AuthPage';
import { supabase } from './lib/supabase';
import './styles/layout.css';

export const COLOR_PALETTES = {
  Noir: {
    header: '#000000',
    body: '#F2F2F7',
    text: '#FFFFFF',
    darkText: '#000000',
  },
  Red: {
    header: '#FF3B30',
    body: '#FFE5E5',
    text: '#FFFFFF',
    darkText: '#000000',
  },
  Rose: {
    header: '#FF2D55',
    body: '#FFE5EC',
    text: '#FFFFFF',
    darkText: '#000000',
  },
  Orange: {
    header: '#FF9500',
    body: '#FFEFCF',
    text: '#FFFFFF',
    darkText: '#000000',
  },
  Yellow: {
    header: '#FFFF00',
    body: '#FFFDE0',
    text: '#000000',
    darkText: '#000000',
  },
  'Green (Light)': {
    header: '#90EE90',
    body: '#EAFCEF',
    text: '#000000',
    darkText: '#000000',
  },
  Green: {
    header: '#34C759',
    body: '#E6F9EA',
    text: '#FFFFFF',
    darkText: '#000000',
  },
  'Blue (Light)': {
    header: '#ADD8E6',
    body: '#F0FAFF',
    text: '#000000',
    darkText: '#000000',
  },
  Blue: {
    header: '#007AFF',
    body: '#E6F2FF',
    text: '#FFFFFF',
    darkText: '#000000',
  },
  'Blue (Dark)': {
    header: '#000080',
    body: '#E1EFFF',
    text: '#FFFFFF',
    darkText: '#000000',
  },
  Purple: {
    header: '#800080',
    body: '#F7EFFF',
    text: '#FFFFFF',
    darkText: '#000000',
  },
};

/*
 * Transforme une note provenant de Supabase
 * dans le format utilisé par l’interface React.
 */
const databaseNoteToAppNote = async (databaseNote) => {
  const storedImages = Array.isArray(databaseNote.images)
    ? databaseNote.images
    : [];

  /*
   * Le bucket est privé : on génère une URL temporaire
   * permettant d’afficher chaque image.
   */
  const images = await Promise.all(
    storedImages.map(async (image) => {
      if (!image.path) {
        return image;
      }

      const { data, error } = await supabase.storage
        .from('note-images')
        .createSignedUrl(image.path, 3600);

      if (error) {
        console.error(
          `Impossible de charger l’image ${image.name} :`,
          error
        );

        return {
          ...image,
          src: '',
        };
      }

      return {
        ...image,
        src: data.signedUrl,
      };
    })
  );

  return {
    id: databaseNote.id,
    title: databaseNote.title || 'Untitled',
    text: databaseNote.content || '',
    color: databaseNote.color || 'Yellow',
    folder: databaseNote.folder || 'Notes',

    cards:
      Array.isArray(databaseNote.cards) &&
      databaseNote.cards.length > 0
        ? databaseNote.cards
        : [
            {
              id: crypto.randomUUID(),
              subtitle: databaseNote.title || 'Untitled',
              text: databaseNote.content || '',
            },
          ],

    isLocked: databaseNote.is_locked || false,
    lockPasswordHash: databaseNote.lock_password_hash || null,
    lockPasswordSalt: databaseNote.lock_password_salt || null,

    tables: Array.isArray(databaseNote.tables)
      ? databaseNote.tables
      : [],

    links: Array.isArray(databaseNote.links)
      ? databaseNote.links
      : [],

    images,

    date: databaseNote.created_at
      ? new Date(databaseNote.created_at).toLocaleTimeString(
          'fr-FR',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        )
      : '',
  };
};

/*
 * Transforme une note de l’interface React
 * dans le format attendu par Supabase.
 */
const appNoteToDatabaseNote = (note, userId) => ({
  id: note.id,
  user_id: userId,
  title: note.title || 'Untitled',
  content: note.text || '',
  color: note.color || 'Yellow',
  folder: note.folder || 'Notes',
  cards: Array.isArray(note.cards) ? note.cards : [],
  is_locked: Boolean(note.isLocked),
  lock_password_hash: note.lockPasswordHash || null,
  lock_password_salt: note.lockPasswordSalt || null,

  tables: Array.isArray(note.tables) ? note.tables : [],
  links: Array.isArray(note.links) ? note.links : [],

  /*
   * On conserve seulement les informations durables.
   * L’URL signée est temporaire et ne doit pas être enregistrée.
   */
  images: Array.isArray(note.images)
    ? note.images
        .filter((image) => image.path)
        .map((image) => ({
          id: image.id,
          name: image.name,
          path: image.path,
        }))
    : [],
});

function App() {
  const [phase, setPhase] = useState('splash');

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  const [selectedId, setSelectedId] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [groupTitle, setGroupTitle] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [tempGroupTitle, setTempGroupTitle] = useState('');

  const saveTimerRef = useRef(null);

  /*
   * Surveille les changements de connexion Supabase.
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      if (!session?.user && phase === 'app') {
        setNotes([]);
        setSelectedId(null);
        setNotesLoaded(false);
        setPhase('auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [phase]);

  /*
   * Charge les notes appartenant à l’utilisateur connecté.
   */
  useEffect(() => {
    if (phase !== 'app' || !user) {
      return;
    }

    let cancelled = false;

    const loadNotes = async () => {
      setNotesLoaded(false);
      setSyncStatus('loading');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error('Erreur de chargement des notes :', error);
        setSyncStatus('error');
        setNotesLoaded(true);
        return;
      }

      const loadedNotes = await Promise.all(
  (data || []).map(databaseNoteToAppNote)
);

      setNotes(loadedNotes);
      setSelectedId(loadedNotes.length > 0 ? loadedNotes[0].id : null);
      setNotesLoaded(true);
      setSyncStatus('saved');
    };

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [phase, user]);

  /*
   * Sauvegarde automatique.
   *
   * La sauvegarde se déclenche 700 millisecondes après
   * la dernière modification d’une note.
   */
  useEffect(() => {
    if (
      phase !== 'app' ||
      !user ||
      !notesLoaded ||
      notes.length === 0
    ) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSyncStatus('saving');

    saveTimerRef.current = setTimeout(async () => {
      const notesToSave = notes.map((note) =>
        appNoteToDatabaseNote(note, user.id)
      );

      const { error } = await supabase
        .from('notes')
        .upsert(notesToSave, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Erreur de sauvegarde des notes :', error);
        setSyncStatus('error');
        return;
      }

      setSyncStatus('saved');
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [notes, notesLoaded, phase, user]);

  /*
   * À la fin du SplashScreen :
   * si une session existe déjà, l’application s’ouvre directement.
   */
  const handleSplashDone = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setUser(session.user);
      setPhase('app');
    } else {
      setPhase('auth');
    }
  };

  /*
   * Appelé par AuthPage après une connexion réussie.
   */
  const handleAuthSuccess = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setPhase('auth');
      return;
    }

    setUser(session.user);
    setPhase('app');
  };

  /*
   * Déconnecte réellement l’utilisateur de Supabase,
   * vide les données locales et retourne à l’écran de connexion.
   */
  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setNotes([]);
      setSelectedId(null);
      setSelectedFolder('all');
      setNotesLoaded(false);
      setSyncStatus('idle');
      setGroupTitle('');
      setIsGroupModalOpen(false);
      setIsSidebarOpen(true);
      setPhase('auth');
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      window.alert(
        error?.message
          ? `Impossible de se déconnecter : ${error.message}`
          : 'Impossible de se déconnecter.'
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSaveGroupTitle = () => {
    if (tempGroupTitle.trim()) {
      setGroupTitle(tempGroupTitle.trim());
    }

    setIsGroupModalOpen(false);
  };

  const openGroupModal = () => {
    setTempGroupTitle(groupTitle);
    setIsGroupModalOpen(true);
  };

  if (phase === 'splash') {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  if (phase === 'auth') {
    return <AuthPage onAuth={handleAuthSuccess} />;
  }

  return (
    <div className="app-container" id="app">
      <div className="main-body">
        <div
          className={`sidebar-shell${
            isSidebarOpen ? '' : ' is-closed'
          }`}
        >
          <Sidebar
            notes={notes}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
          />
        </div>

        {!isSidebarOpen && (
          <button
            type="button"
            className="sidebar-reopen-btn"
            onClick={() => setIsSidebarOpen(true)}
            title="Afficher la barre latérale"
            aria-label="Afficher la barre latérale"
          >
            <i className="fa-solid fa-grip" />
          </button>
        )}

        <NoteList
          notes={notes}
          setNotes={setNotes}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          selectedFolder={selectedFolder}
          groupTitle={groupTitle}
          setGroupTitle={setGroupTitle}
          onOpenGroupModal={openGroupModal}
        />

        <NoteEditor
          notes={notes}
          setNotes={setNotes}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          groupTitle={groupTitle}
          setGroupTitle={setGroupTitle}
          onOpenGroupModal={openGroupModal}
        />

        
      </div>

      <StatusBar />

      {isGroupModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setIsGroupModalOpen(false)}
        >
          <div
            style={{
              background: '#000',
              width: '540px',
              padding: '30px 40px',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Add Title for these notes"
              value={tempGroupTitle}
              onChange={(event) =>
                setTempGroupTitle(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSaveGroupTitle();
                }
              }}
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.6)',
                color: '#fff',
                fontSize: '16px',
                padding: '6px 0',
                outline: 'none',
              }}
            />

            <button
              type="button"
              onClick={handleSaveGroupTitle}
              style={{
                background: '#93b9e9',
                color: '#1a3a60',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 24px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => setIsGroupModalOpen(false)}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 24px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;