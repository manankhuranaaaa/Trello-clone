import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { updateList, deleteList, createCard } from '../../api';
import CardItem from '../Card/CardItem';

export default function ListColumn({ list, index, cards, cardLabels, cardMembers, labels, members, onCardClick, onListUpdate, onListDelete, onCardCreate }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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
    try { const card = await createCard({ list_id: list.id, title: cardTitle.trim() }); onCardCreate(card); setCardTitle(''); toast.success('Card added'); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!confirm(`Delete "${list.title}"?`)) return;
    try { await deleteList(list.id); onListDelete(list.id); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            flexShrink:0, width:272,
            background:'#ebecf0',
            borderRadius:6,
            display:'flex', flexDirection:'column',
            maxHeight:'calc(100vh - 110px)',
            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(9,30,66,.3)' : 'none',
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
          }}
        >
          {/* Header */}
          <div {...provided.dragHandleProps} style={{ padding:'10px 8px 6px 12px',display:'flex',alignItems:'center',gap:4,cursor:'grab',flexShrink:0 }}>
            {editingTitle ? (
              <input autoFocus value={title} onChange={e=>setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={e=>{if(e.key==='Enter')handleTitleBlur();if(e.key==='Escape'){setTitle(list.title);setEditingTitle(false);}}}
                style={{ flex:1,fontSize:14,fontWeight:600,color:'#172b4d',background:'#fff',border:'2px solid #0052cc',borderRadius:3,padding:'4px 6px',outline:'none',boxShadow:'0 0 0 2px rgba(0,82,204,.2)' }}
              />
            ) : (
              <h3 onClick={()=>setEditingTitle(true)} style={{ flex:1,fontSize:14,fontWeight:600,color:'#172b4d',cursor:'pointer',padding:'4px 6px',borderRadius:3,transition:'background .15s',wordBreak:'break-word' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(9,30,66,.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >{list.title}</h3>
            )}
            <div style={{ position:'relative',flexShrink:0 }}>
              <button onClick={()=>setMenuOpen(o=>!o)} className="icon-btn" style={{ width:28,height:28 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {menuOpen && (
                <>
                  <div className="popover-overlay" onClick={()=>setMenuOpen(false)} />
                  <div className="popover" style={{ right:0,top:'100%',marginTop:4 }}>
                    <h4>List Actions</h4>
                    {[
                      {label:'Add card',fn:()=>{setMenuOpen(false);setAddingCard(true);}},
                      {label:'Rename list',fn:()=>{setMenuOpen(false);setEditingTitle(true);}},
                    ].map(item=>(
                      <button key={item.label} onClick={item.fn} style={{ display:'block',width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:3,color:'#172b4d',fontSize:14,transition:'background .1s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#ebecf0'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                      >{item.label}</button>
                    ))}
                    <hr style={{ border:'none',borderTop:'1px solid #dfe1e6',margin:'6px 0' }} />
                    <button onClick={handleDelete} style={{ display:'block',width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:3,color:'#de350b',fontSize:14,transition:'background .1s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#ffebe6'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >Delete list</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cards */}
          <Droppable droppableId={list.id} type="CARD">
            {(prov, snap) => (
              <div ref={prov.innerRef} {...prov.droppableProps}
                style={{ flex:1,overflowY:'auto',padding:'0 8px',minHeight:4,background:snap.isDraggingOver?'rgba(9,30,66,.06)':'transparent',borderRadius:3,transition:'background .15s' }}
              >
                {cards.map((card,i) => (
                  <CardItem key={card.id} card={card} index={i}
                    labels={cardLabels.filter(cl=>cl.card_id===card.id).map(cl=>labels.find(l=>l.id===cl.label_id)).filter(Boolean)}
                    members={cardMembers.filter(cm=>cm.card_id===card.id).map(cm=>members.find(m=>m.id===cm.member_id)).filter(Boolean)}
                    onClick={()=>onCardClick(card.id)}
                  />
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add card */}
          {addingCard ? (
            <form onSubmit={handleAddCard} style={{ padding:'0 8px 8px',flexShrink:0 }}>
              <textarea autoFocus className="inline-edit-input" placeholder="Enter a title for this card…" value={cardTitle}
                onChange={e=>setCardTitle(e.target.value)} rows={2}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleAddCard(e);}if(e.key==='Escape')setAddingCard(false);}}
              />
              <div style={{ display:'flex',gap:8,marginTop:8 }}>
                <button type="submit" className="btn btn-primary" style={{ fontSize:13,padding:'5px 12px' }}>Add card</button>
                <button type="button" className="icon-btn" onClick={()=>setAddingCard(false)}>✕</button>
              </div>
            </form>
          ) : (
            <button onClick={()=>setAddingCard(true)} style={{ margin:'4px 8px 8px',padding:'8px',borderRadius:3,color:'#5e6c84',fontSize:14,textAlign:'left',transition:'background .15s,color .15s',display:'flex',alignItems:'center',gap:6,flexShrink:0 }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(9,30,66,.08)';e.currentTarget.style.color='#172b4d';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#5e6c84';}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}
