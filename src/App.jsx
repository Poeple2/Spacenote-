import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import NoteList from './layout/NoteList';
import NoteEditor from './layout/NoteEditor';
import StatusBar from './layout/StatusBar';
import SplashScreen from './layout/SplashScreen';
import AuthPage from './layout/AuthPage';
import './styles/layout.css';

// ─── Palettes de couleurs ────────────────────────────────────────────────────
export const COLOR_PALETTES = {
  'Noir':          { header: '#000000', body: '#F2F2F7', text: '#FFFFFF', darkText: '#000000' },
  'Red':           { header: '#FF3B30', body: '#FFE5E5', text: '#FFFFFF', darkText: '#000000' },
  'Rose':          { header: '#FF2D55', body: '#FFE5EC', text: '#FFFFFF', darkText: '#000000' },
  'Orange':        { header: '#FF9500', body: '#FFEFCF', text: '#FFFFFF', darkText: '#000000' },
  'Yellow':        { header: '#FFFF00', body: '#FFFDE0', text: '#000000', darkText: '#000000' },
  'Green (Light)': { header: '#90EE90', body: '#EAFCEF', text: '#000000', darkText: '#000000' },
  'Green':         { header: '#34C759', body: '#E6F9EA', text: '#FFFFFF', darkText: '#000000' },
  'Blue (Light)':  { header: '#ADD8E6', body: '#F0FAFF', text: '#000000', darkText: '#000000' },
  'Blue':          { header: '#007AFF', body: '#E6F2FF', text: '#FFFFFF', darkText: '#000000' },
  'Blue (Dark)':   { header: '#000080', body: '#E1EFFF', text: '#FFFFFF', darkText: '#000000' },
  'Purple':        { header: '#800080', body: '#F7EFFF', text: '#FFFFFF', darkText: '#000000' },
};

// ─── Données initiales ───────────────────────────────────────────────────────
const INITIAL_NOTES = [
  {
    id: 1,
    title: 'Fidélité — Principes',
    text: 'La fidélité est un acte de volonté autant que de sentiment. Elle se construit chaque jour dans les petits choix.',
    color: 'Blue',
    date: '20/02/25',
    folder: 'Notes',
  },
];

function App() {
  // ── Phase : 'splash' → 'auth' → 'app' ────────────────────────────────────
  const [phase, setPhase] = useState('splash');

  // ── État principal (identique à ton App original) ─────────────────────────
  const [notes, setNotes]                   = useState(INITIAL_NOTES);
  const [selectedId, setSelectedId]         = useState(1);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode]             = useState('list');

  // ── Groupe / espace de notes ──────────────────────────────────────────────
  const [groupTitle, setGroupTitle]             = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [tempGroupTitle, setTempGroupTitle]     = useState('');

  const handleSaveGroupTitle = () => {
    if (tempGroupTitle.trim()) setGroupTitle(tempGroupTitle.trim());
    setIsGroupModalOpen(false);
  };

  const openGroupModal = () => {
    setTempGroupTitle(groupTitle);
    setIsGroupModalOpen(true);
  };

  // ── Phase 1 : Splash ──────────────────────────────────────────────────────
  if (phase === 'splash') {
    return <SplashScreen onDone={() => setPhase('auth')} />;
  }

  // ── Phase 2 : Auth ────────────────────────────────────────────────────────
  if (phase === 'auth') {
    return <AuthPage onAuth={() => setPhase('app')} />;
  }

  // ── Phase 3 : Application principale (ton App original) ───────────────────
  return (
    <div className="app-container" id="app">
      <div className="main-body">

        <Sidebar
          notes={notes}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

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

      {/* ═══ MODAL NOMMER L'ESPACE ════════════════════════════════════════ */}
      {isGroupModalOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000,
          }}
          onClick={() => setIsGroupModalOpen(false)}
        >
          <div
            style={{
              background: '#000', width: '540px', padding: '30px 40px',
              borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Add Title for theses notes"
              value={tempGroupTitle}
              onChange={(e) => setTempGroupTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveGroupTitle()}
              autoFocus
              style={{
                flex: 1, background: 'transparent', border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.6)',
                color: '#fff', fontSize: '16px', padding: '6px 0', outline: 'none',
              }}
            />
            <button
              onClick={handleSaveGroupTitle}
              style={{
                background: '#93b9e9', color: '#1a3a60', border: 'none',
                borderRadius: '10px', padding: '8px 24px', fontSize: '15px',
                fontWeight: '600', cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setIsGroupModalOpen(false)}
              style={{
                background: '#fff', color: '#000', border: 'none',
                borderRadius: '10px', padding: '8px 24px', fontSize: '15px',
                fontWeight: '600', cursor: 'pointer',
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