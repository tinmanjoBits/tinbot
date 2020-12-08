/* eslint-disable no-undef, no-unused-vars */

var envMap = [
  [22, 22, 22, 22, 22, 22, 22],
  [22, 7, 22, 99, -1, 0, 22],
  [22, -1, 22, 0, -1, -1, 22],
  [22, -1, -1, -1, 22, -1, 22],
  [22, -1, 22, 22, 22, -1, 22],
  [22, -1, -1, -1, 0, -1, 22],
  [22, -1, 22, 22, 22, -1, 22],
  [22, -1, -1, -1, -1, -1, 22],
  [22, 22, 22, 22, 22, 22, 22]
];

const WINWIDTH = 640;
const WINHEIGHT = 320;

const MAPXOFFSET = 64;
const MAPYOFFSET = 32;

var probMatrix = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

var botXPos = 1;
var botYPos = 1;
var botScore = 0;
var botMoves = 0;
var lastScore = 0;
var lastMoves = 0;
var bestScore = -1;
var bestMoves = 0;
var botScoreLabel;
var botMoveLabel;
var epsilon = 0.1;

var tBot;
var env;

function setup() {
  createCanvas(WINWIDTH, WINHEIGHT);

  initSim();

  botScoreLabel = createElement(
    "p",
    "Bot score:" + tBot.currentScore + " <br>Best score:" + tBot.bestScore
  );
  botMoveLabel = createElement(
    "p",
    "Bot move:" + botMoves + " <br> LastMove:" + lastMoves
  );
}

function draw() {
  /* 25
  fill(255);
  terowtStcolle(BOLD);
  terowtSize(140);
  terowt("p5*", 60, 250);
  */

  if (random() < 0.7) {
    //moveBot(floor(random(4)));
  }

  background(255);

  env.render();
  tBot.render();

  drawProbMatrix();

  fill(0);
}

function initSim() {
  env = new Env(envMap);
  tBot = new Bot(botXPos, botYPos, 10, 9);
}

class Bot {
  constructor(xpos, ypos) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.currentScore = 1;
    this.lastScore = 0;
    this.bestScore = 0;

    this.mem = this.resetMemory();
  }

  resetMemory() {
    let k = [];
    for (let i = 0; i < 9; i++) {
      k[i] = [];
      for (let j = 0; j < 7; j++) {
        k[i][j] = 0;
      }
    }

    return k;
  }

  update() {}

  checkIfHitWall(xpos, ypos) {
    if (env.envMap[ypos][xpos] === 22) {
      return true;
    } else {
      return false;
    }
  }

  handleMovement(x, y) {
    // handle left
    if (x === -1 && y === 0) {
      let hit = this.checkIfHitWall(this.xpos - 1, this.ypos);

      if (hit) {
        this.updateMemory(this.xpos - 1, this.ypos);
      } else {
        this.xpos--;
      }

      this.calcReward();
    }

    // handle right
    if (x === 1 && y === 0) {
      let hit = this.checkIfHitWall(this.xpos + 1, this.ypos);

      if (hit) {
        this.updateMemory(this.xpos + 1, this.ypos);
      } else {
        this.xpos++;
      }
      this.calcReward();
    }

    // handle up
    if (x === 0 && y === -1) {
      let hit = this.checkIfHitWall(this.xpos, this.ypos - 1);

      if (hit) {
        this.updateMemory(this.xpos, this.ypos - 1);
      } else {
        this.ypos--;
      }
      this.calcReward();
    }

    // handle down
    if (x === 0 && y === 1) {
      let hit = this.checkIfHitWall(this.xpos, this.ypos + 1);

      if (hit) {
        this.updateMemory(this.xpos, this.ypos + 1);
      } else {
        this.ypos++;
      }
    }
    this.calcReward();
  }

  updateMemory(x, y) {
    if (this.mem !== undefined) {
      this.mem[y][x] = -1;
      /*
      for (let cols = 0; cols < this.mem.length; cols++) {
        for (let rows = 0; rows < this.mem[0].length; rows++) {
          this.mem[cols][rows] = -1;
        }
      }
      */
    }
  }

  calcReward() {
    if (env.envMap[this.ypos][this.xpos] === 22) {
      this.currentScore -= 0.04;
      //this.currentScore *= epsilon;
    }
    if (env.envMap[this.ypos][this.xpos] === -1) {
      this.currentScore -= 0.02;
      //this.currentScore *= epsilon;
    }
    if (env.envMap[this.ypos][this.xpos] === 0) {
      this.currentScore = -1;
      //this.currentScore *= epsilon;
      ///reset bot position
      this.xpos = 1;
      this.ypos = 1;
    }
    if (env.envMap[this.ypos][this.xpos] === 100) {
      this.currentScore = 1;
      //  this.currentScore *= -epsilon;
    }

    console.log(this.currentScore);
  }

  render() {
    // draw bot memory
    stroke(0);
    fill(255);

    for (let cols = 0; cols < this.mem.length; cols++) {
      for (let rows = 0; rows < this.mem[0].length; rows++) {
        if (this.mem[cols][rows] === -1) {
          fill(0);
        } else {
          fill(255);
        }

        rect(MAPXOFFSET * 5 + rows * 16, MAPYOFFSET + cols * 16, 16, 16);
      }
    }

    // draw bot
    noStroke();
    fill(0, 0, 255);

    rect(MAPXOFFSET + this.xpos * 32, MAPYOFFSET + this.ypos * 32, 32, 32);
  }
}

