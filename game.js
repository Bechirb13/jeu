// our javascript code

/****************************************************
 *** Variables ***
 ****************************************************/

// important HTML blocks
let container = document.querySelector("#game");
let player = document.querySelector("#player");
let ground = document.querySelector("#ground");
let enemies = document.querySelector("#enemies");
let balls = document.querySelector("#balls");
const gameOver = document.querySelector("#gameOverMenu");
const startButton = document.querySelector("#start");
const scoreElement = document.querySelector('.score-value');

gameSound = new Audio('sound.mp3');

let isRunning = false;
let score = 0;
// An array of margin bottom postions (in px)
const positionsY = [
  100, 100, 100, // maximize chances to be 100px
  150, 150,
  200, 250, 300
];

// some parameters
// minimal margin to the bottom (in pixels)
let marginBottom = 100;
// plane jump speed (in seconds)
let jumpSpeed = 0.5;
// how much height is a jump (in pixels)
let jumpStep = 100;

// how long is a fall (in seconds)
let fallSpeed = 2;
// how much time after a jump do we fall (in milliseconds)
let timeToFallAfterJump = 400;

// delay between two enemies motion (in milliseconds)
let motionDelay = 5;
// motion distance at each step (in pixels)
let motionStep = 4;

// other variables
let spawn, motion, playerGravity, scoreInterval;

/****************************************************
 *** When game starts ***
 ****************************************************/

// enemy motion
motion = setInterval(function() {
  document.querySelectorAll("#enemies > .eagle").forEach(function(enemy) {
    moveEnemy(enemy);
  });
}, motionDelay);

ballsInterval = setInterval(() => {
  document.querySelectorAll("#balls > .ball").forEach(ball => {
    moveBall(ball);
  });
}, 1);

document.addEventListener("keydown", event => {
  if (isRunning) {
    switch(event.keyCode) {
      case 32:
        jump();
        break;
      case 70:
        spawnBall();
        break;
      default:
        break;
    }
  }
});

startButton.addEventListener('click', () => {
  isRunning = true;
  gameSound.play();
  startButton.classList.add('hide');
  scoreInterval = setInterval(() => {
    scoreElement.innerHTML = ++score;
  }, 180);
});

// player gravity
// make the player fall
// change the player bottom margin
// 'px' is the unit (=pixels)
// thanks to the CSS 'transition' rule,
// the fall is progressive
player.style.bottom = marginBottom + "px";

const myInterval = setInterval(spawnEnemy, 2000);

// invoke an enemy
spawnEnemy();

/****************************************************
 *** Functions ***
 ****************************************************/

// make the player jump
function jump() {
  // if we are on the top, don't jump anymore
  if (player.offsetTop < 50) return;

  // set the jump duration
  // as we use the CSS animation
  player.style.transition = jumpSpeed + "s";
  // the CSS animation is described in the 'fallingPlayer' class
  player.classList.remove("fallingPlayer");

  // if we jump, we stop the gravity fall
  clearInterval(playerGravity);

  // and then update the player position
  let offsetBottom =
    container.offsetHeight - (player.offsetTop + player.offsetHeight);
  player.style.bottom = offsetBottom + jumpStep + "px";

  // after we have jumped, we fall again (gravity)
  setGravity();
}

// make the player fall after a jump
function setGravity() {
  playerGravity = setTimeout(function() {
    player.style.transition = fallSpeed + "s";
    player.style.bottom = marginBottom + "px";
  }, timeToFallAfterJump);
}

function getPosition(div) {
  let left = div.offsetLeft;
  let top = div.offsetTop;
  let right = div.offsetLeft + div.offsetWidth;
  let bottom = div.offsetTop + div.offsetHeight;

  // the '10' here is to allow some tolerance in the collision
  return [left + 10, right - 10, top + 10, bottom - 10];
}

// check if there is a collision between two blocks
function isCollision(bloc1, bloc2) {
  return !(
    bloc1[1] < bloc2[0] ||
    bloc1[0] > bloc2[1] ||
    bloc1[3] < bloc2[2] ||
    bloc1[2] > bloc2[3]
  );
}

// spawn a new enemy HTML block
function spawnEnemy() {
  // Add enemy only when the game is not over
  if(isRunning) {
    let numEnemies = Math.floor(score / 75) + 1;

    for (let i = 1; i <= numEnemies; i++) {
      let newObstacle = document.createElement("div");
      newObstacle.classList.add("eagle");
      newObstacle.style.bottom = getRandomEnemyPositionY();
      newObstacle.style.left = getRandomEnemyPositionX();
      enemies.appendChild(newObstacle);
    }
  }
}

function spawnBall() {
  if(isRunning) {
    newBall = document.createElement("div");
    newBall.classList.add("ball");
    newBall.style.bottom = `${parseInt(player.style.bottom) + 20}px`;
    balls.appendChild(newBall);
  }
}

function getRandomEnemyPositionX()
{
  return Math.floor(Math.random() * (2700 - 1390 + 1) ) + 1390 + "px";
}

function getRandomEnemyPositionY()
{
  return positionsY[Math.floor(Math.random() * positionsY.length)] + "px";
}

// move an enemy
// this function is called for each enemy step
// see the setInterval above
function moveEnemy(enemy) {
  enemy.style.left = enemy.offsetLeft - (motionStep + score / 65) + "px";

  if (enemy.offsetLeft <= 0) enemy.remove();

  posPlayer = getPosition(player);
  posObs = getPosition(enemy);

  if (isCollision(posPlayer, posObs)) stopAll();
}

// Move a ball
function moveBall(ball) {
  ball.style.left = ball.offsetLeft + motionStep - 1 + (score/65) + "px";

  if (ball.offsetLeft >= 1500) ball.remove();

  document.querySelectorAll("#enemies > .eagle").forEach(function(enemy) {
    if (isCollision(getPosition(enemy), getPosition(ball))) {
      enemy.remove();
      ball.remove();
    }
  });
}

function showGoMenu() {
  gameOver.classList.add('show');
}

// allow to stop the game
function stopAll() {
  // do not hide the player
  // player.style.display = "none";

  isRunning = false;

  showGoMenu();

  // Stop the score counter
  clearInterval(scoreInterval);

  // stop the enemies motion
  clearInterval(motion);

  // stop to spawn new enemies
  clearInterval(spawn);

  clearInterval(ballsInterval);

  gameSound.pause();
}
