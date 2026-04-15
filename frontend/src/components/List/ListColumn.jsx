import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { updateList, deleteList, createCard } from '../../api';
import CardItem from '../Card/CardItem';

export default function ListColumn({ list, index, cards, cardLabels, cardMembers, labels, members, onCardClick, onListUpdate, onListDelete, onCardCreate, styles: s }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle]               = useState(list.title);
  const [addingCard, setAddingCard]     = useState(false);
  const [cardTitle, setCardTitle]       = useState('');
  const [menuOpen, setMenuOpen]         = useState(false);

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    if (title.trim() && title !== list.title) {
      try { const u = await updateList(list.id, { title: title.trim() }); onListUpdate(u); toast.success('Renamed'); }
      catch { toast.error('Failed'); setTitle(list.title); }
    } else setTitle(list.title);
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    try {
      const card = await createCard({ list_id: list.id, title: cardTitle.trim() });
      onCardCreate(card); setCardTitle('');
      toast.success('Card added ✓');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!confirm(`Delete "${list.title}"?`)) return;
    try { await deleteList(list.id); onListDelete(list.id); toast.success('List deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`${s.list} ${snapshot.isDragging ? s.listDragging : ''}`}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Header */}
          <div {...provided.dragHandleProps} className={s.listHeader}>
            {editingTitle ? (
              <input autoFocus className={s.listTitleInput} value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={e => { if (e.key === 'Enter') handleTitleBlur(); if (e.key === 'Escape') { setTitle(list.title); setEditingTitle(false); } }}
              />
            ) : (
              <span className={s.listTitle} onClick={() => setEditingTitle(true)}>{list.title}</span>
            )}

            <span className={s.listCount}>{cards.length}</span>

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button className={s.listMenuBtn} onClick={() => setMenuOpen(o => !o)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="popover-overlay" onClick={() => setMenuOpen(false)} />
                  <div className={s.listMenu}>
                    <div className={s.listMenuTitle}>List Actions</div>
                    {[
                      { icon: '＋', label: 'Add card', fn: () => { setMenuOpen(false); setAddingCard(true); } },
                      { icon: '✎', label: 'Rename list', fn: () => { setMenuOpen(false); setEditingTitle(true); } },
                    ].map(item => (
                      <button key={item.label} className={s.listMenuItem} onClick={item.fn}>
                        <span style={{ fontSize: 13 }}>{item.icon}</span> {item.label}
                      </button>
                    ))}
                    <div className={s.listMenuDivider} />
                    <button className={`${s.listMenuItem} ${s.listMenuItemDanger}`} onClick={handleDelete}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      Delete list
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cards */}
          <Droppable droppableId={list.id} type="CARD">
            {(prov, snap) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className={`${s.cardsArea} ${snap.isDraggingOver ? s.cardsAreaOver : ''}`}
              >
                {cards.map((card, i) => (
                  <CardItem
                    key={card.id} card={card} index={i}
                    labels={cardLabels.filter(cl => cl.card_id === card.id).map(cl => labels.find(l => l.id === cl.label_id)).filter(Boolean)}
                    members={cardMembers.filter(cm => cm.card_id === card.id).map(cm => members.find(m => m.id === cm.member_id)).filter(Boolean)}
                    onClick={() => onCardClick(card.id)}
                    styles={s}
                  />
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add card */}
          {addingCard ? (
            <form className={s.addCardForm} onSubmit={handleAddCard}>
              <textarea
                autoFocus
                className={s.addCardTextarea}
                placeholder="Enter a title for this card…"
                value={cardTitle}
                onChange={e => setCardTitle(e.target.value)}
                rows={2}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e); } if (e.key === 'Escape') setAddingCard(false); }}
              />
              <div className={s.addCardActions}>
                <button type="submit" className={s.addCardSubmit}>Add card</button>
                <button type="button" className={s.addCardCancel} onClick={() => setAddingCard(false)}>✕</button>
              </div>
            </form>
          ) : (
            <button className={s.addCardBtn} onClick={() => setAddingCard(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}
