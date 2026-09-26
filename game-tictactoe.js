(function(){
  const boardEl = document.getElementById('tttBoard');
  const msgEl = document.getElementById('msg');
  const winsEl = document.getElementById('wins');
  const lossesEl = document.getElementById('losses');
  const drawsEl = document.getElementById('draws');

  let board, gameOver;
  const LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function stats(){
    return JSON.parse(localStorage.getItem('jodah_ttt_stats') || '{"w":0,"l":0,"d":0}');
  }
  function saveStats(s){ localStorage.setItem('jodah_ttt_stats', JSON.stringify(s)); }

  function renderStats(){
    const s = stats();
    winsEl.textContent = s.w; lossesEl.textContent = s.l; drawsEl.textContent = s.d;
  }

  function newGame(){
    board = Array(9).fill(null);
    gameOver = false;
    msgEl.textContent = 'Ты играешь за ✕, бот — за ○. Твой ход первый.';
    render();
  }

  function render(){
    boardEl.innerHTML = '';
    board.forEach((v,i)=>{
      const cell = document.createElement('div');
      cell.className = 'ttt-cell';
      cell.textContent = v === 'x' ? '✕' : v === 'o' ? '○' : '';
      cell.addEventListener('click', ()=>playerMove(i));
      boardEl.appendChild(cell);
    });
  }

  function winner(b){
    for(const [a,c,d] of LINES){
      if(b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
    }
    return b.every(x=>x) ? 'draw' : null;
  }

  function playerMove(i){
    if(gameOver || board[i]) return;
    board[i] = 'x';
    render();
    const w = winner(board);
    if(w){ finish(w); return; }
    setTimeout(botMove, 260);
  }

  function botMove(){
    if(gameOver) return;
    const empty = board.map((v,i)=>v?null:i).filter(v=>v!==null);
    let move = findWinningMove('o') ?? findWinningMove('x') ?? (board[4]===null ? 4 : null)
      ?? [0,2,6,8].find(i=>board[i]===null) ?? empty[Math.floor(Math.random()*empty.length)];
    board[move] = 'o';
    render();
    const w = winner(board);
    if(w) finish(w);
  }

  function findWinningMove(mark){
    for(const [a,c,d] of LINES){
      const line = [a,c,d];
      const vals = line.map(i=>board[i]);
      const marks = vals.filter(v=>v===mark).length;
      const empties = line.filter(i=>board[i]===null);
      if(marks===2 && empties.length===1) return empties[0];
    }
    return null;
  }

  function finish(w){
    gameOver = true;
    const s = stats();
    if(w === 'x'){ msgEl.textContent = 'Победа! ✕ выиграли.'; s.w++; }
    else if(w === 'o'){ msgEl.textContent = 'Бот выиграл в этот раз.'; s.l++; }
    else { msgEl.textContent = 'Ничья.'; s.d++; }
    saveStats(s);
    renderStats();
  }

  document.getElementById('restartBtn').addEventListener('click', newGame);
  renderStats();
  newGame();
})();
