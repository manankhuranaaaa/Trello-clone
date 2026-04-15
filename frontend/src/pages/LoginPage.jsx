import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO } from '../utils/auth';
import s from './Auth.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    // simulate tiny network delay for realism
    await new Promise(r => setTimeout(r, 600));
    if (form.email === DEMO.email && form.password === DEMO.password) {
      login({ name: DEMO.name, email: DEMO.email });
      navigate('/');
    } else {
      setGlobalError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <BrandPanel />
      <div className={s.formPanel}>
        <div className={s.formBox}>
          <div className={s.formHeader}>
            <h2>Welcome back 👋</h2>
            <p>Sign in to your Trello workspace</p>
          </div>

          <div className={s.demoBox}>
            <strong>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>
              Demo credentials
            </strong>
            <span>Email: <code>demo@trello.com</code></span>
            <span>Password: <code>123456</code></span>
          </div>

          {globalError && (
            <div className={s.globalError}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={s.field} style={{ animation: 'fadeSlideUp 0.4s 0.05s both' }}>
              <label>Email address</label>
              <div className={s.inputWrap}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className={errors.email ? s.inputError : ''}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className={s.fieldError}>⚠ {errors.email}</p>}
            </div>

            <div className={s.field} style={{ animation: 'fadeSlideUp 0.4s 0.1s both' }}>
              <label>Password</label>
              <div className={s.inputWrap}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  className={errors.password ? s.inputError : ''}
                  style={{ paddingRight: 42 }}
                  autoComplete="current-password"
                />
                <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {errors.password && <p className={s.fieldError}>⚠ {errors.password}</p>}
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
              style={{ animation: 'fadeSlideUp 0.4s 0.15s both', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? <Spinner /> : 'Sign in →'}
            </button>
          </form>

          <p className={s.switchText}>
            Don't have an account? <Link to="/signup">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className={s.brand}>
      <div className={s.brandGrid} />
      <div className={s.brandContent}>
        <div className={s.brandLogo}>
          <div className={s.brandLogoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="2" y="2" width="9" height="14" rx="2" />
              <rect x="13" y="2" width="9" height="9" rx="2" />
            </svg>
          </div>
          Trello
        </div>
        <div className={s.brandText}>
          <h1>Manage your tasks efficiently</h1>
          <p>Organize projects, collaborate with your team, and ship faster than ever.</p>
        </div>
        <div className={s.features}>
          {[
            ['📋', 'Drag-and-drop Kanban boards'],
            ['🏷️', 'Labels, members & due dates'],
            ['✅', 'Checklists & comments'],
            ['🔍', 'Powerful search & filters'],
          ].map(([icon, text]) => (
            <div className={s.feature} key={text}>
              <div className={s.featureIcon}>{icon}</div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
  </svg>
);
