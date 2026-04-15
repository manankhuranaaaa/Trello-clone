import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ boardName }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      height: 'var(--nav-h)',
      background: 'rgba(0,0,0,.32)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center',
      padding: '0 8px', gap: 4,
      flexShrink: 0,
      position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{
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

      {/* Workspace */}
      <NavBtn label="Workspace" />
      <NavBtn label="Recent" />
      <NavBtn label="Starred" />
      <NavBtn label="Templates" />

      <button style={{
        padding: '4px 10px', borderRadius: 3,
        background: 'rgba(255,255,255,.25)',
        color: '#fff', fontWeight: 500, fontSize: 14,
        marginLeft: 4, transition: 'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.35)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
      >+ Create</button>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.7)',pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input placeholder="Search" style={{
            padding: '5px 10px 5px 28px',
            background: 'rgba(255,255,255,.2)',
            border: '1px solid rgba(255,255,255,.3)',
            borderRadius: 3, color: '#fff',
            fontSize: 13, outline: 'none', width: 160,
            transition: 'background .15s, width .2s',
          }}
          onFocus={e => { e.target.style.background='#fff'; e.target.style.color='#172b4d'; e.target.style.width='220px'; }}
          onBlur={e => { e.target.style.background='rgba(255,255,255,.2)'; e.target.style.color='#fff'; e.target.style.width='160px'; }}
          />
        </div>

        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0052cc,#0065ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 12,
          cursor: 'pointer', marginLeft: 4,
          border: '2px solid rgba(255,255,255,.3)',
        }} title={user?.name}>{user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() ?? 'MK'}</div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: '4px 10px', borderRadius: 3,
            background: 'rgba(255,255,255,.15)',
            color: '#fff', fontWeight: 500, fontSize: 13,
            marginLeft: 4, transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(222,53,11,.7)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
        >Logout</button>
      </div>
    </nav>
  );
}

function NavBtn({ label }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 8px', borderRadius: 3,
      color: '#fff', fontSize: 14, fontWeight: 500,
      transition: 'background .15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {label}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
    </button>
  );
}
