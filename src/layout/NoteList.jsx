import React from 'react';
import { COLOR_PALETTES } from '../App';

/* Importation des images générées */
import plusIcon from './icones plus.png';
import trashIcon from './icone trash.png';


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
  const addNote = () => {
    const id = Date.now();

    const newGroup = {
      id,
      title: 'Untitled',
      color: 'Yellow',
      date: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      folder: 'Notes',
      cards: [
        {
          id: id + 1,
          subtitle: 'Untitled',
          text: 'Start a note...',
        },
      ],
      tables: [],
      links: [],
      images: [],
    };

    setNotes((previousNotes) => [
      newGroup,
      ...previousNotes,
    ]);

    setSelectedId(id);
  };

  /* Supprimer le groupe sélectionné */
  const deleteNote = () => {
    if (!selectedId) return;

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