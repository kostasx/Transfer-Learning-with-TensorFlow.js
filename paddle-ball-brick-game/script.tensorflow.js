var canvas, ctx, w, h;

var player = {
  x: 450,
  y: 520,
  width: 100,
  height: 20,
  color: "red"
}

var ball = {
  x: 500,
  y: 510,
  radius: 10,
  speedX: 0,
  speedY: 0,
  color: "blue"
}

var numOfBlocks = 10;
var blocks = [];

var lives = 3, score = 0;

var firstStart = true;
var end = false;
var leftPressed = false, rightPressed = false;
var leftWithShiftPressed = false, rightWithShiftPressed = false;

window.onload = init;

function init() {
  canvas = document.querySelector("#gameCanvas");
  
  w = canvas.width;
  h = canvas.height;
  
  ctx = canvas.getContext("2d");
  
  blocks = createBlocks(numOfBlocks);
  
  addEventListener("keydown", keyDownHandler, false);
  addEventListener("keyup", keyUpHandler, false);
  addEventListener("keydown", startingOff, false);
  
  mainLoop();
}

function mainLoop() {
  ctx.clearRect(0, 0, w, h);
  
  drawLives(lives);
  drawScore(score);
  drawPlayer(player);
  drawBall(ball);
  drawBlocks(blocks);
  
  moveBall(ball);
  
  if (!end) {
    requestAnimationFrame(mainLoop);
  }
  if (blocks[0] == undefined) {
    end = true;
    
    ctx.fillStyle = "green";
    ctx.font = "60px monospace";
    ctx.fillText("You Win!", 380, 300);
    
    ctx.fillStyle = "black";
  }
}

function drawLives(l) {
  ctx.save();
  
  ctx.font="30px Monospace";
  ctx.fillText("Life: " + l, 20, 580);
  
  ctx.restore();
}

function drawScore(s) {
  ctx.save();
  
  ctx.font="30px Monospace";
  ctx.fillText("Score: " + s, 820, 580);
  
  ctx.restore();
}

function drawPlayer(p) {
  ctx.save();

  if (leftPressed && (w - player.x) < w) {
    player.x -= 10;
  } else if (rightPressed && (player.x + 100) < w) {
    player.x += 10;
  }
  
  if (leftWithShiftPressed && (w - player.x) < w) {
    player.x -= 25;
  } else if (rightWithShiftPressed && (player.x + 100) < w) {
    player.x += 25;
  }
  
  ctx.translate(p.x, p.y);
  
  ctx.fillStyle = p.color;
  ctx.fillRect(0, 0, p.width, p.height);
  
  ctx.restore();
}

function drawBall(b) {
  ctx.save();

  if (firstStart) {
    if (leftPressed && (w - b.x + 50) < w) {
      b.x -= 10;
    } else if (rightPressed && (b.x + 50) < w) {
      b.x += 10;
    }
    
    if (leftWithShiftPressed && (w - b.x + 50) < w) {
      b.x -= 25;
    } else if (rightWithShiftPressed && (b.x + 50) < w) {
      b.x += 25;
    }
  }
  
  ctx.translate(b.x, b.y);
  
  ctx.fillStyle = b.color;
  
  ctx.beginPath();
  ctx.arc(0, 0, b.radius, 0, 2 * Math.PI)
  ctx.fill();
  
  ctx.restore();
}

function moveBall(b) {
  b.x += -b.speedX;
  b.y += -b.speedY;
  
  collisionWithPlayer(b, player);
  collisionWithWall(b);
  collisionWithBlock(ball, blocks);
}

function createBlocks(n) {
  var blockArray = [];
  
  var B = {
    x: 168,
    y: 100,
    width: 35,
    height: 35,
    color: "#db8b5c"
  }
  
  for (var i = 0; i < n; i++) {
    var temp = Object.assign({}, B);
    blockArray.push(temp);
    B.x += 70;
  }
  blockArray[Math.floor(Math.random() * 10)].color = "#af6438";
  return blockArray;
}

function drawBlocks(blockArray) {
  blockArray.forEach(function(B) {
    drawABlock(B);
  });
}

