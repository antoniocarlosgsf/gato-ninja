let selectedCharacter = 'default';

const menuScreen = document.getElementById('menu-screen');
const characterScreen = document.getElementById('character-screen');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameover-screen');
const finalScoreText = document.getElementById('final-score');
const pauseScreen = document.getElementById('pause-screen');



let gravity = 0.35;
let groundLevel = 500;
let player;
let gameRunning = false;
let gamePaused = false;
let fishes = [];
let fishImage = null; // podemos usar retângulo por enquanto
let justPaused = false; // bloqueia salto logo após pausa
let enemies = [];
let jumpSound = new Audio('assets/sounds/jump.mp3');
let collectSound = new Audio('assets/sounds/collect.mp3');
let backgroundMusic = new Audio('assets/sounds/background_music.mp3');

backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;




// ==== CLASSE DO GATO ====

class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = 120;
        this.y = 0; // vamos posicionar manualmente depois com base na plataforma
        this.velY = 0;
        this.jumpForce = -15;  // salto mais alto
        this.isJumping = false;
        }

  update() {
    this.velY += gravity;
    this.velY = Math.min(this.velY, 15); // impede queda muito rápida
    this.y += this.velY;

  }

  jump() {
    if (!this.isJumping) {
      this.velY = this.jumpForce;
      this.isJumping = true;
    }
  }

  draw() {
    ctx.fillStyle = selectedCharacter === 'shadow' ? 'gray' :
                    selectedCharacter === 'cyborg' ? 'lightblue' :
                    'orange';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// ==== FUNÇÕES DE TELA ====

function startGame() {
    menuScreen.classList.add('hidden');
    characterScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
  
    canvas.classList.remove('hidden');
  
    gameRunning = true;
    gamePaused = false;
  
    const savedCharacter = localStorage.getItem('selectedCharacter');
    if (savedCharacter) {
      selectedCharacter = savedCharacter;
    }
  
    const savedScore = localStorage.getItem('highScore') || 0;
    document.getElementById('high-score-display').innerText = "Recorde: " + savedScore;
  
    backgroundMusic.play()
    initGame();
  }
  
  

function openCharacterSelect() {
  menuScreen.classList.add('hidden');
  characterScreen.classList.remove('hidden');
}

function selectCharacter(character) {
    selectedCharacter = character;
    localStorage.setItem('selectedCharacter', character);
    alert(`Você selecionou: ${character}`);
  }

function backToMenu() {
  characterScreen.classList.add('hidden');
  menuScreen.classList.remove('hidden');
}

function exitGame() {
  alert("Obrigado por jogar Gato Ninja!");
  window.close();
}

function triggerGameOver() {
    gameRunning = false;
    canvas.classList.add('hidden');

    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreText.innerText = "Score: " + score;
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

  }
  
  function togglePause() {
    if (!gameRunning) return;
  
    gamePaused = !gamePaused;
    justPaused = true; // evita espaço logo depois do clique
  
    if (gamePaused) {
      pauseScreen.classList.remove('hidden');
    } else {
      pauseScreen.classList.add('hidden');
      requestAnimationFrame(updateGame);
    }
  }
  
  
  

// ==== JOGO ====

let platforms = [];
let platformSpeed = 3;
let score = 0;

function initGame() {
    platforms = generateInitialPlatforms(); // precisa vir antes
    fishes = generateInitialFishes();       // ok manter aqui
    enemies = generateInitialEnemies();
    console.log("Inimigos gerados:", enemies);

    player = new Player();                  // agora pode instanciar
    const firstPlat = platforms[0];
    player.y = firstPlat.y - player.height;
  
    score = 0;
    requestAnimationFrame(updateGame);
  }
  
  
function generateInitialFishes() {
return [
    { x: 300, y: 350, width: 20, height: 20 },
    { x: 600, y: 300, width: 20, height: 20 }
];
}
  
function generateInitialPlatforms() {
  return [
    { x: 100, y: 450, width: 200, height: 20 },
    { x: 400, y: 400, width: 200, height: 20 },
    { x: 750, y: 480, width: 150, height: 20 }
  ];
}

function generateInitialEnemies() {
    let result = [];
  
    // Começa a partir da segunda plataforma
    for (let i = 1; i < platforms.length; i++) {
      const plat = platforms[i];
      
      if (Math.random() < 0.6) {
        result.push({
          x: plat.x + plat.width / 2 - 10,
          y: plat.y - 30,
          width: 20,
          height: 30,
          speed: 0.5, // mais lento
          dir: Math.random() < 0.5 ? -1 : 1,
          platform: plat
        });
      }
    }
  
    // Garante pelo menos 1 inimigo (fora da plataforma inicial)
    if (result.length === 0 && platforms.length > 1) {
      const plat = platforms[1];
      result.push({
        x: plat.x + plat.width / 2 - 10,
        y: plat.y - 30,
        width: 20,
        height: 30,
        speed: 0.5,
        dir: 1,
        platform: plat
      });
    }
  
    return result;
  }
  
function updateDifficulty() {
    if (score >= 1000 && score < 2000) {
        platformSpeed = 4;
    } else if (score >= 2000 && score < 3000) {
        platformSpeed = 5;
    } else if (score >= 3000 && score < 4000) {
        platformSpeed = 6;
    } else if (score >= 4000) {
        platformSpeed = 7;
    }
}
    

function updateGame() {
    if (justPaused) {
        justPaused = false;
      }
      
    if (!gameRunning || gamePaused) return;


  // fundo
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // chão
  ctx.fillStyle = 'darkgreen';
  ctx.fillRect(0, groundLevel, canvas.width, canvas.height - groundLevel);

  // plataformas
  ctx.fillStyle = 'gray';
  for (let plat of platforms) {
    plat.x -= platformSpeed;
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }

  // remove plataformas que saíram e adiciona novas
  if (platforms.length > 0 && platforms[0].x + platforms[0].width < 0) {
    platforms.shift();
    let lastX = platforms[platforms.length - 1].x;
    platforms.push({
      x: lastX + 300 + Math.random() * 100,
      y: 380 + Math.random() * 80,
      width: 120 + Math.random() * 100,
      height: 20
    });
  }

  // colisão com plataformas
  let onPlatform = false;
  for (let plat of platforms) {
    if (
      player.x + player.width > plat.x &&
      player.x < plat.x + plat.width &&
      player.y + player.height >= plat.y - 5 &&
      player.y + player.height <= plat.y + 10 &&
      player.velY >= 0
    ) {
      player.y = plat.y - player.height;
      player.velY = 0;
      player.isJumping = false;
      onPlatform = true;
    }
  }

  ctx.fillStyle = 'red';
for (let enemy of enemies) {
  // movimentação: patrulha ou perseguição
  const distanceToPlayer = Math.abs(enemy.x - player.x);

  if (distanceToPlayer < 150) {
    // Persegue o jogador com velocidade baixa
    enemy.dir = player.x > enemy.x ? 1 : -1;
    enemy.x += enemy.dir * 1.2; // velocidade de perseguição mais suave
  }
   else {
    // Patrulha
    enemy.x += enemy.dir * enemy.speed;

    // Se chegar nas bordas da plataforma, inverte
    if (
      enemy.x < enemy.platform.x ||
      enemy.x + enemy.width > enemy.platform.x + enemy.platform.width
    ) {
      enemy.dir *= -1;
    }
  }

  // move junto com a plataforma
  enemy.x -= platformSpeed;

  // desenha
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  // colisão com o jogador (morte)
  if (
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y
  ) {
    triggerGameOver();
    return;
  }
}


    // peixes
    ctx.fillStyle = 'gold';
    for (let i = fishes.length - 1; i >= 0; i--) {
    let fish = fishes[i];
    fish.x -= platformSpeed;

    // desenha
    ctx.fillRect(fish.x, fish.y, fish.width, fish.height);

    // colisão com jogador
    if (
        player.x < fish.x + fish.width &&
        player.x + player.width > fish.x &&
        player.y < fish.y + fish.height &&
        player.y + player.height > fish.y
    ) {
        fishes.splice(i, 1);
        score += 100;
        collectSound.play();

    }

    // remove peixe que saiu da tela
    if (fish.x + fish.width < 0) {
        fishes.splice(i, 1);
    }
    }

    // chance de novo peixe
    if (Math.random() < 0.01) {
    fishes.push({
        x: 800 + Math.random() * 200,
        y: 300 + Math.random() * 100,
        width: 20,
        height: 20
    });
    }


  // queda no chão (caso não esteja em plataforma)
  if (!onPlatform && player.y + player.height < groundLevel) {
    player.isJumping = true;
  }

  // atualiza jogador
  player.update();
  player.draw();

  // pontuação
  score += 1;
  updateDifficulty();

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText("Score: " + score, 10, 30);

  if (player.y > canvas.height) {
    triggerGameOver();
    return;
  }  

  requestAnimationFrame(updateGame);
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    canvas.classList.remove('hidden');
    pauseScreen.classList.add('hidden');
  
    gameRunning = true;
    gamePaused = false;
    initGame();
  }
  
  
  function backToMenuFromGameOver() {
    gameOverScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
  }
  


// ==== CONTROLES ====

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' && gameRunning) {
      togglePause();
      return;
    }
  
    if (e.code === 'Space' && gameRunning && !gamePaused && !justPaused) {
      player.jump();
      jumpSound.play();
    }
  });
  
  
