/* =========================================================
   APP SHELL RENDERER
   Injects sidebar + topbar markup so every page shares one
   source of truth for navigation. The sidebar and topbar are
   built per-role: a Student never even receives the markup
   for Teacher/Admin links, a Teacher never receives Admin
   links, and a signed-out visitor gets a plain guest topbar.
   ========================================================= */

const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="12" width="8" height="9" rx="2"/><rect x="3" y="14" width="8" height="7" rx="2"/></svg>',
  create: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
  courses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/></svg>',
  platform: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4" stroke-linecap="round"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7" stroke-linecap="round"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4M7 9l5-5 5 5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke-linecap="round"/></svg>',
  admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.96 19a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H2.91a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6c.51-.19 1-.6 1.04-1.6H10a2 2 0 1 1 4 0v.09c.04 1 .53 1.41 1.04 1.6.6.21 1.35.1 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.44.52-.55 1.27-.34 1.87.19.51.6 1 1.6 1.04H21a2 2 0 1 1 0 4h-.09c-1 .04-1.41.53-1.6 1.04Z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-1Z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" transform="translate(2)"/><circle cx="9" cy="7" r="4" transform="translate(2)"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18" stroke-linecap="round"/><path d="M7 15l4-4 3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* One nav config per role. Each item only ever gets rendered for
   the roles listed as a key here — a Student's sidebar HTML never
   contains the Admin links at all (not just visually hidden). */
const NAV_BY_ROLE = {
  STUDENT: [
    { key:'student-dashboard', label:'Dashboard',        href:'student-dashboard.html', icon:'dashboard' },
    { key:'platform',          label:'Đăng ký khóa học',  href:'courses.html',           icon:'platform' },
    { key:'my',                label:'Khóa học của tôi',  href:'my-courses.html',        icon:'courses' },
    { key:'schedule',          label:'Lịch học',          href:'schedule.html',          icon:'calendar' },
    { key:'profile',           label:'Hồ sơ',             href:'profile.html',           icon:'profile' },
  ],
  TEACHER: [
    { key:'teacher-dashboard', label:'Dashboard',        href:'teacher-dashboard.html', icon:'dashboard' },
    { key:'create',            label:'Giáo trình',        href:'create-course.html',     icon:'create' },
    { key:'materials',         label:'Upload tài liệu',   href:'materials.html',         icon:'upload' },
    { key:'schedule',          label:'Lịch dạy',          href:'schedule.html',          icon:'calendar' },
    { key:'students',          label:'Học viên',          href:'students.html',          icon:'users' },
    { key:'profile',           label:'Hồ sơ',             href:'profile.html',           icon:'profile' },
  ],
  ADMIN: [
    { key:'admin-dashboard',   label:'Dashboard',          href:'admin-dashboard.html', icon:'dashboard' },
    { key:'admin-users',       label:'Quản lý người dùng', href:'admin-users.html',     icon:'users' },
    { key:'admin-courses',     label:'Quản lý khóa học',   href:'admin-courses.html',   icon:'book' },
    { key:'schedule',          label:'Quản lý lịch học',   href:'schedule.html',        icon:'calendar' },
    { key:'materials',         label:'Quản lý giáo trình', href:'materials.html',       icon:'upload' },
    { key:'admin-analytics',   label:'Báo cáo',            href:'admin-analytics.html', icon:'chart' },
  ],
};
const GUEST_NAV = [
  { key:'platform', label:'Khóa học', href:'courses.html', icon:'platform' },
  { key:'about',    label:'Giới thiệu', href:'about.html', icon:'book' },
];

function renderShell(active){
  const loggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn();
  const role = loggedIn ? Auth.getRole() : null;
  const user = (loggedIn && Auth.getUser()) || { fullName: 'Guest' };
  const initials = (user.fullName || user.username || 'GL').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const items = loggedIn ? (NAV_BY_ROLE[role] || []) : GUEST_NAV;

  const navHTML = items.map(it => `
    <a class="nav-item ${active===it.key?'is-active':''}" href="${it.href}">
      ${ICONS[it.icon]}<span>${it.label}</span>
    </a>`).join('');

  const roleLabel = loggedIn ? (typeof ROLE_LABEL !== 'undefined' ? ROLE_LABEL[role] : role) : '';

  const sidebar = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__brand"><span class="dot"></span> E-Learning</div>
      <nav class="sidebar__nav">
        ${navHTML}
        ${loggedIn ? `<div class="sidebar__label">${roleLabel}</div>` : ''}
      </nav>
      <div class="sidebar__spacer"></div>
      <div class="sidebar__footer">
        ${loggedIn ? `<button class="theme-toggle" id="logoutBtn" style="color:inherit;">${ICONS.logout}<span>Đăng xuất</span></button>`
                   : `<a class="theme-toggle" href="login.html">${ICONS.logout}<span>Đăng nhập</span></a>`}
      </div>
    </aside>
    <div class="sidebar__scrim" id="scrim"></div>`;

  const topbarNav = loggedIn ? '' : `
      <nav class="topbar__menu">
        <a href="about.html#why">Why E-learning?</a>
        <a href="about.html#how">How it works</a>
        <a href="about.html#earn">Earn with platform</a>
        <a href="courses.html">Find course</a>
      </nav>`;

  const topbarUser = loggedIn ? `
      <div class="topbar__user" id="userMenu" title="${roleLabel}">
        <div class="avatar">${initials}</div>
        ${ICONS.chevron}
      </div>` : `
      <div style="display:flex; gap:10px;">
        <a href="login.html" class="btn btn-ghost btn-sm">Log in</a>
        <a href="register.html" class="btn btn-primary btn-sm">Sign up</a>
      </div>`;

  const topbar = `
    <header class="topbar">
      <button class="burger" id="burger" aria-label="Open menu">${ICONS.menu}</button>
      ${topbarNav}
      <div class="topbar__spacer"></div>
      <div class="topbar__search">
        ${ICONS.search}
        <input type="search" placeholder="Search courses…" id="topSearch" aria-label="Search courses">
      </div>
      ${topbarUser}
    </header>`;

  const appEl = document.getElementById('app');
  if (!appEl) return;

  // Chèn sidebar vào đầu #app
  if (!document.getElementById('sidebar')) {
    appEl.insertAdjacentHTML('afterbegin', sidebar);
  }

  // Chèn topbar trước main
  const mainEl = appEl.querySelector('main');
  if (mainEl && !appEl.querySelector('.topbar')) {
    const temp = document.createElement('div');
    temp.innerHTML = topbar;
    mainEl.before(temp.firstElementChild);
  }

  // mobile nav
  const sidebarEl = document.getElementById('sidebar');
  const burgerBtn = document.getElementById('burger');
  const scrimEl = document.getElementById('scrim');
  if (burgerBtn && sidebarEl) {
    burgerBtn.addEventListener('click', () => sidebarEl.classList.add('is-open'));
  }
  if (scrimEl && sidebarEl) {
    scrimEl.addEventListener('click', () => sidebarEl.classList.remove('is-open'));
  }

  // search -> courses page
  const searchInput = document.getElementById('topSearch');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()){
        window.location.href = `courses.html?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  // user menu -> profile page ; guest -> login
  if (loggedIn){
    const userMenu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    if (userMenu) {
      userMenu.addEventListener('click', () => { window.location.href = 'profile.html'; });
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
        window.location.href = 'index.html';
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.active || '';
  renderShell(page);
});
