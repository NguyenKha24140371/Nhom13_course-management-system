/* =========================================================
   API CLIENT
   Talks to the CMS Spring Boot backend (/api/**).
   If the backend isn't running (e.g. static preview), every
   call transparently falls back to DEMO data so the UI never
   looks broken.
   ========================================================= */

const API_BASE = window.location.origin.includes(':8080') ? '/api' : 'http://localhost:8080/api';
const TOKEN_KEY = 'cms_token';
const USER_KEY  = 'cms_user';

/* ---------- Roles ----------
   Canonical role names used throughout the frontend. The backend's
   /api/auth/login endpoint currently returns only an access token
   (no role/user info in the payload), so on login we resolve the
   role in this order:
     1. A role/roles field on the login response, if the backend
        ever starts sending one (checked defensively, see below).
     2. A role claim decoded from the JWT itself, if present.
     3. The role the person picked in the "Continue as" selector on
        the login page.
   This keeps every page working correctly today, and will start
   using the *real* backend role automatically the day the API
   response includes one — no frontend changes needed then. */
const ROLES = { STUDENT: 'STUDENT', TEACHER: 'TEACHER', ADMIN: 'ADMIN' };
const ROLE_HOME = {
  [ROLES.STUDENT]: 'student-dashboard.html',
  [ROLES.TEACHER]: 'teacher-dashboard.html',
  [ROLES.ADMIN]:   'admin-dashboard.html',
};
const ROLE_LABEL = { STUDENT: 'Học viên', TEACHER: 'Giảng viên', ADMIN: 'Quản trị viên' };

function normalizeRole(raw){
  if (!raw) return null;
  const v = String(Array.isArray(raw) ? raw[0] : raw).toUpperCase().replace(/^ROLE_/, '');
  if (v === 'INSTRUCTOR' || v === 'TEACHER') return ROLES.TEACHER;
  if (v === 'ADMIN') return ROLES.ADMIN;
  if (v === 'STUDENT' || v === 'USER') return ROLES.STUDENT;
  return null;
}

function decodeJwtRole(token){
  try{
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return normalizeRole(payload.role || payload.roles || payload.authorities || payload.scope);
  }catch(e){ return null; }
}

const Auth = {
  getToken(){ return localStorage.getItem(TOKEN_KEY); },
  /** loginResponse: raw object returned by /api/auth/login (may or may not carry a role).
   *  fallbackRole: role chosen on the login form, used only if the backend gave us none. */
  setSession(token, user, loginResponse, fallbackRole){
    const resolvedRole =
      normalizeRole(loginResponse && (loginResponse.role || loginResponse.roles || (loginResponse.user && loginResponse.user.role))) ||
      (token && decodeJwtRole(token)) ||
      normalizeRole(fallbackRole) ||
      ROLES.STUDENT;
    const finalUser = Object.assign({}, user, { role: resolvedRole });
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(finalUser));
    return finalUser;
  },
  getUser(){
    try{ return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }catch(e){ return null; }
  },
  getRole(){ const u = Auth.getUser(); return u ? u.role : null; },
  isLoggedIn(){ return !!Auth.getToken(); },
  hasRole(...roles){ return Auth.isLoggedIn() && roles.includes(Auth.getRole()); },
  homeFor(role){ return ROLE_HOME[role] || 'index.html'; },
  logout(){ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
};

/* ---------- Route guard ----------
   Called at the very top of every protected page (before the shell
   or any content renders) with the roles allowed to view it, taken
   from <body data-roles="STUDENT,TEACHER">. Blocks the page and
   redirects instead of just hiding menu items, so a direct URL
   visit can't bypass the restriction on the client side. */
const Guard = {
  protect(rolesCsv){
    if (!rolesCsv) return true; // page is public
    const allowed = rolesCsv.split(',').map(r => r.trim()).filter(Boolean);
    if (!Auth.isLoggedIn()){
      window.location.replace(`login.html?next=${encodeURIComponent(location.pathname.split('/').pop())}`);
      return false;
    }
    if (!allowed.includes(Auth.getRole())){
      window.location.replace('403.html');
      return false;
    }
    return true;
  }
};
// Run immediately (before shell.js paints anything) so a disallowed
// visit is redirected before protected content is ever inserted.
Guard.protect(document.body && document.body.dataset.roles);