function drawABlock(B) {
  ctx.save();
  
  ctx.translate(B.x, B.y);
  
  ctx.fillStyle = B.color;
  ctx.fillRect(0, 0, B.width, B.height);
  
  ctx.restore();
}

function collisionWithPlayer(b, p) {
  var position = (ball.x - player.x)*(ball.x - player.x) + (ball.y - player.y)*(ball.y - player.y);
  
  if (circRectsOverlap(player.x, player.y, player.width, player.height, b.x, b.y, b.radius)) {
    b.speedY = -b.speedY;
    --b.y;

    if (position <= 900 || position > 5650) {
      if (b.speedX < 0) b.speedX = -7;
      else b.speedX = 7;
    }
    else if (position <= 5650) {
      if (b.speedX < 0) b.speedX = -3;
      else b.speedX = 3;
    }
  }
  
}

function collisionWithWall(b) {
  if ((b.x + b.radius) > w) {
    b.speedX = -b.speedX;
    b.x = w - b.radius;
  } else if ((b.x - b.radius) < 0) {
    b.speedX = -b.speedX;
    b.x = b.radius;
  }
  
  // Reset position
  if((b.y + b.radius) > h + 100) {
    b.x = 500;
    b.y = 510;
    
    player.x = 450;
    player.y = 520;
    b.speedX = 0;
    b.speedY = 0;
    
    --lives;
    
    firstStart = true;
    
    if (lives == 0) {
      gameOver();
    }
  } else if((b.y -b.radius) < 0) {
    b.speedY = -b.speedY;
    b.Y = b.radius;
  }
}

function collisionWithBlock(b, blockArray) {
  blockArray.forEach(function(B, index) {
    var collide = circRectsOverlap(B.x, B.y, B.width, B.height, b.x, b.y, b.radius);
    
    if (collide && B.color == "#db8b5c") {
      b.speedY = -b.speedY;
      score += 10;
      blockArray.splice(index, 1);
    } else if(collide && B.color == "#af6438") {
      b.speedX = -b.speedX;
      b.speedY = -b.speedY;
      B.color = "#db8b5c";
      score += 10;
    }
    
  });
}

function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
   var testX=cx;
   var testY=cy;
   if (testX < x0) testX=x0;
   if (testX > (x0+w0)) testX=(x0+w0);
   if (testY < y0) testY=y0;
   if (testY > (y0+h0)) testY=(y0+h0);
   return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))< r*r);
}

function startingOff(evt) {
  if (evt.key == " " && firstStart) {
    
    if (leftPressed || leftWithShiftPressed) ball.speedX = 5;
    else if (rightPressed || rightWithShiftPressed) ball.speedX = -5;
    
    ball.speedY = 5;

    firstStart = false;
  }
}

function gameOver() {
  ctx.save();
  
  ctx.clearRect(0, 0, w, h);
  
  drawLives(lives);
  drawScore(score);
  drawPlayer(player);
  drawBlocks(blocks);
  
  ctx.fillStyle = "grey";
  ctx.font = "60px monospace";
  ctx.fillText("Game Over", 340, 300);
  
  end = true;
  ctx.restore();
}

function keyDownHandler(evt) {
  if(evt.keyCode == 37) {
    leftPressed = true;
  }
  else if(evt.keyCode == 39) {
    rightPressed = true;
  }
}

function keyUpHandler(evt) {
  if(evt.keyCode == 37) {
    leftPressed = false;
    leftWithShiftPressed = false;
  }
  else if(evt.keyCode == 39) {
    rightPressed = false;
    rightWithShiftPressed = false;
  }
  
}

// PLACE TF.JS CODE HERE:
// TF.JS
// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function initTF() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        // TF ADDITION : GAME CODE:
        if ( prediction[i].probability.toFixed(2) > 0.8 ){
          console.log( prediction[i].className );
          if ( prediction[i].className === "LEFT" ){

            leftPressed = true;
            rightPressed = false;
            
          } else if ( prediction[i].className === "RIGHT" ){

            leftPressed = false;
            rightPressed = true;
            
          } else {

            leftPressed = false;
            rightPressed = false;

          }

        }
        // TF ADDITION : GAME CODE:

    }

}