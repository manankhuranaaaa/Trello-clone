import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getCard, updateCard, deleteCard,
  addLabel, removeLabel, addMember, removeMember,
  createChecklist, deleteChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem,
  addComment, deleteComment,
} from '../../api';
import styles from './CardModal.module.css';

const COVER_COLORS = ['#EB5A46','#FF9F1A','#61BD4F','#0052cc','#C377E0','#00C2E0','#51E898','#FF78CB',''];

export default function CardModal({ cardId, labels: boardLabels, members: boardMembers, onClose }) {
  const [card, setCard] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [coverColor, setCoverColor] = useState('');
  const [activePopover, setActivePopover] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('Checklist');
  const currentMember = boardMembers[0];

  useEffect(() => {
    getCard(cardId).then(data => {
      setCard(data);
      setTitle(data.title);
      setDesc(data.description || '');
      setDueDate(data.due_date ? data.due_date.split('T')[0] : '');
      setCoverColor(data.cover_color || '');
    }).catch(() => toast.error('Failed to load card'));
  }, [cardId]);

  const reload = () => getCard(cardId).then(setCard).catch(() => {});

  const saveTitle = async () => {
    setEditingTitle(false);
    if (!title.trim() || title === card.title) { setTitle(card.title); return; }
    try {
      await updateCard(cardId, { title: title.trim() });
      reload();
      toast.success('Title updated');
    } catch { toast.error('Failed to update title'); setTitle(card.title); }
  };

  const saveDesc = async () => {
    setEditingDesc(false);
    try {
      await updateCard(cardId, { description: desc });
      reload();
      toast.success('Description saved');
    } catch { toast.error('Failed to save description'); }
  };

  const saveDueDate = async (val) => {
    setDueDate(val);
    try {
      await updateCard(cardId, { due_date: val || null });
      reload();
    } catch { toast.error('Failed to update due date'); }
  };

  const saveCover = async (color) => {
    setCoverColor(color);
    setActivePopover(null);
    try {
      await updateCard(cardId, { cover_color: color || null });
      reload();
    } catch { toast.error('Failed to update cover'); }
  };

  const toggleLabel = async (labelId) => {
    const has = card.labels.some(l => l.id === labelId);
    try {
      if (has) await removeLabel(cardId, labelId);
      else await addLabel(cardId, labelId);
      reload();
    } catch { toast.error('Failed to update label'); }
  };

  const toggleMember = async (memberId) => {
    const has = card.members.some(m => m.id === memberId);
    try {
      if (has) await removeMember(cardId, memberId);
      else await addMember(cardId, memberId);
      reload();
    } catch { toast.error('Failed to update member'); }
  };

  const handleAddChecklist = async () => {
    try {
      await createChecklist(cardId, newChecklistTitle);
      setActivePopover(null);
      setNewChecklistTitle('Checklist');
      reload();
      toast.success('Checklist added');
    } catch { toast.error('Failed to add checklist'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentMember) return;
    try {
      await addComment(cardId, { member_id: currentMember.id, text: commentText.trim() });
      setCommentText('');
      reload();
    } catch { toast.error('Failed to post comment'); }
  };

  const handleArchive = async () => {
    try {
      await updateCard(cardId, { archived: true });
      toast.success('Card archived');
      onClose();
    } catch { toast.error('Failed to archive card'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card permanently?')) return;
    try {
      await deleteCard(cardId);
      toast.success('Card deleted');
      onClose();
    } catch { toast.error('Failed to delete card'); }
  };

  if (!card) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className={styles.loadingState}>
          {[1,2,3].map(i => <div key={i} className={`skeleton ${styles.skeletonLine}`} style={{ width: i === 1 ? '60%' : i === 2 ? '90%' : '75%' }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {card.cover_color && <div className={styles.cover} style={{ background: card.cover_color }} />}
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className={styles.body}>
          {/* ── Main ── */}
          <div className={styles.main}>

            {/* Title */}
            <div className={styles.row}>
              <div className={styles.rowIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                {editingTitle ? (
                  <textarea
                    autoFocus
                    className={`inline-edit-input ${styles.titleTextarea}`}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveTitle(); } }}
                    rows={2}
                  />
                ) : (
                  <h2 className={styles.cardTitle} onClick={() => setEditingTitle(true)}>{card.title}</h2>
                )}
              </div>
            </div>

            {/* Labels + Members + Due inline badges */}
            {(card.labels.length > 0 || card.members.length > 0 || dueDate) && (
              <div className={styles.badges}>
                {card.labels.length > 0 && (
                  <div className={styles.badgeGroup}>
                    <p className={styles.badgeLabel}>Labels</p>
                    <div className={styles.labelChips}>
                      {card.labels.map(l => (
                        <span key={l.id} className={styles.labelChip} style={{ background: l.color }}>{l.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {card.members.length > 0 && (
                  <div className={styles.badgeGroup}>
                    <p className={styles.badgeLabel}>Members</p>
                    <div className={styles.avatarRow}>
                      {card.members.map(m => (
                        <span key={m.id} className={styles.avatar} style={{ background: m.avatar_color }} title={m.name}>{m.name[0]}</span>
                      ))}
                    </div>
                  </div>
                )}
                {dueDate && (
                  <div className={styles.badgeGroup}>
                    <p className={styles.badgeLabel}>Due Date</p>
                    <input type="date" className={styles.dateInput} value={dueDate} onChange={e => saveDueDate(e.target.value)} />
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className={styles.row} style={{ marginTop: 20 }}>
              <div className={styles.rowIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h12v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.rowHeader}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                  {!editingDesc && (
                    <button className="btn btn-subtle" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setEditingDesc(true)}>
                      Edit
                    </button>
                  )}
                </div>
                {editingDesc ? (
                  <div>
                    <textarea
                      autoFocus className="inline-edit-input"
                      value={desc} onChange={e => setDesc(e.target.value)}
                      rows={4} placeholder="Add a more detailed description..."
                      style={{ marginTop: 6 }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn-primary" onClick={saveDesc}>Save</button>
                      <button className="btn btn-subtle" onClick={() => { setEditingDesc(false); setDesc(card.description || ''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.descText} onClick={() => setEditingDesc(true)}>
                    {card.description || <span className={styles.descPlaceholder}>Add a description…</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {card.checklists.map(cl => (
              <ChecklistSection
                key={cl.id} checklist={cl} cardId={cardId}
                onAddItem={async (clId, text) => { await addChecklistItem(cardId, clId, text); reload(); }}
                onToggleItem={async (clId, itemId, completed) => { await updateChecklistItem(cardId, clId, itemId, { completed: !completed }); reload(); }}
                onDeleteItem={async (clId, itemId) => { await deleteChecklistItem(cardId, clId, itemId); reload(); }}
                onDelete={async (clId) => { await deleteChecklist(cardId, clId); reload(); toast.success('Checklist deleted'); }}
              />
            ))}

            {/* Activity */}
            <div className={styles.row} style={{ marginTop: 20 }}>
              <div className={styles.rowIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: 14 }}>Activity</h3>
                {currentMember && (
                  <form onSubmit={handleComment} className={styles.commentForm}>
                    <span className={styles.avatar} style={{ background: currentMember.avatar_color, flexShrink: 0 }}>{currentMember.name[0]}</span>
                    <div style={{ flex: 1 }}>
                      <textarea
                        className="inline-edit-input"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        rows={commentText ? 3 : 1}
                        style={{ resize: 'none' }}
                      />
                      {commentText && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button type="submit" className="btn btn-primary">Save</button>
                          <button type="button" className="btn btn-subtle" onClick={() => setCommentText('')}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </form>
                )}
                <div className={styles.commentList}>
                  {card.comments.map(c => (
                    <div key={c.id} className={styles.comment}>
                      <span className={styles.avatar} style={{ background: c.avatar_color, flexShrink: 0 }}>{c.member_name[0]}</span>
                      <div style={{ flex: 1 }}>
                        <div className={styles.commentMeta}>
                          <strong className={styles.commentAuthor}>{c.member_name}</strong>
                          <span className={styles.commentTime}>{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                        <p className={styles.commentText}>{c.text}</p>
                        {currentMember?.id === c.member_id && (
                          <button className={styles.deleteComment} onClick={() => deleteComment(cardId, c.id).then(reload)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className={styles.sidebar}>
            <p className={styles.sidebarHeading}>Add to card</p>
            <SidebarBtn icon="👤" label="Members" active={activePopover === 'members'} onClick={() => setActivePopover(p => p === 'members' ? null : 'members')} />
            {activePopover === 'members' && (
              <Popover onClose={() => setActivePopover(null)} title="Members">
                {boardMembers.map(m => (
                  <label key={m.id} className={styles.popoverItem}>
                    <input type="checkbox" checked={card.members.some(cm => cm.id === m.id)} onChange={() => toggleMember(m.id)} />
                    <span className={styles.avatar} style={{ background: m.avatar_color }}>{m.name[0]}</span>
                    <span>{m.name}</span>
                  </label>
                ))}
              </Popover>
            )}

            <SidebarBtn icon="🏷" label="Labels" active={activePopover === 'labels'} onClick={() => setActivePopover(p => p === 'labels' ? null : 'labels')} />
            {activePopover === 'labels' && (
              <Popover onClose={() => setActivePopover(null)} title="Labels">
                {boardLabels.map(l => (
                  <label key={l.id} className={styles.popoverItem}>
                    <input type="checkbox" checked={card.labels.some(cl => cl.id === l.id)} onChange={() => toggleLabel(l.id)} />
                    <span className={styles.labelChip} style={{ background: l.color, flex: 1 }}>{l.name}</span>
                  </label>
                ))}
              </Popover>
            )}

            <SidebarBtn icon="✓" label="Checklist" active={activePopover === 'checklist'} onClick={() => setActivePopover(p => p === 'checklist' ? null : 'checklist')} />
            {activePopover === 'checklist' && (
              <Popover onClose={() => setActivePopover(null)} title="Add Checklist">
                <p className={styles.popoverFieldLabel}>Title</p>
                <input className="inline-edit-input" style={{ marginBottom: 10 }} value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)} />
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddChecklist}>Add</button>
              </Popover>
            )}

            <SidebarBtn icon="🗓" label="Due Date" active={activePopover === 'due'} onClick={() => setActivePopover(p => p === 'due' ? null : 'due')} />
            {activePopover === 'due' && (
              <Popover onClose={() => setActivePopover(null)} title="Due Date">
                <input type="date" className="inline-edit-input" value={dueDate} onChange={e => { saveDueDate(e.target.value); setActivePopover(null); }} />
                {dueDate && <button className="btn btn-subtle" style={{ width: '100%', marginTop: 8 }} onClick={() => { saveDueDate(''); setActivePopover(null); }}>Remove</button>}
              </Popover>
            )}

            <SidebarBtn icon="🎨" label="Cover" active={activePopover === 'cover'} onClick={() => setActivePopover(p => p === 'cover' ? null : 'cover')} />
            {activePopover === 'cover' && (
              <Popover onClose={() => setActivePopover(null)} title="Cover Color">
                <div className={styles.coverGrid}>
                  {COVER_COLORS.map((c, i) => (
                    <button
                      key={i}
                      className={`${styles.coverSwatch} ${coverColor === c ? styles.swatchSelected : ''}`}
                      style={{ background: c || 'var(--list-bg)', border: c ? 'none' : '1px solid var(--border)' }}
                      onClick={() => saveCover(c)}
                      title={c || 'No cover'}
                    >
                      {!c && <span style={{ fontSize: 14, color: 'var(--text-subtle)' }}>✕</span>}
                    </button>
                  ))}
                </div>
              </Popover>
            )}

            <div className={styles.sidebarDivider} />
            <p className={styles.sidebarHeading}>Actions</p>
            <SidebarBtn icon="📦" label="Archive" onClick={handleArchive} />
            <SidebarBtn icon="🗑" label="Delete" onClick={handleDelete} danger />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarBtn({ icon, label, onClick, danger, active }) {
  return (
    <button className={`${styles.sidebarBtn} ${danger ? styles.danger : ''} ${active ? styles.active : ''}`} onClick={onClick}>
      <span className={styles.sidebarBtnIcon}>{icon}</span>
      {label}
    </button>
  );
}

function Popover({ onClose, title, children }) {
  return (
    <>
      <div className="popover-overlay" onClick={onClose} />
      <div className="popover" style={{ position: 'relative', zIndex: 202, marginTop: 4 }}>
        <h4>{title}</h4>
        {children}
      </div>
    </>
  );
}

function ChecklistSection({ checklist, cardId, onAddItem, onToggleItem, onDeleteItem, onDelete }) {
  const [addingItem, setAddingItem] = useState(false);
  const [itemText, setItemText] = useState('');
  const total = checklist.items.length;
  const done = checklist.items.filter(i => i.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!itemText.trim()) return;
    await onAddItem(checklist.id, itemText.trim());
    setItemText('');
    setAddingItem(false);
  };

  return (
    <div className={styles.row} style={{ marginTop: 20 }}>
      <div className={styles.rowIcon}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div className={styles.rowHeader}>
          <h3 className={styles.sectionTitle}>{checklist.title}</h3>
          <button className="btn btn-subtle" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => onDelete(checklist.id)}>Delete</button>
        </div>
        <div className={styles.progressBar}>
          <span className={`${styles.progressPct} ${allDone ? styles.progressDone : ''}`}>{pct}%</span>
          <div className={styles.progressTrack}>
            <div className={`${styles.progressFill} ${allDone ? styles.progressFillDone : ''}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        {checklist.items.map(item => (
          <div key={item.id} className={`${styles.checkItem} ${item.completed ? styles.checkItemDone : ''}`}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={item.completed}
              onChange={() => onToggleItem(checklist.id, item.id, item.completed)}
            />
            <span className={styles.checkItemText}>{item.text}</span>
            <button className={styles.deleteItemBtn} onClick={() => onDeleteItem(checklist.id, item.id)}>✕</button>
          </div>
        ))}
        {addingItem ? (
          <form onSubmit={handleAdd} style={{ marginTop: 8 }}>
            <textarea
              autoFocus className="inline-edit-input"
              value={itemText} onChange={e => setItemText(e.target.value)}
              placeholder="Add an item..." rows={2}
              onKeyDown={e => { if (e.key === 'Escape') setAddingItem(false); }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary">Add</button>
              <button type="button" className="btn btn-subtle" onClick={() => setAddingItem(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <button className="btn btn-subtle" style={{ marginTop: 8, fontSize: 13 }} onClick={() => setAddingItem(true)}>
            Add an item
          </button>
        )}
      </div>
    </div>
  );
}
