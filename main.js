(function(){
  // ---------- apply saved overrides from the admin panel ----------
  const overrides = JSON.parse(localStorage.getItem('jodah_overrides') || '{}');
  Object.keys(overrides).forEach(key=>{
    if(!overrides[key]) return;
    document.querySelectorAll('[data-field="'+key+'"]').forEach(el=>{
      el.textContent = overrides[key];
    });
  });

  // ---------- visit counter (shown in admin dashboard) ----------
  const visits = parseInt(localStorage.getItem('jodah_visits') || '0', 10) + 1;
  localStorage.setItem('jodah_visits', String(visits));

  // ---------- secret admin gate: hold J + D + H together ----------
  const COMBO = ['KeyJ','KeyD','KeyH'];
  const HOLD_MS = 900;
  const held = new Set();
  let holdTimer = null;

  const backdrop = document.getElementById('adminBackdrop');
  const userInput = document.getElementById('loginUser');
  const passInput = document.getElementById('loginPass');
  const errEl = document.getElementById('loginErr');
  const modal = backdrop ? backdrop.querySelector('.modal') : null;

  function comboActive(){
    return COMBO.every(k => held.has(k));
  }

  function openModal(){
    if(!backdrop) return;
    backdrop.classList.add('open');
    errEl.textContent = '';
    userInput.value = ''; passInput.value = '';
    setTimeout(()=>userInput.focus(), 50);
  }
  function closeModal(){
    if(!backdrop) return;
    backdrop.classList.remove('open');
  }

  window.addEventListener('keydown', (e)=>{
    if(COMBO.includes(e.code)){
      held.add(e.code);
      if(comboActive() && !holdTimer){
        holdTimer = setTimeout(()=>{ openModal(); holdTimer = null; }, HOLD_MS);
      }
    }
    if(e.code === 'Escape') closeModal();
  });
  window.addEventListener('keyup', (e)=>{
    held.delete(e.code);
    if(!comboActive() && holdTimer){ clearTimeout(holdTimer); holdTimer = null; }
  });
  window.addEventListener('blur', ()=>{
    held.clear();
    if(holdTimer){ clearTimeout(holdTimer); holdTimer = null; }
  });

  // ---------- credentials ----------
  // Change these two values any time — they only live here, in this file.
  const ADMIN_USER = 'jodah';
  const ADMIN_PASS = 'jodah-tyumen-16';

  function tryLogin(){
    if(userInput.value.trim() === ADMIN_USER && passInput.value === ADMIN_PASS){
      sessionStorage.setItem('jodahAdminAuth', '1');
      window.location.href = 'admin.html';
    } else {
      errEl.textContent = 'Неверный логин или пароль.';
      modal.classList.remove('shake'); void modal.offsetWidth; modal.classList.add('shake');
      passInput.value = '';
    }
  }

  if(backdrop){
    document.getElementById('loginSubmit').addEventListener('click', tryLogin);
    document.getElementById('loginCancel').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e)=>{ if(e.target === backdrop) closeModal(); });
    passInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') tryLogin(); });
  }
})();
