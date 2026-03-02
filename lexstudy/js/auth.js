import { getDB, setDB, setCurrentUser, toast } from './storage.js';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');

const switchTab = (type) => {
  const isLogin = type === 'login';
  loginForm.classList.toggle('hidden', !isLogin);
  signupForm.classList.toggle('hidden', isLogin);
  tabLogin.classList.toggle('btn-secondary', !isLogin);
  tabSignup.classList.toggle('btn-secondary', isLogin);
};

tabLogin.onclick = () => switchTab('login');
tabSignup.onclick = () => switchTab('signup');

signupForm.onsubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(signupForm);
  const user = { id: crypto.randomUUID(), name: fd.get('name').trim(), email: fd.get('email').trim().toLowerCase(), password: fd.get('password') };
  if (user.name.length < 2) return toast('Name is too short.');
  const db = getDB();
  if (db.users.some(u => u.email === user.email)) return toast('Email already registered.');
  db.users.push(user);
  setDB(db);
  toast('Signup successful. Please login.');
  switchTab('login');
};

loginForm.onsubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(loginForm);
  const email = fd.get('email').trim().toLowerCase();
  const password = fd.get('password');
  const db = getDB();
  const found = db.users.find(u => u.email === email && u.password === password);
  if (!found) return toast('Invalid credentials.');
  setCurrentUser({ id: found.id, name: found.name, email: found.email });
  location.href = 'dashboard.html';
};