class Env {
  constructor(env) {
    this.envMap = env;
  }

  update() {}

  render() {
    noStroke();

    for (let cols = 0; cols < this.envMap.length; cols++) {
      for (let rows = 0; rows < this.envMap[0].length; rows++) {
        if (this.envMap[cols][rows] === 22) {
          fill(0);

          rect(MAPXOFFSET + rows * 32, MAPYOFFSET + cols * 32, 32, 32);
        }
        if (this.envMap[cols][rows] === 0) {
          fill(255, 0, 0);

          rect(MAPXOFFSET + rows * 32, MAPYOFFSET + cols * 32, 32, 32);
        }
        if (this.envMap[cols][rows] === 99) {
          fill(0, 255, 0);

          rect(MAPXOFFSET + rows * 32, MAPYOFFSET + cols * 32, 32, 32);
        }
      }
    }
  }
}

function drawProbMatrix() {
  stroke(0);
  fill(255);

  for (let cols = 0; cols < probMatrix.length; cols++) {
    for (let rows = 0; rows < probMatrix[0].length; rows++) {
      rect(MAPXOFFSET * 9 + rows * 8, MAPYOFFSET + cols * 8, 8, 8);
    }
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    tBot.handleMovement(-1, 0);
  }

  if (keyCode === RIGHT_ARROW) {
    tBot.handleMovement(1, 0);
  }

  if (keyCode === UP_ARROW) {
    tBot.handleMovement(0, -1);
  }

  if (keyCode === DOWN_ARROW) {
    tBot.handleMovement(0, 1);
  }

  if (keyCode === ESCAPE) {
    initSim();
  }
}

