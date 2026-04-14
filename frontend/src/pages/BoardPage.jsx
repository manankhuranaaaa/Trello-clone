import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { getBoard, reorderLists, moveCard, reorderCards, createList, updateBoard } from '../api';
import ListColumn from '../components/List/ListColumn';
import CardModal from '../components/Card/CardModal';

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [labels, setLabels] = useState([]);
  const [cardLabels, setCardLabels] = useState([]);
  const [cardMembers, setCardMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  const [filter, setFilter] = useState({ q: '', label_id: '', member_id: '', due: '' });
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div style={{ height:'100vh', background:'#0079bf', display:'flex', flexDirection:'column' }}>
      <div style={{ height:44, background:'rgba(0,0,0,.2)' }} />
      <div style={{ display:'flex', gap:10, padding:10 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ width:272, height:400, borderRadius:6, background:'rgba(255,255,255,.2)', flexShrink:0 }} />)}
      </div>
    </div>
  );

  if (!board) return null;

  const hasFilter = filter.q || filter.label_id || filter.member_id || filter.due;

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background: board.background, backgroundSize:'cover' }}>

      {/* Top nav */}
      <header style={{
        height:44, flexShrink:0,
        background:'rgba(0,0,0,.32)',
        backdropFilter:'blur(8px)',
        WebkitBackdropFilter:'blur(8px)',
        display:'flex', alignItems:'center',
        padding:'0 8px', gap:4,
      }}>
        {/* Logo */}
        <button onClick={()=>navigate('/')} style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 8px',borderRadius:3,color:'#fff',fontWeight:700,fontSize:18,transition:'background .15s' }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="9" height="14" rx="2"/><rect x="13" y="2" width="9" height="9" rx="2"/></svg>
          Trello
        </button>

        {['Workspaces','Recent','Starred','Templates'].map(label => (
          <button key={label}
            onClick={() => toast('Coming soon!', { icon: '🚧' })}
            style={{ display:'flex',alignItems:'center',gap:3,padding:'4px 8px',borderRadius:3,color:'#fff',fontSize:14,fontWeight:500,transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >{label} <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg></button>
        ))}

        <button style={{ padding:'4px 10px',borderRadius:3,background:'rgba(255,255,255,.25)',color:'#fff',fontWeight:500,fontSize:14,marginLeft:4,transition:'background .15s' }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.35)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.25)'}
        >+ Create</button>

        <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.7)',pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input placeholder="Search" style={{ padding:'5px 10px 5px 28px',background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.3)',borderRadius:3,color:'#fff',fontSize:13,outline:'none',width:150 }}
              onFocus={e=>{e.target.style.background='#fff';e.target.style.color='#172b4d';}}
              onBlur={e=>{e.target.style.background='rgba(255,255,255,.2)';e.target.style.color='#fff';}}
            />
          </div>
          <div style={{ width:28,height:28,borderRadius:'50%',background:'#0052cc',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',border:'2px solid rgba(255,255,255,.4)' }} title="Manan Khurana">M</div>
        </div>
      </header>

      {/* Board sub-header */}
      <div style={{
        height:44, flexShrink:0,
        background:'rgba(0,0,0,.2)',
        display:'flex', alignItems:'center',
        padding:'0 12px', gap:8,
      }}>
        <BoardTitle board={board} onUpdate={setBoard} />
        <div style={{ width:1,height:20,background:'rgba(255,255,255,.3)',margin:'0 4px' }} />

        {/* Filter bar */}
        <div style={{ display:'flex',alignItems:'center',gap:6,flex:1 }}>
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.7)',pointerEvents:'none' }} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input placeholder="Search cards…" value={filter.q} onChange={e=>setFilter(f=>({...f,q:e.target.value}))}
              style={{ padding:'5px 8px 5px 24px',background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.25)',borderRadius:3,color:'#fff',fontSize:12,outline:'none',width:140 }}
              onFocus={e=>{e.target.style.background='rgba(255,255,255,.9)';e.target.style.color='#172b4d';}}
              onBlur={e=>{e.target.style.background='rgba(255,255,255,.2)';e.target.style.color='#fff';}}
            />
          </div>
          <FilterSelect value={filter.label_id} onChange={v=>setFilter(f=>({...f,label_id:v}))} options={[{value:'',label:'Label'}, ...labels.map(l=>({value:l.id,label:l.name}))]} />
          <FilterSelect value={filter.member_id} onChange={v=>setFilter(f=>({...f,member_id:v}))} options={[{value:'',label:'Member'}, ...members.map(m=>({value:m.id,label:m.name}))]} />
          <FilterSelect value={filter.due} onChange={v=>setFilter(f=>({...f,due:v}))} options={[{value:'',label:'Due date'},{value:'overdue',label:'Overdue'},{value:'today',label:'Today'},{value:'week',label:'This week'}]} />
          {hasFilter && <button onClick={()=>setFilter({q:'',label_id:'',member_id:'',due:''})} style={{ color:'rgba(255,255,255,.8)',fontSize:12,padding:'4px 8px',borderRadius:3,transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >✕ Clear</button>}
        </div>
      </div>

      {/* Board canvas */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="LIST" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}
              style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px 24px',overflowX:'auto',flex:1,minHeight:0 }}
            >
              {lists.map((list, index) => (
                <ListColumn
                  key={list.id} list={list} index={index}
                  cards={getCardsForList(list.id)}
                  cardLabels={cardLabels} cardMembers={cardMembers}
                  labels={labels} members={members}
                  onCardClick={setActiveCardId}
                  onListUpdate={u => setLists(prev => prev.map(l => l.id===u.id ? u : l))}
                  onListDelete={id => setLists(prev => prev.filter(l => l.id!==id))}
                  onCardCreate={card => setCards(prev => [...prev, card])}
                />
              ))}
              {provided.placeholder}
              <AddListBtn boardId={boardId} onAdd={list => setLists(prev => [...prev, list])} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {activeCardId && (
        <CardModal cardId={activeCardId} labels={labels} members={members}
          onClose={() => { setActiveCardId(null); loadBoard(); }} />
      )}
    </div>
  );
}

function BoardTitle({ board, onUpdate }) {
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
    <input autoFocus value={title} onChange={e=>setTitle(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e=>{if(e.key==='Enter')handleBlur();if(e.key==='Escape'){setTitle(board.title);setEditing(false);}}}
      style={{ fontSize:15,fontWeight:700,color:'#fff',background:'rgba(255,255,255,.25)',border:'2px solid rgba(255,255,255,.6)',borderRadius:3,padding:'3px 8px',outline:'none',minWidth:160 }}
    />
  );
  return (
    <h1 onClick={()=>setEditing(true)} style={{ fontSize:15,fontWeight:700,color:'#fff',cursor:'pointer',padding:'4px 8px',borderRadius:3,transition:'background .15s',whiteSpace:'nowrap',textShadow:'0 1px 2px rgba(0,0,0,.2)' }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
    >{board.title}</h1>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ padding:'4px 8px',background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.25)',borderRadius:3,color:'#fff',fontSize:12,outline:'none',cursor:'pointer' }}
    >
      {options.map(o => <option key={o.value} value={o.value} style={{ background:'#026aa7',color:'#fff' }}>{o.label}</option>)}
    </select>
  );
}

function AddListBtn({ boardId, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try { const list = await createList({ board_id: boardId, title: title.trim() }); onAdd(list); setTitle(''); setAdding(false); toast.success('List added'); }
    catch { toast.error('Failed'); }
  };
  if (!adding) return (
    <button onClick={()=>setAdding(true)} style={{
      flexShrink:0,width:272,padding:'10px 12px',
      background:'rgba(255,255,255,.25)',color:'#fff',
      borderRadius:6,fontWeight:500,fontSize:14,
      textAlign:'left',transition:'background .15s',
      whiteSpace:'nowrap',border:'none',cursor:'pointer',
    }}
    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.35)'}
    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.25)'}
    >+ Add another list</button>
  );
  return (
    <form onSubmit={handleSubmit} style={{ flexShrink:0,width:272,background:'#ebecf0',borderRadius:6,padding:8 }}>
      <input autoFocus className="inline-edit-input" placeholder="Enter list title…" value={title}
        onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==='Escape'&&setAdding(false)} />
      <div style={{ display:'flex',gap:8,marginTop:8 }}>
        <button type="submit" className="btn btn-primary" style={{ fontSize:13,padding:'5px 12px' }}>Add list</button>
        <button type="button" className="icon-btn" onClick={()=>setAdding(false)}>✕</button>
      </div>
    </form>
  );
}
