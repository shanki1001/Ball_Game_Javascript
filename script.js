var x = window.matchMedia("(max-width: 600px)");
var tabletScreen = window.matchMedia("(min-width: 600px)");
var tabletScreenEnd = window.matchMedia("(max-width: 1000px");
let canvas = document.querySelector("canvas");
let controls = document.getElementById("controls");
let isMobile = false;
if (x.matches) {
   canvas.height = 400;
   canvas.width = 380;
   console.log("600-px screen");
   isMobile = true;
   let leftBtn = document.getElementById("leftBtn");
   let rightBtn = document.getElementById("rightBtn");
   controls.style.display = "flex";
} else if (tabletScreen.matches && tabletScreenEnd.matches) {
   canvas.height = 580;
   canvas.width = 500;
   console.log("700-px screen");
   isMobile = true;
   let leftBtn = document.getElementById("leftBtn");
   let rightBtn = document.getElementById("rightBtn");
   controls.style.display = "flex";
} else {
   controls.style.display = "none";
   canvas.width = 600;
   canvas.height = 600;
}

let context = canvas.getContext("2d");
//document.body.insertBefore(canvas, document.body.childNodes[0]);
let result = document.getElementById("result");
let score = document.getElementById("score");
let obstacles = [];
let startBtn = document.getElementById("startBtn");
let obstaclesSpeed = 0.55;
let obstaclesCreationDelay = 180;
let gameInterval;
let frameNo;
let currentScore;
let highScores = [0, 0, 0];
const img = new Image();
img.src = "sky.jpg";
context.drawImage(img, 0, 0);
class Obstacle {
   constructor(x, y, color = "brown", width = 85, height = 15) {
      this.width = width;
      this.x = x;
      this.y = y;
      this.height = height;
      this.color = color;
      this.speed = obstaclesSpeed;
   }
   draw() {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.width, this.height);
   }
   update() {
      this.y -= this.speed;
   }
}

let ball = {
   radius: 15,
   x: 20,
   y: 20,
   speedY: 0,
   speedX: 0,
   gravity: 0.18,
   gravitySpeed: 0,
   update: function () {
      let ctx = context;
      ctx.beginPath();
      if (this.x <= 0) this.x = this.radius;
      else if (this.x >= canvas.width) this.x = canvas.width - this.radius;
      if (this.y <= 0) gameOver();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.stroke();
   },
   newPos: function () {
      if (!this.hitBottom()) {
         this.gravitySpeed += this.gravity;
         this.y += this.speedY + this.gravitySpeed;
      } else {
         gameOver();
      }
      this.x += this.speedX;
   },
   hitBottom: function () {
      if (this.y >= canvas.height) return true;
      return false;
   },
   isContact: function () {
      for (let i = 0; i < obstacles.length; i++) {
         if (
            this.x >= obstacles[i].x - (this.radius - 8) &&
            this.x <= obstacles[i].x + obstacles[i].width + (this.radius - 8) &&
            this.y >= obstacles[i].y - this.radius &&
            this.y <= obstacles[i].y
         ) {
            this.y = obstacles[i].y - this.radius;
            this.gravitySpeed = 0;
         }
      }
   },
   increaseSpeed: function (speed) {
      if (this.speedX < 6 && this.speedX > -6) this.speedX += speed;
   },
   decreaseSpeed: function () {
      if (lastMoving === "Right") {
         while (this.speedX >= 0) this.speedX -= 0.003;
      } else if (lastMoving === "Left") {
         if (lastMoving === "Left") {
            while (this.speedX <= 0) this.speedX += 0.003;
         }
      }
      this.speedX = 0;
   },
};

function gameOver() {
   clearInterval(gameInterval);
   console.log(ball.x, ball.y);
   score.textContent = `Score: ${currentScore}`;
   result.style.display = "flex";
}

function updateGame() {
   context.clearRect(0, 0, canvas.width, canvas.height);
   context.drawImage(img, 0, 0);
   frameNo++;
   if ((frameNo / obstaclesCreationDelay) % 1 == 0) {
      currentScore++;
      let x = Math.floor(Math.random() * (canvas.width - 85 + 1)) + 0;
      obstacles.push(new Obstacle(x, canvas.height));
   }
   if ((frameNo / 750) % 1 == 0) {
      if (obstaclesSpeed < 1) obstaclesSpeed += 0.14;
      if (obstaclesCreationDelay > 110) obstaclesCreationDelay -= 6;
   }
   for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].update();
      obstacles[i].draw();
   }
   ball.isContact();
   ball.newPos();
   ball.update();
}

// Movement of the Ball
let movingRight = false;
let movingLeft = false;
let lastMoving;
function rightMovement() {
   movingRight = true;
   ball.increaseSpeed(1.5);
   lastMoving = "Right";
}
function leftMovement() {
   movingLeft = true;
   ball.increaseSpeed(-1.5);
   lastMoving = "Left";
}
function decreaseMovement() {
   if (lastMoving === "Right") movingRight = false;
   else if (lastMoving === "Left") movingLeft = false;
   ball.decreaseSpeed();
}

if (isMobile) {
   let rightMoving;
   rightBtn.addEventListener("touchstart", () => {
      rightMoving = setInterval(rightMovement(), 30);
   });
   leftBtn.addEventListener("touchstart", () => {
      leftMovement();
   });
   rightBtn.addEventListener("touchend", () => {
      clearInterval(rightMoving);
      decreaseMovement();
   });
   leftBtn.addEventListener("touchend", () => {
      decreaseMovement();
   });
}

addEventListener("keydown", (e) => {
   if (e.key === "ArrowRight") {
      rightMovement();
   }
   if (e.key === "ArrowLeft") {
      leftMovement();
   }
});
addEventListener("keyup", (e) => {
   if (e.key === "ArrowRight") {
      decreaseMovement();
   } else if (e.key === "ArrowLeft") {
      /* movingLeft = false;
      ball.decreaseSpeed(); */
      decreaseMovement();
   }
});

// --------------- Starting the Game ----------------- //

function startGame() {
   result.style.display = "none";
   obstacles = [];
   obstacles.push(new Obstacle(0, 400));
   frameNo = 0;
   currentScore = 0;
   ball.x = 20;
   ball.y = 20;
   ball.gravitySpeed = 0;
   if (gameInterval !== null) {
      clearInterval(gameInterval);
      gameInterval = null;
   }
   gameInterval = setInterval(updateGame, 20);
}

startBtn.addEventListener("click", () => {
   console.log("clicked");
   startGame();
});
