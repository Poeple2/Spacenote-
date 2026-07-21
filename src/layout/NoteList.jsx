import React from 'react';
import { COLOR_PALETTES } from '../App';

export default function NoteList({
  notes,          // C'est maintenant ton tableau de groupes de cartes
  setNotes,
  selectedId,
  setSelectedId,
  selectedFolder,
  groupTitle,     // Le titre général (ex: "Today")
  onOpenGroupModal,
}) {
  
  // Filtrage des groupes selon le dossier de l'espace de travail
  const visibleNotes =
    selectedFolder === 'all'
      ? notes
      : notes.filter((n) => n.folder === 'Notes');

  // ACTION : Créer un tout nouveau groupe indépendant de cartes
 const addNote = () => {
  const id = Date.now();
  const newGroup = {
    id,
    title: 'Untitled',
    color: 'Yellow',
    date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    folder: 'Notes',
    // On instancie un tout nouveau tableau à chaque création
    cards: [
      { id: Date.now() + 1, subtitle: 'Untitled', text: 'Start a note...' }
    ],
    tables: [],
    links: [],
    images: []
  };
  setNotes((prev) => [newGroup, ...prev]);
  setSelectedId(id);
};

  // ACTION : Supprimer le groupe entier sélectionné
  const deleteNote = () => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== selectedId);
      setSelectedId(next.length ? next[0].id : null);
      return next;
    });
  };

  return (
    <div className="note-list">
      <div className="note-list-header">
        {/* Titre de l'espace actuel en haut à gauche de la liste */}
        <span
          className="note-list-header-title"
          style={{ cursor: 'pointer', flex: 1 }}
          onClick={onOpenGroupModal}
          title="Cliquer pour nommer cet espace"
        >
          {groupTitle || 'Today'}
        </span>
        
        <div className="note-list-header-btns">
          {/* Bouton (+) en haut de la liste pour créer un NOUVEAU groupe vide */}
          <button className="note-header-btn" title="New group of cards" onClick={addNote}>
            <i className="fa-solid fa-plus"></i>
          </button>
          {/* Bouton Poubelle pour supprimer le groupe entier */}
          <button className="note-header-btn" title="Delete group" onClick={deleteNote}>
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div id="note-list-body">
        {visibleNotes.map((group) => {
          const pal = COLOR_PALETTES[group.color] || COLOR_PALETTES['Yellow'];
          
          // On récupère le texte de la toute première carte du groupe pour l'aperçu
          const firstCardText = group.cards && group.cards.length > 0 
            ? group.cards[0].text 
            : 'No new text';

          return (
            <div
              key={group.id}
              className={`note-card${group.id === selectedId ? ' active' : ''}`}
              style={{ background: group.id === selectedId ? pal.body : '' }}
              onClick={() => setSelectedId(group.id)} // Charge le groupe au clic
            >
              {/* Affiche le titre personnalisé du groupe (ex: People Inc Project 2025) */}
              <div className="note-card-title">{group.title}</div>
              
              <div className="note-card-info">
                <span className="time">{group.date}</span>
                {/* L'aperçu dynamique basé sur la première carte */}
                <span className="preview">{firstCardText.slice(0, 18)}...</span>
                <i className="fa-solid fa-droplet status-icon" style={{ color: pal.header }}></i>
              </div>
              
              <div className="note-card-folder">
                <i className="fa-regular fa-folder"></i>
                <span>Notes</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}