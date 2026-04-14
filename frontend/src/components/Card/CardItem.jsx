import { Draggable } from '@hello-pangea/dnd';
import { format, isPast, isToday } from 'date-fns';
import { useState } from 'react';

export default function CardItem({ card, index, labels, members, onClick }) {
  const [hov, setHov] = useState(false);
  const dueDate = card.due_date ? new Date(card.due_date) : null;
  const dueBg = dueDate ? isToday(dueDate) ? '#ff9f1a' : isPast(dueDate) ? '#eb5a46' : '#f4f5f7' : '';
  const dueColor = dueDate ? isToday(dueDate) || isPast(dueDate) ? '#fff' : '#5e6c84' : '';

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          onClick={onClick}
          onMouseEnter={()=>setHov(true)}
          onMouseLeave={()=>setHov(false)}
          style={{
            ...provided.draggableProps.style,
            background:'#fff',
            borderRadius:3,
            boxShadow: snapshot.isDragging ? '0 8px 16px rgba(9,30,66,.25)' : '0 1px 0 rgba(9,30,66,.25)',
            marginBottom:8,
            cursor:'pointer',
            overflow:'hidden',
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
            outline: hov && !snapshot.isDragging ? '2px solid #0052cc' : 'none',
            outlineOffset:-1,
            transition:'box-shadow .15s',
          }}
        >
          {card.cover_color && <div style={{ height:32,background:card.cover_color }} />}

          <div style={{ padding:'6px 8px 8px' }}>
            {labels.length > 0 && (
              <div style={{ display:'flex',flexWrap:'wrap',gap:4,marginBottom:6 }}>
                {labels.map(l => (
                  <span key={l.id} style={{ height:8,minWidth:40,borderRadius:4,background:l.color,display:'inline-block' }} title={l.name} />
                ))}
              </div>
            )}

            <p style={{ fontSize:14,color:'#172b4d',lineHeight:1.4,wordBreak:'break-word' }}>{card.title}</p>

            {(dueDate || card.description || members.length > 0) && (
              <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:6,flexWrap:'wrap' }}>
                {dueDate && (
                  <span style={{ display:'inline-flex',alignItems:'center',gap:3,fontSize:11,fontWeight:500,padding:'2px 6px',borderRadius:3,background:dueBg,color:dueColor }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
                    {format(dueDate,'MMM d')}
                  </span>
                )}
                {card.description && (
                  <span style={{ color:'#5e6c84',fontSize:13 }} title="Has description">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h12v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                  </span>
                )}
                {members.length > 0 && (
                  <div style={{ display:'flex',marginLeft:'auto' }}>
                    {members.slice(0,3).map((m,i) => (
                      <span key={m.id} title={m.name} style={{ width:24,height:24,borderRadius:'50%',background:m.avatar_color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10,fontWeight:700,border:'2px solid #fff',marginLeft:i>0?-6:0 }}>{m.name[0]}</span>
                    ))}
                    {members.length > 3 && <span style={{ width:24,height:24,borderRadius:'50%',background:'#dfe1e6',display:'flex',alignItems:'center',justifyContent:'center',color:'#5e6c84',fontSize:9,fontWeight:700,border:'2px solid #fff',marginLeft:-6 }}>+{members.length-3}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
