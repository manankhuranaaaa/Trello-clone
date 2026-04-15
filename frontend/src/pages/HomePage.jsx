import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getBoards, createBoard, deleteBoard } from '../api';
import { useAuth } from '../context/AuthContext';
import s from './HomePage.module.css';

const COLORS = [
  { value: '#0052cc', label: 'Ocean Blue' },
  { value: '#6554c0', label: 'Purple' },
  { value: '#00875a', label: 'Green' },
  { value: '#de350b', label: 'Red' },
  { value: '#00b8d9', label: 'Cyan' },
  { value: '#ff5630', label: 'Orange' },
  { value: '#ff991f', label: 'Yellow' },
  { value: '#172b4d', label: 'Dark' },
  { value: '#403294', label: 'Indigo' },
  { value: '#008da6', label: 'Teal' },
  { value: '#5e6c84', label: 'Slate' },
  { value: '#0065ff', label: 'Blue' },
  { value: '#36b37e', label: 'Emerald' },
  { value: '#bf2600', label: 'Crimson' },
  { value: '#8777d9', label: 'Lavender' },
  { value: '#253858', label: 'Navy' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [boards, setBoards]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');
  const [title, setTitle]         = useState('');
  const [bg, setBg]               = useState(COLORS[0].value);
  const [creating, setCreating]   = useState(false);

  const filtered = boards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .catch(() => toast.error('Failed to load boards'))
      .finally(() => setLoading(false));
  }, []);

  const openModal = () => { setTitle(''); setBg(COLORS[0].value); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard({ title: title.trim(), background: bg });
      setBoards(prev => [board, ...prev]);
      closeModal();
      toast.success('Board created! 🎉');
    } catch { toast.error('Failed to create board'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteBoard(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      toast.success('Board deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? 'U';

  return (
    <div className={s.page}>
      {/* ── Navbar ── */}
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
          <button key={label} className={s.navBtn}
            onClick={() => toast('Coming soon!', { icon: '🚧' })}>
            {label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
        ))}

        <button className={s.navCreate} onClick={openModal}>+ Create</button>

        <div className={s.navRight}>
          <div className={s.searchWrap}>
            <input
              className={s.searchInput}
              placeholder="Search boards…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className={s.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>

          <div className={s.avatar} title={user?.name}>{initials}</div>

          <button className={s.logoutBtn} onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className={s.hero}>
        <div className={s.heroBlob1} />
        <div className={s.heroBlob2} />
        <div className={s.heroInner}>
          <p className={s.heroGreeting}>👋 Good {getTimeOfDay()}</p>
          <h1 className={s.heroTitle}>Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!</h1>
          <p className={s.heroSub}>Here's what's happening with your projects today.</p>
          <div className={s.heroStats}>
            <div className={s.heroStat}>
              <span className={s.heroStatNum}>{boards.length}</span>
              <span className={s.heroStatLabel}>Boards</span>
            </div>
            <div className={s.heroStat}>
              <span className={s.heroStatNum}>{boards.length * 3}</span>
              <span className={s.heroStatLabel}>Lists</span>
            </div>
            <div className={s.heroStat}>
              <span className={s.heroStatNum}>{boards.length * 8}</span>
              <span className={s.heroStatLabel}>Cards</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={s.content}>
        <div className={s.sectionHeader}>
          <div className={s.sectionTitle}>
            <div className={s.sectionIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M3 3h7v11H3zm11 0h7v7h-7zm0 9h7v9h-7zM3 16h7v5H3z"/>
              </svg>
            </div>
            Your Boards
            {!loading && <span className={s.boardCount}>{filtered.length}</span>}
          </div>

          <div className={s.filterWrap}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              className={s.filterInput}
              placeholder="Filter boards…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={s.grid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className={s.skeleton} />)
            : filtered.length === 0 && search
              ? <EmptySearch query={search} onClear={() => setSearch('')} />
              : filtered.length === 0
                ? <EmptyState onCreate={openModal} />
                : filtered.map(b => (
                    <BoardTile
                      key={b.id}
                      board={b}
                      onClick={() => navigate(`/board/${b.id}`)}
                      onDelete={e => handleDelete(e, b.id, b.title)}
                    />
                  ))
          }
          {!loading && (
            <button className={s.createBtn} onClick={openModal}>
              <div className={s.createBtnIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              Create new board
            </button>
          )}
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showModal && (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={s.modal}>
            <div className={s.modalPreview} style={{ background: bg }}>
              <div className={s.modalPreviewBadge}>Preview</div>
              <span className={s.modalPreviewTitle}>{title || 'Board title'}</span>
            </div>
            <div className={s.modalBody}>
              <h3 className={s.modalTitle}>Create new board</h3>
              <p className={s.modalSub}>Give your board a name and pick a color.</p>

              <form onSubmit={handleCreate}>
                <label className={s.modalLabel}>Board title</label>
                <input
                  autoFocus
                  className={s.modalInput}
                  placeholder="e.g. Product Roadmap"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && closeModal()}
                />

                <label className={s.modalLabel}>Background color</label>
                <div className={s.colorGrid}>
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      className={`${s.colorSwatch} ${bg === c.value ? s.colorSwatchActive : ''}`}
                      style={{ background: c.value }}
                      onClick={() => setBg(c.value)}
                      title={c.label}
                    >
                      {bg === c.value && (
                        <span className={s.colorSwatchCheck}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className={s.modalActions}>
                  <button type="submit" className={s.modalSubmit} disabled={creating || !title.trim()}>
                    {creating ? 'Creating…' : '✦ Create Board'}
                  </button>
                  <button type="button" className={s.modalCancel} onClick={closeModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Board Tile ── */
function BoardTile({ board, onClick, onDelete }) {
  return (
    <div className={s.tile} style={{ background: board.background }} onClick={onClick}>
      <div className={s.tileShimmer} />
      <div className={s.tileOverlay} />
      <span className={s.tileName}>{board.title}</span>
      <div className={s.tileFooter}>
        <button className={s.tileStarBtn} onClick={e => { e.stopPropagation(); toast('Starred! ⭐', { duration: 1500 }); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
        <button className={s.tileDeleteBtn} onClick={onDelete}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Empty States ── */
function EmptyState({ onCreate }) {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon}>📋</span>
      <h3 className={s.emptyTitle}>No boards yet</h3>
      <p className={s.emptyText}>Create your first board to start organizing your work.</p>
      <button className={s.emptyBtn} onClick={onCreate}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create your first board
      </button>
    </div>
  );
}

function EmptySearch({ query, onClear }) {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon}>🔍</span>
      <h3 className={s.emptyTitle}>No results for "{query}"</h3>
      <p className={s.emptyText}>Try a different search term.</p>
      <button className={s.emptyBtn} onClick={onClear}>Clear search</button>
    </div>
  );
}

/* ── Helpers ── */
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
