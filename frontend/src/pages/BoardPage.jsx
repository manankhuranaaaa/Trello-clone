import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { getBoard, reorderLists, moveCard, reorderCards, createList, updateBoard } from '../api';
import { useAuth } from '../context/AuthContext';
import ListColumn from '../components/List/ListColumn';
import CardModal from '../components/Card/CardModal';
import s from './Board.module.css';

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [board, setBoard]           = useState(null);
  const [lists, setLists]           = useState([]);
  const [cards, setCards]           = useState([]);
  const [labels, setLabels]         = useState([]);
  const [cardLabels, setCardLabels] = useState([]);
  const [cardMembers, setCardMembers] = useState([]);
  const [members, setMembers]       = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  const [filter, setFilter]         = useState({ q: '', label_id: '', member_id: '', due: '' });
  const [loading, setLoading]       = useState(true);

  const loadBoard = useCallback(async () => {
    try {
      const data = await getBoard(boardId);
      setBoard(data.board); setLists(data.lists); setCards(data.cards);
      setLabels(data.labels); setCardLabels(data.cardLabels);
      setCardMembers(data.cardMembers); setMembers(data.members);
    } catch { toast.error('Failed to load board'); navigate('/'); }
    finally { setLoading(false); }
  }, [boardId, navigate]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  const getCardsForList = (listId) => {
    let f = cards.filter(c => c.list_id === listId);
    if (filter.q) f = f.filter(c => c.title.toLowerCase().includes(filter.q.toLowerCase()));
    if (filter.label_id) f = f.filter(c => cardLabels.some(cl => cl.card_id === c.id && cl.label_id === filter.label_id));
    if (filter.member_id) f = f.filter(c => cardMembers.some(cm => cm.card_id === c.id && cm.member_id === filter.member_id));
    if (filter.due) {
      const today = new Date(); today.setHours(0,0,0,0);
      f = f.filter(c => {
        if (!c.due_date) return false;
        const d = new Date(c.due_date);
        if (filter.due === 'overdue') return d < today;
        if (filter.due === 'today') return d.toDateString() === today.toDateString();
        if (filter.due === 'week') { const w = new Date(today); w.setDate(w.getDate()+7); return d >= today && d <= w; }
        return true;
      });
    }
    return f;
  };

  const onDragEnd = async ({ source, destination, type }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    if (type === 'LIST') {
      const nl = Array.from(lists);
      const [m] = nl.splice(source.index, 1);
      nl.splice(destination.index, 0, m);
      setLists(nl);
      try { await reorderLists(nl.map(l => l.id)); } catch { toast.error('Failed'); loadBoard(); }
      return;
    }
    const src = source.droppableId, dst = destination.droppableId;
    const srcCards = cards.filter(c => c.list_id === src).sort((a,b) => a.position - b.position);
    const [moved] = srcCards.splice(source.index, 1);
    if (src === dst) {
      srcCards.splice(destination.index, 0, moved);
      setCards(prev => prev.map(c => { const i = srcCards.findIndex(s => s.id === c.id); return i !== -1 ? {...c, position: i+1} : c; }));
      try { await reorderCards(srcCards.map(c => c.id)); } catch { toast.error('Failed'); loadBoard(); }
    } else {
      const dstCards = cards.filter(c => c.list_id === dst).sort((a,b) => a.position - b.position);
      dstCards.splice(destination.index, 0, {...moved, list_id: dst});
      setCards(prev => prev.map(c => {
        if (c.id === moved.id) return {...c, list_id: dst};
        const i = dstCards.findIndex(d => d.id === c.id);
        return i !== -1 ? {...c, position: i+1} : c;
      }));
      try { await moveCard(moved.id, { list_id: dst, orderedIds: dstCards.map(c => c.id) }); } catch { toast.error('Failed'); loadBoard(); }
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? 'MK';
  const hasFilter = filter.q || filter.label_id || filter.member_id || filter.due;

  if (loading) return (
    <div className={s.loadingPage}>
      <div className={s.loadingNav} />
      <div className={s.loadingCanvas}>
        {[380, 320, 260].map((h, i) => <div key={i} className={s.loadingSkeleton} style={{ height: h }} />)}
      </div>
    </div>
  );

  if (!board) return null;

  return (
    <div className={s.boardPage} style={{ background: board.background, backgroundSize: 'cover' }}>

      {/* ── Top Navbar ── */}
      <nav className={s.nav}>
        <button className={s.navLogo} onClick={() => navigate('/')}>
          <div className={s.navLogoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <rect x="2" y="2" width="9" height="14" rx="2"/>
              <rect x="13" y="2" width="9" height="9" rx="2"/>
            </svg>
          </div>
          Trello
        </button>

        {['Workspaces','Recent','Starred','Templates'].map(label => (
          <button key={label} className={s.navBtn} onClick={() => toast('Coming soon!', { icon: '🚧' })}>
            {label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
        ))}

        <button className={s.navCreate} onClick={() => toast('Coming soon!', { icon: '🚧' })}>+ Create</button>

        <div className={s.navRight}>
          <div className={s.searchWrap}>
            <input className={s.searchInput} placeholder="Search…" />
            <svg className={s.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <div className={s.avatar} title={user?.name}>{initials}</div>
          <button className={s.logoutBtn} onClick={handleLogout}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Sub-header ── */}
      <div className={s.subHeader}>
        <BoardTitle board={board} onUpdate={setBoard} styles={s} />
        <div className={s.divider} />

        <div className={s.filterBar}>
          <div className={s.filterSearchWrap}>
            <svg className={s.filterSearchIcon} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              className={s.filterSearchInput}
              placeholder="Search cards…"
              value={filter.q}
              onChange={e => setFilter(f => ({...f, q: e.target.value}))}
            />
          </div>

          <select className={s.filterSelect} value={filter.label_id} onChange={e => setFilter(f => ({...f, label_id: e.target.value}))}>
            <option value="">Label</option>
            {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>

          <select className={s.filterSelect} value={filter.member_id} onChange={e => setFilter(f => ({...f, member_id: e.target.value}))}>
            <option value="">Member</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <select className={s.filterSelect} value={filter.due} onChange={e => setFilter(f => ({...f, due: e.target.value}))}>
            <option value="">Due date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
          </select>

          {hasFilter && (
            <button className={s.clearFilterBtn} onClick={() => setFilter({ q: '', label_id: '', member_id: '', due: '' })}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Board Canvas ── */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className={s.canvas}>
              {lists.map((list, index) => (
                <ListColumn
                  key={list.id} list={list} index={index}
                  cards={getCardsForList(list.id)}
                  cardLabels={cardLabels} cardMembers={cardMembers}
                  labels={labels} members={members}
                  onCardClick={setActiveCardId}
                  onListUpdate={u => setLists(prev => prev.map(l => l.id === u.id ? u : l))}
                  onListDelete={id => setLists(prev => prev.filter(l => l.id !== id))}
                  onCardCreate={card => setCards(prev => [...prev, card])}
                  styles={s}
                />
              ))}
              {provided.placeholder}
              <AddListBtn boardId={boardId} onAdd={list => setLists(prev => [...prev, list])} styles={s} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {activeCardId && (
        <CardModal
          cardId={activeCardId} labels={labels} members={members}
          onClose={() => { setActiveCardId(null); loadBoard(); }}
        />
      )}
    </div>
  );
}

function AddListBtn({ boardId, onAdd, styles: s }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const list = await createList({ board_id: boardId, title: title.trim() });
      onAdd(list); setTitle(''); setAdding(false);
      toast.success('List added');
    } catch { toast.error('Failed'); }
  };

  if (!adding) return (
    <button className={s.addListBtn} onClick={() => setAdding(true)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Add another list
    </button>
  );

  return (
    <form className={s.addListForm} onSubmit={handleSubmit}>
      <input
        autoFocus
        className={s.addListInput}
        placeholder="Enter list title…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && setAdding(false)}
      />
      <div className={s.addListActions}>
        <button type="submit" className={s.addListSubmit}>Add list</button>
        <button type="button" className={s.addListCancel} onClick={() => setAdding(false)}>✕</button>
      </div>
    </form>
  );
}

function BoardTitle({ board, onUpdate, styles: s }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(board.title);

  const handleBlur = async () => {
    setEditing(false);
    if (title.trim() && title !== board.title) {
      try { const u = await updateBoard(board.id, { title: title.trim() }); onUpdate(u); toast.success('Renamed'); }
      catch { toast.error('Failed'); setTitle(board.title); }
    }
  };

  if (editing) return (
    <input autoFocus className={s.boardTitleInput} value={title}
      onChange={e => setTitle(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') handleBlur(); if (e.key === 'Escape') { setTitle(board.title); setEditing(false); } }}
    />
  );
  return (
    <button className={s.boardTitleBtn} onClick={() => setEditing(true)}>{board.title}</button>
  );
}
