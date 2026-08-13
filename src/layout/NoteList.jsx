import { COLOR_PALETTES } from '../constants/colors';

/* Importation des images générées */
import plusIcon from './icones plus.png';
import trashIcon from './icone trash.png';
import { supabase } from '../lib/supabase';


export default function NoteList({
  notes,
  setNotes,
  selectedId,
  setSelectedId,
  selectedFolder,
  groupTitle,
  onOpenGroupModal,
}) {
  const visibleNotes =
    selectedFolder === 'all'
      ? notes
      : notes.filter((note) => note.folder === 'Notes');

  /* Créer un nouveau groupe */
  const addNote = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    window.alert(
      "Vous devez être connecté pour créer une note."
    );
    return;
  }

  const id = crypto.randomUUID();

  const firstCard = {
    id: crypto.randomUUID(),
    subtitle: 'Untitled',
    text: '',
  };

  const newGroup = {
    id,
    title: 'Untitled',
    text: '',
    color: 'Yellow',
    date: new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    folder: 'Notes',
    cards: [firstCard],
    tables: [],
    links: [],
    images: [],
    isLocked: false,
  };

  /*
   * Création immédiate de la note dans Supabase.
   * La note existe donc dans la base avant d’être affichée.
   */
  const { error } = await supabase
    .from('notes')
    .insert({
      id,
      user_id: user.id,
      title: newGroup.title,
      content: newGroup.text,
      color: newGroup.color,
      folder: newGroup.folder,
      cards: newGroup.cards,
      is_locked: false,
    });

  if (error) {
    console.error('Erreur de création de la note :', error);

    window.alert(
      `La note n'a pas pu être créée : ${error.message}`
    );

    return;
  }

  /*
   * La note est ajoutée à l’interface seulement après
   * sa création réussie dans Supabase.
   */
  setNotes((previousNotes) => [
    newGroup,
    ...previousNotes,
  ]);

  setSelectedId(id);
};

  /* Supprimer le groupe sélectionné */
  const deleteNote = async () => {
    if (!selectedId) return;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', selectedId);

    if (error) {
      window.alert(`La note n'a pas pu être supprimée : ${error.message}`);
      return;
    }

    setNotes((previousNotes) => {
      const nextNotes = previousNotes.filter(
        (note) => note.id !== selectedId
      );

      setSelectedId(
        nextNotes.length > 0
          ? nextNotes[0].id
          : null
      );

      return nextNotes;
    });
  };

  return (
    <div className="note-list">
      <div className="note-list-header">
        {/* Titre de l’espace */}
        <span
          className="note-list-header-title"
          style={{
            cursor: 'pointer',
            flex: 1,
          }}
          onClick={onOpenGroupModal}
          title="Cliquer pour nommer cet espace"
        >
          {groupTitle || 'Today'}
        </span>

        {/* Boutons Ajouter et Supprimer */}
        <div
          className="note-list-header-btns"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Bouton d’ajout */}
          <button
            type="button"
            className="note-header-btn"
            title="Créer un nouveau groupe"
            aria-label="Créer un nouveau groupe"
            onClick={addNote}
            style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              background: 'transparent',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                '#e8e8e8';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                'transparent';
            }}
          >
            <img
              src={plusIcon}
              alt=""
              draggable="false"
              style={{
                width: '32px',
                height: '32px',
                display: 'block',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </button>

          {/* Bouton de suppression */}
          <button
            type="button"
            className="note-header-btn"
            title="Supprimer le groupe"
            aria-label="Supprimer le groupe"
            onClick={deleteNote}
            disabled={!selectedId}
            style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedId
                ? 'pointer'
                : 'not-allowed',
              opacity: selectedId ? 1 : 0.35,
              overflow: 'hidden',
              transition:
                'background 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(event) => {
              if (selectedId) {
                event.currentTarget.style.background =
                  '#ffe5e5';
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                'transparent';
            }}
          >
            <img
              src={trashIcon}
              alt=""
              draggable="false"
              style={{
                width: '32px',
                height: '32px',
                display: 'block',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Liste des groupes */}
      <div id="note-list-body">
        {visibleNotes.map((group) => {
          const palette =
            COLOR_PALETTES[group.color] ||
            COLOR_PALETTES.Yellow;

          const firstCardText =
            group.cards && group.cards.length > 0
              ? group.cards[0].text
              : 'No new text';

          return (
            <div
              key={group.id}
              className={`note-card${
                group.id === selectedId
                  ? ' active'
                  : ''
              }`}
              style={{
                background:
                  group.id === selectedId
                    ? palette.body
                    : '',
              }}
              onClick={() => setSelectedId(group.id)}
            >
              <div className="note-card-title">
                {group.title}
              </div>

              <div className="note-card-info">
                <span className="time">
                  {group.date}
                </span>

                <span className="preview">
                  {firstCardText.slice(0, 18)}
                  {firstCardText.length > 18
                    ? '...'
                    : ''}
                </span>

                <i
                  className="fa-solid fa-droplet status-icon"
                  style={{
                    color: palette.header,
                  }}
                />
              </div>

              <div className="note-card-folder">
                <i className="fa-regular fa-folder" />
                <span>Notes</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
