import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getBoards, createBoard, deleteBoard } from '../api';

const BG_COLORS = [
  '#0052cc','#0065ff','#00875a','#de350b',
  '#6554c0','#00b8d9','#ff5630','#ff991f',
];

export default function HomePage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [bg, setBg] = useState(BG_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [navSearch, setNavSearch] = useState('');
  const allSearch = navSearch || search;
  const filteredBoards = boards.filter(b => b.title.toLowerCase().includes(allSearch.toLowerCase()));
  const navigate = useNavigate();



  useEffect(() => {
    getBoards().then(setBoards).catch(() => toast.error('Failed to load boards')).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard({ title: title.trim(), background: bg });
      setBoards(prev => [board, ...prev]);
      setTitle(''); setShowCreate(false);
      toast.success('Board created!');
    } catch { toast.error('Failed to create board'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    try { await deleteBoard(id); setBoards(prev => prev.filter(b => b.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      {/* Trello-style top nav */}
      <header style={{
        height: 44, background: '#026aa7',
        display: 'flex', alignItems: 'center',
        padding: '0 8px', gap: 4,
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 0 rgba(9,30,66,.25)',
      }}>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px', borderRadius: 3,
          color: '#fff', fontWeight: 700, fontSize: 18,
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="2" y="2" width="9" height="14" rx="2"/>
            <rect x="13" y="2" width="9" height="9" rx="2"/>
          </svg>
          Trello
        </button>

        {['Workspaces','Recent','Starred','Templates'].map(label => (
          <button key={label}
            onClick={() => toast('Coming soon!', { icon: '🚧' })}
            style={{ display:'flex',alignItems:'center',gap:3,padding:'4px 8px',borderRadius:3,color:'#fff',fontSize:14,fontWeight:500,transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            {label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
        ))}

        <button style={{
          padding:'4px 10px',borderRadius:3,
          background:'rgba(255,255,255,.25)',color:'#fff',
          fontWeight:500,fontSize:14,marginLeft:4,
          transition:'background .15s',
        }}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.35)'}
        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.25)'}
        onClick={() => setShowCreate(true)}
        >+ Create</button>

        <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.7)',pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              placeholder="Search"
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              style={{ padding:'5px 10px 5px 28px',background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.3)',borderRadius:3,color:'#fff',fontSize:13,outline:'none',width:150 }}
              onFocus={e=>{e.target.style.background='#fff';e.target.style.color='#172b4d';}}
              onBlur={e=>{e.target.style.background='rgba(255,255,255,.2)';e.target.style.color='#fff';}}
            />
          </div>
          <div style={{
            width:28,height:28,borderRadius:'50%',
            background:'#0052cc',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',
            border:'2px solid rgba(255,255,255,.4)',
          }} title="Manan Khurana">M</div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:32,height:32,borderRadius:6,background:'#0052cc',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v11H3zm11 0h7v7h-7zm0 9h7v9h-7zM3 16h7v5H3z"/></svg>
          </div>
          <h2 style={{ fontSize:16,fontWeight:700,color:'#172b4d' }}>Your boards</h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(194px,1fr))', gap:16 }}>
          {loading
            ? Array.from({length:4}).map((_,i) => <div key={i} className="skeleton" style={{ height:96,borderRadius:6 }} />)
            : filteredBoards.map(b => <BoardTile key={b.id} board={b} onClick={()=>navigate(`/board/${b.id}`)} onDelete={e=>handleDelete(e,b.id,b.title)} />)
          }
          {!loading && (showCreate
            ? <CreateTile title={title} setTitle={setTitle} bg={bg} setBg={setBg} colors={BG_COLORS} creating={creating} onSubmit={handleCreate} onCancel={()=>setShowCreate(false)} />
            : <button onClick={()=>setShowCreate(true)} style={{
                height:96,borderRadius:6,
                background:'rgba(9,30,66,.08)',
                color:'#5e6c84',fontSize:14,fontWeight:500,
                transition:'background .15s',
                border:'none',cursor:'pointer',width:'100%',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(9,30,66,.16)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(9,30,66,.08)'}
              >Create new board</button>
          )}
        </div>
      </div>
    </div>
  );
}

function BoardTile({ board, onClick, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        height:96,borderRadius:6,
        background:board.background,
        padding:10,cursor:'pointer',position:'relative',overflow:'hidden',
        transition:'filter .15s',
        filter: hov ? 'brightness(.85)' : 'brightness(1)',
        boxShadow:'0 1px 0 rgba(9,30,66,.25)',
      }}
    >
      <span style={{ color:'#fff',fontWeight:700,fontSize:14,wordBreak:'break-word',textShadow:'0 1px 2px rgba(0,0,0,.2)' }}>{board.title}</span>
      <button onClick={onDelete} style={{
        position:'absolute',bottom:6,right:6,
        width:24,height:24,borderRadius:3,
        background:'rgba(0,0,0,.2)',color:'rgba(255,255,255,.8)',
        fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',
        opacity:hov?1:0,transition:'opacity .15s',border:'none',cursor:'pointer',
      }}>✕</button>
    </div>
  );
}

function CreateTile({ title, setTitle, bg, setBg, colors, creating, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} style={{
      borderRadius:6,background:'#fff',
      border:'1px solid #dfe1e6',padding:12,
      display:'flex',flexDirection:'column',gap:8,
      boxShadow:'0 4px 8px rgba(9,30,66,.15)',
    }}>
      <div style={{ height:36,borderRadius:3,background:bg,display:'flex',alignItems:'center',paddingLeft:8 }}>
        <span style={{ color:'#fff',fontWeight:700,fontSize:13 }}>{title||'Board title'}</span>
      </div>
      <input autoFocus placeholder="Add board title" value={title} onChange={e=>setTitle(e.target.value)}
        onKeyDown={e=>e.key==='Escape'&&onCancel()}
        style={{ padding:'6px 8px',border:'2px solid #0052cc',borderRadius:3,outline:'none',fontSize:14 }}
      />
      <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
        {colors.map(c=>(
          <button key={c} type="button" onClick={()=>setBg(c)} style={{
            width:24,height:24,borderRadius:3,background:c,border:'none',cursor:'pointer',
            outline:bg===c?'2px solid #172b4d':'none',outlineOffset:2,
          }}/>
        ))}
      </div>
      <div style={{ display:'flex',gap:6 }}>
        <button type="submit" disabled={creating||!title.trim()} style={{
          padding:'6px 12px',borderRadius:3,
          background:creating||!title.trim()?'#c1c7d0':'#0052cc',
          color:'#fff',fontWeight:500,fontSize:14,border:'none',
          cursor:creating||!title.trim()?'not-allowed':'pointer',
        }}>{creating?'Creating…':'Create'}</button>
        <button type="button" onClick={onCancel} style={{ padding:'6px 10px',borderRadius:3,fontSize:14,color:'#5e6c84' }}>Cancel</button>
      </div>
    </form>
  );
}
