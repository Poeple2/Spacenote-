import React, { useState, useRef } from 'react';
import { COLOR_PALETTES } from '../App';

const LINK_SUGGESTIONS = [
  {
    id: 1, title: '(10) PARTYNEXTDOOR &...', source: 'Google Chrome',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'youtube', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    siteName: 'youtube.com', description: 'PARTYNEXTDOOR & DRAKE - LASERS',
  },
];

export default function NoteEditor({
  notes, setNotes, selectedId, setSelectedId,
  groupTitle, setGroupTitle, onOpenGroupModal,
}) {
  const [openDD, setOpenDD]           = useState(null);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [lockStep, setLockStep]       = useState(null);
  const [password, setPassword]       = useState('');
  const [linkInput, setLinkInput]     = useState('');
  const [mediaModal, setMediaModal]   = useState(false);
  const [mediaTab, setMediaTab]       = useState('photos');
  const [selectedImg, setSelectedImg] = useState(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [tableCtxMenu, setTableCtxMenu] = useState(null);
  const fileInputRef = useRef(null);

  // ── Modal renommage interne ──────────────────────────────────────────────
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const note        = notes.find((n) => n.id === selectedId);
  const activePal   = note ? (COLOR_PALETTES[note.color] || COLOR_PALETTES['Yellow']) : COLOR_PALETTES['Yellow'];
  const additionalCards = note && note.cards ? note.cards.slice(1) : [];

  // ── Taille adaptative des cartes ─────────────────────────────────────────
  const totalCards = note && note.cards ? note.cards.length : 1;
  const CARD_WIDTH =
    totalCards === 1 ? '460px' :
    totalCards === 2 ? '340px' :
    totalCards <= 4  ? '260px' : '220px';
  const CARD_MIN_HEIGHT =
    totalCards === 1 ? '380px' :
    totalCards === 2 ? '320px' :
    totalCards <= 4  ? '230px' : '200px';

  const toggle   = (name) => setOpenDD((prev) => (prev === name ? null : name));
  const closeAll = () => { setOpenDD(null); setSearchOpen(false); setTableCtxMenu(null); };

  const updateNote = (patch) =>
    setNotes((prev) => prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n)));

  const setColor = (colorName) => { updateNote({ color: colorName }); closeAll(); };

  // ── Modal renommage ───────────────────────────────────────────────────────
  const openRenameModal = () => {
    if (!note) return;
    setTempTitle(note.title || '');
    setIsRenameModalOpen(true);
  };

  const saveGroupTitle = () => {
    updateNote({ title: tempTitle || 'Untitled' });
    setIsRenameModalOpen(false);
  };

  // ── Liste ─────────────────────────────────────────────────────────────────
  const insertList = (type) => {
    if (!note) return;
    const prefixes = {
      disc: '• Item 1\n• Item 2\n• Item 3', circle: '◦ Item 1\n◦ Item 2\n◦ Item 3',
      num: '1. Item 1\n2. Item 2\n3. Item 3', diamond: '◆ Item 1\n◆ Item 2\n◆ Item 3',
      arrow: '→ Item 1\n→ Item 2\n→ Item 3', check: '☑ Item 1\n☑ Item 2\n☑ Item 3',
      checkmark: '✓ Item 1\n✓ Item 2\n✓ Item 3',
    };
    const sep = note.text.trim() ? '\n\n' : '';
    updateNote({ text: note.text + sep + (prefixes[type] || '') });
    closeAll();
  };

  // ── Tableau ───────────────────────────────────────────────────────────────
  const insertTable = (rows, cols) => {
    if (!note) return;
    const newTable = { id: Date.now(), rows, cols, data: Array.from({ length: rows }, () => Array(cols).fill('')) };
    updateNote({ tables: [...(note.tables || []), newTable] });
    closeAll();
  };

  const updateCell = (tableId, r, c, value) => {
    const tables = (note.tables || []).map((t) => {
      if (t.id !== tableId) return t;
      return { ...t, data: t.data.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? value : cell) : row) };
    });
    updateNote({ tables });
  };

  const tableAddColBefore = (tableId, colIdx) => {
    const tables = (note.tables || []).map((t) => t.id !== tableId ? t : { ...t, cols: t.cols + 1, data: t.data.map((row) => [...row.slice(0, colIdx), '', ...row.slice(colIdx)]) });
    updateNote({ tables }); setTableCtxMenu(null);
  };
  const tableAddColAfter = (tableId, colIdx) => {
    const tables = (note.tables || []).map((t) => t.id !== tableId ? t : { ...t, cols: t.cols + 1, data: t.data.map((row) => [...row.slice(0, colIdx + 1), '', ...row.slice(colIdx + 1)]) });
    updateNote({ tables }); setTableCtxMenu(null);
  };
  const tableDeleteCol = (tableId, colIdx) => {
    const tables = (note.tables || []).map((t) => (t.id !== tableId || t.cols <= 1) ? t : { ...t, cols: t.cols - 1, data: t.data.map((row) => row.filter((_, ci) => ci !== colIdx)) });
    updateNote({ tables }); setTableCtxMenu(null);
  };
  const tableAddRow = (tableId) => {
    const tables = (note.tables || []).map((t) => t.id !== tableId ? t : { ...t, rows: t.rows + 1, data: [...t.data, Array(t.cols).fill('')] });
    updateNote({ tables });
  };

  // ── Media ─────────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !note) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateNote({ images: [...(note.images || []), { id: Date.now(), src: ev.target.result, name: file.name }] });
      setMediaModal(false); setSelectedImg(null);
    };
    reader.readAsDataURL(file);
  };

  const insertSelectedImg = () => {
    if (!selectedImg || !note) return;
    updateNote({ images: [...(note.images || []), { id: Date.now(), src: selectedImg.src, name: selectedImg.name }] });
    setMediaModal(false); setSelectedImg(null);
  };

  // ── Lien ──────────────────────────────────────────────────────────────────
  const insertLink = (s) => {
    if (!note) return;
    updateNote({ links: [...(note.links || []), s] });
    closeAll(); setLinkInput('');
  };

  const insertCustomLink = () => {
    if (!note || !linkInput.trim()) return;
    const isYT = linkInput.includes('youtube.com') || linkInput.includes('youtu.be');
    let ytId = null;
    if (isYT) { const m = linkInput.match(/(?:v=|youtu\.be\/)([^&?/]+)/); if (m) ytId = m[1]; }
    insertLink({
      id: Date.now(), title: linkInput, source: 'Manuel', url: linkInput, type: isYT ? 'youtube' : 'web',
      thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null,
      siteName: (() => { try { return new URL(linkInput.startsWith('http') ? linkInput : `https://${linkInput}`).hostname; } catch { return linkInput; } })(),
      description: linkInput,
    });
  };

  // ── Cartes groupe ─────────────────────────────────────────────────────────
  const addGroupCard = () => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? { ...n, cards: [...(n.cards || [{ id: n.id, subtitle: n.title, text: n.text }]), { id: Date.now(), subtitle: 'Untitled', text: '' }] }
          : n
      )
    );
  };

  const removeLastGroupCard = () => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId && n.cards && n.cards.length > 1
          ? { ...n, cards: n.cards.slice(0, -1) }
          : n
      )
    );
  };

  // ── Lock ──────────────────────────────────────────────────────────────────
  const handleLockToggleAction = () => {
    if (note?.isLocked) { setLockStep('password-input'); } else { setLockStep('options'); }
    setOpenDD(null);
  };
  const handleLockNote = () => {
    if (!password.trim()) return;
    updateNote({ isLocked: !note?.isLocked });
    setLockStep(null); setPassword(''); closeAll();
  };
  const handleUnlockAll = () => {
    setNotes((prev) => prev.map((n) => ({ ...n, isLocked: false }))); closeAll();
  };

  // ── Coin plié ─────────────────────────────────────────────────────────────
  const FoldedCorner = () => (
    <div style={{
      position: 'absolute', bottom: 0, right: 0,
      width: '34px', height: '34px', pointerEvents: 'none',
      background: 'linear-gradient(135deg, #e4e4e4 20%, #cccccc 44%, #ffffff 52%, #ffffff 100%)',
      borderBottomRightRadius: '2px',
      boxShadow: '-3px -3px 5px rgba(0,0,0,0.18)',
    }} />
  );

  // ── Rendu note principale ─────────────────────────────────────────────────
  const renderMainStickyNote = () => {
    if (!note) return null;
    const pal = activePal;
    const mainText = note.cards && note.cards[0] ? note.cards[0].text : note.text;

    return (
      <div className="sticky-note" style={{ background: pal.body, width: CARD_WIDTH, minHeight: CARD_MIN_HEIGHT, flex: '0 0 auto', position: 'relative', borderRadius: '6px', boxShadow: '0 3px 8px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
        <div className="sticky-header-bar" style={{ background: pal.header, color: pal.text, fontWeight: 800, fontSize: '20px', padding: '22px 20px', textAlign: 'center', borderBottom: '2px solid rgba(0,0,0,0.12)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {note.isLocked ? '🔒 Contenu Protégé' : note.title}
        </div>
        <div className="sticky-body" style={{ padding: '18px 20px', flex: 1 }}>
          {note.isLocked ? (
            <div className="lock-masked-screen">
              <i className="fa-solid fa-lock lock-masked-icon"></i>
              <p className="lock-masked-text">Cette note est protégée.</p>
              <button className="btn-lock-yellow" style={{ width: 'auto', padding: '8px 20px', marginTop: '10px' }} onClick={() => setLockStep('password-input')}>
                Saisir le mot de passe
              </button>
            </div>
          ) : (
            <>
              {(note.images || []).map((img) => (
                <div key={img.id} className="note-image-block">
                  <img src={img.src} alt={img.name} />
                  <button className="note-image-remove" onClick={() => updateNote({ images: (note.images || []).filter((i) => i.id !== img.id) })}>✕</button>
                </div>
              ))}
              {(note.links || []).map((lnk) => (
                <div key={lnk.id} className="link-preview-card">
                  {lnk.thumbnail && (
                    <div className="link-preview-thumb">
                      <img src={lnk.thumbnail} alt={lnk.title} />
                      {lnk.type === 'youtube' && <div className="link-preview-play"><i className="fa-solid fa-play"></i></div>}
                    </div>
                  )}
                  <div className="link-preview-info">
                    <div className="link-preview-desc">{lnk.description}</div>
                    <div className="link-preview-site">{lnk.siteName}</div>
                  </div>
                  <div className="link-preview-bar" style={{ background: pal.header }} />
                  <button className="link-preview-remove" onClick={() => updateNote({ links: (note.links || []).filter((l) => l.id !== lnk.id) })}>✕</button>
                </div>
              ))}
              <textarea
                value={mainText || ''}
                placeholder="Start a note..."
                style={{ color: pal.darkText, width: '100%', minHeight: '120px', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '15px', lineHeight: 1.6, fontFamily: 'inherit' }}
                onChange={(e) => {
                  setNotes((prev) => prev.map((n) => {
                    if (n.id !== selectedId) return n;
                    const updatedCards = [...(n.cards || [])];
                    if (updatedCards[0]) updatedCards[0] = { ...updatedCards[0], text: e.target.value };
                    return { ...n, text: e.target.value, cards: updatedCards };
                  }));
                }}
              />
              {(note.tables || []).map((tbl) => (
                <div key={tbl.id} className="note-table-wrapper" style={{ position: 'relative', margin: '10px 0' }}>
                  <table className="note-table" style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        {tbl.data[0].map((_, ci) => (
                          <th key={ci} style={{ position: 'relative', padding: 0, border: '1px solid #bbb' }}>
                            <div className="col-handle" onClick={(e) => { e.stopPropagation(); setTableCtxMenu({ tableId: tbl.id, colIndex: ci }); }}
                              style={{ background: tableCtxMenu?.tableId === tbl.id && tableCtxMenu?.colIndex === ci ? '#FF9500' : '#e0e0e0', cursor: 'pointer', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#555' }}>···</div>
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
                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', padding: '4px', color: pal.darkText }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => tableAddRow(tbl.id)} style={{ marginTop: '4px', fontSize: '11px', background: 'none', border: '1px dashed #aaa', borderRadius: '4px', width: '100%', cursor: 'pointer', color: '#888', padding: '2px 0' }}>
                    + Add row
                  </button>
                  {tableCtxMenu?.tableId === tbl.id && (
                    <div className="table-ctx-menu" onClick={(e) => e.stopPropagation()}
                      style={{ position: 'absolute', top: '22px', left: `${(tableCtxMenu.colIndex / tbl.cols) * 100}%`, background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,.15)', zIndex: 999, minWidth: '170px', overflow: 'hidden' }}>
                      {[
                        { label: 'Insert a front column', action: () => tableAddColBefore(tbl.id, tableCtxMenu.colIndex) },
                        { label: 'Insert column after', action: () => tableAddColAfter(tbl.id, tableCtxMenu.colIndex) },
                        { label: 'Delete column', action: () => tableDeleteCol(tbl.id, tableCtxMenu.colIndex) },
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
        <FoldedCorner />
      </div>
    );
  };

  // ── Rendu carte supplémentaire ────────────────────────────────────────────
  const renderGroupCard = (card, subIdx) => {
    const pal = activePal;
    const globalIdx = subIdx + 1;
    return (
      <div key={card.id} className="sticky-note" style={{ background: pal.body, width: CARD_WIDTH, minHeight: CARD_MIN_HEIGHT, flex: '0 0 auto', position: 'relative', borderRadius: '6px', boxShadow: '0 3px 8px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>
        <div className="sticky-header-bar" style={{ background: pal.header, color: pal.text, fontWeight: 800, fontSize: '20px', padding: '22px 20px', textAlign: 'center', borderBottom: '2px solid rgba(0,0,0,0.12)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.subtitle || 'Untitled'}
        </div>
        <div className="sticky-body" style={{ padding: '18px 20px', flex: 1 }}>
          <textarea
            value={card.text || ''}
            placeholder="Start a note..."
            style={{ color: pal.darkText, width: '100%', minHeight: '120px', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '15px', lineHeight: 1.6, fontFamily: 'inherit' }}
            onChange={(e) => {
              setNotes((prev) => prev.map((n) => {
                if (n.id !== selectedId) return n;
                const updatedCards = (n.cards || []).map((c, i) => i === globalIdx ? { ...c, text: e.target.value } : c);
                return { ...n, cards: updatedCards };
              }));
            }}
          />
        </div>
        <FoldedCorner />
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <main className="note-editor" id="note-editor"
      onClick={(e) => {
        if (!e.target.closest('.editor-toolbar') && !e.target.closest('.search-wrapper')) closeAll();
        if (!e.target.closest('.table-ctx-menu') && !e.target.closest('.col-handle')) setTableCtxMenu(null);
      }}>

      {/* ═══ BARRE D'OUTILS ═══════════════════════════════════════════════
          FIX : style inline en flex-start + gap régulier de 14px pour que
          la loupe suive directement le reste des icônes au lieu d'être
          poussée tout à droite par un éventuel justify-content:space-between
          hérité du CSS global (.editor-toolbar). */}
      <div
        className="editor-toolbar"
        id="toolbar"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', flex: 1, gap: '4px' }}>

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
                  <li key={name} className="color-item" onClick={(e) => { e.stopPropagation(); setColor(name); }}>
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

        {/* ── Aa ── */}
        <div className="rel">
          <button onClick={(e) => { e.stopPropagation(); toggle('aa'); }} title="Police"
            style={{ background: openDD === 'aa' ? '#dcdcdc' : 'transparent', borderRadius: '5px', border: 'none', padding: '6px 12px', cursor: 'pointer' }}>
            <span style={{ fontWeight: '500', fontSize: '15px', color: '#444' }}>Aa</span>
          </button>
          {openDD === 'aa' && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: '0', marginTop: '6px', background: 'rgba(235,235,235,0.95)', backdropFilter: 'blur(25px)', borderRadius: '16px', padding: '12px', boxShadow: '0 12px 35px rgba(0,0,0,0.15)', zIndex: 9999, width: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                {[['B','bold','normal','none'],['I','normal','italic','none'],['U','normal','normal','underline'],['S','normal','normal','line-through']].map(([l,fw,fs,td]) => (
                  <button key={l} style={{ background: 'transparent', border: 'none', fontSize: '15px', fontWeight: fw, fontStyle: fs, textDecoration: td, color: '#000', cursor: 'pointer', width: '24px' }}>{l}</button>
                ))}
              </div>
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '2px 4px' }}>
                <span style={{ fontSize: '10px', color: '#8e8e93' }}>✓</span><span style={{ fontWeight: '600' }}>Body</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '2px 4px' }}>
                <span style={{ width: '10px' }}></span><span style={{ fontFamily: 'Courier New, monospace' }}>Monostyle</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '2px 4px' }}>
                <span style={{ width: '10px' }}></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '3px', height: '12px', background: '#ff9500', borderRadius: '1px' }} />
                  <span>Quote block</span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <select style={{ width: '100%', height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', fontSize: '12px', paddingLeft: '6px', appearance: 'none', outline: 'none', cursor: 'pointer' }}>
                  <option>Posterama</option><option>Helvetica</option><option>Georgia</option>
                </select>
                <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ position: 'relative', width: '50px' }}>
                  <select style={{ width: '100%', height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', fontSize: '12px', paddingLeft: '6px', appearance: 'none', outline: 'none' }}>
                    <option>8</option><option>10</option><option>12</option><option>14</option><option>16</option>
                  </select>
                  <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
                </div>
                <div style={{ position: 'relative', flex: 1, height: '22px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 6px', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700' }}>A</span>
                  <div style={{ width: '12px', height: '12px', background: '#000', borderRadius: '2px', marginLeft: 'auto', marginRight: '10px' }} />
                  <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '5px', color: '#ff9500', pointerEvents: 'none' }}>▲▼</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── LISTE ── */}
        <div className="rel">
          <button onClick={() => toggle('list')} title="Create a list"
            style={{ background: openDD === 'list' ? '#dcdcdc' : 'transparent', borderRadius: '4px', border: 'none', padding: '6px 10px', cursor: 'pointer' }}>
            <i className="fa-solid fa-list-ul" style={{ fontSize: '15px', color: '#444' }}></i>
          </button>
          {openDD === 'list' && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: '0', marginTop: '4px', background: 'rgba(238,238,238,0.94)', backdropFilter: 'blur(25px)', borderRadius: '10px', padding: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 9999, width: '230px', display: 'flex', gap: '6px' }}>
              <button onClick={closeAll} style={{ width: '42px', height: '54px', background: '#d0e1f9', border: 'none', borderRadius: '5px', color: '#0055cc', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>None</button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', flex: 1 }}>
                {[
                  { type: 'disc', els: ['•','•','•'] }, { type: 'circle', els: ['◦','◦','◦'] },
                  { type: 'num', els: ['1.','2.','3.'] }, { type: 'check', els: ['❑','❑','❑'] },
                  { type: 'diamond', els: ['◆','◆','◆'] }, { type: 'arrow', els: ['➔','➔','➔'] },
                  { type: 'checkmark', els: ['✓','✓','✓'] },
                ].map((item, idx) => (
                  <button key={idx} onClick={() => insertList(item.type)}
                    style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '4px', padding: '4px 2px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '3px' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}>
                    {item.els.map((bullet, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '8px', color: '#444', minWidth: '8px', textAlign: 'center' }}>{bullet}</span>
                        <div style={{ height: '1.5px', background: '#aaa', flex: 1 }} />
                      </div>
                    ))}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── TABLEAU ── */}
        <div className="rel">
          <button onClick={(e) => { e.stopPropagation(); if (!note) return; note.tables?.length > 0 ? updateNote({ tables: [] }) : insertTable(2, 2); }}
            title={note?.tables?.length > 0 ? 'Remove table' : 'Add a table'}
            style={{ background: note?.tables?.length > 0 ? '#dcdcdc' : 'transparent', borderRadius: '5px', border: 'none', padding: '6px 10px', cursor: 'pointer' }}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect x="0.5" y="0.5" width="17" height="13" rx="1.5" stroke="#444" strokeWidth="1"/>
              <line x1="9" y1="0.5" x2="9" y2="13.5" stroke="#444" strokeWidth="1"/>
              <line x1="0.5" y1="7" x2="17.5" y2="7" stroke="#444" strokeWidth="1"/>
            </svg>
          </button>
        </div>

        {/* ── IMAGE / MEDIA ── */}
        <div className="rel">
          <button onClick={() => toggle('media')} title="open your device's photo browser" className={openDD === 'media' ? 'active' : ''}>
            <i className="fa-regular fa-image"></i>
          </button>
          {openDD === 'media' && (
            <div className="media-dropdown" onClick={(e) => e.stopPropagation()}>
              <button className="media-item media-item-top" onClick={() => { setMediaModal(true); setMediaTab('photos'); closeAll(); }}>Photos &amp; Videos</button>
              <div className="media-section-separator" />
              <div className="media-section-label">GhostLabs App</div>
              <button className="media-item" onClick={() => { fileInputRef.current?.click(); closeAll(); }}>Take a photo</button>
              <button className="media-item" onClick={closeAll}>Scan documents</button>
              <button className="media-item" onClick={closeAll}>Add a sketch</button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />

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
                        {s.type === 'youtube' ? <i className="fa-brands fa-youtube" style={{ color: '#FF0000', fontSize: '18px' }}></i> : <i className="fa-solid fa-globe" style={{ color: '#555', fontSize: '14px' }}></i>}
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
                <input type="text" className="link-manual-input" placeholder="Coller un lien..." value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && insertCustomLink()} />
                <button className="link-add-btn" onClick={insertCustomLink}>Add</button>
              </div>
            </div>
          )}
        </div>

        <div className="tb-divider" />

        {/* ── LOCK ── */}
        <div className="rel">
          <button className={openDD === 'lock' || note?.isLocked ? 'active' : ''} onClick={() => toggle('lock')} title="Verrouiller">
            <i className={`fa-solid ${note?.isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
          </button>
          {openDD === 'lock' && (
            <div className="lock-dropdown">
              <button className="lock-item" onClick={handleLockToggleAction}>{note?.isLocked ? 'Unlock this note' : 'Lock this note'}</button>
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
                  <div className="mini-header-blue">{note?.title || 'Untitled'}</div>
                  <div className="mini-body-lines"><div className="mini-line"></div><div className="mini-line short"></div></div>
                </div>
                <div className="share-header-text">
                  <h3>{note?.title || 'New note'}</h3>
                  <p>{note?.folder || 'Notes'}</p>
                </div>
              </div>
              <div className="share-select-container">
                <select className="share-action-select"><option>Send a copy</option><option>Collaborate</option></select>
              </div>
              <div className="share-section-title">SpaceChat / GhostLabs Contacts</div>
              <div className="share-contacts-row">
                {[{ name: 'Moses', cls: 'avatar-yellow' }, { name: 'Adam', cls: 'avatar-green' }, { name: 'Kahina', cls: 'avatar-purple' }].map(({ name, cls }) => (
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
        {/* FIX : le bouton loupe garde toujours sa taille fixe dans le flux
            flex normal. Quand searchOpen est true, le champ + dropdown sont
            positionnés en absolute (position: 'absolute', right: 0) donc ils
            se superposent visuellement sans jamais élargir la largeur réelle
            de la barre d'outils — les autres icônes ne bougent plus et ne
            disparaissent plus. */}
        <div className="search-wrapper rel" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button title="Search" onClick={(e) => { e.stopPropagation(); if (searchOpen) { closeAll(); } else { closeAll(); setSearchOpen(true); } }}
            style={{ background: 'transparent', border: 'none', padding: '6px 10px', cursor: 'pointer', borderRadius: '5px' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '16px', color: '#444' }}></i>
          </button>

          {searchOpen && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)', zIndex: 10000 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type="text" placeholder="Search" autoFocus value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)}
                  style={{ width: '240px', height: '26px', background: 'rgba(235,235,235,0.6)', border: '1.5px solid #ff9500', borderRadius: '6px', padding: '0 28px 0 10px', fontSize: '13px', outline: 'none' }} />
                <div style={{ position: 'absolute', right: '8px', cursor: 'pointer' }} onClick={() => setSearchOpen(false)}>
                  <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '13px', color: '#777' }}></i>
                </div>
              </div>
              {!mediaSearch.trim() && (
                <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '6px', background: 'rgba(225,225,225,0.94)', backdropFilter: 'blur(25px)', borderRadius: '16px', padding: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 9999, width: '270px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', paddingLeft: '4px' }}>Research suggestions</div>
                  {[
                    { ic: 'fa-user-group', t: 'Shared notes' }, { ic: 'fa-lock', t: 'Locked Notes' },
                    { ic: 'fa-list-ul', t: 'Notes with lists' }, { ic: 'fa-hashtag', t: 'Notes with tags' },
                    { ic: 'fa-pen-ruler', t: 'Notes with drawings' }, { ic: 'fa-expand', t: 'Notes with scanned documents' },
                    { ic: 'fa-paperclip', t: 'Notes with attachments' },
                  ].map(({ ic, t }, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#000', cursor: 'pointer', padding: '3px 4px', borderRadius: '6px' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <i className={`fa-solid ${ic}`} style={{ width: '18px', textAlign: 'center', color: '#444' }}></i>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
      {/* ═══ FIN TOOLBAR ══════════════════════════════════════════════════ */}

      {/* ═══ ZONE D'ÉDITION ══════════════════════════════════════════════ */}
      <div className="editor-area" id="editor-area">
        <div className="editor-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div id="notes-display" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '20px', padding: '0 24px' }}>
          {note && renderMainStickyNote()}
          {additionalCards.map((card, idx) => renderGroupCard(card, idx))}
        </div>
      </div>

      {/* ═══ FOOTER + BOUTONS BAS (sur la même ligne) ════════════════════ */}
      <div className="editor-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '14px 20px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>

        {/* Champ titre — visible seulement quand il y a des cartes groupées */}
        {note && note.cards && note.cards.length > 0 && (
          <input
            type="text"
            value={note.title || ''}
            placeholder="Add a title..."
            onChange={(e) => updateNote({ title: e.target.value })}
            style={{
              flex: 1,
              maxWidth: '400px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '14px',
              background: '#f9f9f9',
              outline: 'none',
              textAlign: 'center',
              color: '#333',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
            }}
          />
        )}

        {/* + orange : ajoute une carte */}
        <button className="btn-round yellow" onClick={addGroupCard} title="Add more notes on the same doc">
          <i className="fa-solid fa-plus"></i>
        </button>

        {/* - rouge : supprime la dernière carte */}
        <button className="btn-round red" onClick={removeLastGroupCard} title="Remove last note">
          <i className="fa-solid fa-minus"></i>
        </button>

        {/* vert : ouvre la modal pour renommer */}
        <button className="btn-round teal" onClick={openRenameModal} title="Rename this group of cards">
          <i className="fa-regular fa-copy"></i>
        </button>
      </div>

      {/* ═══ MODAL RENOMMAGE ═════════════════════════════════════════════ */}
      {isRenameModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#000000', borderRadius: '24px', width: '750px', padding: '25px 40px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '30px' }}>
            <input
              type="text"
              placeholder="Add Title for theses notes"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveGroupTitle()}
              autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '2px solid #555555', color: '#ffffff', fontSize: '20px', fontWeight: '500', padding: '8px 0', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button onClick={saveGroupTitle} style={{ background: '#8cb4e6', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '12px 28px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', minWidth: '95px' }}>
                Save
              </button>
              <button onClick={() => setIsRenameModalOpen(false)} style={{ background: '#ffffff', color: '#000000', border: 'none', borderRadius: '12px', padding: '12px 28px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', minWidth: '95px' }}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODALE PHOTOS ═══════════════════════════════════════════════ */}
      {mediaModal && (
        <div className="media-modal-overlay" onClick={() => { setMediaModal(false); setSelectedImg(null); }}>
          <div className="media-modal" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-traffic">
              <button className="traffic green" onClick={() => { setMediaModal(false); setSelectedImg(null); }} />
              <button className="traffic yellow" onClick={() => { setMediaModal(false); setSelectedImg(null); }} />
              <button className="traffic red" onClick={() => { setMediaModal(false); setSelectedImg(null); }} />
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
              {(note?.images || []).filter((img) => mediaSearch === '' || img.name.toLowerCase().includes(mediaSearch.toLowerCase())).map((img) => (
                <div key={img.id} className={`media-grid-item${selectedImg?.id === img.id ? ' selected' : ''}`} onClick={() => setSelectedImg(selectedImg?.id === img.id ? null : img)}>
                  <img src={img.src} alt={img.name} />
                  <div className="media-grid-name">{img.name.length > 12 ? img.name.slice(0, 9) + '...' : img.name}</div>
                </div>
              ))}
              {(note?.images || []).length === 0 && (
                <div className="media-empty">
                  <i className="fa-regular fa-image" style={{ fontSize: '32px', color: '#ccc' }}></i>
                  <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>Aucune photo.<br/>
                    <span style={{ color: '#007AFF', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>Importer depuis l'appareil</span>
                  </p>
                </div>
              )}
            </div>
            <div className="media-modal-footer">
              <div className="media-search-wrap">
                <input type="text" placeholder="Search" className="media-search-input" value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} />
                <i className="fa-solid fa-magnifying-glass media-search-icon"></i>
              </div>
              {selectedImg && <button className="media-insert-btn" onClick={insertSelectedImg}>Insert</button>}
              <span className="media-count">{(note?.images || []).length}/{(note?.images || []).length}</span>
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
              <h2>Verrouiller avec le mot de passe de session</h2>
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
              <p>La création d'un mot de passe dédié apporte une couche de sécurité supplémentaire.</p>
              <div className="lock-dots"><div className="lock-dot"/><div className="lock-dot active"/></div>
              <button className="btn-lock-yellow" onClick={() => setLockStep('password-input')}>Créer pour cette note</button>
            </div>
          )}
          {lockStep === 'password-input' && (
            <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lock-icon-circle"><i className="fa-solid fa-lock"></i></div>
              <h2 style={{ marginBottom: '5px' }}>SpaceNotes</h2>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '22px' }}>Saisissez le mot de passe pour verrouiller cette note.</p>
              <input type="password" className="lock-input" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              <div className="lock-modal-actions">
                <button className="btn-lock-cancel" onClick={() => setLockStep(note?.isLocked ? null : 'options')}>Annuler</button>
                <button className="btn-lock-yellow" style={{ flex: 1, margin: 0 }} onClick={handleLockNote}>Confirmer</button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}