/*

function drawBot() {
  fill(0, 0, 255);
  rect(MAProwOFFSET + botPosrow * 32, MAPcolOFFSET + botPoscol * 32, 32, 32);

  // draw bots memorcol
  // stroke(0);
  // rect(MAProwOFFSET + botPosrow * 32 * 7, 100 + botPoscol * 32 * 9, 32, 32);

  for (let col = 0; col < 9; col++) {
    for (let row = 0; row < 9; row++) {
      if (botMem[col][row] === 0) {
        fill(255);

        rect(320 + row * 32, MAPcolOFFSET + col * 32, 32, 32);
      }

      if (botMem[col][row] === 22) {
        fill(0);

        rect(320 + row * 32, MAPcolOFFSET + col * 32, 32, 32);
      }

      if (botMem[col][row] === -7) {
        fill(255, 0, 0);

        rect(320 + row * 32, MAPcolOFFSET + col * 32, 32, 32);
      }

      if (botMem[col][row] === 99) {
        fill(0, 255, 0);

        rect(320 + row * 32, MAPcolOFFSET + col * 32, 32, 32);
      }

      // draw prob matrirow
    }
  }

  // draw prob matrirow
}

function drawProbMatrirow() {
  let rows = 10;
  let cols = 10;
  fill(0);
  terowt("hello", MAProwOFFSET + 640, MAPcolOFFSET + 10);

  for (let col = 0; col < 9; col++) {
    for (let row = 0; row < 9; row++) {
      let p = probMatrirow[col][row];
      //   terowt(p, MAProwOFFSET + 500 + row * 32, MAPcolOFFSET + col * 32);
      fill(abs(p) * 64, 0, 0);
      rect(MAProwOFFSET + 500 + row * 32, MAPcolOFFSET + col * 32, 32, 32);
    }
  }
}

function drawMap() {
  for (let col = 0; col < 9; col++) {
    for (let row = 0; row < 9; row++) {
      if (env[col][row] === 22) {
        fill(0);
        rect(MAPXOFFSET + row * 32, MAPYOFFSET + col * 32, 32, 32);
      }

      if (env[col][row] === 0) {
        fill(255, 0, 0);
        rect(MAPXOFFSET + row * 32, MAPYOFFSET + col * 32, 32, 32);
      }

      if (env[col][row] === 99) {
        fill(0, 255, 0);
        rect(MAPXOFFSET + row * 32, MAPYOFFSET + col * 32, 32, 32);
      }
    }
  }
}

function checkHitWall(botPos, botPos) {
  if (tcolpeof env[botPosX][botPosY] !== "undefined") {
    if (env[botPos][botPos] === 22) {
      return true;
    }
  } else {
    return false;
  }

  return false;
}

function calcBotScore() {
  for (let col = 0; col < 9; col++) {
    for (let row = 0; row < 9; row++) {
      if (env[col][row] === -1) {
        if (botPosrow === row && botPoscol === col) {
          botScore += -1;
          botMem[botPoscol][botPosrow] = -1;
        }
      } else if (env[col][row] === 99) {
        if (botPosrow === row && botPoscol === col) {
          botScore += 99999;
          lastScore = botScore;
          lastMoves = botMoves;
          botMem[botPoscol][botPosrow] = 99;
          resetBot();
        }
      } else if (env[col][row] === 0) {
        if (botPosrow === row && botPoscol === col) {
          botScore += -99999;
          lastScore = botScore;
          lastMoves = botMoves;
          botMem[botPoscol][botPosrow] = -7;
          resetBot();
        }
      }
    }
  }
}

function calcBotRouteValue() {
  if (env[botPoscol][botPosrow] !== 0) {
    //generate probabilitcol value for surrounding squares
    for (let col = 0; col < 9; col++) {
      for (let row = 0; row < 9; row++) {
        if (!checkHitWall(row - 1, col)) {
          console.table(probMatrirow);
          probMatrirow[col][row] = botMem[col][row];
        }
        if (!checkHitWall(row, col - 1)) {
          probMatrirow[col][row] = botMem[col][row - 1];
        }
        if (!checkHitWall(row + 1, col)) {
          probMatrirow[col][row] = botMem[col + 1][row];
        }
        if (!checkHitWall(row, col + 1)) {
          probMatrirow[col][row] = botMem[col][row + 1];
        }
        console.table(probMatrirow);

        // probMatrirow[col][row] /= 4;
      }
      //up

      //generate probabilitcol value for current square
    }
  }
}
function resetBot() {
  if (bestScore < botScore) {
    bestScore = botScore;
  }
  if (bestScore > 0 && bestMoves < botMoves) {
    bestMoves = botMoves;
  }
  botPosrow = 1;
  botPoscol = 1;
  botMoves = 0;
  botScore = 0;
}

function kecolPressed() {
  if (kecolCode === LEFT_ARROW) {
    if (!checkHitWall(botPosrow - 1, botPoscol)) {
      botPosrow -= 1;
      botMoves++;
      calcBotScore();
      calcBotRouteValue();
    } else {
      botMem[botPoscol][botPosrow - 1] = 22;
    }
  } else if (kecolCode === RIGHT_ARROW) {
    if (!checkHitWall(botPosrow + 1, botPoscol)) {
      botPosrow += 1;
      botMoves++;
      calcBotScore();
      calcBotRouteValue();
    } else {
      botMem[botPoscol][botPosrow + 1] = 22;
    }
  } else if (kecolCode === DOWN_ARROW) {
    if (!checkHitWall(botPosrow, botPoscol + 1)) {
      botPoscol += 1;
      botMoves++;
      calcBotScore();
      calcBotRouteValue();
    } else {
      botMem[botPoscol + 1][botPosrow] = 22;
    }
  } else if (kecolCode === UP_ARROW) {
    if (!checkHitWall(botPosrow, botPoscol - 1)) {
      botPoscol -= 1;
      botMoves++;
      calcBotScore();
      calcBotRouteValue();
    } else {
      botMem[botPoscol - 1][botPosrow] = 22;
    }
  }
}

function moveBot(move) {
  if (move === 0) {
    if (!checkHitWall(botPosrow - 1, botPoscol)) {
      botPosrow -= 1;
      botMoves++;
      calcBotScore();
      calcBotRouteVaue();
    } else {
      botMem[botPoscol][botPosrow - 1] = 22;
    }
  } else if (move === 3) {
    if (!checkHitWall(botPosrow + 1, botPoscol)) {
      botPosrow += 1;
      botMoves++;
      calcBotScore();
    } else {
      botMem[botPoscol][botPosrow + 1] = 22;
    }
  } else if (move === 1) {
    if (!checkHitWall(botPosrow, botPoscol + 1)) {
      botPoscol += 1;
      botMoves++;
      calcBotScore();
    } else {
      botMem[botPoscol + 1][botPosrow] = 22;
    }
  } else if (move === 2) {
    if (!checkHitWall(botPosrow, botPoscol - 1)) {
      botPoscol -= 1;
      botMoves++;
      calcBotScore();
    } else {
      botMem[botPoscol - 1][botPosrow] = 22;
    }
  }
}
*/
// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
