import React, { useState, useRef } from 'react';
import { COLOR_PALETTES } from '../App';

const SHADE_MAP = {
  Yellow: '#d4d060', Green: '#22a046', Blue: '#0055cc', Red: '#cc2c20',
  Orange: '#cc7700', Rose: '#cc2244', Purple: '#600060', Noir: '#333',
  'Blue (Dark)': '#000060', 'Blue (Light)': '#80b8c8', 'Green (Light)': '#70c870',
};

const LINK_SUGGESTIONS = [
  {
    id: 1,
    title: '(10) PARTYNEXTDOOR &...',
    source: 'Google Chrome',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    favicon: 'https://www.youtube.com/favicon.ico',
    type: 'youtube',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    siteName: 'youtube.com',
    description: 'PARTYNEXTDOOR & DRAKE - LASERS',
  },
  
];

export default function NoteEditor({ notes, setNotes, selectedId, setSelectedId }) {
  const [openDD, setOpenDD]         = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tableHover, setTableHover] = useState({ r: -1, c: -1 });
// ── États pour le bouton Aa ─────────────────────────────────────────
  const [textStyle, setTextStyle]   = useState('body'); // 'body', 'monostyle', 'quote'
  const [fontFamily, setFontFamily] = useState('Posterama');
  const [fontSize, setFontSize]     = useState('8');

  // ── Groupe ──────────────────────────────────────────────────────────────────
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupTitle, setGroupTitle]   = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempTitle, setTempTitle]     = useState('');

  // ── Lock ────────────────────────────────────────────────────────────────────
  const [lockStep, setLockStep] = useState(null);
  const [password, setPassword] = useState('');

  // ── Lien ────────────────────────────────────────────────────────────────────
  const [linkInput, setLinkInput] = useState('');

  // ── Media ───────────────────────────────────────────────────────────────────
  const [mediaModal, setMediaModal]   = useState(false);
  const [mediaTab, setMediaTab]       = useState('photos');
  const [selectedImg, setSelectedImg] = useState(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const fileInputRef                  = useRef(null);

  // ── Tableau contextuel ──────────────────────────────────────────────────────
  const [tableCtxMenu, setTableCtxMenu] = useState(null);

  const note      = notes.find((n) => n.id === selectedId);
  const activePal = note ? (COLOR_PALETTES[note.color] || COLOR_PALETTES['Yellow']) : COLOR_PALETTES['Yellow'];

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toggle   = (name) => setOpenDD((prev) => (prev === name ? null : name));
  const closeAll = () => { setOpenDD(null); setSearchOpen(false); setTableCtxMenu(null); };

  const updateNote = (patch) =>
    setNotes((prev) => prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n)));

  // ── Couleur ──────────────────────────────────────────────────────────────────
  const setColor = (colorName) => { updateNote({ color: colorName }); closeAll(); };

  // ── Liste ────────────────────────────────────────────────────────────────────
  const insertList = (type) => {
    if (!note) return;
    const prefixes = {
      disc:    '• Item 1\n• Item 2\n• Item 3',
      circle:  '◦ Item 1\n◦ Item 2\n◦ Item 3',
      num:     '1. Item 1\n2. Item 2\n3. Item 3',
      diamond: '◆ Item 1\n◆ Item 2\n◆ Item 3',
      arrow:   '→ Item 1\n→ Item 2\n→ Item 3',
      check:   '☑ Item 1\n☑ Item 2\n☑ Item 3',
    };
    const sep = note.text.trim() ? '\n\n' : '';
    updateNote({ text: note.text + sep + prefixes[type] });
    closeAll();
  };

  // ── Tableau ───────────────────────────────────────────────────────────────────
  const insertTable = (rows, cols) => {
    if (!note) return;
    const newTable = {
      id: Date.now(), rows, cols,
      data: Array.from({ length: rows }, () => Array(cols).fill('')),
    };
    updateNote({ tables: [...(note.tables || []), newTable] });
    closeAll();
  };

  const updateCell = (tableId, r, c, value) => {
    const tables = (note.tables || []).map((t) => {
      if (t.id !== tableId) return t;
      const data = t.data.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row
      );
      return { ...t, data };
    });
    updateNote({ tables });
  };

  const tableAddColBefore = (tableId, colIdx) => {
    const tables = (note.tables || []).map((t) => {
      if (t.id !== tableId) return t;
      return { ...t, cols: t.cols + 1, data: t.data.map((row) => [...row.slice(0, colIdx), '', ...row.slice(colIdx)]) };
    });
    updateNote({ tables }); setTableCtxMenu(null);
  };

  const tableAddColAfter = (tableId, colIdx) => {
    const tables = (note.tables || []).map((t) => {
      if (t.id !== tableId) return t;
      return { ...t, cols: t.cols + 1, data: t.data.map((row) => [...row.slice(0, colIdx + 1), '', ...row.slice(colIdx + 1)]) };
    });
    updateNote({ tables }); setTableCtxMenu(null);
  };

  const tableDeleteCol = (tableId, colIdx) => {
    const tables = (note.tables || []).map((t) => {
      if (t.id !== tableId || t.cols <= 1) return t;
      return { ...t, cols: t.cols - 1, data: t.data.map((row) => row.filter((_, ci) => ci !== colIdx)) };
    });
    updateNote({ tables }); setTableCtxMenu(null);
  };

  const tableAddRow = (tableId) => {
    const tables = (note.tables || []).map((t) => {
      if (t.id !== tableId) return t;
      return { ...t, rows: t.rows + 1, data: [...t.data, Array(t.cols).fill('')] };
    });
    updateNote({ tables });
  };

  // ── Media ────────────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !note) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const images = [...(note.images || []), { id: Date.now(), src: ev.target.result, name: file.name }];
      updateNote({ images });
      setMediaModal(false);
      setSelectedImg(null);
    };
    reader.readAsDataURL(file);
  };

  const insertSelectedImg = () => {
    if (!selectedImg || !note) return;
    const images = [...(note.images || []), { id: Date.now(), src: selectedImg.src, name: selectedImg.name }];
    updateNote({ images });
    setMediaModal(false);
    setSelectedImg(null);
  };

  // ── Lien ────────────────────────────────────────────────────────────────────
  const insertLink = (suggestion) => {
    if (!note) return;
    const links = [...(note.links || []), suggestion];
    updateNote({ links });
    closeAll();
    setLinkInput('');
  };

  const insertCustomLink = () => {
    if (!note || !linkInput.trim()) return;
    const isYT = linkInput.includes('youtube.com') || linkInput.includes('youtu.be');
    let ytId = null;
    if (isYT) {
      const m = linkInput.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
      if (m) ytId = m[1];
    }
    const suggestion = {
      id: Date.now(),
      title: linkInput,
      source: 'Manuel',
      url: linkInput,
      favicon: null,
      type: isYT ? 'youtube' : 'web',
      thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null,
      siteName: (() => { try { return new URL(linkInput.startsWith('http') ? linkInput : `https://${linkInput}`).hostname; } catch { return linkInput; } })(),
      description: linkInput,
    };
    insertLink(suggestion);
  };

  // ── Autres ────────────────────────────────────────────────────────────────────
  const newNote = () => {
    const id = Date.now();
    setNotes((prev) => [
      { id, title: 'New note', text: '', color: 'Yellow', tables: [], links: [], images: [],
        date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        folder: 'Notes' },
      ...prev,
    ]);
    setSelectedId(id);
    setIsGroupMode(false);
    setGroupTitle('');
  };

  const removeGroup     = () => { setIsGroupMode(false); setGroupTitle(''); };
  const handleSaveGroup = () => {
    if (tempTitle.trim()) { setGroupTitle(tempTitle); setIsGroupMode(true); }
    setIsModalOpen(false);
  };

  const handleLockToggleAction = () => {
    if (note?.isLocked) { setLockStep('password-input'); }
    else { setLockStep('options'); }
    setOpenDD(null);
  };

  const handleLockNote = () => {
    if (!password.trim()) return;
    updateNote({ isLocked: !note?.isLocked });
    setLockStep(null);
    setPassword('');
    closeAll();
  };

  const handleUnlockAll = () => {
    setNotes((prev) => prev.map((n) => ({ ...n, isLocked: false })));
    closeAll();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <main
      className="note-editor"
      id="note-editor"
      onClick={(e) => {
        if (!e.target.closest('.editor-toolbar') && !e.target.closest('.search-wrapper')) closeAll();
        if (!e.target.closest('.table-ctx-menu') && !e.target.closest('.col-handle')) setTableCtxMenu(null);
      }}
    >

      {/* ═══ BARRE D'OUTILS ═══════════════════════════════════════════════ */}
      <div className="editor-toolbar" id="toolbar">

        {/* ── COULEUR ── */}
        <div className="rel">
          <button onClick={() => toggle('color')} title="Couleur">
            <i className="fa-solid fa-droplet" style={{ color: activePal.header }}></i>
          </button>
          {openDD === 'color' && (
            <div className="colors-dropdown">
              <div className="dropdown-title">Colors suggestions</div>
              <ul className="colors-list">
                {Object.entries(COLOR_PALETTES).map(([name, pal]) => (
                  <li key={name} className="color-item"
                    onClick={(e) => { e.stopPropagation(); setColor(name); }}>
                    <span className="color-square" style={{ background: pal.header }} />
                    <span className="color-name">{name}</span>
                    {note?.color === name && <i className="fa-solid fa-check check-icon" style={{ color: '#007AFF' }}></i>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="tb-divider" />

        {/* ── BOUTON FORMAT DE TEXTE "Aa" (VERSION SÉCURISÉE) ── */}
        <div className="rel" style={{ position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); toggle('aa'); }} 
            title="Choose a style to apply to the text"
            style={{ 
              background: openDD === 'aa' ? '#dcdcdc' : 'transparent', 
              borderRadius: '5px', 
              border: 'none', 
              padding: '6px 12px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontWeight: '500', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI"', fontSize: '15px', color: '#444' }}>Aa</span>
          </button>
          
          {openDD === 'aa' && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', 
                top: '100%', 
                left: '0', 
                marginTop: '6px',
                background: 'rgba(235, 235, 235, 0.95)', 
                backdropFilter: 'blur(25px)',
                borderRadius: '16px', 
                padding: '12px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.2)',
                zIndex: 9999, 
                width: '180px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
                boxSizing: 'border-box'
              }}
            >
              {/* Rangée 1 : Style Styles de base */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                <button style={{ background: 'transparent', border: 'none', fontSize: '15px', fontWeight: 'bold', color: '#000', cursor: 'pointer', width: '24px' }}>B</button>
                <button style={{ background: 'transparent', border: 'none', fontSize: '15px', fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#000', cursor: 'pointer', width: '24px' }}>I</button>
                <button style={{ background: 'transparent', border: 'none', fontSize: '15px', textDecoration: 'underline', color: '#000', cursor: 'pointer', width: '24px' }}>U</button>
                <button style={{ background: 'transparent', border: 'none', fontSize: '15px', textDecoration: 'line-through', color: '#000', cursor: 'pointer', width: '24px' }}>S</button>
              </div>

              <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '2px 0' }} />

              {/* Rangée 2 : Body */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#000', cursor: 'pointer', padding: '2px 4px' }}>
                <div style={{ width: '10px', display: 'flex', justifyContent: 'center', fontSize: '10px', color: '#8e8e93' }}>✓</div>
                <span style={{ fontWeight: '600' }}>Body</span>
              </div>

              {/* Rangée 3 : Monostyle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#000', cursor: 'pointer', padding: '2px 4px' }}>
                <div style={{ width: '10px' }}></div>
                <span style={{ fontFamily: 'Courier New, monospace' }}>Monostyle</span>
              </div>

              {/* Rangée 4 : Quote block */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#000', cursor: 'pointer', padding: '2px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '3px', height: '12px', background: '#ff9500', borderRadius: '1px' }} />
                    <span>Quote block</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <div style={{ width: '14px', height: '14px', background: '#ff3b30', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div style={{ position: 'relative', width: '16px', height: '14px', background: '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', fontSize: '5px', lineHeight: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
                  </div>
                </div>
              </div>

              {/* Rangée 5 : Police */}
              <div style={{ position: 'relative', width: '100%' }}>
                <select style={{ width: '100%', height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', fontSize: '12px', color: '#000', paddingLeft: '6px', appearance: 'none', outline: 'none', cursor: 'pointer' }}>
                  <option>Posterama</option>
                  <option>Helvetica</option>
                </select>
                <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', fontSize: '5px', lineHeight: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
              </div>

              {/* Rangée 6 : Taille & Couleur */}
              <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                <div style={{ position: 'relative', width: '50px' }}>
                  <select style={{ width: '100%', height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', fontSize: '12px', color: '#000', paddingLeft: '6px', appearance: 'none', outline: 'none', cursor: 'pointer' }}>
                    <option>8</option>
                    <option>10</option>
                  </select>
                  <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', fontSize: '5px', lineHeight: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
                </div>

                <div style={{ position: 'relative', flex: 1, height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 6px', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#000', fontFamily: 'Georgia, serif' }}>A</span>
                  <div style={{ width: '12px', height: '12px', background: '#000', borderRadius: '2px', marginLeft: 'auto', marginRight: '10px' }} />
                  <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', fontSize: '5px', lineHeight: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
                </div>
              </div>

              {/* Rangée 7 : Pinceau & M */}
              <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                <div style={{ position: 'relative', flex: 1, height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 6px' }}>
                  <span style={{ fontSize: '11px' }}>🖌️</span>
                  <div style={{ width: '12px', height: '12px', background: '#fff', border: '1px solid #ccc', borderRadius: '2px', marginLeft: 'auto', marginRight: '10px' }} />
                  <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', fontSize: '5px', lineHeight: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
                </div>

                <div style={{ position: 'relative', width: '50px', height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '500', color: '#000' }}>M</span>
                  <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', fontSize: '5px', lineHeight: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── LISTE STYLE REPRODUCTION IDÉALE (image_048907.png) ── */}
        <div className="rel" style={{ position: 'relative' }}>
          <button 
            onClick={() => toggle('list')} 
            title="Create a list"
            style={{ 
              background: openDD === 'list' ? '#dcdcdc' : 'transparent', 
              borderRadius: '4px', 
              border: 'none', 
              padding: '6px 10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className="fa-solid fa-list-ul" style={{ fontSize: '15px', color: '#444' }}></i>
          </button>

          {openDD === 'list' && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', 
                top: '100%', 
                left: '0', 
                marginTop: '4px',
                background: 'rgba(238, 238, 238, 0.94)', 
                backdropFilter: 'blur(25px)',
                borderRadius: '10px', 
                padding: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.25)',
                zIndex: 9999, 
                width: '230px', 
                display: 'flex', 
                gap: '6px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxSizing: 'border-box'
              }}
            >
              {/* Option GAUCHE : Bouton vertical unique "None" */}
              <button 
                className="list-preview-btn none-option" 
                onClick={closeAll}
                style={{
                  width: '42px',
                  height: '54px',
                  background: '#d0e1f9',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#0055cc',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                None
              </button>

              {/* Options DROITE : Grille compacte de 2 lignes x 4 colonnes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', flex: 1 }}>
                {[
                  { type: 'disc',    els: ['•', '•','•'] },
                  { type: 'circle',  els: ['◦', '◦','◦'] },
                  { type: 'num',     els: ['1.', '2.','3.'] },
                  { type: 'check',   els: ['❑', '❑','❑'] },
                  { type: 'diamond', els: ['◆', '◆','◆'] },
                  { type: 'arrow',   els: ['➔', '➔','➔'] },
                  { type: 'checkmark', els: ['✓', '✓','✓'] },
                ].map((item, idx) => (
                  <button 
                    key={idx} 
                    className="list-preview-btn" 
                    onClick={() => insertList(item.type)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      borderRadius: '21px',
                      height: '6px',
                      padding: '1px 1px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '2px',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
                  >
                    {item.els.map((bullet, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#444', minWidth: '10px', textAlign: 'center', lineHeight: 1 }}>
                          {bullet}
                        </span>
                        <div style={{ height: '1.5px', background: '#aaa', flex: 1, borderRadius: '0.5px' }} />
                      </div>
                    ))}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

     {/* ── TABLEAU INTERRUPTEUR (AJOUTER / SUPPRIMER) ── */}
        <div className="rel" style={{ position: 'relative' }}>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (!note) return;

              // On vérifie si la note contient déjà au moins un tableau
              const hasTable = note.tables && note.tables.length > 0;

              if (hasTable) {
                // S'il y a un tableau, on le supprime (on vide le tableau de la note)
                updateNote({ tables: [] });
              } else {
                // Sinon, on insère le tableau 2x2 initial (image_05fc11.png)
                insertTable(2, 2); 
              }
            }} 
            title={note?.tables && note.tables.length > 0 ? "Remove table" : "Add a table"}
            style={{ 
              // Le bouton change de couleur de fond si le tableau est actif (comme sur image_05fc11.png)
              background: note?.tables && note.tables.length > 0 ? '#dcdcdc' : 'transparent', 
              borderRadius: '5px', 
              border: 'none', 
              padding: '6px 10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!(note?.tables && note.tables.length > 0)) {
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(note?.tables && note.tables.length > 0)) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {/* Icône de grille épurée */}
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="17" height="13" rx="1.5" stroke="#444" strokeWidth="1"/>
              <line x1="9" y1="0.5" x2="9" y2="13.5" stroke="#444" strokeWidth="1"/>
              <line x1="0.5" y1="7" x2="17.5" y2="7" stroke="#444" strokeWidth="1"/>
            </svg>
          </button>
        </div>
        {/* ── IMAGE / MEDIA ── */}
        <div className="rel">
          <button
            onClick={() => toggle('media')}
            title="open your device's photo browser or use People Inc.."
            className={openDD === 'media' ? 'active' : ''}
          >
            <i className="fa-regular fa-image"></i>
          </button>

          {openDD === 'media' && (
            <div className="media-dropdown" onClick={(e) => e.stopPropagation()}>
              <button
                className="media-item media-item-top"
                onClick={() => { setMediaModal(true); setMediaTab('photos'); closeAll(); }}
              >
                Photos &amp; Videos
              </button>
              <div className="media-section-separator" />
              <div className="media-section-label">GhostLabs App</div>
              <button className="media-item" onClick={() => { fileInputRef.current?.click(); closeAll(); }}>
                Take a photo
              </button>
              <button className="media-item" onClick={closeAll}>Scan documents</button>
              <button className="media-item" onClick={closeAll}>Add a sketch</button>
            </div>
          )}
        </div>

        {/* Input caché upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* ── LIEN ── */}
        <div className="rel">
          <button onClick={() => toggle('link')} title="Add a link." className={openDD === 'link' ? 'active' : ''}>
            <i className="fa-solid fa-link"></i>
          </button>
          {openDD === 'link' && (
            <div className="link-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="link-dropdown-title">Add a link to the app</div>
              <div className="link-suggestions">
                {LINK_SUGGESTIONS.map((s) => (
                  <div key={s.id} className="link-suggestion-row">
                    <div className="link-suggestion-left">
                      <div className="link-favicon-wrap">
                        {s.type === 'youtube'
                          ? <i className="fa-brands fa-youtube" style={{ color: '#FF0000', fontSize: '18px' }}></i>
                          : <i className="fa-solid fa-globe" style={{ color: '#555', fontSize: '14px' }}></i>
                        }
                      </div>
                      <div className="link-suggestion-text">
                        <div className="link-suggestion-title">{s.title}</div>
                        <div className="link-suggestion-source">{s.source}</div>
                      </div>
                    </div>
                    <button className="link-add-btn" onClick={() => insertLink(s)}>Add link</button>
                  </div>
                ))}
              </div>
              <div className="link-divider" />
              <div className="link-manual-row">
                <input
                  type="text"
                  className="link-manual-input"
                  placeholder="Coller un lien..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertCustomLink()}
                />
                <button className="link-add-btn" onClick={insertCustomLink}>Add</button>
              </div>
            </div>
          )}
        </div>

        <div className="tb-divider" />

        {/* ── LOCK ── */}
        <div className="rel">
          <button
            className={openDD === 'lock' || note?.isLocked ? 'active' : ''}
            onClick={() => toggle('lock')}
            title="Verrouiller"
          >
            <i className={`fa-solid ${note?.isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
          </button>
          {openDD === 'lock' && (
            <div className="lock-dropdown">
              <button className="lock-item" onClick={handleLockToggleAction}>
                {note?.isLocked ? 'Unlock this note' : 'Lock this note'}
              </button>
              <button className="lock-item" onClick={handleUnlockAll}>Close all locked notes</button>
            </div>
          )}
        </div>

        {/* ── PARTAGER ── */}
        <div className="rel">
          <button onClick={() => toggle('share')} title="Partager">
            <i className="fa-solid fa-arrow-up-from-bracket"></i>
          </button>
          {openDD === 'share' && (
            <div className="share-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="share-header">
                <div className="note-mini-preview">
                  <div className="mini-header-blue">{note ? note.title : 'Untitled'}</div>
                  <div className="mini-body-lines">
                    <div className="mini-line"></div>
                    <div className="mini-line short"></div>
                  </div>
                </div>
                <div className="share-header-text">
                  <h3>{note ? note.title : 'New note'}</h3>
                  <p>{note ? note.folder : 'Notes'}</p>
                </div>
              </div>
              <div className="share-select-container">
                <select className="share-action-select">
                  <option value="copy">Send a copy</option>
                  <option value="collaborate">Collaborate</option>
                </select>
              </div>
              <div className="share-section-title">SpaceChat / GhostLabs Contacts</div>
              <div className="share-contacts-row">
                {[
                  { name: 'Moses', cls: 'avatar-yellow' },
                  { name: 'Adam',  cls: 'avatar-green' },
                  { name: 'Kahina', cls: 'avatar-purple' },
                ].map(({ name, cls }) => (
                  <div key={name} className="contact-item" onClick={closeAll}>
                    <div className={`contact-avatar ${cls}`}><i className="fa-solid fa-user"></i></div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
              <div className="share-divider"></div>
              <div className="share-app-row" onClick={closeAll}>
                <div className="app-icon-mail"><i className="fa-solid fa-envelope"></i></div>
                <span className="app-label">Mail</span>
              </div>
            </div>
          )}
        </div>

        {/* ── RECHERCHE ── */}
        {/* ── RECHERCHE STYLE DYNAMIQUE (image_06710e.png, image_067433.png, image_0674c8.png) ── */}
        <div className="search-wrapper rel" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {!searchOpen ? (
            /* État initial : Juste l'icône loupe */
            <button 
              className="search-trigger-btn" 
              title="Easily find notes and attachments."
              onClick={(e) => { 
                e.stopPropagation(); 
                closeAll(); 
                setSearchOpen(true); 
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '16px', color: '#444' }}></i>
            </button>
          ) : (
            /* État actif : Champ avec contour orange */
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search" 
                autoFocus
                value={mediaSearch} // Utilise ou remplace par ta variable de recherche globale (ex: searchQuery)
                onChange={(e) => setMediaSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '240px',
                  height: '26px',
                  background: 'rgba(235, 235, 235, 0.6)',
                  border: '1.5px solid #ff9500', // Bordure orange vive de image_067433.png
                  borderRadius: '6px',
                  padding: '0 28px 0 10px',
                  fontSize: '13px',
                  color: '#000',
                  outline: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}
              />
              {/* Petite loupe grise intégrée à droite du champ */}
              <div 
                style={{ position: 'absolute', right: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={() => setSearchOpen(false)} // Referme au clic sur la loupe interne
              >
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '13px', color: '#777' }}></i>
              </div>

              {/* Menu déroulant des suggestions (S'affiche UNIQUEMENT si le champ est vide) */}
              {!mediaSearch.trim() && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '6px',
                    background: 'rgba(225, 225, 225, 0.94)',
                    backdropFilter: 'blur(25px)',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    width: '270px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', paddingLeft: '4px', marginBottom: '2px' }}>
                    Research suggestions
                  </div>

                  {[
                    { iconClass: 'fa-solid fa-user-group', text: 'Shared notes' },
                    { iconClass: 'fa-solid fa-lock', text: 'Locked Notes' },
                    { iconClass: 'fa-solid fa-list-ul', text: 'Notes with lists' },
                    { iconClass: 'fa-solid fa-hashtag', text: 'Notes with tags' },
                    { iconClass: 'fa-solid fa-pen-ruler', text: 'Notes with drawings' },
                    { iconClass: 'fa-solid fa-expand', text: 'Notes with scanned documents' },
                    { iconClass: 'fa-solid fa-paperclip', text: 'Notes with attachments' }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: '#000',
                        cursor: 'pointer',
                        padding: '3px 4px',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '13px', width: '18px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#444' }}>
                        <i className={item.iconClass}></i>
                      </span>
                      <span style={{ fontWeight: '400' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ═══ FIN TOOLBAR ══════════════════════════════════════════════════ */}

      {/* ═══ ZONE D'ÉDITION ══════════════════════════════════════════════ */}
      <div className="editor-area" id="editor-area">
        <div className="editor-date">Thursday, February, 20, 2025</div>

        <div className="notes-display-container" id="notes-display">
          {note && (
            <>
              <div className="sticky-note" id="main-sticky" style={{ background: activePal.body }}>
                <div className="sticky-header-bar" style={{ background: activePal.header, color: activePal.text }}>
                  {note.isLocked ? '🔒 Contenu Protégé' : (isGroupMode ? groupTitle : note.title)}
                </div>

                <div className="sticky-body">
                  {note.isLocked ? (
                    <div className="lock-masked-screen">
                      <i className="fa-solid fa-lock lock-masked-icon"></i>
                      <p className="lock-masked-text">Cette note est protégée par un mot de passe.</p>
                      <button className="btn-lock-yellow"
                        style={{ width: 'auto', padding: '8px 20px', marginTop: '10px' }}
                        onClick={() => setLockStep('password-input')}>
                        Saisir le mot de passe
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* ── Images insérées ── */}
                      {(note.images || []).map((img) => (
                        <div key={img.id} className="note-image-block">
                          <img src={img.src} alt={img.name} />
                          <button
                            className="note-image-remove"
                            onClick={() => updateNote({ images: (note.images || []).filter((i) => i.id !== img.id) })}
                          >✕</button>
                        </div>
                      ))}

                      {/* ── Previews de liens ── */}
                      {(note.links || []).map((lnk) => (
                        <div key={lnk.id} className="link-preview-card">
                          {lnk.thumbnail && (
                            <div className="link-preview-thumb">
                              <img src={lnk.thumbnail} alt={lnk.title} />
                              {lnk.type === 'youtube' && (
                                <div className="link-preview-play">
                                  <i className="fa-solid fa-play"></i>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="link-preview-info">
                            <div className="link-preview-desc">{lnk.description}</div>
                            <div className="link-preview-site">{lnk.siteName}</div>
                          </div>
                          <div className="link-preview-bar" style={{ background: activePal.header }} />
                          <button
                            className="link-preview-remove"
                            onClick={() => updateNote({ links: (note.links || []).filter((l) => l.id !== lnk.id) })}
                          >✕</button>
                        </div>
                      ))}

                      {/* ── Textarea ── */}
                      <textarea
                        value={note.text}
                        placeholder="Start a note..."
                        style={{ color: activePal.darkText }}
                        onChange={(e) => updateNote({ text: e.target.value })}
                      />

                      {/* ── Tableaux HTML ── */}
                      {(note.tables || []).map((tbl) => (
                        <div key={tbl.id} className="note-table-wrapper" style={{ position: 'relative', margin: '10px 0' }}>
                          <table className="note-table" style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                            <thead>
                              <tr>
                                {tbl.data[0].map((_, ci) => (
                                  <th key={ci} style={{ position: 'relative', padding: 0, border: '1px solid #bbb' }}>
                                    <div className="col-handle"
                                      onClick={(e) => { e.stopPropagation(); setTableCtxMenu({ tableId: tbl.id, colIndex: ci }); }}
                                      style={{
                                        background: tableCtxMenu?.tableId === tbl.id && tableCtxMenu?.colIndex === ci ? '#FF9500' : '#e0e0e0',
                                        cursor: 'pointer', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#555',
                                      }}>···</div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tbl.data.map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((cell, ci) => (
                                    <td key={ci} style={{ border: '1px solid #bbb', padding: '2px' }}>
                                      <input value={cell} onChange={(e) => updateCell(tbl.id, ri, ci, e.target.value)}
                                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', padding: '4px', color: activePal.darkText }} />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button onClick={() => tableAddRow(tbl.id)}
                            style={{ marginTop: '4px', fontSize: '11px', background: 'none', border: '1px dashed #aaa', borderRadius: '4px', width: '100%', cursor: 'pointer', color: '#888', padding: '2px 0' }}>
                            + Add row
                          </button>
                          {tableCtxMenu?.tableId === tbl.id && (
                            <div className="table-ctx-menu" onClick={(e) => e.stopPropagation()}
                              style={{ position: 'absolute', top: '22px', left: `${(tableCtxMenu.colIndex / tbl.cols) * 100}%`, background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,.15)', zIndex: 999, minWidth: '170px', overflow: 'hidden' }}>
                              {[
                                { label: 'Insert a front column', action: () => tableAddColBefore(tbl.id, tableCtxMenu.colIndex) },
                                { label: 'Insert column after',   action: () => tableAddColAfter(tbl.id, tableCtxMenu.colIndex) },
                                { label: 'Delete column',         action: () => tableDeleteCol(tbl.id, tableCtxMenu.colIndex) },
                              ].map(({ label, action }) => (
                                <button key={label} onClick={action}
                                  style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: label === 'Delete column' ? '#dc2626' : '#111' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {isGroupMode && (
                <div className="sticky-note" style={{ background: '#FFFDE0', marginTop: '16px' }}>
                  <div className="sticky-header-bar" style={{ background: '#FFFF00', color: '#000' }}>Untitled</div>
                  <div className="sticky-body">
                    <textarea placeholder="Start a note..." style={{ color: '#000' }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ FOOTER GROUPE ═══════════════════════════════════════════════ */}
      {isGroupMode && (
        <div className="group-title-footer" id="group-footer">
          <input type="text" className="group-title-input" value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)} />
        </div>
      )}

      {/* ═══ BOUTONS BAS ═════════════════════════════════════════════════ */}
      <div className="editor-bottom">
        <button className="btn-round yellow" onClick={newNote} title="Nouvelle note"><i className="fa-solid fa-plus"></i></button>
        <button className="btn-round red" onClick={removeGroup} title="Supprimer groupe"><i className="fa-solid fa-minus"></i></button>
        <button className="btn-round teal" onClick={() => { setTempTitle(''); setIsModalOpen(true); }} title="Ajouter notes groupées">
          <i className="fa-regular fa-copy"></i>
        </button>
      </div>

      {/* ═══ MODALE PHOTOS ═══════════════════════════════════════════════ */}
      {mediaModal && (
        <div className="media-modal-overlay" onClick={() => { setMediaModal(false); setSelectedImg(null); }}>
          <div className="media-modal" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-traffic">
              <button className="traffic green"  onClick={() => { setMediaModal(false); setSelectedImg(null); }} />
              <button className="traffic yellow" onClick={() => { setMediaModal(false); setSelectedImg(null); }} />
              <button className="traffic red"    onClick={() => { setMediaModal(false); setSelectedImg(null); }} />
            </div>
            <div className="media-modal-tabs">
              <button className={`media-tab-btn${mediaTab === 'photos' ? ' active' : ''}`} onClick={() => setMediaTab('photos')}>
                <i className="fa-regular fa-image" style={{ marginRight: '6px' }}></i>Photos
              </button>
              <button className={`media-tab-btn${mediaTab === 'videos' ? ' active' : ''}`} onClick={() => setMediaTab('videos')}>
                <i className="fa-regular fa-circle-play" style={{ marginRight: '6px' }}></i>Videos
              </button>
            </div>
            <div className="media-modal-grid">
              {(note?.images || [])
                .filter((img) => mediaSearch === '' || img.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                .map((img) => (
                  <div
                    key={img.id}
                    className={`media-grid-item${selectedImg?.id === img.id ? ' selected' : ''}`}
                    onClick={() => setSelectedImg(selectedImg?.id === img.id ? null : img)}
                  >
                    <img src={img.src} alt={img.name} />
                    <div className="media-grid-name">
                      {img.name.length > 12 ? img.name.slice(0, 9) + '...' : img.name}
                    </div>
                  </div>
                ))}
              {(note?.images || []).length === 0 && (
                <div className="media-empty">
                  <i className="fa-regular fa-image" style={{ fontSize: '32px', color: '#ccc' }}></i>
                  <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                    Aucune photo.<br/>
                    <span style={{ color: '#007AFF', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                      Importer depuis l'appareil
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="media-modal-footer">
              <div className="media-search-wrap">
                <input
                  type="text"
                  placeholder="Search"
                  className="media-search-input"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                />
                <i className="fa-solid fa-magnifying-glass media-search-icon"></i>
              </div>
              {selectedImg && (
                <button className="media-insert-btn" onClick={insertSelectedImg}>Insert</button>
              )}
              <span className="media-count">
                {(note?.images || []).length}/{(note?.images || []).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TUNNEL LOCK ═════════════════════════════════════════════════ */}
      {lockStep && (
        <div className="modal-overlay" onClick={() => setLockStep(null)}>
          {lockStep === 'options' && (
            <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-x" onClick={() => setLockStep(null)}>✕</button>
              <div className="lock-icon-circle"><i className="fa-solid fa-lock"></i></div>
              <h2>Choisissez une option ci-dessous</h2>
              <button className="btn-lock-yellow" onClick={() => setLockStep('info-page1')}>Utiliser le mot de passe de session</button>
              <button className="btn-lock-outline" onClick={() => setLockStep('info-page2')}>Créer un mot de passe personnalisé</button>
              <span className="lock-link">En savoir plus</span>
            </div>
          )}
          {lockStep === 'info-page1' && (
            <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-x" onClick={() => setLockStep(null)}>✕</button>
              <div className="lock-icon-circle"><i className="fa-solid fa-lock"></i></div>
              <h2>Verrouiller vos notes avec votre mot de passe de session</h2>
              <p>L'utilisation du code d'accès de votre appareil vous évite d'avoir à retenir un mot de passe distinct.</p>
              <div className="lock-dots"><div className="lock-dot active"/><div className="lock-dot"/></div>
              <button className="btn-lock-yellow" onClick={() => setLockStep('password-input')}>Utiliser la session</button>
            </div>
          )}
          {lockStep === 'info-page2' && (
            <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-x" onClick={() => setLockStep(null)}>✕</button>
              <div className="lock-icon-circle"><i className="fa-solid fa-lock"></i></div>
              <h2>Créer un mot de passe distinct</h2>
              <p>La création d'un mot de passe dédié permet d'apporter une couche de sécurité supplémentaire.</p>
              <div className="lock-dots"><div className="lock-dot"/><div className="lock-dot active"/></div>
              <button className="btn-lock-yellow" onClick={() => setLockStep('password-input')}>Créer pour cette note</button>
            </div>
          )}
          {lockStep === 'password-input' && (
            <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lock-icon-circle"><i className="fa-solid fa-lock"></i></div>
              <h2 style={{ marginBottom: '5px' }}>SpaceNotes</h2>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '22px' }}>Saisissez le mot de passe pour verrouiller cette note.</p>
              <input type="password" className="lock-input" placeholder="Mot de passe"
                value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              <div className="lock-modal-actions">
                <button className="btn-lock-cancel" onClick={() => setLockStep(note?.isLocked ? null : 'options')}>Annuler</button>
                <button className="btn-lock-yellow" style={{ flex: 1, margin: 0 }} onClick={handleLockNote}>Confirmer</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ MODAL GROUPE ════════════════════════════════════════════════ */}
      {/* ── MODAL COMPOSITE CORRIGÉE (image_074648.png, image_0746aa.png) ── */}
  {isModalOpen && (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10000
    }} onClick={() => setIsModalOpen(false)}>
      
      <div className="composite-modal" style={{
        background: '#000000', width: '540px', padding: '30px 40px',
        borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }} onClick={(e) => e.stopPropagation()}>
        
        <input 
          type="text" 
          className="modal-input-field" 
          placeholder="Add Title for theses notes"
          value={tempTitle} 
          onChange={(e) => setTempTitle(e.target.value)} 
          autoFocus 
          style={{
            flex: 1, background: 'transparent', border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
            color: '#ffffff', fontSize: '16px', padding: '6px 0', outline: 'none'
          }}
        />

        <div className="modal-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn-modal save" 
            onClick={handleSaveGroup}
            style={{
              background: '#93b9e9', color: '#1a3a60', border: 'none',
              borderRadius: '10px', padding: '8px 24px', fontSize: '15px',
              fontWeight: '600', cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button 
            className="btn-modal back" 
            onClick={() => setIsModalOpen(false)}
            style={{
              background: '#ffffff', color: '#000000', border: 'none',
              borderRadius: '10px', padding: '8px 24px', fontSize: '15px',
              fontWeight: '600', cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )}
    </main>
  );
}