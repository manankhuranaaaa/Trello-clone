import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import s from './Auth.module.css';

const USERS_KEY = 'trello_users';

const FIELDS = [
  { key: 'name',    label: 'Full Name',        type: 'text',     placeholder: 'Alice Johnson' },
  { key: 'email',   label: 'Email address',    type: 'email',    placeholder: 'you@example.com' },
  { key: 'password',label: 'Password',         type: 'password', placeholder: '••••••••' },
  { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
];

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
const STRENGTH_COLOR = ['', '#de350b', '#ff991f', '#f6c90e', '#00875a', '#006644'];

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [globalError, setGlobalError] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)     e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.confirm)      e.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u) => u.email === form.email)) {
      setGlobalError('An account with this email already exists.');
      setLoading(false);
      return;
    }
    users.push({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    navigate('/login');
  };

  const strength = getStrength(form.password);

  return (
    <div className={s.page}>
      <BrandPanel />
      <div className={s.formPanel}>
        <div className={s.formBox}>
          <div className={s.formHeader}>
            <h2>Create account ✨</h2>
            <p>Start managing your projects today — it's free</p>
          </div>

          {globalError && (
            <div className={s.globalError}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {FIELDS.map(({ key, label, type, placeholder }, i) => {
              const isPassword = key === 'password';
              const isConfirm  = key === 'confirm';
              const inputType  = isPassword ? (showPw ? 'text' : 'password')
                               : isConfirm  ? (showCf ? 'text' : 'password')
                               : type;
              const toggle     = isPassword ? () => setShowPw(v => !v)
                               : isConfirm  ? () => setShowCf(v => !v)
                               : null;
              const shown      = isPassword ? showPw : showCf;

              return (
                <div
                  key={key}
                  className={s.field}
                  style={{ animation: `fadeSlideUp 0.4s ${0.05 + i * 0.07}s both` }}
                >
                  <label>{label}</label>
                  <div className={s.inputWrap}>
                    <input
                      type={inputType}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={set(key)}
                      className={errors[key] ? s.inputError : ''}
                      style={(isPassword || isConfirm) ? { paddingRight: 42 } : {}}
                      autoComplete={isPassword ? 'new-password' : isConfirm ? 'new-password' : key}
                    />
                    {toggle && (
                      <button type="button" className={s.eyeBtn} onClick={toggle} tabIndex={-1}>
                        {shown ? <EyeOff /> : <EyeOn />}
                      </button>
                    )}
                  </div>

                  {/* password strength bar */}
                  {isPassword && form.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} style={{
                            flex: 1, height: 3, borderRadius: 99,
                            background: n <= strength ? STRENGTH_COLOR[strength] : '#ebecf0',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: STRENGTH_COLOR[strength], fontWeight: 600 }}>
                        {STRENGTH_LABEL[strength]}
                      </span>
                    </div>
                  )}

                  {errors[key] && <p className={s.fieldError}>⚠ {errors[key]}</p>}
                </div>
              );
            })}

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
              style={{ animation: 'fadeSlideUp 0.4s 0.35s both', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? <Spinner /> : 'Create Account →'}
            </button>
          </form>

          <p className={s.switchText}>
            Already have an account? <Link to="/login">Sign in</Link>
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
          <h1>Join thousands of teams</h1>
          <p>Plan, track, and manage your work — all in one place.</p>
        </div>
        <div className={s.features}>
          {[
            ['🚀', 'Get started in seconds'],
            ['🤝', 'Invite your team members'],
            ['📊', 'Track progress visually'],
            ['🔒', 'Secure and reliable'],
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
