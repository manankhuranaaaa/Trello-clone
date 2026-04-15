import { Draggable } from '@hello-pangea/dnd';
import { format, isPast, isToday } from 'date-fns';

export default function CardItem({ card, index, labels, members, onClick, styles: s }) {
  const dueDate = card.due_date ? new Date(card.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);
  const dueBg    = isDueToday ? '#ff991f' : isOverdue ? '#eb5a46' : 'rgba(9,30,66,0.08)';
  const dueColor = isDueToday || isOverdue ? '#fff' : '#5e6c84';

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`${s.card} ${snapshot.isDragging ? s.cardDragging : ''}`}
          style={{ ...provided.draggableProps.style }}
        >
          {/* cover */}
          {card.cover_color && (
            <div className={s.cardCover} style={{ background: card.cover_color }} />
          )}

          {/* edit hint */}
          <div className={s.cardEditHint}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>

          <div className={s.cardBody}>
            {/* labels */}
            {labels.length > 0 && (
              <div className={s.cardLabels}>
                {labels.map(l => (
                  <span key={l.id} className={s.cardLabel} style={{ background: l.color }} title={l.name} />
                ))}
              </div>
            )}

            {/* title */}
            <p className={s.cardTitle}>{card.title}</p>

            {/* meta row */}
            {(dueDate || card.description || members.length > 0) && (
              <div className={s.cardMeta}>
                {dueDate && (
                  <span className={s.cardDueBadge} style={{ background: dueBg, color: dueColor }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                    </svg>
                    {format(dueDate, 'MMM d')}
                  </span>
                )}

                {card.description && (
                  <span className={s.cardDescIcon} title="Has description">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 18h12v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                  </span>
                )}

                {members.length > 0 && (
                  <div className={s.cardMembers}>
                    {members.slice(0, 3).map((m, i) => (
                      <span
                        key={m.id}
                        className={s.cardMemberAvatar}
                        title={m.name}
                        style={{ background: m.avatar_color, marginLeft: i > 0 ? -7 : 0 }}
                      >
                        {m.name[0]}
                      </span>
                    ))}
                    {members.length > 3 && (
                      <span className={s.cardMemberAvatar} style={{ background: '#dfe1e6', color: '#5e6c84', marginLeft: -7 }}>
                        +{members.length - 3}
                      </span>
                    )}
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