async function apiFetch(path, options = {}){
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok){
    let msg = `Yêu cầu thất bại (${res.status})`;
    try{ const body = await res.json(); msg = body.message || msg; }catch(e){}
    throw new Error(msg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ---------- DEMO DATA (used only as an offline fallback) ---------- */
const DEMO_COURSES = [
  { id:1, title:'Nền tảng Phát triển Doanh nghiệp', description:'Học cách phát triển doanh nghiệp từ con số 0 đến nguồn doanh thu bền vững qua các bài học thực tế.', price:23, duration:6, instructorName:'Akila M.', rating:4, badge:'promo', img:'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop' },
  { id:2, title:'Nghệ thuật Cắm hoa & Thiết kế', description:'Giới thiệu thực hành về cắm hoa, lý thuyết màu sắc và phối hợp bố cục theo mùa.', price:23, duration:4, instructorName:'Akila M.', rating:4, badge:null, img:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=400&auto=format&fit=crop' },
  { id:3, title:'Các Nhà soạn nhạc Nổi tiếng', description:'Hành trình khám phá cuộc đời và tác phẩm của các nhà soạn nhạc đã hình thành nền âm nhạc phương Tây.', price:23, duration:8, instructorName:'Akila M.', rating:4, badge:'new', img:'https://images.unsplash.com/photo-1465225314224-587cd83d322b?q=80&w=400&auto=format&fit=crop' },
  { id:4, title:'Kỹ năng Giao tiếp Hiệu quả', description:'Khung phương pháp thực tế giúp viết lách rõ ràng, điều hành cuộc họp tốt hơn và xử lý hội thoại khó khăn.', price:23, duration:5, instructorName:'Akila M.', rating:4, badge:null, img:'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=400&auto=format&fit=crop' },
  { id:5, title:'Nền tảng Thiết kế UX/UI', description:'Từ bản vẽ phác thảo đến sản phẩm mẫu: quy trình cốt lõi tạo ra giao diện người dùng yêu thích.', price:23, duration:10, instructorName:'Akila M.', rating:4, badge:'hot', img:'https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=400&auto=format&fit=crop' },
  { id:6, title:'Nhập môn Lý thuyết Trò chơi', description:'Poker, cờ vua và quyết định hàng ngày — tư duy chiến lược ứng dụng trong cuộc sống.', price:19, duration:6, instructorName:'D. Marlowe', rating:5, badge:null, img:'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=400&auto=format&fit=crop' },
];

const DEMO_CATEGORIES = [
  { name:'Chứng chỉ', items:['HACCP','Sơ cứu','Chứng chỉ khác'] },
  { name:'Giáo dục', items:['Toán học','Vật lý','Sinh học','Hóa học','Địa lý','Văn học'], more:true },
  { name:'Kỳ thi', items:['Tất cả kỳ thi'] },
  { name:'Lý thuyết trò chơi', items:['Poker','Cờ vua','Blackjack','Mạt chược'] },
  { name:'Sức khỏe', items:['Thể dục nhịp điệu','Tập sức bền','HIIT','Sức khỏe khác'] },
  { name:'Nhà hàng - Khách sạn', items:['Ẩm thực','Đồ uống','Vận hành','Ngành dịch vụ khác'] },
  { name:'Ngoại ngữ', items:['Tiếng Anh','Tiếng Tây Ban Nha','Tiếng Pháp','Tiếng Đức'] },
  { name:'Khác', items:['Khác'] },
];

/* ---------- LocalStorage helpers for offline/demo course persistence ---------- */
function _loadCustomCourses(){
  try{ return JSON.parse(localStorage.getItem('cms_custom_courses') || '[]'); }catch(e){ return []; }
}
function _saveCustomCourses(list){
  try{ localStorage.setItem('cms_custom_courses', JSON.stringify(list)); }catch(e){}
}

/* ---------- Courses ---------- */
const CourseAPI = {
  async list({ page = 0, size = 20, sort } = {}){
    try{
      const qs = new URLSearchParams({ page, size, ...(sort ? { sort } : {}) });
      const data = await apiFetch(`/courses?${qs.toString()}`);
      const serverList = (data && data.content) ? data.content : (Array.isArray(data) ? data : DEMO_COURSES);
      const custom = _loadCustomCourses();
      const serverIds = new Set(serverList.map(c => String(c.id)));
      const newOnes = custom.filter(c => !serverIds.has(String(c.id)));
      return [...serverList, ...newOnes];
    }catch(e){
      const base = [...DEMO_COURSES];
      const custom = _loadCustomCourses();
      const baseIds = new Set(base.map(c => String(c.id)));
      custom.filter(c => !baseIds.has(String(c.id))).forEach(c => base.push(c));
      return base;
    }
  },
  async search(keyword){
    try{
      const qs = new URLSearchParams({ keyword });
      const data = await apiFetch(`/courses/search?${qs.toString()}`);
      const result = (data && data.content) ? data.content : DEMO_COURSES;
      const k = keyword.toLowerCase();
      const custom = _loadCustomCourses().filter(c => c.title.toLowerCase().includes(k));
      const resultIds = new Set(result.map(c => String(c.id)));
      return [...result, ...custom.filter(c => !resultIds.has(String(c.id)))];
    }catch(e){
      const k = keyword.toLowerCase();
      const all = [...DEMO_COURSES, ..._loadCustomCourses()];
      return all.filter(c => c.title.toLowerCase().includes(k));
    }
  },
  async get(id){
    try{ return await apiFetch(`/courses/${id}`); }
    catch(e){
      const custom = _loadCustomCourses();
      return custom.find(c => String(c.id) === String(id))
          || DEMO_COURSES.find(c => String(c.id) === String(id))
          || DEMO_COURSES[0];
    }
  },
  async create(payload){
    try{
      return await apiFetch('/courses', { method:'POST', body: JSON.stringify(payload) });
    }catch(e){
      const user = Auth.getUser();
      const newCourse = {
        id: Date.now(),
        ...payload,
        instructorName: user ? (user.fullName || user.username) : 'Giảng viên',
        rating: 4,
        badge: null,
        img: null,
      };
      const list = _loadCustomCourses();
      list.push(newCourse);
      _saveCustomCourses(list);
      return newCourse;
    }
  },
  async update(id, payload){
    try{
      return await apiFetch(`/courses/${id}`, { method:'PUT', body: JSON.stringify(payload) });
    }catch(e){
      const list = _loadCustomCourses();
      const idx = list.findIndex(c => String(c.id) === String(id));
      const updated = { id, ...payload };
      if (idx !== -1) list[idx] = { ...list[idx], ...payload };
      else list.push(updated);
      _saveCustomCourses(list);
      return updated;
    }
  },
  async remove(id){
    try{ await apiFetch(`/courses/${id}`, { method:'DELETE' }); return true; }
    catch(e){
      const list = _loadCustomCourses().filter(c => String(c.id) !== String(id));
      _saveCustomCourses(list);
      return true;
    }
  }
};

const LessonAPI = {
  async listByCourse(courseId){
    try{ return await apiFetch(`/lessons/course/${courseId}`); }
    catch(e){
      return [
        { id:1, title:'Chào mừng & Tổng quan khóa học', duration:8 },
        { id:2, title:'Các khái niệm cốt lõi', duration:22 },
        { id:3, title:'Hướng dẫn thực hành chi tiết', duration:31 },
        { id:4, title:'Tổng kết & Các bước tiếp theo', duration:12 },
      ];
    }
  }
};

const EnrollmentAPI = {
  async enroll(courseId, studentId){
    return apiFetch('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId, studentId })
    });
  }
};

const AuthAPI = {
  async login(username, password){
    return apiFetch('/auth/login', { method:'POST', body: JSON.stringify({ username, password }) });
  },
  async register(payload){
    return apiFetch('/auth/register', { method:'POST', body: JSON.stringify(payload) });
  }
};

function money(v){ return '€' + Number(v).toFixed(0); }

function starsHTML(rating = 4, max = 5){
  let out = '';
  for (let i = 1; i <= max; i++){
    out += `<span class="${i <= rating ? '' : 'dim'}">★</span>`;
  }
  return `<span class="stars">${out}</span>`;
}

function toast(message, type = 'success'){
  let stack = document.querySelector('.toast-stack');
  if (!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
