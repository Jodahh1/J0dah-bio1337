(function(){
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const COLS = 20, ROWS = 20, CELL = canvas.width / COLS;
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const msgEl = document.getElementById('msg');

  let snake, dir, nextDir, food, score, best, over, paused, timer;
  const SPEED = 110;

  function loadBest(){ return parseInt(localStorage.getItem('jodah_snake_best')||'0',10); }
  function saveBest(v){ localStorage.setItem('jodah_snake_best', String(v)); }

  function reset(){
    snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir = {x:1,y:0}; nextDir = {x:1,y:0};
    score = 0; over = false; paused = false;
    best = loadBest();
    placeFood();
    msgEl.textContent = 'Стрелки или WASD. Пробел — пауза.';
    draw();
    if(timer) clearInterval(timer);
    timer = setInterval(tick, SPEED);
  }

  function placeFood(){
    let ok = false;
    while(!ok){
      food = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
      ok = !snake.some(s=>s.x===food.x && s.y===food.y);
    }
  }

  function tick(){
    if(over || paused) return;
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    if(head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || snake.some(s=>s.x===head.x && s.y===head.y)){
      over = true;
      if(score > best){ best = score; saveBest(best); }
      msgEl.textContent = 'Врезалась. Нажми «Заново».';
      draw();
      return;
    }

    snake.unshift(head);
    if(head.x === food.x && head.y === food.y){
      score += 10;
      if(score > best){ best = score; saveBest(best); }
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++){
      if((x+y)%2===0) ctx.fillRect(x*CELL,y*CELL,CELL,CELL);
    }
    ctx.fillStyle = '#d9c89e';
    ctx.fillRect(food.x*CELL+2, food.y*CELL+2, CELL-4, CELL-4);
    snake.forEach((s,i)=>{
      ctx.fillStyle = i===0 ? '#a9c6e8' : 'rgba(169,198,232,0.75)';
      ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
    });
    scoreEl.textContent = score;
    bestEl.textContent = best;
  }

  window.addEventListener('keydown', (e)=>{
    const map = {
      ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}, ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1},
      KeyA:{x:-1,y:0}, KeyD:{x:1,y:0}, KeyW:{x:0,y:-1}, KeyS:{x:0,y:1}
    };
    if(e.code === 'Space'){ e.preventDefault(); if(!over){ paused = !paused; msgEl.textContent = paused ? 'Пауза.' : 'Погнали дальше.'; } return; }
    const nd = map[e.code];
    if(nd && !(nd.x === -dir.x && nd.y === -dir.y)){
      e.preventDefault();
      nextDir = nd;
    }
  });

  document.getElementById('restartBtn').addEventListener('click', reset);
  reset();
})();
