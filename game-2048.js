(function(){
  const SIZE = 4;
  let grid, score = 0, best = 0, over = false, won = false;
  const gridEl = document.getElementById('g2048-grid');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const msgEl = document.getElementById('msg');

  const TILE_COLORS = {
    2:'#e8ecf5',4:'#dfe6f3',8:'#bcd6ee',16:'#9cc6ea',32:'#7fb3e6',
    64:'#5f9fe0',128:'#d9c89e',256:'#d3ba7f',512:'#cdac61',
    1024:'#c49a44',2048:'#c2872c'
  };

  function loadBest(){ return parseInt(localStorage.getItem('jodah_2048_best')||'0',10); }
  function saveBest(v){ localStorage.setItem('jodah_2048_best', String(v)); }

  function newGame(){
    grid = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
    score = 0; over = false; won = false;
    best = loadBest();
    msgEl.textContent = 'Стрелки или WASD, чтобы двигать плитки. На телефоне — свайп.';
    spawn(); spawn();
    render();
  }

  function spawn(){
    const empty = [];
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]===0) empty.push([r,c]);
    if(!empty.length) return;
    const [r,c] = empty[Math.floor(Math.random()*empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function render(){
    gridEl.innerHTML = '';
    for(let i=0;i<SIZE*SIZE;i++){
      const bg = document.createElement('div');
      bg.className = 'cell-bg';
      gridEl.appendChild(bg);
    }
    const cellSize = gridEl.clientWidth ? (gridEl.clientWidth - 8*2 - 8*3)/4 : 68;
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE;c++){
        const v = grid[r][c];
        if(!v) continue;
        const t = document.createElement('div');
        t.className = 'tile';
        t.textContent = v;
        const size = cellSize;
        t.style.width = size+'px';
        t.style.height = size+'px';
        t.style.left = (8 + c*(size+8))+'px';
        t.style.top = (8 + r*(size+8))+'px';
        t.style.fontSize = (v > 512 ? size*0.32 : size*0.4) + 'px';
        t.style.background = TILE_COLORS[v] || '#a9c6e8';
        gridEl.appendChild(t);
      }
    }
    scoreEl.textContent = score;
    bestEl.textContent = best;
  }

  function slideRow(row){
    let vals = row.filter(v=>v!==0);
    for(let i=0;i<vals.length-1;i++){
      if(vals[i] === vals[i+1]){
        vals[i]*=2; score += vals[i];
        if(vals[i]===2048 && !won){ won = true; msgEl.textContent = 'Ты собрал 2048! Можно продолжать.'; }
        vals.splice(i+1,1);
      }
    }
    while(vals.length < SIZE) vals.push(0);
    return vals;
  }

  function rotate(g){
    const n = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) n[c][SIZE-1-r] = g[r][c];
    return n;
  }

  function move(dir){
    if(over) return;
    let g = grid.map(r=>r.slice());
    let rotations = {left:0, up:1, right:2, down:3}[dir];
    for(let i=0;i<rotations;i++) g = rotate(g);
    let moved = false;
    for(let r=0;r<SIZE;r++){
      const before = g[r].join(',');
      g[r] = slideRow(g[r]);
      if(g[r].join(',') !== before) moved = true;
    }
    for(let i=0;i<(4-rotations)%4;i++) g = rotate(g);
    if(moved){
      grid = g;
      spawn();
      if(score > best){ best = score; saveBest(best); }
      render();
      checkOver();
    }
  }

  function checkOver(){
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]===0) return;
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
      const v = grid[r][c];
      if(c<SIZE-1 && grid[r][c+1]===v) return;
      if(r<SIZE-1 && grid[r+1][c]===v) return;
    }
    over = true;
    msgEl.textContent = 'Ходов больше нет. Нажми «Заново».';
  }

  window.addEventListener('keydown', (e)=>{
    const map = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',
                 KeyA:'left',KeyD:'right',KeyW:'up',KeyS:'down'};
    if(map[e.code]){ e.preventDefault(); move(map[e.code]); }
  });

  let touchX=0, touchY=0;
  gridEl.addEventListener('touchstart', e=>{
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
  }, {passive:true});
  gridEl.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if(Math.max(Math.abs(dx),Math.abs(dy)) < 24) return;
    if(Math.abs(dx) > Math.abs(dy)) move(dx>0?'right':'left');
    else move(dy>0?'down':'up');
  }, {passive:true});

  document.getElementById('restartBtn').addEventListener('click', newGame);
  window.addEventListener('resize', render);

  newGame();
})();
