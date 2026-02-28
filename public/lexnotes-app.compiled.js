const {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} = React;
let NEXT_ID = 1000;
const nextId = () => ++NEXT_ID;
const USERS_KEY = 'lexnotes:users';
const SESSION_KEY = 'lexnotes:session';
const PASSWORD_RESET_REQUESTS_KEY = 'lexnotes:password-reset-requests';
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function esc(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
function downloadFile(name, content, type = 'text/plain') {
  const blob = new Blob([content], {
    type
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 300);
}
const COURSES = [];
const INIT_NOTES = [];
const INIT_DOCS = [];
const INIT_BOOKS = [];
const INIT_ANNOTATIONS = [];
const HL = {
  yellow: 'rgba(255,214,0,.2)',
  green: 'rgba(74,171,120,.16)',
  pink: 'rgba(217,95,95,.14)',
  blue: 'rgba(82,131,224,.16)'
};
const HLDOT = {
  yellow: '#ffd600',
  green: '#4aab78',
  pink: '#d95f5f',
  blue: '#5283e0'
};
const PRACTICE_QS = [{
  id: 1,
  course: 'Contracts',
  topic: 'Damages',
  sub: 'Hadley v. Baxendale',
  text: 'A software company contracts with a logistics firm to deliver a server. The logistics firm is unaware the entire e-commerce platform depends on it. The firm delivers a week late. Which damages are recoverable?',
  opts: ['All lost profits — the breach caused them directly.', 'No damages — the loss was due to the company\'s own design choices.', 'Only general damages; lost profits are not recoverable because the firm was not informed of special circumstances at formation.', 'Punitive damages, since the delay was egregious.'],
  correct: 2,
  exp: 'Under Hadley v. Baxendale, consequential damages require both parties to contemplate the loss at formation. The logistics firm knew nothing about the critical dependency — lost profits are unrecoverable.'
}, {
  id: 2,
  course: 'Torts',
  topic: 'Negligence',
  sub: 'Carroll Towing / Hand Formula',
  text: 'A barge owner leaves his barge unattended for 21 hours. It breaks free and causes $50,000 in damage. Cost to keep an attendant: $10/day. Probability barge breaks free: 1%. Applying the Hand Formula, was the barge owner negligent?',
  opts: ['No — probability was very low.', 'Yes — B ($10) < P×L ($500), so precaution cost was less than expected harm.', 'No — barge owners have no duty to have attendants onboard.', 'Yes — but only because the area was inherently dangerous.'],
  correct: 1,
  exp: 'Hand Formula: B < PL = negligence. B=$10; P=0.01; L=$50,000; PL=$500. Since $10 < $500, the owner was negligent for not keeping an attendant onboard.'
}, {
  id: 3,
  course: 'Torts',
  topic: 'Duty',
  sub: 'Palsgraf v. LIRR',
  text: 'Under the Cardozo majority in Palsgraf, which plaintiff would MOST clearly be owed a duty of care by the railroad?',
  opts: ['A bystander 200 feet away struck by debris from an explosion.', 'A passenger jostled when the guard helps another passenger board.', 'A person at home who suffers a heart attack hearing news of the accident.', 'A competitor railroad that loses business as passengers avoid the line.'],
  correct: 1,
  exp: 'Cardozo: duty owed only to those within the foreseeable zone of danger. The passenger being helped on board is most directly in the zone of danger from the guard\'s acts.'
}];
const CAL_EVENTS = {};
const TB_CONTENT = `
<div class="tbct">Chapter 3 — Negligence</div>
<div style="font-size:10px;color:#3e4152;font-family:'JetBrains Mono',monospace;margin-bottom:22px;margin-top:4px">Prosser & Keeton on Torts, 5th Edition</div>
<div class="tbst">§ 3.1 The Reasonable Person Standard</div>
<p>The foundation of negligence liability rests on a deceptively simple question: did the defendant behave as a <span class="hly">reasonable person would have behaved under the same or similar circumstances?</span> This "reasonable person" is not a perfect being — it is an <span class="hlg">objective legal fiction designed to set an external, uniform standard against which all conduct may be measured.</span></p>
<p><em>Vaughan v. Menlowe</em> (1837) established that a defendant's subjective belief in the prudence of his conduct provides no defense. The court rejected "honest best judgment" — to accept it would allow each man to carry his own standard of care, producing results "as variable as the length of the foot."</p>
<p><span class="hlp">Where the defendant possesses superior knowledge, skill, or expertise, the standard is elevated accordingly.</span> A surgeon is held to the standard of a reasonable surgeon; a licensed electrician to the standard of a reasonable electrician.</p>
<div class="tbst">§ 3.2 The Hand Formula</div>
<p>Judge Learned Hand, in <em>United States v. Carroll Towing Co.</em> (2d Cir. 1947), articulated the dominant economic framework for evaluating negligence. <span class="hlb">A party is negligent if the burden of taking adequate precautions (B) is less than the probability of harm (P) multiplied by the gravity of injury (L). Algebraically: B &lt; PL.</span></p>
<p>The Carroll Towing facts illustrate the formula well. A barge owner left his vessel unattended. When the barge broke free and caused significant damage, Hand found the cost of keeping an attendant far exceeded the expected harm of not doing so.</p>
<p>Critics note the formula reduces moral judgments to economic calculation. <span class="hly">The formula provides clarity but cannot account for dignity, autonomy, or distributional equity that tort law has historically served.</span></p>
<div class="tbst">§ 3.3 Custom as Evidence</div>
<p>In <em>The T.J. Hooper</em> (1932), Hand held that an entire industry can be negligent: <span class="hlg">"courts must in the end say what is required; there are precautions so imperative that even their universal disregard will not excuse their omission."</span></p>
<p style="font-size:10.5px;color:#3e4152;margin-top:7px">* See Chapter 11 (Medical Malpractice) and Chapter 12 (Legal Malpractice).</p>`;
const API_DATA = [{
  cat: 'core',
  label: 'Core API',
  name: 'LexNotes REST API',
  owner: 'Build in-house (Node.js + Express)',
  purpose: 'Handles all note CRUD, user auth, course/topic management, and real-time collab sessions. The central data layer everything else calls through.',
  eps: [{
    m: 'post',
    p: '/api/auth/register'
  }, {
    m: 'post',
    p: '/api/auth/login'
  }, {
    m: 'get',
    p: '/api/notes?course=&topic='
  }, {
    m: 'post',
    p: '/api/notes'
  }, {
    m: 'patch',
    p: '/api/notes/:id'
  }, {
    m: 'del',
    p: '/api/notes/:id'
  }]
}, {
  cat: 'ai',
  label: 'AI',
  name: 'Anthropic Claude API',
  owner: 'api.anthropic.com',
  purpose: 'Powers AI auto-outline generation, case brief suggestions, exam tip generation, topic connection mapping, and AI-generated practice question explanations.',
  eps: [{
    m: 'post',
    p: '/api/ai/generate-outline'
  }, {
    m: 'post',
    p: '/api/ai/suggest-connections'
  }, {
    m: 'post',
    p: '/api/ai/generate-questions'
  }, {
    m: 'post',
    p: '/api/ai/exam-tips'
  }]
}, {
  cat: 'ai',
  label: 'AI',
  name: 'OpenAI Whisper API',
  owner: 'api.openai.com',
  purpose: 'Real-time lecture recording transcription with timestamp generation and speaker detection. Powers Auto Notes, merge feature, and timestamp sync map.',
  eps: [{
    m: 'post',
    p: '/api/audio/transcribe'
  }, {
    m: 'get',
    p: '/api/audio/:id/timestamps'
  }, {
    m: 'get',
    p: '/api/audio/:id/status'
  }]
}, {
  cat: 'db',
  label: 'Storage',
  name: 'Supabase / PostgreSQL',
  owner: 'supabase.com',
  purpose: 'Primary database for all user data — notes, briefs, courses, textbook annotations. Realtime subscriptions enable live sync across devices.',
  eps: [{
    m: 'get',
    p: '/rest/v1/notes (realtime)'
  }, {
    m: 'post',
    p: '/rest/v1/notes'
  }, {
    m: 'patch',
    p: '/rest/v1/notes?id=eq.:id'
  }, {
    m: 'post',
    p: '/rest/v1/documents'
  }]
}, {
  cat: 'db',
  label: 'Storage',
  name: 'AWS S3 / Cloudflare R2',
  owner: 'aws.amazon.com / cloudflare.com',
  purpose: 'Object storage for lecture audio recordings, uploaded PDF/ePub textbooks, and exported documents. Presigned URLs for direct browser upload.',
  eps: [{
    m: 'post',
    p: '/api/storage/presign-upload'
  }, {
    m: 'get',
    p: '/api/storage/:key'
  }, {
    m: 'del',
    p: '/api/storage/:key'
  }]
}, {
  cat: 'sync',
  label: 'Sync',
  name: 'Canvas LMS OAuth 2.0',
  owner: 'canvas.instructure.com',
  purpose: 'Pull course syllabi, assignments, due dates, and reading lists. Auto-populate the LexNotes calendar. Keep integration updated via webhook on Canvas changes.',
  eps: [{
    m: 'get',
    p: '/api/lms/canvas/courses'
  }, {
    m: 'get',
    p: '/api/lms/canvas/assignments'
  }, {
    m: 'get',
    p: '/api/lms/canvas/calendar'
  }, {
    m: 'post',
    p: '/api/lms/canvas/webhook'
  }]
}, {
  cat: 'sync',
  label: 'Sync',
  name: 'Google Calendar API',
  owner: 'developers.google.com',
  purpose: 'Two-way calendar sync. Class schedules, office hours, and exam dates pushed from LexNotes automatically. OAuth 2.0 scope: calendar.events.',
  eps: [{
    m: 'get',
    p: '/api/integrations/google/events'
  }, {
    m: 'post',
    p: '/api/integrations/google/events'
  }, {
    m: 'del',
    p: '/api/integrations/google/events/:id'
  }]
}, {
  cat: 'ai',
  label: 'AI',
  name: 'PDF.js + LlamaIndex',
  owner: 'mozilla.github.io / llamaindex.ai',
  purpose: 'In-app PDF/ePub parsing, text extraction, semantic chunking, and search index for textbook reader. Powers annotations, highlighting, and copy-to-notes.',
  eps: [{
    m: 'post',
    p: '/api/textbooks/upload'
  }, {
    m: 'get',
    p: '/api/textbooks/:id/pages'
  }, {
    m: 'post',
    p: '/api/textbooks/:id/annotations'
  }, {
    m: 'post',
    p: '/api/textbooks/:id/search'
  }]
}, {
  cat: 'core',
  label: 'Core',
  name: 'Stripe Billing API',
  owner: 'stripe.com',
  purpose: 'Subscription management for Free, Pro ($12/mo), and Law School (enterprise) tiers. Usage-based AI credits for heavy users. Webhook for subscription events.',
  eps: [{
    m: 'post',
    p: '/api/billing/create-subscription'
  }, {
    m: 'post',
    p: '/api/billing/portal'
  }, {
    m: 'post',
    p: '/api/billing/webhook'
  }]
}];
function useToast() {
  const [ts, setTs] = useState([]);
  const timers = useRef(new Map());
  const show = useCallback(msg => {
    const id = nextId();
    setTs(p => [...p.slice(-2), {
      id,
      msg
    }]);
    const timer = setTimeout(() => {
      setTs(p => p.filter(t => t.id !== id));
      timers.current.delete(id);
    }, 2200);
    timers.current.set(id, timer);
  }, []);
  useEffect(() => () => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current.clear();
  }, []);
  return [ts, show];
}
function useDebouncedEffect(effect, deps, delay) {
  useEffect(() => {
    const t = setTimeout(effect, delay);
    return () => clearTimeout(t);
  }, [...deps, delay]);
}
function Toasts({
  items
}) {
  return React.createElement("div", {
    className: "toast-stack"
  }, items.map(t => React.createElement("div", {
    key: t.id,
    className: "toast"
  }, t.msg)));
}
function Modal({
  open,
  onClose,
  title,
  sub,
  size = 'modal-md',
  children
}) {
  if (!open) return null;
  return React.createElement("div", {
    className: "overlay",
    onClick: e => e.target.classList.contains('overlay') && onClose()
  }, React.createElement("div", {
    className: `modal ${size} afu`
  }, React.createElement("div", {
    className: "mhd"
  }, React.createElement("div", null, React.createElement("div", {
    className: "mhd-title"
  }, title), sub && React.createElement("div", {
    className: "mhd-sub"
  }, sub)), React.createElement("button", {
    className: "mclose",
    onClick: onClose
  }, "\u2715")), children));
}
function PanelCollapseBtn({
  collapsed,
  onToggle
}) {
  return React.createElement("button", {
    className: "pcol",
    onClick: onToggle
  }, collapsed ? '›' : '‹');
}
function Toggle({
  on,
  onToggle
}) {
  return React.createElement("div", {
    className: `toggle-track${on ? ' on' : ''}`,
    onClick: onToggle
  }, React.createElement("div", {
    className: "toggle-thumb"
  }));
}
function AuthScreen({
  onAuth,
  existingUser,
  onSwitch
}) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  function submit() {
    const e = email.trim().toLowerCase();
    if (!e || !password) {
      setErr('Email and password are required');
      return;
    }
    const users = readJSON(USERS_KEY, []);
    const existing = users.find(u => u.email === e);
    if (mode === 'signup') {
      if (!name.trim()) {
        setErr('Name is required');
        return;
      }
      if (password !== confirm) {
        setErr('Passwords do not match');
        return;
      }
      if (existing) {
        setErr('An account with this email already exists');
        return;
      }
      const user = {
        id: `u_${nextId()}`,
        name: name.trim(),
        email: e,
        password,
        createdAt: new Date().toISOString()
      };
      writeJSON(USERS_KEY, [...users, user]);
      writeJSON(SESSION_KEY, {
        id: user.id
      });
      onAuth(user);
      return;
    }
    if (!existing || existing.password !== password) {
      setErr('Invalid email or password');
      return;
    }
    writeJSON(SESSION_KEY, {
      id: existing.id
    });
    onAuth(existing);
  }
  function submitForgotPassword() {
    const e = forgotEmail.trim().toLowerCase();
    if (!e) {
      setForgotMsg('Enter your account email');
      return;
    }
    const users = readJSON(USERS_KEY, []);
    const existing = users.find(u => u.email === e);
    if (!existing) {
      setForgotMsg('No account found for that email');
      return;
    }
    const requests = readJSON(PASSWORD_RESET_REQUESTS_KEY, []);
    requests.push({
      id: `r_${nextId()}`,
      email: e,
      userId: existing.id,
      requestedAt: new Date().toISOString(),
      routeTo: e
    });
    writeJSON(PASSWORD_RESET_REQUESTS_KEY, requests.slice(-200));
    setForgotMsg(`Reset request sent to ${e}.`);
  }
  return React.createElement("div", {
    className: "view active afu",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }
  }, React.createElement("div", {
    className: "modal modal-sm",
    style: {
      maxHeight: 'none'
    }
  }, React.createElement("div", {
    className: "mhd"
  }, React.createElement("div", null, React.createElement("div", {
    className: "mhd-title"
  }, "Welcome to LexNotes"), React.createElement("div", {
    className: "mhd-sub"
  }, "Create an account or sign in to load your workspace"))), React.createElement("div", {
    className: "mbody"
  }, existingUser && React.createElement("div", {
    style: {
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 10
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Signed in previously as"), React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 600
    }
  }, existingUser.name, " \xB7 ", existingUser.email), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 8
    }
  }, React.createElement("button", {
    className: "btn btn-primary btn-sm",
    style: {
      flex: 1
    },
    onClick: () => onAuth(existingUser)
  }, "Continue"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      flex: 1
    },
    onClick: onSwitch
  }, "Use another account"))), React.createElement("div", {
    className: "choices"
  }, React.createElement("button", {
    className: `choice${mode === 'login' ? ' picked' : ''}`,
    onClick: () => {
      setMode('login');
      setErr('');
    }
  }, "Log In"), React.createElement("button", {
    className: `choice${mode === 'signup' ? ' picked' : ''}`,
    onClick: () => {
      setMode('signup');
      setErr('');
    }
  }, "Create Account")), mode === 'signup' && React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Name"), React.createElement("input", {
    className: "inp",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Jordan Davis"
  })), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Email"), React.createElement("input", {
    className: "inp",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "you@lawschool.edu"
  })), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Password"), React.createElement("input", {
    className: "inp",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), mode === 'signup' && React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Confirm Password"), React.createElement("input", {
    className: "inp",
    type: "password",
    value: confirm,
    onChange: e => setConfirm(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), mode === 'login' && React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setForgotOpen(true);
      setForgotEmail(email);
      setForgotMsg('');
    }
  }, "Forgot password?")), err && React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--red)'
    }
  }, err), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      width: '100%',
      padding: 10
    },
    onClick: submit
  }, mode === 'signup' ? 'Create Account' : 'Log In'), React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--dim)'
    }
  }, "Demo auth is stored in your browser localStorage for this prototype."))), React.createElement(Modal, {
    open: forgotOpen,
    onClose: () => setForgotOpen(false),
    title: "Reset Password",
    sub: "Reset requests are sent to the account email entered below",
    size: "modal-sm"
  }, React.createElement("div", {
    className: "mbody"
  }, React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Account Email"), React.createElement("input", {
    className: "inp",
    value: forgotEmail,
    onChange: e => setForgotEmail(e.target.value),
    placeholder: "you@lawschool.edu"
  })), forgotMsg && React.createElement("div", {
    style: {
      fontSize: 11,
      color: forgotMsg.startsWith('Reset request sent') ? 'var(--green)' : 'var(--red)'
    }
  }, forgotMsg), React.createElement("div", {
    className: "frow"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      flex: 1
    },
    onClick: () => setForgotOpen(false)
  }, "Cancel"), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      flex: 1
    },
    onClick: submitForgotPassword
  }, "Send Reset Request")))));
}
function Sidebar({
  view,
  onNav,
  mini,
  setMini,
  user,
  onLogout
}) {
  const navItems = [{
    id: 'dashboard',
    ic: '⊞',
    label: 'Dashboard'
  }, {
    id: 'notes',
    ic: '✎',
    label: 'Notes',
    dot: true
  }, {
    id: 'outline',
    ic: '≡',
    label: 'Outlines'
  }, {
    id: 'practice',
    ic: '◎',
    label: 'Practice'
  }, {
    id: 'calendar',
    ic: '▦',
    label: 'Calendar'
  }, {
    id: 'docs',
    ic: '📄',
    label: 'Documents'
  }, {
    id: 'textbooks',
    ic: '📚',
    label: 'Textbooks'
  }, {
    id: 'integrations',
    ic: '⌁',
    label: 'Integrations'
  }, {
    id: 'settings',
    ic: '⚙',
    label: 'Settings'
  }, {
    id: 'apis',
    ic: '◈',
    label: 'API Map'
  }];
  return React.createElement("div", {
    className: `sidebar${mini ? ' mini' : ''}`,
    style: {
      position: 'relative'
    }
  }, React.createElement("div", {
    className: "logo"
  }, React.createElement("div", {
    className: "logo-icon"
  }, "L"), !mini && React.createElement("div", {
    className: "logo-words"
  }, React.createElement("div", {
    className: "logo-name"
  }, "LexNotes"), React.createElement("div", {
    className: "logo-tag"
  }, "Law School OS"))), React.createElement("button", {
    className: "sb-toggle",
    onClick: () => setMini(v => !v)
  }, mini ? '›' : '‹'), React.createElement("div", {
    className: "sb-section"
  }, !mini && React.createElement("div", {
    className: "sb-label"
  }, "Workspace"), navItems.map(n => React.createElement("div", {
    key: n.id,
    className: `nav${view === n.id ? ' on' : ''}`,
    onClick: () => onNav(n.id),
    title: mini ? n.label : ''
  }, React.createElement("span", {
    className: "nav-ic"
  }, n.ic), !mini && React.createElement("span", {
    className: "nav-lbl"
  }, n.label), !mini && n.dot && React.createElement("span", {
    className: "nav-dot"
  })))), !mini && React.createElement("div", {
    className: "sb-section"
  }, React.createElement("div", {
    className: "sb-label"
  }, "Courses"), COURSES.map(c => React.createElement("div", {
    key: c.id,
    className: "cpill",
    onClick: () => onNav('notes')
  }, React.createElement("div", {
    className: "cdot",
    style: {
      background: c.color
    }
  }), React.createElement("span", {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, c.label)))), React.createElement("div", {
    className: "sb-bottom"
  }, React.createElement("div", {
    className: "ucard"
  }, React.createElement("div", {
    className: "avatar"
  }, (user?.name || 'U').slice(0, 2).toUpperCase()), !mini && React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, user?.name || 'User'), React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, user?.email || 'Not signed in')), !mini && React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: e => {
      e.stopPropagation();
      onLogout();
    }
  }, "Log out"))));
}
function Topbar({
  view,
  onNew,
  onToast
}) {
  const titles = {
    dashboard: 'Dashboard',
    notes: 'Notes',
    outline: 'Outlines',
    practice: 'Practice',
    calendar: 'Calendar',
    docs: 'Documents',
    textbooks: 'Textbooks',
    integrations: 'Integrations',
    settings: 'Settings',
    apis: 'API Architecture Map'
  };
  const ctas = {
    dashboard: '+ New Note',
    notes: '+ New Note',
    outline: '⚡ Regenerate',
    practice: '▶ New Session',
    calendar: '+ Event',
    docs: '+ New Doc',
    textbooks: '+ Add Book',
    integrations: '⌁ Connect App',
    settings: null,
    apis: null
  };
  return React.createElement("div", {
    className: "topbar"
  }, React.createElement("div", {
    className: "tb-title"
  }, titles[view] || view), React.createElement("div", {
    className: "tb-search"
  }, React.createElement("span", {
    className: "tb-search-icon"
  }, "\u2315"), React.createElement("input", {
    placeholder: "Search notes, cases, topics\u2026",
    onFocus: () => onToast('Global search — ⌘K shortcut in production')
  })), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onToast('Notifications: 3 new')
  }, "\uD83D\uDD14"), ctas[view] && React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: onNew
  }, ctas[view]));
}
function Dashboard({
  notes,
  onToast,
  onNav,
  user
}) {
  const DASH_KEY = `lexnotes:${user?.id || 'anon'}:dashboard-widgets`;
  const DEFAULT_WIDGETS = [{
    id: 'upcoming',
    label: 'Upcoming',
    on: true
  }, {
    id: 'recent',
    label: 'Recent Notes',
    on: true
  }, {
    id: 'insights',
    label: 'AI Insights',
    on: true
  }, {
    id: 'practice',
    label: 'Practice Stats',
    on: true
  }, {
    id: 'outline',
    label: 'Outline Preview',
    on: true
  }, {
    id: 'inbox',
    label: 'Inbox',
    on: true
  }];
  const CAL_KEY = `lexnotes:${user?.id || 'anon'}:calendar-events`;
  const [upcoming, setUpcoming] = useState([]);
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [showCustomize, setShowCustomize] = useState(false);
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DASH_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      setWidgets(DEFAULT_WIDGETS.map(w => {
        const hit = saved.find(s => s.id === w.id);
        return hit ? {
          ...w,
          on: !!hit.on
        } : w;
      }));
    } catch {}
  }, []);
  useDebouncedEffect(() => {
    try {
      localStorage.setItem(DASH_KEY, JSON.stringify(widgets.map(w => ({
        id: w.id,
        on: w.on
      }))));
    } catch {}
  }, [widgets], 220);
  useEffect(() => {
    const cal = readJSON(CAL_KEY, {});
    const out = [];
    Object.entries(cal || {}).forEach(([monthKey, daysObj]) => {
      Object.entries(daysObj || {}).forEach(([day, events]) => {
        (events || []).forEach(ev => {
          out.push({
            l: ev.l,
            w: `${monthKey}-${String(day).padStart(2, '0')}`,
            c: ev.tc || '#5283e0'
          });
        });
      });
    });
    out.sort((a, b) => a.w.localeCompare(b.w));
    setUpcoming(out.slice(0, 5));
  }, [CAL_KEY]);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const toggleWidget = id => setWidgets(p => p.map(w => w.id === id ? {
    ...w,
    on: !w.on
  } : w));
  const moveWidget = (from, to) => {
    if (from === to || from < 0 || to < 0) return;
    setWidgets(p => {
      if (to >= p.length) return p;
      const next = [...p];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };
  const cardById = {
    upcoming: React.createElement("div", {
      className: "wcard"
    }, React.createElement("div", {
      className: "whead"
    }, React.createElement("span", {
      className: "wtitle"
    }, "Upcoming"), React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => onNav('calendar')
    }, "Calendar \u2192")), React.createElement("div", {
      className: "wbody"
    }, upcoming.length === 0 ? React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--muted)'
      }
    }, "No events yet. Connect Calendar apps or add events.") : upcoming.map((u, i) => React.createElement("div", {
      key: i,
      className: "wrow"
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, React.createElement("div", {
      style: {
        width: 3,
        height: 32,
        borderRadius: 2,
        background: u.c,
        flexShrink: 0
      }
    }), React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 500
      }
    }, u.l), React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--dim)',
        fontFamily: 'JetBrains Mono,monospace'
      }
    }, u.w))))))),
    recent: React.createElement("div", {
      className: "wcard"
    }, React.createElement("div", {
      className: "whead"
    }, React.createElement("span", {
      className: "wtitle"
    }, "Recent Notes"), React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => onNav('notes')
    }, "All \u2192")), React.createElement("div", {
      className: "wbody"
    }, notes.length === 0 ? React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--muted)'
      }
    }, "No notes yet.") : notes.slice(0, 5).map(n => {
      const c = COURSES.find(c => c.id === n.course);
      return React.createElement("div", {
        key: n.id,
        className: "wrow",
        style: {
          cursor: 'pointer'
        },
        onClick: () => onNav('notes')
      }, React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          flex: 1,
          minWidth: 0
        }
      }, React.createElement("div", {
        style: {
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: c?.color,
          flexShrink: 0
        }
      }), React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, n.title)), React.createElement("span", {
        style: {
          fontSize: 9,
          background: 'var(--surface2)',
          padding: '1px 5px',
          borderRadius: 3,
          color: 'var(--dim)',
          flexShrink: 0
        }
      }, n.type));
    }))),
    insights: React.createElement("div", {
      className: "wcard"
    }, React.createElement("div", {
      className: "whead"
    }, React.createElement("span", {
      className: "wtitle"
    }, "AI Insights"), React.createElement("div", {
      className: "aidot"
    })), React.createElement("div", {
      className: "wbody"
    }, React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--muted)',
        lineHeight: 1.6,
        marginBottom: 10
      }
    }, "You've covered negligence duty extensively but haven't reviewed ", React.createElement("strong", {
      style: {
        color: 'var(--text)'
      }
    }, "proximate cause"), " recently."), React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--muted)',
        lineHeight: 1.6,
        marginBottom: 10
      }
    }, "Contracts gap: ", React.createElement("strong", {
      style: {
        color: 'var(--accent)'
      }
    }, "promissory estoppel"), " \u2014 3 cases assigned, 0 briefed."), React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      style: {
        width: '100%',
        marginTop: 4
      },
      onClick: () => onToast('Generating personalized study plan…')
    }, "\u26A1 Generate Study Plan"))),
    practice: React.createElement("div", {
      className: "wcard"
    }, React.createElement("div", {
      className: "whead"
    }, React.createElement("span", {
      className: "wtitle"
    }, "Practice Stats"), React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => onNav('practice')
    }, "Practice \u2192")), React.createElement("div", {
      className: "wbody"
    }, COURSES.length === 0 ? React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--muted)'
      }
    }, "Add a course to see stats.") : COURSES.map((c, i) => {
      const pct = [72, 68, 81, 74, 65][i];
      return React.createElement("div", {
        key: c.id,
        className: "wrow"
      }, React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, React.createElement("div", {
        style: {
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: c.color
        }
      }), React.createElement("span", {
        style: {
          fontSize: 11.5
        }
      }, c.label)), React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, React.createElement("div", {
        style: {
          width: 55,
          height: 3,
          borderRadius: 99,
          background: 'var(--border)',
          overflow: 'hidden'
        }
      }, React.createElement("div", {
        style: {
          width: `${pct}%`,
          height: '100%',
          background: c.color,
          borderRadius: 99
        }
      })), React.createElement("span", {
        style: {
          fontSize: 10,
          fontFamily: 'JetBrains Mono,monospace',
          color: 'var(--muted)',
          width: 26,
          textAlign: 'right'
        }
      }, pct, "%")));
    }))),
    outline: React.createElement("div", {
      className: "wcard span2"
    }, React.createElement("div", {
      className: "whead"
    }, React.createElement("span", {
      className: "wtitle"
    }, "Outline Preview \u2014 Contracts"), React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => onNav('outline')
    }, "Full Outline \u2192")), React.createElement("div", {
      className: "wbody",
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 11,
        lineHeight: 1.85,
        color: 'var(--muted)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: 24
      }
    }, React.createElement("div", null, React.createElement("span", {
      style: {
        color: 'var(--text)',
        fontWeight: 600
      }
    }, "I. Formation"), React.createElement("br", null), "\xA0\xA0A. Offer \u2014 definite terms, intent", React.createElement("br", null), "\xA0\xA0B. Acceptance \u2014 mirror image / UCC \xA72-207", React.createElement("br", null), "\xA0\xA0C. Consideration \u2014 bargained-for exchange", React.createElement("br", null), React.createElement("span", {
      style: {
        color: 'var(--text)',
        fontWeight: 600
      }
    }, "II. Defenses"), React.createElement("br", null), "\xA0\xA0A. Fraud, Duress, Undue Influence", React.createElement("br", null), "\xA0\xA0B. Mistake \u2014 mutual vs. unilateral"), React.createElement("div", null, React.createElement("span", {
      style: {
        color: 'var(--text)',
        fontWeight: 600
      }
    }, "III. Breach & Remedies"), React.createElement("br", null), "\xA0\xA0A. Material vs. Minor Breach", React.createElement("br", null), "\xA0\xA0B. Expectation Damages", React.createElement("br", null), "\xA0\xA0C. Consequential \u2014 ", React.createElement("span", {
      style: {
        color: 'var(--accent)',
        fontStyle: 'italic'
      }
    }, "Hadley v. Baxendale"), React.createElement("br", null), "\xA0\xA0D. Reliance & Restitution", React.createElement("br", null), React.createElement("span", {
      style: {
        color: 'var(--text)',
        fontWeight: 600
      }
    }, "IV. Impossibility / Frustration")))),
    inbox: React.createElement("div", {
      className: "wcard"
    }, React.createElement("div", {
      className: "whead"
    }, React.createElement("span", {
      className: "wtitle"
    }, "Inbox"), React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => onToast('Compose email')
    }, "Compose")), React.createElement("div", {
      className: "wbody"
    }, [{
      from: 'Prof. Chen',
      sub: 'Re: Tuesday Office Hours',
      t: '9:14am',
      unread: true
    }, {
      from: 'Canvas LMS',
      sub: 'Contracts: Assignment 3 Posted',
      t: '8:02am',
      unread: true
    }, {
      from: 'Study Group',
      sub: 'Torts outline — can we meet?',
      t: 'Yesterday',
      unread: false
    }].map((m, i) => React.createElement("div", {
      key: i,
      className: "wrow",
      style: {
        cursor: 'pointer',
        gap: 8
      },
      onClick: () => onToast(`Opening: ${m.sub}`)
    }, React.createElement("div", {
      style: {
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: m.unread ? 'var(--accent)' : 'transparent',
        border: m.unread ? 'none' : '1px solid var(--border)',
        flexShrink: 0,
        marginTop: 2
      }
    }), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11.5,
        fontWeight: m.unread ? 600 : 400,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, m.from), React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: 'var(--muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, m.sub)), React.createElement("span", {
      style: {
        fontSize: 9.5,
        color: 'var(--dim)',
        fontFamily: 'JetBrains Mono,monospace',
        flexShrink: 0
      }
    }, m.t)))))
  };
  return React.createElement("div", {
    className: "view active afu",
    style: {
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    className: "dash-scroll"
  }, React.createElement("div", {
    className: "dash-hero"
  }, React.createElement("div", null, React.createElement("div", {
    className: "greeting"
  }, "Welcome back, ", user?.name || 'Student', " \uD83D\uDC4B"), React.createElement("div", {
    className: "greeting-sub"
  }, todayLabel)), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setShowCustomize(true)
  }, "\u229E Customize"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => onNav('notes')
  }, "+ New Note"))), React.createElement("div", {
    className: "stats-row"
  }, [['Notes This Week', '14', '↑ 3 from last week'], ['Cases Briefed', '38', 'Across 5 courses'], ['Practice Score', '74%', '↑ 8% this month'], ['Days to Finals', '31', 'Contracts exam first']].map(([l, v, s]) => React.createElement("div", {
    className: "stat",
    key: l
  }, React.createElement("div", {
    className: "stat-lbl"
  }, l), React.createElement("div", {
    className: "stat-val"
  }, v), React.createElement("div", {
    className: "stat-meta"
  }, s)))), React.createElement("div", {
    className: "wgrid"
  }, widgets.filter(w => w.on).map(w => React.createElement(React.Fragment, {
    key: w.id
  }, cardById[w.id] || null)))), React.createElement(Modal, {
    open: showCustomize,
    onClose: () => setShowCustomize(false),
    title: "Customize Dashboard",
    sub: "Show or hide widgets",
    size: "modal-sm"
  }, React.createElement("div", {
    className: "mbody"
  }, widgets.map((w, idx) => React.createElement("div", {
    key: w.id,
    className: `setrow drag${dragIdx === idx ? ' on' : ''}`,
    style: {
      padding: '8px 0'
    },
    onPointerDown: () => setDragIdx(idx),
    onPointerEnter: () => dragIdx !== null && setOverIdx(idx),
    onPointerUp: () => {
      if (dragIdx !== null && overIdx !== null) moveWidget(dragIdx, overIdx);
      setDragIdx(null);
      setOverIdx(null);
    },
    onPointerCancel: () => {
      setDragIdx(null);
      setOverIdx(null);
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12
    }
  }, w.label), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => moveWidget(idx, Math.max(0, idx - 1))
  }, "\u2191"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => moveWidget(idx, Math.min(widgets.length - 1, idx + 1))
  }, "\u2193"), React.createElement(Toggle, {
    on: w.on,
    onToggle: () => toggleWidget(w.id)
  })))), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      width: '100%',
      padding: 10
    },
    onClick: () => {
      setShowCustomize(false);
      onToast('Dashboard layout saved');
    }
  }, "Done"))));
}
function NotesView({
  notes,
  setNotes,
  onToast,
  user
}) {
  const NOTES_META_KEY = `lexnotes:${user?.id || 'anon'}:notes-meta`;
  const [activeCourse, setActiveCourse] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [activeSubsection, setActiveSubsection] = useState('');
  const [extraCourses, setExtraCourses] = useState([]);
  const [extraTopics, setExtraTopics] = useState({});
  const [extraSubsections, setExtraSubsections] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [openCourses, setOpenCourses] = useState({});
  const [navCol, setNavCol] = useState(false);
  const [listCol, setListCol] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  const [mergeMode, setMergeMode] = useState(false);
  const [merged, setMerged] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTs, setActiveTs] = useState('11:20');
  const [pqAns, setPqAns] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState('brief');
  const [newTitle, setNewTitle] = useState('');
  const [briefDraft, setBriefDraft] = useState(null);
  const audioRef = useRef();
  const recRef = useRef();
  const richRef = useRef();
  const richSaveRef = useRef();
  useEffect(() => {
    if (recording) {
      recRef.current = setInterval(() => setRecSecs(s => s + 1), 1000);
    } else {
      clearInterval(recRef.current);
      setRecSecs(0);
    }
    return () => clearInterval(recRef.current);
  }, [recording]);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const allCourses = useMemo(() => [...COURSES, ...extraCourses], [extraCourses]);
  const subsectionKey = (courseId, topicId) => `${courseId || 'none'}::${topicId || 'none'}`;
  const activeNote = notes.find(n => n.id === activeId);
  const courseObj = allCourses.find(c => c.id === activeCourse);
  const selectedTopics = useMemo(() => [...(courseObj?.topics || []), ...(extraTopics[activeCourse] || [])], [courseObj, extraTopics, activeCourse]);
  const topicObj = selectedTopics.find(t => t.id === activeTopic);
  const currentSubsections = useMemo(() => extraSubsections[subsectionKey(activeCourse, activeTopic)] || [], [extraSubsections, activeCourse, activeTopic]);
  const filtered = useMemo(() => notes.filter(n => {
    if (n.course !== activeCourse || n.topic !== activeTopic) return false;
    if (activeSubsection && n.subsection !== activeSubsection) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [notes, activeCourse, activeTopic, activeSubsection, typeFilter, search]);
  const bothCol = navCol && listCol;
  const TYPE_COLOR = {
    brief: 'var(--blue)',
    class: 'var(--red)',
    auto: 'var(--accent)',
    reading: 'var(--green)'
  };
  const TYPE_LBL = {
    brief: '📋 Case Brief',
    class: '✎ Class Notes',
    auto: '🎙 Auto Notes',
    reading: '📖 Reading Notes'
  };
  const BRIEF_FIELDS = [{
    label: 'Facts',
    key: 'facts',
    rows: 5
  }, {
    label: 'Issue',
    key: 'issue',
    rows: 3
  }, {
    label: 'Rule / Holding',
    key: 'rule',
    rows: 3
  }, {
    label: 'Reasoning',
    key: 'reasoning',
    rows: 5
  }, {
    label: 'Significance / My Notes',
    key: 'notes',
    rows: 3
  }];
  useEffect(() => {
    const saved = readJSON(NOTES_META_KEY, null);
    if (saved) {
      if (Array.isArray(saved.extraCourses)) setExtraCourses(saved.extraCourses);
      if (saved.extraTopics && typeof saved.extraTopics === 'object') setExtraTopics(saved.extraTopics);
      if (saved.extraSubsections && typeof saved.extraSubsections === 'object') setExtraSubsections(saved.extraSubsections);
    }
  }, [NOTES_META_KEY]);
  useDebouncedEffect(() => {
    writeJSON(NOTES_META_KEY, {
      extraCourses,
      extraTopics,
      extraSubsections
    });
  }, [extraCourses, extraTopics, extraSubsections, NOTES_META_KEY], 260);
  useEffect(() => {
    if (activeNote?.type === 'brief') {
      setBriefDraft({
        facts: activeNote.bf?.facts || '',
        issue: activeNote.bf?.issue || '',
        rule: activeNote.bf?.rule || '',
        reasoning: activeNote.bf?.reasoning || '',
        notes: activeNote.bf?.notes || ''
      });
    } else {
      setBriefDraft(null);
    }
  }, [activeId, activeNote?.type]);
  useEffect(() => {
    const firstCourse = allCourses[0];
    if (!firstCourse) {
      if (activeCourse !== '') setActiveCourse('');
      if (activeTopic !== '') setActiveTopic('');
      return;
    }
    const topics = [...(firstCourse.topics || []), ...(extraTopics[firstCourse.id] || [])];
    if (!activeCourse || !allCourses.some(c => c.id === activeCourse)) {
      setActiveCourse(firstCourse.id);
      setOpenCourses(p => ({
        ...p,
        [firstCourse.id]: true
      }));
      setActiveTopic(topics[0]?.id || '');
      return;
    }
    const selectedCourse = allCourses.find(c => c.id === activeCourse);
    const selectedTopics = [...(selectedCourse?.topics || []), ...(extraTopics[selectedCourse?.id] || [])];
    if (activeTopic && !selectedTopics.some(t => t.id === activeTopic)) setActiveTopic(selectedTopics[0]?.id || '');
  }, [allCourses, activeCourse, activeTopic, extraTopics]);
  useEffect(() => {
    const list = extraSubsections[subsectionKey(activeCourse, activeTopic)] || [];
    if (activeSubsection && !list.some(s => s.id === activeSubsection)) setActiveSubsection('');
  }, [activeCourse, activeTopic, extraSubsections, activeSubsection]);
  useEffect(() => {
    if (notes.length === 0) {
      if (activeId !== null) setActiveId(null);
      return;
    }
    if (activeId === null || !notes.some(n => n.id === activeId)) setActiveId(notes[0].id);
  }, [notes, activeId]);
  useEffect(() => {
    if (activeNote && activeNote.subsection && activeNote.subsection !== activeSubsection) {
      setActiveSubsection(activeNote.subsection);
    }
    if (activeNote?.type !== 'brief' && richRef.current) {
      const html = activeNote?.contentHtml || esc(activeNote?.content || '').replace(/\n/g, '<br/>');
      richRef.current.innerHTML = html || '<p><br/></p>';
    }
  }, [activeId]);
  function createNote() {
    if (!newTitle.trim()) {
      onToast('Enter a title');
      return;
    }
    const n = {
      id: nextId(),
      course: activeCourse,
      topic: activeTopic,
      subsection: activeSubsection || '',
      type: newType,
      title: newTitle,
      preview: '',
      date: 'Feb 13',
      hasAudio: false,
      hasMerge: false,
      content: '',
      contentHtml: '',
      bf: {
        facts: '',
        issue: '',
        rule: '',
        reasoning: '',
        notes: ''
      }
    };
    setNotes(p => [n, ...p]);
    setActiveId(n.id);
    setShowNew(false);
    setNewTitle('');
    onToast('✎ Note created');
  }
  function addCourse() {
    const label = (prompt('Course name (e.g., Evidence)') || '').trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `course-${nextId()}`;
    if (allCourses.some(c => c.id === id)) {
      onToast('Course already exists');
      return;
    }
    const palette = ['#d95f5f', '#5283e0', '#4aab78', '#c9a84c', '#8f67d8', '#f08f42'];
    const color = palette[(allCourses.length + 1) % palette.length];
    const c = {
      id,
      label,
      color,
      topics: []
    };
    setExtraCourses(p => [...p, c]);
    setActiveCourse(id);
    setActiveTopic('');
    onToast(`Course "${label}" added`);
  }
  function addTopic(courseId) {
    const label = (prompt('Topic name (e.g., Hearsay)') || '').trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `topic-${nextId()}`;
    const existing = (allCourses.find(c => c.id === courseId)?.topics || []).some(t => t.id === id);
    if (existing) {
      onToast('Topic already exists');
      return;
    }
    setExtraTopics(p => ({
      ...p,
      [courseId]: [...(p[courseId] || []), {
        id,
        label,
        n: 0
      }]
    }));
    setActiveCourse(courseId);
    setActiveTopic(id);
    onToast(`Topic "${label}" added`);
  }
  function addSubsection() {
    if (!activeCourse || !activeTopic) {
      onToast('Pick a course and topic first');
      return;
    }
    const name = (prompt('Subsection name (e.g., Week 2 or Defenses)') || '').trim();
    if (!name) return;
    const kind = (prompt('Subsection type: topic or week', 'topic') || 'topic').trim().toLowerCase() === 'week' ? 'week' : 'topic';
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `sub-${nextId()}`;
    const key = subsectionKey(activeCourse, activeTopic);
    const list = extraSubsections[key] || [];
    if (list.some(s => s.id === id)) {
      onToast('Subsection already exists');
      return;
    }
    const row = {
      id,
      label: name,
      kind
    };
    setExtraSubsections(p => ({
      ...p,
      [key]: [...list, row]
    }));
    setActiveSubsection(id);
    onToast(`Subsection "${name}" added`);
  }
  function exportNote() {
    if (!activeNote) {
      onToast('No note selected');
      return;
    }
    const body = activeNote.type === 'brief' ? `Facts:\n${activeNote.bf?.facts || ''}\n\nIssue:\n${activeNote.bf?.issue || ''}\n\nRule:\n${activeNote.bf?.rule || ''}\n\nReasoning:\n${activeNote.bf?.reasoning || ''}\n\nNotes:\n${activeNote.bf?.notes || ''}` : activeNote.content || '';
    downloadFile(`${(activeNote.title || 'note').replace(/[^\w\- ]+/g, '')}.txt`, `${activeNote.title}\n\n${body}`);
    onToast('Note exported');
  }
  function saveRichNow() {
    if (!activeNote || activeNote.type === 'brief' || !richRef.current) return;
    const html = richRef.current.innerHTML || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.innerText || '';
    if ((activeNote.contentHtml || '') === html && (activeNote.content || '') === text) return;
    setNotes(p => p.map(n => n.id === activeId ? {
      ...n,
      contentHtml: html,
      content: text
    } : n));
  }
  function queueRichSave() {
    clearTimeout(richSaveRef.current);
    richSaveRef.current = setTimeout(saveRichNow, 180);
  }
  function noteCmd(name, val) {
    try {
      document.execCommand(name, false, val);
    } catch {}
    queueRichSave();
  }
  async function shareNote() {
    if (!activeNote) {
      onToast('No note selected');
      return;
    }
    const share = `LexNotes://${activeNote.id}:${activeNote.title}`;
    try {
      await navigator.clipboard.writeText(share);
      onToast('Share link copied');
    } catch {
      onToast('Share string ready: ' + share);
    }
  }
  async function handleAudioUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const title = `Audio Note — ${f.name.replace(/\.[^.]+$/, '')}`;
    const content = `[Uploaded audio]\nFile: ${f.name}\nSize: ${(f.size / 1024 / 1024).toFixed(2)} MB\nImported: ${new Date().toLocaleString()}\n\nTranscript processing ready via /api/transcribe.`;
    const n = {
      id: nextId(),
      course: activeCourse,
      topic: activeTopic || courseObj?.topics?.[0]?.id || 'general',
      subsection: activeSubsection || '',
      type: 'auto',
      title,
      preview: 'Uploaded audio ready for transcription',
      date: 'Just now',
      hasAudio: true,
      hasMerge: true,
      content,
      contentHtml: '',
      bf: {
        facts: '',
        issue: '',
        rule: '',
        reasoning: '',
        notes: ''
      }
    };
    setNotes(p => [n, ...p]);
    setActiveId(n.id);
    onToast('Audio file attached as auto note');
    e.target.value = '';
  }
  const TIMESTAMPS = [{
    ts: '02:14',
    label: 'Reasonable person'
  }, {
    ts: '05:30',
    label: 'Vaughan v. Menlove'
  }, {
    ts: '11:20',
    label: 'Hand Formula'
  }, {
    ts: '18:45',
    label: 'Carroll Towing'
  }, {
    ts: '31:00',
    label: 'Student Q: B = econ?'
  }, {
    ts: '39:15',
    label: 'Proximate cause'
  }];
  const AUTOBLOCKS = [{
    ts: '00:00',
    text: 'Prof. Chen began discussing the duty element — "The first question you always ask is whether the defendant owed a duty to this plaintiff."'
  }, {
    ts: '02:14',
    text: 'Introduced the reasonable person standard. Emphasized it is an external, objective test — not subjective to the defendant.'
  }, {
    ts: '05:30',
    text: 'Vaughan v. Menlove — defendant built haystack near cottage; court rejected "honest best judgment" defense. Objective standard applies regardless of D\'s mental capacity.'
  }, {
    ts: '11:20',
    text: 'HAND FORMULA — B < P × L. B = burden of adequate precautions. P = probability of harm. L = gravity of resulting injury.'
  }, {
    ts: '18:45',
    text: 'Carroll Towing hypo — barge broke away from dock. Was the barge owner negligent for not having a bargee on duty?'
  }, {
    ts: '31:00',
    text: 'STUDENT QUESTION: Does B include economic cost only? Prof: "No — burden can include any cost, inconvenience, or loss of utility." ← YOUR OPEN QUESTION ANSWERED'
  }, {
    ts: '39:15',
    text: 'Transition to proximate cause — "But-for causation isn\'t enough."'
  }];
  function saveBriefDraft() {
    if (!activeNote || activeNote.type !== 'brief' || !briefDraft) return;
    const curr = activeNote.bf || {};
    if ((curr.facts || '') === (briefDraft.facts || '') && (curr.issue || '') === (briefDraft.issue || '') && (curr.rule || '') === (briefDraft.rule || '') && (curr.reasoning || '') === (briefDraft.reasoning || '') && (curr.notes || '') === (briefDraft.notes || '')) return;
    setNotes(p => p.map(n => n.id === activeId ? {
      ...n,
      bf: {
        ...n.bf,
        ...briefDraft
      }
    } : n));
  }
  useEffect(() => () => clearTimeout(richSaveRef.current), []);
  return React.createElement("div", {
    className: "view active notes-layout",
    style: {
      flexDirection: 'row'
    }
  }, React.createElement("div", {
    className: "course-panel",
    style: {
      width: navCol ? 0 : '206px',
      borderRight: navCol ? 'none' : '',
      overflow: navCol ? 'visible' : 'hidden'
    }
  }, React.createElement(PanelCollapseBtn, {
    collapsed: navCol,
    onToggle: () => setNavCol(v => !v)
  }), React.createElement("div", {
    className: "phead"
  }, React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600
    }
  }, "My Courses"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: addCourse
  }, "+ Course")), React.createElement("div", {
    style: {
      padding: '7px 10px',
      borderBottom: '1px solid var(--border)'
    }
  }, React.createElement("input", {
    className: "inp",
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Search notes\u2026",
    style: {
      fontSize: 11.5
    }
  })), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, allCourses.map(course => {
    const topics = [...(course.topics || []), ...(extraTopics[course.id] || [])];
    return React.createElement("div", {
      key: course.id
    }, React.createElement("div", {
      className: `cgroup-hd${activeCourse === course.id ? ' on' : ''}`,
      onClick: () => {
        setActiveCourse(course.id);
        setOpenCourses(p => ({
          ...p,
          [course.id]: !p[course.id]
        }));
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, React.createElement("div", {
      className: "cdot",
      style: {
        background: course.color
      }
    }), React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 500
      }
    }, course.label)), React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, React.createElement("span", {
      style: {
        fontSize: 9,
        fontFamily: 'JetBrains Mono,monospace',
        color: 'var(--dim)',
        background: 'var(--surface3)',
        padding: '1px 5px',
        borderRadius: 99
      }
    }, notes.filter(n => n.course === course.id).length), React.createElement("span", {
      style: {
        fontSize: 8,
        color: 'var(--dim)'
      }
    }, openCourses[course.id] ? '▾' : '▸'))), openCourses[course.id] && topics.map(t => React.createElement("div", {
      key: t.id,
      className: `topic-row${activeCourse === course.id && activeTopic === t.id ? ' on' : ''}`,
      onClick: () => {
        setActiveCourse(course.id);
        setActiveTopic(t.id);
        setTypeFilter('all');
      }
    }, React.createElement("span", {
      style: {
        fontSize: 8,
        marginRight: 5,
        opacity: .4
      }
    }, "\u2B21"), t.label, React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontSize: 9,
        fontFamily: 'JetBrains Mono,monospace',
        color: 'var(--dim)'
      }
    }, notes.filter(n => n.course === course.id && n.topic === t.id).length || t.n))), openCourses[course.id] && React.createElement("div", {
      style: {
        padding: '4px 13px 4px 26px',
        fontSize: 11,
        color: 'var(--dim)',
        cursor: 'pointer'
      },
      onClick: () => addTopic(course.id)
    }, "+ Add Topic"));
  }))), React.createElement("div", {
    className: "list-panel",
    style: {
      width: listCol ? 0 : '256px',
      borderRight: listCol ? 'none' : '',
      overflow: listCol ? 'visible' : 'hidden'
    }
  }, React.createElement(PanelCollapseBtn, {
    collapsed: listCol,
    onToggle: () => setListCol(v => !v)
  }), React.createElement("div", {
    className: "phead"
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace',
      textTransform: 'uppercase',
      letterSpacing: 1
    }
  }, courseObj?.label), React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, topicObj?.label)), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setShowNew(true)
  }, "+")), React.createElement("div", {
    className: "nfilter"
  }, ['all', 'brief', 'class', 'auto', 'reading'].map(f => React.createElement("span", {
    key: f,
    className: `nfc${typeFilter === f ? ' on' : ''}`,
    onClick: () => setTypeFilter(f)
  }, f === 'all' ? 'All' : f === 'brief' ? '📋' : f === 'class' ? '✎' : f === 'auto' ? '🎙' : '📖', " ", f === 'all' ? '' : '  ', f === 'brief' ? 'Brief' : f === 'class' ? 'Class' : f === 'auto' ? 'Auto' : 'Reading'))), React.createElement("div", {
    className: "subfilter"
  }, React.createElement("span", {
    className: `subchip${activeSubsection === '' ? ' on' : ''}`,
    onClick: () => setActiveSubsection('')
  }, "All Sections"), currentSubsections.map(s => React.createElement("span", {
    key: s.id,
    className: `subchip${activeSubsection === s.id ? ' on' : ''}`,
    onClick: () => setActiveSubsection(s.id)
  }, s.kind === 'week' ? 'Wk' : 'Tp', " \xB7 ", s.label)), React.createElement("span", {
    className: "subchip",
    onClick: addSubsection
  }, "+ Section")), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '4px 0'
    }
  }, filtered.length === 0 && React.createElement("div", {
    style: {
      padding: '24px 14px',
      textAlign: 'center',
      color: 'var(--dim)',
      fontSize: 12
    }
  }, "No notes yet.", React.createElement("br", null), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    style: {
      marginTop: 8
    },
    onClick: () => setShowNew(true)
  }, "+ Create One")), filtered.map(n => React.createElement("div", {
    key: n.id,
    className: `nitem${n.id === activeId ? ' on' : ''}`,
    onClick: () => {
      setActiveId(n.id);
      setMergeMode(false);
      setMerged(false);
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2
    }
  }, React.createElement("div", {
    className: "nbadge",
    style: {
      color: TYPE_COLOR[n.type] || 'var(--muted)'
    }
  }, TYPE_LBL[n.type] || n.type), n.hasAudio && React.createElement("span", {
    className: "chip chip-gold",
    style: {
      fontSize: 8.5
    }
  }, "\uD83C\uDF99 Audio"), n.hasMerge && React.createElement("span", {
    className: "mbadge",
    onClick: e => {
      e.stopPropagation();
      setActiveId(n.id);
      setMergeMode(true);
      setMerged(false);
    }
  }, "\u21CC Merge")), React.createElement("div", {
    className: "ntitle"
  }, n.title), React.createElement("div", {
    className: "npreview"
  }, n.preview || n.content?.slice(0, 55)), n.subsection && React.createElement("small", null, currentSubsections.find(s => s.id === n.subsection)?.label || n.subsection), React.createElement("div", {
    className: "ndate"
  }, n.date))))), React.createElement("div", {
    className: "editor"
  }, bothCol && React.createElement("div", {
    className: "focus-bar"
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setNavCol(false);
      setListCol(false);
    }
  }, "\u203A\u203A Show panels"), React.createElement("span", {
    style: {
      fontSize: 9.5,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, "Focus Mode"), React.createElement("span", {
    className: "chip chip-gold"
  }, courseObj?.label, " \u203A ", topicObj?.label), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, "Full-screen editing")), !mergeMode ? React.createElement(React.Fragment, null, React.createElement("div", {
    className: "etopbar"
  }, React.createElement("span", {
    className: "chip",
    style: {
      background: (TYPE_COLOR[activeNote?.type] || 'var(--blue)') + '22',
      color: TYPE_COLOR[activeNote?.type] || 'var(--blue)',
      border: `1px solid ${TYPE_COLOR[activeNote?.type] || 'var(--blue)'}33`
    }
  }, TYPE_LBL[activeNote?.type] || 'Note'), React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'var(--muted)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, courseObj?.label, " \u203A ", topicObj?.label), React.createElement("div", {
    style: {
      flex: 1
    }
  }), activeNote?.hasMerge && React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setMergeMode(true);
      setMerged(false);
    }
  }, "\u21CC Merge w/ Auto Notes"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setAiOpen(v => !v)
  }, "\u26A1 AI"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: exportNote
  }, "\u2913 Export"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: shareNote
  }, "\u2197 Share"), (navCol || listCol) && React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setNavCol(false);
      setListCol(false);
    }
  }, "\u203A\u203A Show panels")), React.createElement("div", {
    className: "earea"
  }, React.createElement("div", {
    className: "escroll"
  }, activeNote ? React.createElement("div", {
    className: "ecol afu",
    key: activeId
  }, React.createElement("input", {
    className: "etitle",
    defaultValue: activeNote.title,
    placeholder: "Note title\u2026",
    onBlur: e => setNotes(p => p.map(n => n.id === activeId ? {
      ...n,
      title: e.target.value
    } : n))
  }), React.createElement("div", {
    className: "emeta"
  }, React.createElement("span", null, courseObj?.label), React.createElement("span", null, "\xB7"), activeNote.citation && React.createElement(React.Fragment, null, React.createElement("span", null, activeNote.citation), React.createElement("span", null, "\xB7")), React.createElement("span", null, activeNote.date)), activeNote.type === 'brief' ? BRIEF_FIELDS.map(f => React.createElement("div", {
    className: "bsec",
    key: f.key
  }, React.createElement("label", {
    className: "blbl"
  }, f.label), React.createElement("textarea", {
    className: "bta",
    rows: f.rows,
    value: briefDraft?.[f.key] || '',
    onChange: e => setBriefDraft(p => ({
      ...p,
      [f.key]: e.target.value
    })),
    onBlur: saveBriefDraft,
    placeholder: `Enter ${f.label.toLowerCase()}…`
  }))) : React.createElement("div", null, React.createElement("div", {
    className: "note-toolbar"
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => noteCmd('bold')
  }, "B"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => noteCmd('italic')
  }, React.createElement("i", null, "I")), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => noteCmd('underline')
  }, React.createElement("u", null, "U")), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => noteCmd('insertUnorderedList')
  }, "\u2022 List"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => noteCmd('insertOrderedList')
  }, "1. List")), React.createElement("div", {
    ref: richRef,
    className: "ebody-rich",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: queueRichSave,
    onBlur: saveRichNow
  }))) : React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--muted)',
      marginTop: 80
    }
  }, React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 12
    }
  }, "\u270E"), React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, "Select a note or create a new one"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setShowNew(true)
  }, "+ Create New Note"))), React.createElement("div", {
    className: `aipanel${aiOpen ? '' : ' hide'}`
  }, React.createElement("div", {
    className: "aihd"
  }, React.createElement("div", {
    className: "aititle"
  }, React.createElement("div", {
    className: "aidot"
  }), "Lex AI"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onToast('Refreshing AI insights…')
  }, "\u21BB Refresh")), React.createElement("div", {
    className: "aiscroll"
  }, React.createElement("div", {
    className: "aisec"
  }, React.createElement("div", {
    className: "aisec-lbl"
  }, "Topic Connections"), React.createElement("div", {
    className: "aicard",
    onClick: () => onToast('Opening linked note…')
  }, "\uD83D\uDD17 Links to ", React.createElement("strong", null, "Blyth v. Birmingham"), " \u2014 defines \"reasonable person\" in your reading notes"), React.createElement("div", {
    className: "aicard",
    onClick: () => onToast('Opening NIED…')
  }, "\uD83D\uDD17 NIED section: emotional harm requires foreseeable plaintiff \u2014 same Palsgraf doctrine")), React.createElement("div", {
    className: "aisec"
  }, React.createElement("div", {
    className: "aisec-lbl"
  }, "Quick Practice Question"), React.createElement("div", {
    style: {
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: 10
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      lineHeight: 1.6,
      marginBottom: 8
    }
  }, "What is Cardozo's test for duty in Palsgraf?"), [{
    t: 'Duty owed to all persons in society',
    c: false
  }, {
    t: 'Duty owed only to foreseeable plaintiffs in the zone of danger',
    c: true
  }, {
    t: 'Duty determined solely by proximate cause',
    c: false
  }].map((o, i) => React.createElement("div", {
    key: i,
    className: `pqopt${pqAns === i ? o.c ? ' ok' : ' no' : pqAns !== null && o.c ? ' ok' : ''}`,
    onClick: () => pqAns === null && setPqAns(i)
  }, String.fromCharCode(65 + i), ". ", o.t)), pqAns !== null && React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--green)',
      marginTop: 7,
      lineHeight: 1.5
    }
  }, "\u2713 Cardozo: duty is relational \u2014 owed only to those in the foreseeable zone of danger."))), React.createElement("div", {
    className: "aisec"
  }, React.createElement("div", {
    className: "aisec-lbl"
  }, "Exam Tip"), React.createElement("div", {
    className: "aicard tip"
  }, "\u26A1 Always argue BOTH Cardozo AND Andrews on exam hypos \u2014 they reach different results and professors love seeing both frameworks applied.")), React.createElement("div", {
    className: "aisec"
  }, React.createElement("div", {
    className: "aisec-lbl"
  }, "Actions"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      width: '100%',
      marginBottom: 6
    },
    onClick: () => onToast('Generating flash cards…')
  }, "\u26A1 Generate Flash Cards"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      width: '100%',
      marginBottom: 6
    },
    onClick: () => onToast('Adding to outline…')
  }, "\u2261 Add to Outline"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      width: '100%'
    },
    onClick: () => onToast('Creating practice question…')
  }, "\u25CE Create Practice Q"))))), React.createElement("div", {
    className: "tsbar"
  }, React.createElement("button", {
    className: `recbtn${recording ? ' live' : ''}`,
    onClick: () => setRecording(v => !v)
  }, recording ? '⏹' : '⏺'), React.createElement("div", {
    className: "tstxt"
  }, recording ? `Recording lecture… ${fmt(recSecs)}` : 'Click ⏺ to record · AI will auto-transcribe with timestamps'), recording && React.createElement("span", {
    className: "tstime"
  }, fmt(recSecs)), !recording && React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => audioRef.current?.click()
  }, "\u2191 Upload Audio"), React.createElement("input", {
    ref: audioRef,
    type: "file",
    accept: "audio/*",
    style: {
      display: 'none'
    },
    onChange: handleAudioUpload
  }))) : React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "mghd"
  }, React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--accent)'
    }
  }, "\u21CC Merge Mode"), React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--muted)',
      marginLeft: 8
    }
  }, courseObj?.label, " \u203A ", topicObj?.label), React.createElement("div", {
    style: {
      flex: 1
    }
  }), !merged && React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => {
      setMerged(true);
      onToast('✓ Notes merged successfully');
    }
  }, "\u2713 Merge into Single Note"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setMergeMode(false);
      setMerged(false);
    }
  }, "\u2715 Close")), merged ? React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      padding: '9px 16px',
      background: 'rgba(74,171,120,.05)',
      borderBottom: '1px solid rgba(74,171,120,.2)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      color: 'var(--green)',
      fontSize: 12.5,
      fontWeight: 600
    }
  }, "\u2713 Merged Successfully"), React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: 11.5
    }
  }, "Your notes + AI transcript combined with timestamp sync")), React.createElement("textarea", {
    style: {
      flex: 1,
      background: 'var(--bg)',
      border: 'none',
      outline: 'none',
      padding: '22px 30px',
      fontSize: 13,
      lineHeight: 1.8,
      color: 'var(--text)',
      fontFamily: 'DM Sans,sans-serif'
    },
    defaultValue: 'MERGED — Negligence, Feb 12 + Feb 10 Lecture\n\n[From Class Notes]\n\nREASONABLE PERSON STANDARD\n• Objective test — not what D could do, but what reasonable person would\n• Vaughan v. Menlove: "honest best judgment" rejected\n\nHAND FORMULA (Carroll Towing)\nB < P × L → negligent\nB = burden of precaution, P = probability, L = magnitude of loss\n\n[From Auto Notes — Lecture Feb 10]\n\n[02:14] Reasonable person is EXTERNAL and OBJECTIVE — emphasized by Prof. Chen.\n[05:30] Vaughan v. Menlove — objective std applies regardless of D\'s mental capacity.\n[11:20] HAND FORMULA: B = burden of precautions, P = probability, L = gravity of injury.\n[31:00] ANSWERED: B includes any cost — economic or otherwise.\n[39:15] Proximate cause — "But-for causation isn\'t enough."'
  })) : React.createElement("div", {
    className: "mgbody"
  }, React.createElement("div", {
    className: "mgpane"
  }, React.createElement("div", {
    className: "mgpane-hd"
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--muted)'
    }
  }, "\u270E Your Notes"), React.createElement("span", {
    className: "chip chip-red"
  }, "Class Notes \xB7 Feb 12")), React.createElement("textarea", {
    style: {
      flex: 1,
      background: 'var(--bg)',
      border: 'none',
      outline: 'none',
      padding: '16px 20px',
      fontSize: 13,
      lineHeight: 1.75,
      color: 'var(--text)',
      fontFamily: 'DM Sans,sans-serif'
    },
    defaultValue: 'Negligence — Class Notes, Feb 12\n\nREASONABLE PERSON STANDARD\n• Objective test — not what this D could do\n• Vaughan v. Menlove: "honest best judgment" rejected\n\nHAND FORMULA (Carroll Towing)\nB < P × L → negligent\nB = burden of precaution\nP = probability of harm\nL = magnitude of loss\n\nQ: is B only economic cost? Need to ask Prof.'
  })), React.createElement("div", {
    className: "syncmap"
  }, React.createElement("div", {
    style: {
      padding: '8px 10px',
      background: 'var(--surface2)',
      borderBottom: '1px solid var(--border)',
      fontSize: 9.5,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--muted)'
    }
  }, "\u23F1 Sync Map"), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 7
    }
  }, TIMESTAMPS.map(t => React.createElement("div", {
    key: t.ts,
    className: `tslink${activeTs === t.ts ? ' hi' : ''}`,
    onClick: () => setActiveTs(t.ts)
  }, React.createElement("div", {
    className: "tstlbl"
  }, t.ts), React.createElement("div", {
    className: "tslabel"
  }, t.label)))), React.createElement("div", {
    style: {
      padding: 7,
      borderTop: '1px solid var(--border)',
      textAlign: 'center',
      fontSize: 9,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, "6 matched segments")), React.createElement("div", {
    className: "mgpane",
    style: {
      borderRight: 'none'
    }
  }, React.createElement("div", {
    className: "mgpane-hd"
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--muted)'
    }
  }, "\uD83C\uDF99 Auto Notes"), React.createElement("span", {
    className: "chip chip-gold"
  }, "AI Transcript \xB7 47 min")), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 20px',
      fontSize: 12.5,
      lineHeight: 1.8,
      color: 'var(--muted)',
      fontFamily: 'JetBrains Mono,monospace',
      background: 'var(--bg)'
    }
  }, AUTOBLOCKS.map(b => React.createElement("div", {
    key: b.ts,
    className: `tsblock${activeTs === b.ts ? ' hi' : ''}`,
    onClick: () => setActiveTs(b.ts)
  }, "[", React.createElement("span", {
    className: "tsstamp",
    onClick: e => {
      e.stopPropagation();
      setActiveTs(b.ts);
    }
  }, b.ts), "] ", b.text))))))), React.createElement(Modal, {
    open: showNew,
    onClose: () => setShowNew(false),
    title: "New Note",
    sub: `${courseObj?.label} · ${topicObj?.label}`,
    size: "modal-sm"
  }, React.createElement("div", {
    className: "mbody"
  }, React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Type"), React.createElement("div", {
    className: "choices"
  }, [{
    v: 'brief',
    l: '📋 Case Brief'
  }, {
    v: 'class',
    l: '✎ Class Notes'
  }, {
    v: 'auto',
    l: '🎙 Auto Notes'
  }, {
    v: 'reading',
    l: '📖 Reading Notes'
  }].map(t => React.createElement("button", {
    key: t.v,
    className: `choice${newType === t.v ? ' picked' : ''}`,
    onClick: () => setNewType(t.v)
  }, t.l)))), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Title"), React.createElement("input", {
    className: "inp",
    value: newTitle,
    onChange: e => setNewTitle(e.target.value),
    placeholder: "e.g. Palsgraf v. LIRR",
    onKeyDown: e => e.key === 'Enter' && createNote()
  })), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      padding: '10px',
      fontSize: 13,
      width: '100%'
    },
    onClick: createNote
  }, "Create Note \u2192"))));
}
function OutlineView({
  onToast,
  user,
  notes,
  docs
}) {
  const OUTLINES_KEY = `lexnotes:${user?.id || 'anon'}:outlines`;
  const NOTES_META_KEY = `lexnotes:${user?.id || 'anon'}:notes-meta`;
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [outlines, setOutlines] = useState(() => readJSON(OUTLINES_KEY, {}));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const meta = readJSON(NOTES_META_KEY, {});
    const extra = Array.isArray(meta?.extraCourses) ? meta.extraCourses : [];
    const byId = {};
    extra.forEach(c => {
      if (c && c.id) byId[c.id] = {
        id: c.id,
        label: c.label || c.id
      };
    });
    (notes || []).forEach(n => {
      if (n?.course && !byId[n.course]) byId[n.course] = {
        id: n.course,
        label: n.course.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
      };
    });
    (docs || []).forEach(d => {
      if (d?.course && !byId[d.course]) byId[d.course] = {
        id: d.course,
        label: d.course.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
      };
    });
    const list = Object.values(byId);
    setCourses(list);
    if (!courseId && list[0]) setCourseId(list[0].id);
  }, [notes, docs, NOTES_META_KEY, courseId]);
  useDebouncedEffect(() => {
    writeJSON(OUTLINES_KEY, outlines);
  }, [outlines, OUTLINES_KEY], 350);
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = outlines[courseId]?.html || '';
  }, [courseId]);
  function saveCurrent() {
    if (!courseId || !editorRef.current) return;
    const html = editorRef.current.innerHTML || '';
    setOutlines(p => ({
      ...p,
      [courseId]: {
        ...(p[courseId] || {}),
        html,
        updatedAt: new Date().toISOString()
      }
    }));
  }
  function queueSaveCurrent() {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveCurrent, 220);
  }
  useEffect(() => () => clearTimeout(saveTimerRef.current), []);
  function cmd(name, value) {
    try {
      document.execCommand(name, false, value);
    } catch {}
    saveCurrent();
  }
  function insertAtCursor(text) {
    const safe = esc(text).replace(/\n/g, '<br/>');
    cmd('insertHTML', `<p>${safe}</p>`);
  }
  function insertLinkedCite(note) {
    const cite = note.citation || note.title || 'Linked Note';
    const snippet = (note.preview || note.content || '').slice(0, 180);
    const safeCite = esc(cite);
    const safeSnippet = esc(snippet);
    cmd('insertHTML', `<p><em style="background:rgba(201,168,76,.24);padding:1px 4px;border-radius:4px">[${safeCite}]</em> ${safeSnippet}</p>`);
  }
  function exportOutline(ext) {
    if (!courseId) {
      onToast('Select a course first');
      return;
    }
    const safeCourse = (courses.find(c => c.id === courseId)?.label || courseId).replace(/\s+/g, '-').toLowerCase();
    const name = `${safeCourse}-outline.${ext}`;
    const html = outlines[courseId]?.html || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.innerText || '';
    downloadFile(name, text, ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain');
    onToast(`Exported ${name}`);
  }
  async function autoOutline() {
    if (!courseId) {
      onToast('Select a course first');
      return;
    }
    setBusy(true);
    try {
      const courseNotes = (notes || []).filter(n => n.course === courseId).map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        topic: n.topic,
        content: n.content || '',
        brief: n.bf || null,
        preview: n.preview || ''
      }));
      const courseDocs = (docs || []).filter(d => d.course === courseId || !d.course).map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        content: d.content || null
      }));
      const payload = {
        courseId,
        notes: {
          notes: courseNotes,
          docs: courseDocs,
          transcripts: courseNotes.filter(n => n.type === 'auto')
        }
      };
      const res = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Generation failed');
      const outlineText = (data?.outline || '').trim();
      if (!outlineText) throw new Error('No outline content returned');
      const html = esc(outlineText).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>');
      const wrapped = `<p>${html}</p>`;
      setOutlines(p => ({
        ...p,
        [courseId]: {
          ...(p[courseId] || {}),
          html: wrapped,
          updatedAt: new Date().toISOString(),
          auto: true
        }
      }));
      if (editorRef.current) editorRef.current.innerHTML = wrapped;
      onToast('AI outline generated');
    } catch (err) {
      onToast('Auto-outline failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setBusy(false);
    }
  }
  const courseNotes = (notes || []).filter(n => n.course === courseId).slice(0, 25);
  const current = outlines[courseId] || {};
  return React.createElement("div", {
    className: "view active afu",
    style: {
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
      flexWrap: 'wrap'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      flex: 1,
      flexWrap: 'wrap'
    }
  }, courses.length === 0 ? React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--dim)'
    }
  }, "No courses yet. Create a course in Notes first.") : courses.map(c => React.createElement("button", {
    key: c.id,
    onClick: () => setCourseId(c.id),
    style: {
      padding: '5px 11px',
      borderRadius: 6,
      border: '1px solid var(--border)',
      background: courseId === c.id ? 'var(--accent-dim)' : 'transparent',
      color: courseId === c.id ? 'var(--accent)' : 'var(--muted)',
      fontSize: 11.5,
      cursor: 'pointer',
      transition: 'all .12s'
    }
  }, c.label))), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => cmd('bold')
  }, "B"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => cmd('italic')
  }, React.createElement("i", null, "I")), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => cmd('underline')
  }, React.createElement("u", null, "U")), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => cmd('insertUnorderedList')
  }, "\u2022 List"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => cmd('insertOrderedList')
  }, "1. List"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => cmd('formatBlock', '<h2>')
  }, "H2"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => cmd('formatBlock', '<p>')
  }, "P"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => exportOutline('pdf')
  }, "\u2913 PDF"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => exportOutline('docx')
  }, "\u2913 DOCX"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    disabled: busy || !courseId,
    onClick: autoOutline
  }, busy ? 'Generating…' : '⚡ Auto-Outline (AI)')), React.createElement("div", {
    style: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      width: 260,
      borderRight: '1px solid var(--border)',
      background: 'var(--surface)',
      overflowY: 'auto'
    }
  }, React.createElement("div", {
    style: {
      padding: '10px 12px',
      borderBottom: '1px solid var(--border)',
      fontSize: 10,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--dim)',
      textTransform: 'uppercase',
      letterSpacing: 1
    }
  }, "Insert from Course Notes"), courseNotes.length === 0 ? React.createElement("div", {
    style: {
      padding: 12,
      fontSize: 11,
      color: 'var(--dim)'
    }
  }, "No notes for this course yet.") : courseNotes.map(n => React.createElement("div", {
    key: n.id,
    style: {
      padding: '8px 10px',
      borderBottom: '1px solid var(--border)'
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      marginBottom: 3
    }
  }, n.title), React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--muted)',
      marginBottom: 6
    }
  }, n.type, " \xB7 ", n.topic || 'general'), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => insertAtCursor(`[Case] ${n.title}\n${n.preview || ''}`)
  }, "+ Case"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => insertAtCursor(`[Note] ${n.title}\n${(n.content || '').slice(0, 260)}`)
  }, "+ Note"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => insertLinkedCite(n)
  }, "+ Cite"))))), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 18
    }
  }, React.createElement("div", {
    className: "outline-doc"
  }, React.createElement("div", {
    className: "otag"
  }, courses.find(c => c.id === courseId)?.label || 'Outline', " \xB7 User Draft"), React.createElement("div", {
    className: "otitle"
  }, courses.find(c => c.id === courseId)?.label || 'Course', " Outline"), React.createElement("div", {
    className: "ometa"
  }, courseNotes.length, " notes \xB7 ", docs.filter(d => d.course === courseId).length, " docs \xB7 Updated ", current.updatedAt ? new Date(current.updatedAt).toLocaleString() : 'Not saved yet'), React.createElement("div", {
    ref: editorRef,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: queueSaveCurrent,
    style: {
      minHeight: 520,
      outline: 'none',
      fontSize: 13.5,
      lineHeight: 1.8,
      color: 'var(--text)'
    },
    placeholder: "Start outlining here..."
  })))));
}
function PracticeView({
  onToast,
  user,
  notes
}) {
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState(null);
  const [cFilter, setCFilter] = useState('All');
  const [score, setScore] = useState({
    c: 0,
    t: 0
  });
  const dynamicQs = useMemo(() => {
    const source = (notes || []).filter(n => n.title || n.content || n.preview).slice(0, 80);
    const byCourse = {};
    source.forEach(n => {
      const key = n.course || 'general';
      if (!byCourse[key]) byCourse[key] = [];
      byCourse[key].push(n);
    });
    const makeQ = (n, idx) => {
      const text = (n.content || n.preview || '').replace(/\s+/g, ' ').trim();
      const snippet = text.slice(0, 180) || `Key concept from "${n.title}"`;
      return {
        id: `n_${n.id}_${idx}`,
        course: (n.course || 'General').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase()),
        topic: (n.topic || 'General').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase()),
        sub: n.subsection ? `Section: ${n.subsection.replace(/-/g, ' ')}` : 'From your notes',
        text: `Based on your note "${n.title || 'Untitled'}", which statement is most consistent with your material?`,
        opts: [snippet || 'No content available', 'This rule applies only when punitive damages are mandatory.', 'This concept is irrelevant to exams and should be ignored.', 'The note states that no legal analysis is needed.'],
        correct: 0,
        exp: `Pulled from your note content: ${snippet || 'No content captured yet.'}`
      };
    };
    const out = [];
    Object.values(byCourse).forEach(arr => arr.slice(0, 6).forEach((n, idx) => out.push(makeQ(n, idx))));
    return out.length ? out : PRACTICE_QS;
  }, [notes]);
  const courses = ['All', ...Array.from(new Set(dynamicQs.map(q => q.course)))];
  const activeQs = cFilter === 'All' ? dynamicQs : dynamicQs.filter(q => q.course === cFilter);
  const q = activeQs[qi] || activeQs[0] || dynamicQs[0];
  const qCount = activeQs.length || 1;
  useEffect(() => {
    if (qi >= qCount) {
      setQi(0);
      setAns(null);
    }
  }, [qi, qCount, cFilter]);
  function pick(i) {
    if (ans !== null || !q) return;
    setAns(i);
    setScore(s => ({
      c: s.c + (i === q.correct ? 1 : 0),
      t: s.t + 1
    }));
  }
  function next() {
    setAns(null);
    setQi(p => (p + 1) % qCount);
  }
  function saveFlashCard() {
    if (!q) return;
    const key = `lexnotes:${user?.id || 'anon'}:flashcards`;
    const cards = readJSON(key, []);
    const card = {
      id: nextId(),
      question: q.text,
      answer: q.opts[q.correct],
      topic: `${q.course} · ${q.topic}`,
      savedAt: new Date().toISOString()
    };
    writeJSON(key, [card, ...cards].slice(0, 300));
    onToast('Flash card saved');
  }
  return React.createElement("div", {
    className: "view active afu",
    style: {
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    className: "pracwrap"
  }, React.createElement("div", {
    className: "prachd"
  }, React.createElement("div", null, React.createElement("div", {
    className: "prgtitle"
  }, "Practice Questions"), React.createElement("div", {
    className: "prgsub"
  }, "Generated from your classes and notes \xB7 Question ", Math.min(qi + 1, qCount), " of ", qCount)), React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      fontFamily: 'JetBrains Mono,monospace',
      marginBottom: 4
    }
  }, score.t > 0 ? `${Math.round(score.c / score.t * 100)}% avg · ` : '', Math.min(qi + 1, qCount), "/", qCount), React.createElement("div", {
    className: "prgbar"
  }, React.createElement("div", {
    className: "prgfill",
    style: {
      width: `${Math.min(qi + 1, qCount) / qCount * 100}%`
    }
  })))), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginBottom: 16,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, courses.map(f => React.createElement("span", {
    key: f,
    className: `chip${cFilter === f ? ' chip-gold' : ' chip-dim'}`,
    style: {
      cursor: 'pointer'
    },
    onClick: () => setCFilter(f)
  }, f)), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Score: ", score.c, "/", score.t)), React.createElement("div", {
    className: "qcard afu",
    key: `${cFilter}-${qi}`
  }, React.createElement("div", {
    className: "qtopic"
  }, q.course, " \xB7 ", q.topic, " \xB7 ", q.sub), React.createElement("div", {
    className: "qtext"
  }, q.text), q.opts.map((o, i) => {
    const isOk = i === q.correct;
    const cls = ans !== null ? i === ans ? isOk ? ' ok' : ' no' : isOk ? ' ok' : '' : '';
    return React.createElement("div", {
      key: i,
      className: `qopt${cls}${ans !== null ? ' done' : ''}`,
      onClick: () => pick(i)
    }, React.createElement("span", {
      className: "qletter"
    }, String.fromCharCode(65 + i)), React.createElement("span", null, o));
  }), ans !== null && React.createElement("div", {
    className: "qexplain"
  }, React.createElement("strong", null, ans === q.correct ? '✅ Correct!' : '❌ Incorrect.'), " ", q.exp)), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setAns(null);
      setQi(p => Math.max(0, p - 1));
    }
  }, "\u2190 Previous"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: next
  }, ans === null ? 'Skip →' : 'Next Question →'), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      marginLeft: 'auto'
    },
    onClick: saveFlashCard
  }, "\u229E Save as Flash Card"))));
}
function CalendarView({
  onToast,
  user,
  onNav
}) {
  const CAL_KEY = `lexnotes:${user?.id || 'anon'}:calendar-events`;
  const IMP_KEY = `lexnotes:${user?.id || 'anon'}:calendar-imported`;
  const INT_KEY = `lexnotes:${user?.id || 'anon'}:integrations`;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [cursor, setCursor] = useState(() => new Date());
  const [customEvents, setCustomEvents] = useState(() => readJSON(CAL_KEY, {}));
  const [importedEvents, setImportedEvents] = useState(() => readJSON(IMP_KEY, {}));
  const [connected, setConnected] = useState([]);
  useDebouncedEffect(() => {
    writeJSON(CAL_KEY, customEvents);
  }, [customEvents, CAL_KEY], 260);
  useDebouncedEffect(() => {
    writeJSON(IMP_KEY, importedEvents);
  }, [importedEvents, IMP_KEY], 260);
  useEffect(() => {
    const integrations = readJSON(INT_KEY, []);
    setConnected((integrations || []).filter(i => i.connected && ['canvas', 'google', 'm365'].includes(i.id)));
  }, [INT_KEY]);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthName = cursor.toLocaleString('en-US', {
    month: 'long'
  });
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const lead = Array.from({
    length: firstDow
  }, (_, i) => ({
    d: prevDays - firstDow + i + 1,
    other: true
  }));
  const now = new Date();
  const cur = Array.from({
    length: daysInMonth
  }, (_, i) => ({
    d: i + 1,
    other: false,
    today: year === now.getFullYear() && month === now.getMonth() && i + 1 === now.getDate()
  }));
  const cells = [...lead, ...cur];
  while (cells.length % 7 !== 0) cells.push({
    d: cells.length % 7 + 1,
    other: true
  });
  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthEvents = {
    ...(CAL_EVENTS[key] || {}),
    ...(importedEvents[key] || {}),
    ...(customEvents[key] || {})
  };
  function addEvent() {
    const day = Number(prompt('Day of month (1-31)', ''));
    if (!day || day < 1 || day > daysInMonth) {
      onToast('Invalid day');
      return;
    }
    const label = (prompt('Event label', 'New Event') || '').trim();
    if (!label) return;
    const colors = ['#5283e0', '#d95f5f', '#c9a84c', '#4aab78', '#8f67d8'];
    const tc = colors[(day + label.length) % colors.length];
    const c = tc + '33';
    setCustomEvents(p => ({
      ...p,
      [key]: {
        ...(p[key] || {}),
        [day]: [...((p[key] || {})[day] || []), {
          l: label,
          c,
          tc
        }]
      }
    }));
    onToast('Event added');
  }
  function shiftMonth(delta) {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + delta);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  function importFromIntegrations() {
    if (connected.length === 0) {
      onToast('Connect Canvas, Google, or Microsoft first');
      return;
    }
    const baseDays = [3, 7, 12, 18, 24, 27];
    const providerStyles = {
      canvas: {
        tc: '#5283e0',
        c: 'rgba(82,131,224,.2)',
        prefix: 'Canvas'
      },
      google: {
        tc: '#d95f5f',
        c: 'rgba(217,95,95,.2)',
        prefix: 'Google'
      },
      m365: {
        tc: '#0078d4',
        c: 'rgba(0,120,212,.2)',
        prefix: 'Microsoft'
      }
    };
    const merged = {
      ...(importedEvents[key] || {})
    };
    connected.forEach((provider, idx) => {
      const style = providerStyles[provider.id];
      baseDays.slice(idx * 2, idx * 2 + 2).forEach((day, off) => {
        if (day > daysInMonth) return;
        const label = off === 0 ? `${style.prefix}: Assignment Due` : `${style.prefix}: Calendar Event`;
        merged[day] = [...(merged[day] || []), {
          l: label,
          c: style.c,
          tc: style.tc,
          src: provider.id
        }];
      });
    });
    setImportedEvents(p => ({
      ...p,
      [key]: merged
    }));
    onToast('Imported events from connected calendars');
  }
  function clearImported() {
    setImportedEvents(p => ({
      ...p,
      [key]: {}
    }));
    onToast('Imported events cleared for this month');
  }
  return React.createElement("div", {
    className: "view active afu",
    style: {
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    className: "calwrap"
  }, React.createElement("div", {
    className: "calhd"
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => shiftMonth(-1)
  }, "\u25C2"), React.createElement("div", {
    className: "calmonth"
  }, monthName, " ", year), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => shiftMonth(1)
  }, "\u25B8")), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, [{
    l: 'Class',
    c: '#5283e0'
  }, {
    l: 'Assignment',
    c: '#d95f5f'
  }, {
    l: 'Exam',
    c: '#c9a84c'
  }, {
    l: 'Office Hours',
    c: '#4aab78'
  }].map(x => React.createElement("span", {
    key: x.l,
    className: "chip",
    style: {
      background: x.c + '22',
      color: x.c,
      border: `1px solid ${x.c}44`
    }
  }, "\u25CF ", x.l)), React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, connected.length ? `Connected: ${connected.map(c => c.name).join(', ')}` : 'No calendar app connected'), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onNav('integrations')
  }, "Connect Apps"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: importFromIntegrations
  }, "Import"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: clearImported
  }, "Clear Imported"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: addEvent
  }, "+ Event"))), React.createElement("div", {
    className: "calgrid"
  }, days.map(d => React.createElement("div", {
    key: d,
    className: "caldh"
  }, d)), cells.map((c, i) => React.createElement("div", {
    key: i,
    className: `calcel${c.other ? ' other' : ''}${c.today ? ' today' : ''}`,
    onClick: () => onToast(`Selected ${monthName} ${c.d}, ${year}`)
  }, React.createElement("div", {
    className: "calnum"
  }, c.d), (!c.other ? monthEvents[c.d] || [] : []).map((ev, j) => React.createElement("div", {
    key: j,
    className: "calev",
    style: {
      background: ev.c,
      color: ev.tc
    }
  }, ev.l)))))));
}
function DocsView({
  docs,
  setDocs,
  onToast
}) {
  const docEditorRef = useRef(null);
  const docSaveTimerRef = useRef(null);
  const [cF, setCF] = useState('all');
  const [tF, setTF] = useState('all');
  const [panCol, setPanCol] = useState(false);
  const [modal, setModal] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [activeCell, setActiveCell] = useState({
    r: 0,
    c: 0
  });
  const [formulaBar, setFormulaBar] = useState('');
  const [dName, setDName] = useState('');
  const [dType, setDType] = useState('docx');
  const [dCourse, setDCourse] = useState('');
  const [dTmpl, setDTmpl] = useState('Blank');
  const activeDoc = docs.find(d => d.id === activeDocId) || null;
  function updateDoc(id, patch) {
    setDocs(p => p.map(d => d.id === id ? {
      ...d,
      ...patch,
      modified: 'Just now'
    } : d));
  }
  function makeDocContent(type, tmpl) {
    if (type === 'xlsx') {
      return {
        sheetName: tmpl === 'Grade Tracker' ? 'Grades' : 'Sheet1',
        rows: Array.from({
          length: 12
        }, () => Array.from({
          length: 6
        }, () => '')),
        formulas: {}
      };
    }
    if (type === 'form') {
      const base = tmpl === 'Issue Spotter' ? ['Identify cause of action', 'State rule', 'Apply facts', 'Counterarguments', 'Conclusion'] : ['Item 1', 'Item 2', 'Item 3'];
      return {
        items: base.map(t => ({
          id: nextId(),
          text: t,
          done: false
        }))
      };
    }
    const header = tmpl && tmpl !== 'Blank' ? `${tmpl}\n\n` : '';
    return {
      html: `<p>${esc(header)}Start writing...</p>`,
      font: 'DM Sans',
      size: 14
    };
  }
  const filtered = docs.filter(d => {
    if (cF !== 'all' && d.course !== cF) return false;
    if (tF !== 'all' && d.type !== tF) return false;
    return true;
  });
  function create() {
    if (!dName.trim()) {
      onToast('Enter a document name');
      return;
    }
    const icons = {
      docx: '📝',
      xlsx: '📊',
      form: '📋'
    };
    const id = nextId();
    const doc = {
      id,
      icon: icons[dType] || '📝',
      name: dName,
      type: dType,
      course: dCourse,
      modified: 'Just now',
      template: dTmpl,
      content: makeDocContent(dType, dTmpl)
    };
    setDocs(p => [doc, ...p]);
    setActiveDocId(id);
    setModal(false);
    setDName('');
    onToast('Document created and opened');
  }
  function openDoc(doc) {
    if (!doc.content) {
      updateDoc(doc.id, {
        content: makeDocContent(doc.type, doc.template || 'Blank')
      });
    }
    setActiveDocId(doc.id);
    if (doc.type === 'xlsx') setActiveCell({
      r: 0,
      c: 0
    });
  }
  function closeDoc() {
    setActiveDocId(null);
  }
  function setDocHtml(v) {
    if (!activeDoc) return;
    if ((activeDoc.content && activeDoc.content.html || '') === v) return;
    updateDoc(activeDoc.id, {
      content: {
        ...(activeDoc.content || {}),
        html: v
      }
    });
  }
  function queueDocHtml(v) {
    clearTimeout(docSaveTimerRef.current);
    docSaveTimerRef.current = setTimeout(() => setDocHtml(v), 220);
  }
  useEffect(() => () => clearTimeout(docSaveTimerRef.current), []);
  function docCmd(cmd, val) {
    try {
      document.execCommand(cmd, false, val);
    } catch {}
    if (docEditorRef.current) setDocHtml(docEditorRef.current.innerHTML || '');
  }
  function setSheetCell(r, c, v) {
    if (!activeDoc) return;
    const cur = activeDoc.content && activeDoc.content.rows || Array.from({
      length: 12
    }, () => Array.from({
      length: 6
    }, () => ''));
    ;
    if ((cur[r] && cur[r][c]) === v) return;
    const rows = cur.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? v : cell) : row);
    const formulas = {
      ...(activeDoc.content && activeDoc.content.formulas || {})
    };
    delete formulas[`${r},${c}`];
    updateDoc(activeDoc.id, {
      content: {
        ...(activeDoc.content || {}),
        rows,
        formulas
      }
    });
  }
  function colLabel(i) {
    let n = i + 1,
      out = '';
    while (n > 0) {
      const r = (n - 1) % 26;
      out = String.fromCharCode(65 + r) + out;
      n = Math.floor((n - 1) / 26);
    }
    return out;
  }
  function parseCellRef(ref) {
    const m = String(ref || '').match(/^([A-Z]+)(\d+)$/);
    if (!m) return null;
    let c = 0;
    for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
    return {
      r: Number(m[2]) - 1,
      c: c - 1
    };
  }
  function getNumericCell(rows, r, c) {
    const v = Number(rows[r] && rows[r][c] || 0);
    return Number.isFinite(v) ? v : 0;
  }
  function evalFormula(formula, rows) {
    let expr = String(formula || '').trim();
    if (!expr.startsWith('=')) return expr;
    expr = expr.slice(1).toUpperCase();
    const rangeCalc = (s, fn) => {
      const [a, b] = s.split(':');
      const s1 = parseCellRef(a),
        s2 = parseCellRef(b);
      if (!s1 || !s2) return 0;
      const r0 = Math.min(s1.r, s2.r),
        r1 = Math.max(s1.r, s2.r);
      const c0 = Math.min(s1.c, s2.c),
        c1 = Math.max(s1.c, s2.c);
      const vals = [];
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) vals.push(getNumericCell(rows, r, c));
      if (!vals.length) return 0;
      if (fn === 'SUM') return vals.reduce((a, b) => a + b, 0);
      if (fn === 'AVG') return vals.reduce((a, b) => a + b, 0) / vals.length;
      return 0;
    };
    expr = expr.replace(/(SUM|AVG)\(([A-Z]+\d+:[A-Z]+\d+)\)/g, (_, fn, range) => String(rangeCalc(range, fn)));
    expr = expr.replace(/([A-Z]+\d+)/g, ref => {
      const c = parseCellRef(ref);
      return c ? String(getNumericCell(rows, c.r, c.c)) : '0';
    });
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('Invalid formula');
    const val = Function(`"use strict";return (${expr})`)();
    return Number.isFinite(val) ? String(val) : String(val || '');
  }
  function applyFormula() {
    if (!activeDoc || activeDoc.type !== 'xlsx') return;
    const rows = (activeDoc.content && activeDoc.content.rows || Array.from({
      length: 12
    }, () => Array.from({
      length: 6
    }, () => ''))).map(r => [...r]);
    const formulas = {
      ...(activeDoc.content && activeDoc.content.formulas || {})
    };
    const key = `${activeCell.r},${activeCell.c}`;
    try {
      if (String(formulaBar).trim().startsWith('=')) {
        rows[activeCell.r][activeCell.c] = evalFormula(formulaBar, rows);
        formulas[key] = formulaBar.trim();
      } else {
        rows[activeCell.r][activeCell.c] = formulaBar;
        delete formulas[key];
      }
      updateDoc(activeDoc.id, {
        content: {
          ...(activeDoc.content || {}),
          rows,
          formulas
        }
      });
      onToast('Formula applied');
    } catch (err) {
      onToast('Formula error');
    }
  }
  useEffect(() => {
    if (!activeDoc || activeDoc.type !== 'xlsx') return;
    const key = `${activeCell.r},${activeCell.c}`;
    const rows = activeDoc.content && activeDoc.content.rows || [];
    const formulas = activeDoc.content && activeDoc.content.formulas || {};
    setFormulaBar(formulas[key] !== undefined ? formulas[key] : rows[activeCell.r] && rows[activeCell.r][activeCell.c] || '');
  }, [activeDocId, activeCell.r, activeCell.c, activeDoc?.content]);
  function setDocStyle(field, val) {
    if (!activeDoc) return;
    updateDoc(activeDoc.id, {
      content: {
        ...(activeDoc.content || {}),
        [field]: val
      }
    });
  }
  function toggleFormItem(id) {
    if (!activeDoc) return;
    const items = activeDoc.content && activeDoc.content.items || [];
    updateDoc(activeDoc.id, {
      content: {
        ...(activeDoc.content || {}),
        items: items.map(x => x.id === id ? {
          ...x,
          done: !x.done
        } : x)
      }
    });
  }
  function setFormItem(id, text) {
    if (!activeDoc) return;
    const items = activeDoc.content && activeDoc.content.items || [];
    updateDoc(activeDoc.id, {
      content: {
        ...(activeDoc.content || {}),
        items: items.map(x => x.id === id ? {
          ...x,
          text
        } : x)
      }
    });
  }
  function addFormItem() {
    if (!activeDoc) return;
    const items = activeDoc.content && activeDoc.content.items || [];
    updateDoc(activeDoc.id, {
      content: {
        ...(activeDoc.content || {}),
        items: [...items, {
          id: nextId(),
          text: 'New item',
          done: false
        }]
      }
    });
  }
  function exportActiveDoc() {
    if (!activeDoc) {
      onToast('No document open');
      return;
    }
    const safe = (activeDoc.name || 'document').replace(/[^\w\- ]+/g, '');
    if (activeDoc.type === 'docx') {
      const html = activeDoc.content && activeDoc.content.html || '';
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      downloadFile(`${safe}.txt`, tmp.innerText || '');
    } else if (activeDoc.type === 'xlsx') {
      const rows = activeDoc.content && activeDoc.content.rows || [];
      const csv = rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      downloadFile(`${safe}.csv`, csv, 'text/csv');
    } else {
      const items = activeDoc.content && activeDoc.content.items || [];
      const text = items.map((x, i) => `${i + 1}. [${x.done ? 'x' : ' '}] ${x.text}`).join('\n');
      downloadFile(`${safe}.txt`, text);
    }
    onToast('Document exported');
  }
  return React.createElement("div", {
    className: "view active docs-layout afu",
    style: {
      flexDirection: 'row'
    }
  }, React.createElement("div", {
    className: "course-panel",
    style: {
      width: panCol ? 0 : '206px',
      borderRight: panCol ? 'none' : ''
    }
  }, React.createElement(PanelCollapseBtn, {
    collapsed: panCol,
    onToggle: () => setPanCol(v => !v)
  }), React.createElement("div", {
    className: "phead"
  }, React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600
    }
  }, "Documents"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setModal(true)
  }, "+ New")), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, React.createElement("div", {
    className: `cgroup-hd${cF === 'all' && tF === 'all' ? ' on' : ''}`,
    style: {
      cursor: 'pointer'
    },
    onClick: () => {
      setCF('all');
      setTF('all');
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement("span", null, "\uD83D\uDCC1"), React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, "All Documents")), React.createElement("span", {
    style: {
      fontSize: 9,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--dim)',
      background: 'var(--surface3)',
      padding: '1px 5px',
      borderRadius: 99
    }
  }, docs.length)), React.createElement("div", {
    style: {
      padding: '6px 13px 3px',
      fontSize: 9,
      color: 'var(--dim)',
      letterSpacing: 2,
      fontFamily: 'JetBrains Mono,monospace',
      textTransform: 'uppercase'
    }
  }, "By Course"), COURSES.map(c => React.createElement("div", {
    key: c.id,
    className: `cgroup-hd${cF === c.id ? ' on' : ''}`,
    style: {
      padding: '7px 13px',
      cursor: 'pointer'
    },
    onClick: () => {
      setCF(c.id);
      setTF('all');
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement("div", {
    className: "cdot",
    style: {
      background: c.color
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, c.label)), React.createElement("span", {
    style: {
      fontSize: 9,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--dim)',
      background: 'var(--surface3)',
      padding: '1px 5px',
      borderRadius: 99
    }
  }, docs.filter(d => d.course === c.id).length))), React.createElement("div", {
    style: {
      padding: '7px 13px 3px',
      fontSize: 9,
      color: 'var(--dim)',
      letterSpacing: 2,
      fontFamily: 'JetBrains Mono,monospace',
      textTransform: 'uppercase'
    }
  }, "By Type"), [{
    id: 'docx',
    l: 'Word Docs',
    ic: '📝'
  }, {
    id: 'xlsx',
    l: 'Spreadsheets',
    ic: '📊'
  }, {
    id: 'form',
    l: 'Forms / Checklists',
    ic: '📋'
  }].map(t => React.createElement("div", {
    key: t.id,
    className: `cgroup-hd${tF === t.id ? ' on' : ''}`,
    style: {
      padding: '7px 13px',
      cursor: 'pointer'
    },
    onClick: () => {
      setTF(t.id);
      setCF('all');
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, React.createElement("span", null, t.ic), React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, t.l)), React.createElement("span", {
    style: {
      fontSize: 9,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--dim)',
      background: 'var(--surface3)',
      padding: '1px 5px',
      borderRadius: 99
    }
  }, docs.filter(d => d.type === t.id).length))))), React.createElement("div", {
    className: "docs-main"
  }, panCol && React.createElement("div", {
    className: "focus-bar"
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setPanCol(false)
  }, "\u203A\u203A Show panel"), React.createElement("span", {
    style: {
      fontSize: 9.5,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, "Full-screen view")), React.createElement("div", {
    className: "docs-tb"
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, activeDoc ? activeDoc.name : cF === 'all' && tF === 'all' ? 'All Documents' : cF !== 'all' ? COURSES.find(c => c.id === cF)?.label : tF), React.createElement("div", {
    style: {
      flex: 1
    }
  }), activeDoc && React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: exportActiveDoc
  }, "\u2913 Export"), activeDoc && React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: closeDoc
  }, "\u2190 Back to Library"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setModal(true)
  }, "+ New Document")), !activeDoc && React.createElement("div", {
    className: "docs-quick"
  }, [{
    ic: '📝',
    l: 'Word Document',
    s: 'Memos, briefs, essays',
    t: 'docx'
  }, {
    ic: '📊',
    l: 'Spreadsheet',
    s: 'Case trackers, grades',
    t: 'xlsx'
  }, {
    ic: '📋',
    l: 'Form / Checklist',
    s: 'Issue spotters, rubrics',
    t: 'form'
  }, {
    ic: '⚡',
    l: 'From Template',
    s: 'Legal memo, case chart',
    t: 'docx'
  }].map(b => React.createElement("div", {
    key: b.l,
    className: "dqbtn",
    onClick: () => {
      setDType(b.t);
      setModal(true);
    }
  }, React.createElement("div", {
    style: {
      fontSize: 19,
      marginBottom: 5
    }
  }, b.ic), React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600
    }
  }, b.l), React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--muted)',
      marginTop: 1
    }
  }, b.s)))), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 16
    }
  }, !activeDoc ? filtered.length === 0 ? React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 40,
      color: 'var(--dim)'
    }
  }, "No documents found.") : React.createElement("div", {
    className: "docs-grid"
  }, filtered.map(d => {
    const course = COURSES.find(c => c.id === d.course);
    return React.createElement("div", {
      key: d.id,
      className: "dcard",
      onClick: () => openDoc(d)
    }, React.createElement("div", {
      className: "dicon"
    }, d.icon), React.createElement("div", {
      className: "dname"
    }, d.name), React.createElement("div", {
      className: "dmeta"
    }, d.modified), React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap'
      }
    }, course && React.createElement("span", {
      className: "chip",
      style: {
        background: course.color + '22',
        color: course.color,
        border: `1px solid ${course.color}44`
      }
    }, course.label)));
  })) : React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 14,
      minHeight: '100%'
    }
  }, React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace',
      marginBottom: 10
    }
  }, activeDoc.type === 'docx' ? 'Word Document' : activeDoc.type === 'xlsx' ? 'Spreadsheet' : 'Form', " \xB7 ", activeDoc.modified), activeDoc.type === 'docx' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => docCmd('bold')
  }, "B"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => docCmd('italic')
  }, React.createElement("i", null, "I")), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => docCmd('underline')
  }, React.createElement("u", null, "U")), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => docCmd('insertUnorderedList')
  }, "\u2022 List"), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => docCmd('insertOrderedList')
  }, "1. List"), React.createElement("select", {
    className: "sel",
    style: {
      width: 150,
      padding: '4px 8px'
    },
    value: activeDoc.content && activeDoc.content.font || 'DM Sans',
    onChange: e => setDocStyle('font', e.target.value)
  }, ['DM Sans', 'Georgia', 'Times New Roman', 'Arial', 'Courier New'].map(f => React.createElement("option", {
    key: f,
    value: f
  }, f))), React.createElement("select", {
    className: "sel",
    style: {
      width: 90,
      padding: '4px 8px'
    },
    value: String(activeDoc.content && activeDoc.content.size || 14),
    onChange: e => setDocStyle('size', Number(e.target.value))
  }, [11, 12, 13, 14, 16, 18, 20, 24].map(s => React.createElement("option", {
    key: s,
    value: s
  }, s, "px")))), React.createElement("div", {
    ref: docEditorRef,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: () => queueDocHtml(docEditorRef.current.innerHTML || ''),
    dangerouslySetInnerHTML: {
      __html: activeDoc.content && activeDoc.content.html || '<p></p>'
    },
    style: {
      minHeight: 420,
      padding: 10,
      border: '1px solid var(--border)',
      borderRadius: 8,
      outline: 'none',
      fontFamily: activeDoc.content && activeDoc.content.font || 'DM Sans',
      fontSize: activeDoc.content && activeDoc.content.size || 14,
      lineHeight: 1.75
    }
  })), activeDoc.type === 'xlsx' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8,
      alignItems: 'center'
    }
  }, React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, "fx"), React.createElement("input", {
    className: "inp",
    value: formulaBar,
    onChange: e => setFormulaBar(e.target.value),
    placeholder: "=SUM(A1:B3) or =A1+B1"
  }), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: applyFormula
  }, "Apply"), React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, colLabel(activeCell.c), activeCell.r + 1)), React.createElement("div", {
    style: {
      overflow: 'auto',
      border: '1px solid var(--border)',
      borderRadius: 8
    }
  }, React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      width: '100%',
      minWidth: 720
    }
  }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
    style: {
      borderBottom: '1px solid var(--border)',
      padding: 8,
      fontSize: 10,
      color: 'var(--dim)',
      textAlign: 'left',
      width: 36
    }
  }, "#"), Array.from({
    length: 6
  }, (_, i) => React.createElement("th", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border)',
      padding: 8,
      fontSize: 10,
      color: 'var(--dim)',
      textAlign: 'left'
    }
  }, String.fromCharCode(65 + i))))), React.createElement("tbody", null, (activeDoc.content && activeDoc.content.rows || []).map((row, ri) => React.createElement("tr", {
    key: ri
  }, React.createElement("td", {
    style: {
      borderBottom: '1px solid var(--border)',
      padding: 8,
      fontSize: 10,
      color: 'var(--dim)'
    }
  }, ri + 1), row.map((cell, ci) => React.createElement("td", {
    key: ci,
    style: {
      borderBottom: '1px solid var(--border)',
      padding: 4
    }
  }, React.createElement("input", {
    className: "inp",
    style: {
      padding: '6px 8px',
      fontSize: 12,
      borderColor: activeCell.r === ri && activeCell.c === ci ? 'rgba(201,168,76,.5)' : 'var(--border)'
    },
    value: cell,
    onFocus: () => setActiveCell({
      r: ri,
      c: ci
    }),
    onChange: e => setSheetCell(ri, ci, e.target.value)
  }))))))))), activeDoc.type === 'form' && React.createElement("div", null, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: 8
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: addFormItem
  }, "+ Add Item")), React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, (activeDoc.content && activeDoc.content.items || []).map(item => React.createElement("label", {
    key: item.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 8
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: !!item.done,
    onChange: () => toggleFormItem(item.id)
  }), React.createElement("input", {
    className: "inp",
    value: item.text,
    onChange: e => setFormItem(item.id, e.target.value),
    style: {
      padding: '6px 8px',
      fontSize: 12,
      textDecoration: item.done ? 'line-through' : 'none'
    }
  })))))))), React.createElement(Modal, {
    open: modal,
    onClose: () => setModal(false),
    title: "New Document",
    sub: "Create and link your document"
  }, React.createElement("div", {
    className: "mbody"
  }, React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Type"), React.createElement("div", {
    className: "choices"
  }, [{
    v: 'docx',
    l: '📝 Word Doc'
  }, {
    v: 'xlsx',
    l: '📊 Spreadsheet'
  }, {
    v: 'form',
    l: '📋 Form'
  }].map(t => React.createElement("button", {
    key: t.v,
    className: `choice${dType === t.v ? ' picked' : ''}`,
    onClick: () => setDType(t.v)
  }, t.l)))), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Document Name"), React.createElement("input", {
    className: "inp",
    value: dName,
    onChange: e => setDName(e.target.value),
    placeholder: "e.g. Torts Final Outline",
    onKeyDown: e => e.key === 'Enter' && create()
  })), React.createElement("div", {
    className: "frow"
  }, React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Course"), React.createElement("select", {
    className: "sel",
    value: dCourse,
    onChange: e => setDCourse(e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "No course"), COURSES.map(c => React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.label))))), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Template"), React.createElement("div", {
    className: "choices"
  }, ['Blank', 'Legal Memo', 'Case Brief', 'Issue Spotter', 'Case Chart', 'Grade Tracker'].map(t => React.createElement("button", {
    key: t,
    className: `choice${dTmpl === t ? ' picked' : ''}`,
    onClick: () => setDTmpl(t)
  }, t)))), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      padding: 10,
      fontSize: 13,
      width: '100%'
    },
    onClick: create
  }, "Create Document \u2192"))));
}
function TextbooksView({
  onToast,
  user,
  notes,
  setNotes
}) {
  const BOOKS_KEY = `lexnotes:${user?.id || 'anon'}:textbooks`;
  const ANNS_KEY = `lexnotes:${user?.id || 'anon'}:annotations`;
  const ACTIVE_BOOK_KEY = `lexnotes:${user?.id || 'anon'}:active-book`;
  const NOTES_META_KEY = `lexnotes:${user?.id || 'anon'}:notes-meta`;
  const [libCol, setLibCol] = useState(false);
  const [annOpen, setAnnOpen] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeBook, setActiveBook] = useState('');
  const [hlColor, setHlColor] = useState('yellow');
  const [tool, setTool] = useState('highlight');
  const [fontSize, setFontSize] = useState(14);
  const [page, setPage] = useState(47);
  const [anns, setAnns] = useState([]);
  const [selPopup, setSelPopup] = useState({
    show: false,
    x: 0,
    y: 0
  });
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({
    extraCourses: [],
    extraTopics: {},
    extraSubsections: {}
  });
  const savedRange = useRef(null);
  const paneRef = useRef();
  const fileRef = useRef();
  const TOC = ['Ch. 1 — Introduction to Torts', 'Ch. 2 — Intentional Torts', 'Ch. 3 — Negligence', '  § 3.1 The Reasonable Person', '  § 3.2 The Hand Formula', '  § 3.3 Custom as Evidence', 'Ch. 4 — Causation', 'Ch. 5 — Proximate Cause', 'Ch. 6 — Damages'];
  const activeBookObj = books.find(b => b.id === activeBook) || books[0] || null;
  const allCourses = [...COURSES, ...(Array.isArray(meta.extraCourses) ? meta.extraCourses : [])];
  const sectionKey = (courseId, topicId) => `${courseId || 'none'}::${topicId || 'none'}`;
  const activeTopics = [...(allCourses.find(c => c.id === activeBookObj?.course)?.topics || []), ...(meta.extraTopics && meta.extraTopics[activeBookObj?.course] || [])];
  const activeSubsections = meta.extraSubsections && meta.extraSubsections[sectionKey(activeBookObj?.course, activeBookObj?.topic)] || [];
  useEffect(() => {
    const savedBooks = readJSON(BOOKS_KEY, null);
    const savedAnns = readJSON(ANNS_KEY, null);
    const savedActive = localStorage.getItem(ACTIVE_BOOK_KEY);
    if (Array.isArray(savedBooks) && savedBooks.length) setBooks(savedBooks);
    if (Array.isArray(savedAnns) && savedAnns.length) setAnns(savedAnns);
    if (savedActive) setActiveBook(savedActive);
    setMeta(readJSON(NOTES_META_KEY, {
      extraCourses: [],
      extraTopics: {},
      extraSubsections: {}
    }));
  }, [BOOKS_KEY, ANNS_KEY, ACTIVE_BOOK_KEY, NOTES_META_KEY]);
  useDebouncedEffect(() => {
    writeJSON(BOOKS_KEY, books);
  }, [books, BOOKS_KEY], 280);
  useDebouncedEffect(() => {
    writeJSON(ANNS_KEY, anns);
  }, [anns, ANNS_KEY], 280);
  useDebouncedEffect(() => {
    try {
      localStorage.setItem(ACTIVE_BOOK_KEY, activeBook);
    } catch {}
  }, [activeBook, ACTIVE_BOOK_KEY], 180);
  useEffect(() => {
    setMeta(readJSON(NOTES_META_KEY, {
      extraCourses: [],
      extraTopics: {},
      extraSubsections: {}
    }));
  }, [notes, NOTES_META_KEY]);
  useEffect(() => {
    function onUp(e) {
      const pop = document.querySelector('.selpop');
      if (pop && pop.contains(e.target)) return;
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 3 && paneRef.current && paneRef.current.contains(e.target)) {
        const r = sel.getRangeAt(0);
        const rect = r.getBoundingClientRect();
        savedRange.current = r.cloneRange();
        setSelPopup({
          show: true,
          x: rect.left + rect.width / 2 - 170,
          y: rect.top - 46
        });
      } else {
        setSelPopup(p => p.show ? {
          ...p,
          show: false
        } : p);
      }
    }
    document.addEventListener('mouseup', onUp);
    return () => document.removeEventListener('mouseup', onUp);
  }, []);
  function doHighlight(color) {
    const r = savedRange.current;
    if (!r) return;
    try {
      const sp = document.createElement('span');
      sp.className = `hl${color[0]}`;
      r.surroundContents(sp);
      addAnn(sp.textContent.trim().slice(0, 80), color);
    } catch {
      const f = r.extractContents();
      const sp = document.createElement('span');
      sp.className = `hl${color[0]}`;
      sp.appendChild(f);
      r.insertNode(sp);
      addAnn(sp.textContent.trim().slice(0, 80), color);
    }
    window.getSelection().removeAllRanges();
    setSelPopup(p => ({
      ...p,
      show: false
    }));
    savedRange.current = null;
  }
  function addAnn(quote, color) {
    setAnns(p => [{
      id: nextId(),
      quote: `"${quote}${quote.length >= 80 ? '…' : ''}"`,
      note: '',
      color,
      page
    }, ...p]);
    if (!annOpen) setAnnOpen(true);
  }
  async function handleUpload(e) {
    const f = e.target.files[0];
    if (!f) return;
    const name = f.name.replace(/\.(pdf|epub|txt)$/i, '');
    const icons = ['📕', '📗', '📘', '📙'],
      bgs = ['rgba(217,95,95,.14)', 'rgba(74,171,120,.14)', 'rgba(82,131,224,.14)', 'rgba(201,168,76,.14)'];
    const i = Math.floor(Math.random() * 4);
    let snippet = '';
    try {
      if ((f.type || '').includes('text') || f.name.toLowerCase().endsWith('.txt')) {
        snippet = (await f.text()).slice(0, 2200);
      }
    } catch {}
    const nb = {
      id: String(nextId()),
      title: name,
      sub: 'Uploaded',
      icon: icons[i],
      bg: bgs[i],
      prog: 0,
      fileName: f.name,
      fileType: f.type || 'unknown',
      fileSize: f.size,
      uploadedAt: new Date().toISOString(),
      snippet,
      course: '',
      topic: '',
      subsection: ''
    };
    setBooks(p => [nb, ...p]);
    setActiveBook(nb.id);
    onToast(`📚 "${name}" uploaded and saved`);
    e.target.value = '';
  }
  function patchActiveBook(patch) {
    if (!activeBookObj) return;
    setBooks(p => p.map(b => b.id === activeBookObj.id ? {
      ...b,
      ...patch
    } : b));
  }
  function createReadingNote(text, title) {
    if (!setNotes) {
      onToast('Notes storage unavailable');
      return;
    }
    const clean = (text || '').trim();
    if (!clean) {
      onToast('Nothing to save');
      return;
    }
    const fallbackCourse = allCourses[0]?.id || '';
    const fallbackTopic = (allCourses.find(c => c.id === activeBookObj?.course || fallbackCourse)?.topics || [])[0]?.id || 'general';
    const note = {
      id: nextId(),
      course: activeBookObj?.course || fallbackCourse,
      topic: activeBookObj?.topic || fallbackTopic,
      subsection: activeBookObj?.subsection || '',
      type: 'reading',
      title: title || `${activeBookObj?.title || 'Textbook'} Reading Note`,
      preview: clean.slice(0, 90),
      date: 'Just now',
      hasAudio: false,
      hasMerge: false,
      content: clean,
      contentHtml: '',
      bf: {
        facts: '',
        issue: '',
        rule: '',
        reasoning: '',
        notes: ''
      }
    };
    setNotes(p => [note, ...p]);
    onToast('Reading note created');
  }
  function exportAnnotations() {
    const body = anns.map((a, i) => `${i + 1}. ${a.quote}\n${a.note || ''}\nPage ${a.page} · ${a.color}`).join('\n\n');
    downloadFile(`${(activeBookObj?.title || 'textbook').replace(/[^\w\- ]+/g, '')}-annotations.txt`, body || 'No annotations');
    createReadingNote(body || 'No annotations', `${activeBookObj?.title || 'Textbook'} - Annotations`);
    onToast('Annotations exported and added to notes');
  }
  return React.createElement("div", {
    className: "view active tbview afu",
    style: {
      flexDirection: 'row'
    }
  }, React.createElement("div", {
    className: "tblib",
    style: {
      width: libCol ? 0 : '212px',
      borderRight: libCol ? 'none' : ''
    }
  }, React.createElement(PanelCollapseBtn, {
    collapsed: libCol,
    onToggle: () => setLibCol(v => !v)
  }), React.createElement("div", {
    className: "phead"
  }, React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600
    }
  }, "My Library"), React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => fileRef.current.click()
  }, "+ Add")), React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: ".pdf,.epub,.txt",
    style: {
      display: 'none'
    },
    onChange: handleUpload
  }), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, books.length === 0 && React.createElement("div", {
    style: {
      padding: '16px 12px',
      fontSize: 11,
      color: 'var(--dim)'
    }
  }, "No textbooks yet. Upload one to start your library."), books.map(b => React.createElement("div", {
    key: b.id,
    className: `tbbook${activeBook === b.id ? ' on' : ''}`,
    onClick: () => setActiveBook(b.id)
  }, React.createElement("div", {
    className: "tbthumb",
    style: {
      background: b.bg
    }
  }, b.icon), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: 2
    }
  }, b.title), React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, b.sub), React.createElement("div", {
    className: "tbprog"
  }, React.createElement("div", {
    className: "tbprogf",
    style: {
      width: `${b.prog}%`
    }
  })))))), React.createElement("div", {
    style: {
      margin: 10,
      border: '2px dashed var(--border)',
      borderRadius: 7,
      padding: '16px 10px',
      textAlign: 'center',
      cursor: 'pointer',
      fontSize: 11,
      color: 'var(--dim)',
      transition: 'all .14s'
    },
    onClick: () => fileRef.current.click(),
    onMouseOver: e => {
      e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)';
      e.currentTarget.style.color = 'var(--accent)';
    },
    onMouseOut: e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.color = 'var(--dim)';
    }
  }, React.createElement("div", {
    style: {
      fontSize: 18,
      marginBottom: 5
    }
  }, "\uD83D\uDCC2"), React.createElement("div", {
    style: {
      fontWeight: 600,
      marginBottom: 2
    }
  }, "Add Textbook"), React.createElement("div", {
    style: {
      fontSize: 10
    }
  }, "PDF, ePub, or text file"))), React.createElement("div", {
    className: "tbreader"
  }, React.createElement("div", {
    className: "tbtb"
  }, React.createElement("div", {
    className: "tbtg"
  }, React.createElement("button", {
    className: "tbt",
    onClick: () => setLibCol(v => !v),
    title: "Toggle library"
  }, "\u2630")), React.createElement("div", {
    className: "tbtg"
  }, React.createElement("button", {
    className: "pgbtn",
    onClick: () => setPage(p => Math.max(1, p - 1))
  }, "\u2039"), React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontFamily: 'JetBrains Mono,monospace',
      color: 'var(--muted)',
      margin: '0 6px'
    }
  }, "Ch. 3 \xB7 p. ", page), React.createElement("button", {
    className: "pgbtn",
    onClick: () => setPage(p => p + 1)
  }, "\u203A")), React.createElement("div", {
    className: "tbtg"
  }, [{
    id: 'highlight',
    ic: '🖊',
    title: 'Highlight'
  }, {
    id: 'note',
    ic: '💬',
    title: 'Add Note'
  }, {
    id: 'erase',
    ic: '◻',
    title: 'Erase'
  }].map(t => React.createElement("button", {
    key: t.id,
    className: `tbt${tool === t.id ? ' on' : ''}`,
    onClick: () => setTool(t.id),
    title: t.title
  }, t.ic))), React.createElement("div", {
    className: "tbtg"
  }, ['yellow', 'green', 'pink', 'blue'].map(c => React.createElement("div", {
    key: c,
    className: `hlsw${hlColor === c ? ' on' : ''}`,
    style: {
      background: HL[c]
    },
    onClick: () => {
      setHlColor(c);
      setTool('highlight');
    },
    title: c.charAt(0).toUpperCase() + c.slice(1)
  }))), React.createElement("div", {
    className: "tbtg"
  }, React.createElement("button", {
    className: "tbt",
    onClick: () => setFontSize(f => Math.max(11, f - 1)),
    title: "Smaller text"
  }, "A\u2212"), React.createElement("button", {
    className: "tbt",
    onClick: () => setFontSize(f => Math.min(20, f + 1)),
    title: "Larger text"
  }, "A+")), React.createElement("div", {
    className: "tbtg"
  }, React.createElement("button", {
    className: `tbt${tocOpen ? ' on' : ''}`,
    onClick: () => setTocOpen(v => !v),
    title: "Table of Contents"
  }, "\u2261"), React.createElement("button", {
    className: `tbt${annOpen ? ' on' : ''}`,
    onClick: () => setAnnOpen(v => !v),
    title: "Annotations"
  }, "\uD83D\uDCDD")), React.createElement("div", {
    className: "tbtg"
  }, React.createElement("select", {
    className: "sel",
    style: {
      padding: '4px 8px',
      minWidth: 130
    },
    value: activeBookObj?.course || '',
    onChange: e => patchActiveBook({
      course: e.target.value,
      topic: '',
      subsection: ''
    })
  }, React.createElement("option", {
    value: ""
  }, "Class"), allCourses.map(c => React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.label))), React.createElement("select", {
    className: "sel",
    style: {
      padding: '4px 8px',
      minWidth: 120
    },
    value: activeBookObj?.topic || '',
    onChange: e => patchActiveBook({
      topic: e.target.value,
      subsection: ''
    })
  }, React.createElement("option", {
    value: ""
  }, "Topic"), activeTopics.map(t => React.createElement("option", {
    key: t.id,
    value: t.id
  }, t.label))), React.createElement("select", {
    className: "sel",
    style: {
      padding: '4px 8px',
      minWidth: 130
    },
    value: activeBookObj?.subsection || '',
    onChange: e => patchActiveBook({
      subsection: e.target.value
    })
  }, React.createElement("option", {
    value: ""
  }, "Section"), activeSubsections.map(s => React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.label)))), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      const selected = window.getSelection?.().toString() || '';
      if (!selected.trim()) {
        onToast('Select text first');
        return;
      }
      createReadingNote(selected.trim(), `${activeBookObj?.title || 'Textbook'} - Selection`);
    }
  }, "\u2192 Copy to Notes")), React.createElement("div", {
    style: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    style: {
      width: tocOpen ? 192 : 0,
      overflow: 'hidden',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      transition: 'width .2s',
      flexShrink: 0
    }
  }, React.createElement("div", {
    style: {
      padding: '10px 13px',
      borderBottom: '1px solid var(--border)',
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace'
    }
  }, "Contents"), React.createElement("div", {
    style: {
      padding: '6px 0'
    }
  }, TOC.map((t, i) => React.createElement("div", {
    key: i,
    className: `tb-toc-item${t.startsWith('  ') ? '  tbst' : ''}${i === 2 || [3, 4, 5].includes(i) ? '  on' : ''}`,
    style: {
      padding: `4px ${t.startsWith('  ') ? '24px' : '13px'}`,
      fontSize: t.startsWith('  ') ? 11 : 11.5,
      color: [2, 3, 4, 5].includes(i) ? 'var(--accent)' : 'var(--muted)',
      cursor: 'pointer',
      borderLeft: `2px solid ${[2, 3, 4, 5].includes(i) ? 'var(--accent)' : 'transparent'}`,
      background: [2, 3, 4, 5].includes(i) ? 'var(--accent-dim)' : '',
      transition: 'all .1s'
    },
    onClick: () => onToast(`Jumping to: ${t.trim()}`)
  }, t.trim())))), React.createElement("div", {
    className: "tbrp",
    ref: paneRef
  }, !activeBookObj ? React.createElement("div", {
    className: "tbpage",
    style: {
      fontSize
    }
  }, React.createElement("div", {
    className: "tbct"
  }, "No textbook selected"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 10
    }
  }, "Upload a PDF, ePub, or text file to start reading and annotating.")) : activeBookObj?.snippet ? React.createElement("div", {
    className: "tbpage",
    style: {
      fontSize
    }
  }, React.createElement("div", {
    className: "tbct"
  }, activeBookObj.title), React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#3e4152',
      fontFamily: 'JetBrains Mono,monospace',
      marginBottom: 20,
      marginTop: 4
    }
  }, activeBookObj.fileName, " \xB7 ", (activeBookObj.fileSize / 1024).toFixed(1), " KB"), React.createElement("div", {
    className: "tbst"
  }, "Uploaded Content Preview"), React.createElement("p", {
    style: {
      whiteSpace: 'pre-wrap'
    }
  }, activeBookObj.snippet)) : React.createElement("div", {
    className: "tbpage",
    style: {
      fontSize
    },
    dangerouslySetInnerHTML: {
      __html: TB_CONTENT
    }
  })), React.createElement("div", {
    className: "tbann",
    style: {
      width: annOpen ? 250 : 0,
      overflow: annOpen ? '' : 'hidden',
      borderLeft: annOpen ? '' : 'none'
    }
  }, React.createElement("div", {
    style: {
      padding: '10px 13px',
      borderBottom: '1px solid var(--border)',
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: 'var(--dim)',
      fontFamily: 'JetBrains Mono,monospace',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }
  }, React.createElement("span", null, "Annotations (", anns.length, ")"), React.createElement("span", {
    style: {
      cursor: 'pointer',
      fontSize: 15,
      fontWeight: 300,
      color: 'var(--muted)'
    },
    onClick: () => setAnnOpen(false)
  }, "\xD7")), React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 8
    }
  }, anns.map(a => React.createElement("div", {
    key: a.id,
    className: "tbaitem"
  }, React.createElement("div", {
    className: "tbaquote"
  }, React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: HLDOT[a.color],
      marginRight: 5
    }
  }), a.quote), a.note && React.createElement("div", {
    className: "tbanote"
  }, a.note), React.createElement("div", {
    className: "tbameta"
  }, "Ch. 3 \xB7 p. ", a.page, " \xB7 ", a.color.charAt(0).toUpperCase() + a.color.slice(1))))), React.createElement("div", {
    style: {
      padding: 9,
      borderTop: '1px solid var(--border)',
      flexShrink: 0
    }
  }, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      width: '100%'
    },
    onClick: exportAnnotations
  }, "\u2192 Export All to Notes"))))), selPopup.show && React.createElement("div", {
    className: "selpop",
    style: {
      left: Math.max(8, selPopup.x),
      top: Math.max(8, selPopup.y)
    }
  }, React.createElement("button", {
    className: "selact",
    onClick: () => doHighlight(hlColor)
  }, "Highlight"), React.createElement("div", {
    className: "seldiv"
  }), ['yellow', 'green', 'pink', 'blue'].map(c => React.createElement("div", {
    key: c,
    className: "selhl",
    style: {
      background: HL[c],
      border: '1px solid transparent'
    },
    onClick: () => doHighlight(c)
  })), React.createElement("div", {
    className: "seldiv"
  }), React.createElement("button", {
    className: "selact",
    onClick: () => {
      const selected = window.getSelection()?.toString() || '';
      createReadingNote(selected, `${activeBookObj?.title || 'Textbook'} - Selection`);
      setSelPopup(p => ({
        ...p,
        show: false
      }));
    }
  }, "\u2192 Note"), React.createElement("button", {
    className: "selact",
    onClick: () => {
      const selected = window.getSelection()?.toString() || '';
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(selected).then(() => onToast('Copied to clipboard')).catch(() => onToast('Clipboard blocked by browser'));
      } else {
        onToast('Clipboard API unavailable');
      }
      setSelPopup(p => ({
        ...p,
        show: false
      }));
    }
  }, "Copy")));
}
function IntegrationsView({
  onToast,
  user
}) {
  const INT_KEY = `lexnotes:${user?.id || 'anon'}:integrations`;
  const defaults = [{
    id: 'canvas',
    ic: '🎓',
    bg: 'rgba(82,131,224,.14)',
    name: 'Canvas LMS',
    desc: 'Sync courses, assignments, due dates, and syllabi into LexNotes.',
    connected: false,
    status: ''
  }, {
    id: 'google',
    ic: '📅',
    bg: 'rgba(217,95,95,.14)',
    name: 'Google Calendar',
    desc: 'Two-way calendar sync for classes, office hours, and deadlines.',
    connected: false,
    status: ''
  }, {
    id: 'm365',
    ic: '📘',
    bg: 'rgba(0,120,212,.14)',
    name: 'Microsoft 365',
    desc: 'Sync Outlook and OneDrive. Export outlines and briefs to Word.',
    connected: false,
    status: ''
  }, {
    id: 'blackboard',
    ic: '🖤',
    bg: 'rgba(74,171,120,.14)',
    name: 'Blackboard',
    desc: 'Pull course docs, announcements, and grade updates.',
    connected: false,
    status: ''
  }, {
    id: 'quimbee',
    ic: '🗒',
    bg: 'rgba(255,204,0,.14)',
    name: 'Quimbee',
    desc: 'Import case summaries and supplement briefs automatically.',
    connected: false,
    status: ''
  }, {
    id: 'zoom',
    ic: '🎙',
    bg: 'rgba(201,168,76,.14)',
    name: 'Zoom / Teams',
    desc: 'Auto-import lecture recordings and generate AI notes.',
    connected: false,
    status: '',
    soon: true
  }];
  const [ints, setInts] = useState(defaults);
  const [authTarget, setAuthTarget] = useState(null);
  const [creds, setCreds] = useState({
    baseUrl: '',
    username: '',
    password: '',
    apiToken: ''
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(INT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length) setInts(saved);
    } catch {}
  }, []);
  useDebouncedEffect(() => {
    try {
      localStorage.setItem(INT_KEY, JSON.stringify(ints));
    } catch {}
  }, [ints, INT_KEY], 260);
  function openConnect(i) {
    setAuthTarget(i);
    setCreds(i.creds || {
      baseUrl: '',
      username: '',
      password: '',
      apiToken: ''
    });
  }
  function disconnect(i) {
    setInts(p => p.map(x => x.id === i.id ? {
      ...x,
      connected: false,
      status: 'Not connected',
      creds: {}
    } : x));
    onToast(`${i.name} disconnected`);
  }
  function saveConnection() {
    if (!authTarget) return;
    if ((authTarget.id === 'canvas' || authTarget.id === 'blackboard') && !creds.baseUrl.trim()) {
      onToast('Base URL is required');
      return;
    }
    if (!creds.username.trim()) {
      onToast('Username/email is required');
      return;
    }
    if (!creds.password.trim() && !creds.apiToken.trim()) {
      onToast('Password or API token is required');
      return;
    }
    setInts(p => p.map(i => i.id === authTarget.id ? {
      ...i,
      connected: true,
      status: `Connected as ${creds.username}`,
      creds: {
        ...creds,
        lastConnected: new Date().toISOString()
      }
    } : i));
    onToast(`${authTarget.name} connected`);
    setAuthTarget(null);
  }
  useEffect(() => {
    function onQuickConnect() {
      const first = ints.find(i => !i.connected && !i.soon);
      if (first) openConnect(first);else onToast('All available integrations are already connected');
    }
    window.addEventListener('lexnotes-connect-app', onQuickConnect);
    return () => window.removeEventListener('lexnotes-connect-app', onQuickConnect);
  }, [ints]);
  return React.createElement("div", {
    className: "view active afu",
    style: {
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    className: "intwrap"
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontFamily: "'Playfair Display',serif",
      fontSize: 22,
      fontWeight: 700
    }
  }, "Integrations"), React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--muted)',
      marginTop: 3
    }
  }, "Connect your tools to keep everything in one place")), React.createElement("div", {
    className: "intgrid"
  }, ints.map(i => React.createElement("div", {
    key: i.name,
    className: `intcard${i.connected ? ' conn' : ''}`
  }, React.createElement("div", {
    className: "inticon",
    style: {
      background: i.bg
    }
  }, i.ic), React.createElement("div", {
    className: "intname"
  }, i.name), React.createElement("div", {
    className: "intdesc"
  }, i.desc), React.createElement("div", {
    className: "intstatus"
  }, React.createElement("div", {
    className: "sdot",
    style: {
      background: i.connected ? 'var(--green)' : i.soon ? 'var(--accent)' : 'var(--dim)'
    }
  }), React.createElement("span", {
    style: {
      color: i.connected ? 'var(--green)' : i.soon ? 'var(--accent)' : 'var(--muted)'
    }
  }, i.connected ? 'Connected' : i.soon ? 'Coming soon' : 'Not connected'), i.status && React.createElement("span", {
    style: {
      color: 'var(--dim)',
      marginLeft: 'auto'
    }
  }, i.status), !i.soon && !i.connected && React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      marginLeft: 'auto'
    },
    onClick: () => openConnect(i)
  }, "Connect"), !i.soon && i.connected && React.createElement(React.Fragment, null, React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      marginLeft: 'auto'
    },
    onClick: () => openConnect(i)
  }, "Reconnect"), React.createElement("button", {
    className: "btn btn-ghost-danger btn-sm",
    onClick: () => disconnect(i)
  }, "Disconnect")))))), React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 18,
      marginTop: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 7,
      fontFamily: 'JetBrains Mono,monospace',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: 'var(--accent)'
    }
  }, "AI Calendar Intelligence"), React.createElement("div", {
    style: {
      fontSize: 12.5,
      lineHeight: 1.7,
      color: 'var(--muted)'
    }
  }, "LexNotes AI reads your Canvas assignments, Google Calendar events, and class schedules to build a ", React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "unified smart calendar"), ". It detects conflicts, suggests study blocks before exams, and flags reading assignments that haven't been noted yet."))), React.createElement(Modal, {
    open: !!authTarget,
    onClose: () => setAuthTarget(null),
    title: `Connect ${authTarget?.name || ''}`,
    sub: "Store credentials locally for this demo",
    size: "modal-sm"
  }, React.createElement("div", {
    className: "mbody"
  }, (authTarget?.id === 'canvas' || authTarget?.id === 'blackboard') && React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Base URL"), React.createElement("input", {
    className: "inp",
    value: creds.baseUrl,
    onChange: e => setCreds(p => ({
      ...p,
      baseUrl: e.target.value
    })),
    placeholder: "https://school.instructure.com or https://school.blackboard.com"
  })), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Username / Email"), React.createElement("input", {
    className: "inp",
    value: creds.username,
    onChange: e => setCreds(p => ({
      ...p,
      username: e.target.value
    })),
    placeholder: "your@email.edu"
  })), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Password"), React.createElement("input", {
    className: "inp",
    type: "password",
    value: creds.password,
    onChange: e => setCreds(p => ({
      ...p,
      password: e.target.value
    })),
    placeholder: "Password"
  })), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "API Token (Optional)"), React.createElement("input", {
    className: "inp",
    value: creds.apiToken,
    onChange: e => setCreds(p => ({
      ...p,
      apiToken: e.target.value
    })),
    placeholder: "Paste token if provided by platform"
  })), React.createElement("div", {
    className: "frow"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      flex: 1
    },
    onClick: () => setAuthTarget(null)
  }, "Cancel"), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      flex: 1
    },
    onClick: saveConnection
  }, "Connect")))));
}
function SettingsView({
  onToast,
  user,
  onUpdateUser
}) {
  const SETTINGS_KEY = `lexnotes:${user?.id || 'anon'}:settings`;
  const [notifs, setNotifs] = useState({
    email: true,
    push: true,
    canvas: true,
    reminders: false
  });
  const [aiPrefs, setAiPrefs] = useState({
    autoSuggest: true,
    flashCards: true,
    outlineSync: true,
    practiceQ: false
  });
  const [display, setDisplay] = useState({
    compactMode: false,
    sidebarMini: false,
    monoBody: false
  });
  const [profile, setProfile] = useState({
    name: user?.name || 'Jordan Davis',
    school: 'Georgetown University Law Center',
    year: '1L',
    semester: 'Fall 2025'
  });
  const [settingTab, setSettingTab] = useState('account');
  const settingTabs = [{
    id: 'account',
    l: 'Account'
  }, {
    id: 'notifications',
    l: 'Notifications'
  }, {
    id: 'ai',
    l: 'AI Preferences'
  }, {
    id: 'display',
    l: 'Display'
  }, {
    id: 'billing',
    l: 'Billing'
  }];
  useEffect(() => {
    const saved = readJSON(SETTINGS_KEY, null);
    if (saved) {
      if (saved.notifs) setNotifs(saved.notifs);
      if (saved.aiPrefs) setAiPrefs(saved.aiPrefs);
      if (saved.display) setDisplay(saved.display);
      if (saved.profile) setProfile(saved.profile);
    }
  }, [SETTINGS_KEY]);
  useDebouncedEffect(() => {
    writeJSON(SETTINGS_KEY, {
      notifs,
      aiPrefs,
      display,
      profile
    });
  }, [notifs, aiPrefs, display, profile, SETTINGS_KEY], 320);
  return React.createElement("div", {
    className: "view active afu",
    style: {
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    className: "setwrap"
  }, React.createElement("div", {
    style: {
      fontFamily: "'Playfair Display',serif",
      fontSize: 20,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Settings"), React.createElement("div", {
    className: "setgrid"
  }, React.createElement("div", {
    className: "setnav"
  }, settingTabs.map(t => React.createElement("div", {
    key: t.id,
    className: `nav${settingTab === t.id ? ' on' : ''}`,
    onClick: () => setSettingTab(t.id),
    style: {
      marginBottom: 2
    }
  }, React.createElement("span", {
    className: "nav-ic"
  }, t.id === 'account' ? '👤' : t.id === 'notifications' ? '🔔' : t.id === 'ai' ? '⚡' : t.id === 'display' ? '◑' : '💳'), React.createElement("span", {
    className: "nav-lbl"
  }, t.l)))), React.createElement("div", {
    className: "setsection"
  }, settingTab === 'account' && React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Profile"), React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: 'linear-gradient(135deg,var(--accent),#7a5c18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontWeight: 700,
      color: '#0b0c0e'
    }
  }, "JD"), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, profile.name), React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--muted)'
    }
  }, user?.email || 'user@email.com'), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      marginTop: 6
    },
    onClick: () => {
      const n = (prompt('Enter initials for avatar', 'JD') || '').trim().slice(0, 2).toUpperCase();
      if (n) onToast(`Avatar initials set: ${n}`);
    }
  }, "Change Photo")))), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Full Name"), React.createElement("input", {
    className: "inp",
    value: profile.name,
    onChange: e => setProfile(p => ({
      ...p,
      name: e.target.value
    }))
  })), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Law School"), React.createElement("input", {
    className: "inp",
    value: profile.school,
    onChange: e => setProfile(p => ({
      ...p,
      school: e.target.value
    }))
  })), React.createElement("div", {
    className: "frow"
  }, React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Year"), React.createElement("select", {
    className: "sel",
    value: profile.year,
    onChange: e => setProfile(p => ({
      ...p,
      year: e.target.value
    }))
  }, React.createElement("option", null, "1L"), React.createElement("option", null, "2L"), React.createElement("option", null, "3L"), React.createElement("option", null, "LLM"))), React.createElement("div", {
    className: "ff"
  }, React.createElement("label", {
    className: "lbl"
  }, "Semester"), React.createElement("select", {
    className: "sel",
    value: profile.semester,
    onChange: e => setProfile(p => ({
      ...p,
      semester: e.target.value
    }))
  }, React.createElement("option", null, "Fall 2025"), React.createElement("option", null, "Spring 2025")))), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      width: '100%',
      padding: 9
    },
    onClick: () => {
      onUpdateUser?.({
        name: profile.name
      });
      onToast('Profile saved ✓');
    }
  }, "Save Changes")), settingTab === 'notifications' && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 4
    }
  }, "Notifications"), [{
    k: 'email',
    l: 'Email Notifications',
    s: 'Assignment reminders, exam alerts'
  }, {
    k: 'push',
    l: 'Push Notifications',
    s: 'In-browser alerts for due dates'
  }, {
    k: 'canvas',
    l: 'Canvas Sync Alerts',
    s: 'Notify when new content syncs'
  }, {
    k: 'reminders',
    l: 'Study Reminders',
    s: 'AI-generated daily study prompts'
  }].map(n => React.createElement("div", {
    key: n.k,
    className: "setrow"
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, n.l), React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 2
    }
  }, n.s)), React.createElement(Toggle, {
    on: notifs[n.k],
    onToggle: () => setNotifs(p => ({
      ...p,
      [n.k]: !p[n.k]
    }))
  })))), settingTab === 'ai' && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 4
    }
  }, "AI Preferences"), [{
    k: 'autoSuggest',
    l: 'Auto Topic Connections',
    s: 'Show related notes when editing'
  }, {
    k: 'flashCards',
    l: 'Flash Card Generation',
    s: 'Auto-generate flash cards from briefs'
  }, {
    k: 'outlineSync',
    l: 'Outline Auto-Sync',
    s: 'Regenerate outline when notes change'
  }, {
    k: 'practiceQ',
    l: 'Auto Practice Questions',
    s: 'Generate questions after each brief'
  }].map(p => React.createElement("div", {
    key: p.k,
    className: "setrow"
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, p.l), React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 2
    }
  }, p.s)), React.createElement(Toggle, {
    on: aiPrefs[p.k],
    onToggle: () => setAiPrefs(pr => ({
      ...pr,
      [p.k]: !pr[p.k]
    }))
  })))), settingTab === 'display' && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 4
    }
  }, "Display"), [{
    k: 'compactMode',
    l: 'Compact Mode',
    s: 'Tighter spacing in note lists'
  }, {
    k: 'sidebarMini',
    l: 'Sidebar Mini by Default',
    s: 'Start with collapsed sidebar'
  }, {
    k: 'monoBody',
    l: 'Monospace Body Text',
    s: 'Use JetBrains Mono for note content'
  }].map(p => React.createElement("div", {
    key: p.k,
    className: "setrow"
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, p.l), React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 2
    }
  }, p.s)), React.createElement(Toggle, {
    on: display[p.k],
    onToggle: () => setDisplay(pr => ({
      ...pr,
      [p.k]: !pr[p.k]
    }))
  })))), settingTab === 'billing' && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 4
    }
  }, "Billing & Plan"), React.createElement("div", {
    style: {
      background: 'var(--accent-dim)',
      border: '1px solid rgba(201,168,76,.25)',
      borderRadius: 8,
      padding: 14,
      marginBottom: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'JetBrains Mono,monospace',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: 'var(--accent)',
      marginBottom: 6
    }
  }, "Current Plan"), React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      fontFamily: "'Playfair Display',serif"
    }
  }, "Pro Plan"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 3
    }
  }, "$12 / month \xB7 Renews March 13, 2025")), [['Student', 'Free', 'Unlimited notes · 10 AI actions/day'], ['Pro', '$12/mo', 'Unlimited AI · Audio transcription · Priority support'], ['Law School', 'Contact us', 'Enterprise SSO · Multi-user · LMS admin']].map(([plan, price, desc]) => React.createElement("div", {
    key: plan,
    className: "setrow"
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, plan, " \u2014 ", price), React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 2
    }
  }, desc)), React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onToast(`Switching to ${plan}…`)
  }, plan === 'Pro' ? 'Current' : 'Upgrade'))))))));
}
function APIView() {
  return React.createElement("div", {
    className: "view active afu",
    style: {
      flexDirection: 'column'
    }
  }, React.createElement("div", {
    className: "apiwrap"
  }, React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "'Playfair Display',serif",
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 4
    }
  }, "API Architecture Map"), React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--muted)',
      marginBottom: 14
    }
  }, "All third-party services and internal endpoints required to build LexNotes \u2014 mapped for your dev team."), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, [{
    cat: 'core',
    l: 'Core API'
  }, {
    cat: 'ai',
    l: 'AI Services'
  }, {
    cat: 'sync',
    l: 'Sync / LMS'
  }, {
    cat: 'db',
    l: 'Storage / DB'
  }].map(b => React.createElement("span", {
    key: b.cat,
    className: `apibadge ${b.cat}`,
    style: {
      cursor: 'default',
      padding: '4px 10px',
      fontSize: 10
    }
  }, b.l)), React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginLeft: 8,
      alignSelf: 'center'
    }
  }, "9 services \xB7 ~32 endpoints"))), React.createElement("div", {
    className: "apigrid"
  }, API_DATA.map(api => React.createElement("div", {
    key: api.name,
    className: "apicard"
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 8
    }
  }, React.createElement("div", null, React.createElement("span", {
    className: `apibadge ${api.cat}`
  }, api.label), React.createElement("div", {
    className: "apiname"
  }, api.name))), React.createElement("div", {
    className: "apipurpose"
  }, api.purpose), React.createElement("div", {
    className: "apisep"
  }), React.createElement("div", {
    className: "apiowner",
    style: {
      marginBottom: 8
    }
  }, "Provider: ", api.owner), React.createElement("div", {
    className: "apieps"
  }, api.eps.map((ep, i) => React.createElement("div", {
    key: i,
    className: "ep"
  }, React.createElement("span", {
    className: `meth ${ep.m}`
  }, ep.m.toUpperCase()), React.createElement("span", {
    className: "epath"
  }, ep.p))))))), React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 18,
      marginTop: 20
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 10,
      fontFamily: 'JetBrains Mono,monospace',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: 'var(--accent)'
    }
  }, "Architecture Overview"), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
      gap: 12,
      fontSize: 12,
      color: 'var(--muted)',
      lineHeight: 1.7
    }
  }, React.createElement("div", null, React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "Frontend"), React.createElement("br", null), "React SPA \u2014 hosted on Vercel / Netlify", React.createElement("br", null), "Single-file build for v1 demo"), React.createElement("div", null, React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "Backend API"), React.createElement("br", null), "Node.js + Express on Railway / Fly.io", React.createElement("br", null), "REST + WebSocket for realtime sync"), React.createElement("div", null, React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "Database"), React.createElement("br", null), "Supabase (PostgreSQL) for all user data", React.createElement("br", null), "Realtime subscriptions for live collab"), React.createElement("div", null, React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "File Storage"), React.createElement("br", null), "Cloudflare R2 (S3-compatible)", React.createElement("br", null), "Audio recordings, PDFs, exports"), React.createElement("div", null, React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "AI Pipeline"), React.createElement("br", null), "Claude (outlines, insights) + Whisper (audio)", React.createElement("br", null), "PDF.js + LlamaIndex for textbook parsing"), React.createElement("div", null, React.createElement("strong", {
    style: {
      color: 'var(--text)'
    }
  }, "Auth"), React.createElement("br", null), "Supabase Auth (JWT + OAuth)", React.createElement("br", null), "Google OAuth for calendar + Gmail sync")))));
}
function App() {
  const [view, setView] = useState('dashboard');
  const [notes, setNotes] = useState(INIT_NOTES);
  const [docs, setDocs] = useState(INIT_DOCS);
  const [sidebarMini, setSidebarMini] = useState(false);
  const [user, setUser] = useState(null);
  const [existingUser, setExistingUser] = useState(null);
  const [authRequired, setAuthRequired] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [toasts, showToast] = useToast();
  useEffect(() => {
    const session = readJSON(SESSION_KEY, null);
    const users = readJSON(USERS_KEY, []);
    if (session?.id) {
      const u = users.find(x => x.id === session.id);
      if (u) setExistingUser(u);
    }
    setAuthChecked(true);
  }, []);
  function logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setUser(null);
    setExistingUser(null);
    setAuthRequired(true);
    setView('dashboard');
    showToast('Logged out');
  }
  function updateUser(partial) {
    if (!user) return;
    const next = {
      ...user,
      ...partial
    };
    setUser(next);
    const users = readJSON(USERS_KEY, []);
    writeJSON(USERS_KEY, users.map(u => u.id === next.id ? {
      ...u,
      ...partial
    } : u));
  }
  function handleNew() {
    if (view === 'notes') showToast('Creating new note…');else if (view === 'textbooks') showToast('Upload a PDF or ePub to add a textbook');else if (view === 'calendar') showToast('Add event modal opening…');else if (view === 'integrations') window.dispatchEvent(new Event('lexnotes-connect-app'));else showToast('Coming in v1.1!');
  }
  useEffect(() => {
    if (!user) return;
    const n = readJSON(`lexnotes:${user.id}:notes`, null);
    const d = readJSON(`lexnotes:${user.id}:docs`, null);
    if (Array.isArray(n) && n.length) setNotes(n);else setNotes([]);
    if (Array.isArray(d) && d.length) setDocs(d);else setDocs([]);
  }, [user?.id]);
  useDebouncedEffect(() => {
    if (!user) return;
    writeJSON(`lexnotes:${user.id}:notes`, notes);
  }, [notes, user?.id], 320);
  useDebouncedEffect(() => {
    if (!user) return;
    writeJSON(`lexnotes:${user.id}:docs`, docs);
  }, [docs, user?.id], 320);
  if (!authChecked) {
    return React.createElement("div", {
      className: "app"
    }, React.createElement("div", {
      className: "main"
    }, React.createElement("div", {
      className: "content"
    }, React.createElement("div", {
      className: "view active afu",
      style: {
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "Loading\u2026"))));
  }
  const showAuth = !user || authRequired;
  return React.createElement("div", {
    className: "app"
  }, !showAuth ? React.createElement(Sidebar, {
    view: view,
    onNav: setView,
    mini: sidebarMini,
    setMini: setSidebarMini,
    user: user,
    onLogout: logout
  }) : null, React.createElement("div", {
    className: "main"
  }, !showAuth ? React.createElement(Topbar, {
    view: view,
    onNew: handleNew,
    onToast: showToast
  }) : null, React.createElement("div", {
    className: "content"
  }, showAuth && React.createElement(AuthScreen, {
    existingUser: existingUser,
    onSwitch: () => {
      setExistingUser(null);
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
    },
    onAuth: u => {
      writeJSON(SESSION_KEY, {
        id: u.id
      });
      setUser(u);
      setExistingUser(null);
      setAuthRequired(false);
      showToast(`Welcome, ${u.name}`);
    }
  }), !showAuth && view === 'dashboard' && React.createElement(Dashboard, {
    notes: notes,
    onToast: showToast,
    onNav: setView,
    user: user
  }), !showAuth && view === 'notes' && React.createElement(NotesView, {
    notes: notes,
    setNotes: setNotes,
    onToast: showToast,
    user: user
  }), !showAuth && view === 'outline' && React.createElement(OutlineView, {
    onToast: showToast,
    user: user,
    notes: notes,
    docs: docs
  }), !showAuth && view === 'practice' && React.createElement(PracticeView, {
    onToast: showToast,
    user: user,
    notes: notes
  }), !showAuth && view === 'calendar' && React.createElement(CalendarView, {
    onToast: showToast,
    user: user,
    onNav: setView
  }), !showAuth && view === 'docs' && React.createElement(DocsView, {
    docs: docs,
    setDocs: setDocs,
    onToast: showToast
  }), !showAuth && view === 'textbooks' && React.createElement(TextbooksView, {
    onToast: showToast,
    user: user,
    notes: notes,
    setNotes: setNotes
  }), !showAuth && view === 'integrations' && React.createElement(IntegrationsView, {
    onToast: showToast,
    user: user
  }), !showAuth && view === 'settings' && React.createElement(SettingsView, {
    onToast: showToast,
    user: user,
    onUpdateUser: updateUser
  }), !showAuth && view === 'apis' && React.createElement(APIView, null))), React.createElement(Toasts, {
    items: toasts
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));
try {
  window.parent && window.parent !== window && window.parent.postMessage({
    type: 'lexnotes-ready'
  }, window.location.origin);
} catch {}
