(function(){
  const authed = sessionStorage.getItem('jodahAdminAuth') === '1';
  const lockedView = document.getElementById('lockedView');
  const dashboard = document.getElementById('dashboard');

  if(!authed){
    lockedView.style.display = 'block';
    return;
  }
  dashboard.style.display = 'block';

  document.getElementById('visitCount').textContent = localStorage.getItem('jodah_visits') || '0';
  document.getElementById('best2048').textContent = localStorage.getItem('jodah_2048_best') || '0';
  document.getElementById('bestSnake').textContent = localStorage.getItem('jodah_snake_best') || '0';

  const DEFAULTS = {
    name:'Джодах', country:'Russia', city:'Tyumen', age:'16', username:'@J0dah',
    tagline:'Тюмень, Россия · 16',
    quote:'«Невозможное — слово из словаря глупцов.»',
    quote_author:'— Наполеон'
  };

  const fields = ['name','country','city','age','username','tagline','quote','quote_author'];
  const overrides = JSON.parse(localStorage.getItem('jodah_overrides') || '{}');

  function fillForm(){
    fields.forEach(f=>{
      document.getElementById('f_'+f).value = overrides[f] ?? DEFAULTS[f];
    });
  }
  fillForm();

  document.getElementById('saveBtn').addEventListener('click', ()=>{
    const data = {};
    fields.forEach(f=>{ data[f] = document.getElementById('f_'+f).value; });
    localStorage.setItem('jodah_overrides', JSON.stringify(data));
    const msg = document.getElementById('saveMsg');
    msg.textContent = 'Сохранено. Открой главную страницу, чтобы увидеть изменения.';
    setTimeout(()=>{ msg.textContent = ''; }, 3500);
  });

  document.getElementById('resetBtn').addEventListener('click', ()=>{
    localStorage.removeItem('jodah_overrides');
    Object.keys(overrides).forEach(k=>delete overrides[k]);
    fillForm();
    const msg = document.getElementById('saveMsg');
    msg.textContent = 'Сброшено до значений по умолчанию.';
    setTimeout(()=>{ msg.textContent = ''; }, 3500);
  });

  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    sessionStorage.removeItem('jodahAdminAuth');
    window.location.href = 'index.html';
  });
})();
