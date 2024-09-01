// import { TimeNow, MessageEvent } from "@rnbo/js";
const SPEED = 0.25;
const SIZE = 30;
let x = 175;
let y = 250;

let buttons = [];
let displays = [];
let sliders = [];
let device;

async function setup() {
  await loadRNBO();
  createCanvas(400, 700);
  noStroke();
  buttons.push(new Button(150, 100, 80, 80, 5000, "start"))
  // buttons.push(new Button(200, 100, 80, 80, 30))
  // buttons.push(new Button(100, 200, 80, 80, 30))
  // buttons.push(new Button(200, 200, 80, 80, 30))

  displays.push(new Display(100, 500, 80, 80, 300, "kick"));
  displays.push(new Display(200, 500, 80, 80, 300, "hat"));

  sliders.push(new Slider(125, 200, 20, 250, "kick_gain", false));
  sliders.push(new Slider(225, 200, 20, 250, "hat_gain", false));
}

function draw() {
  background(220);
  if (keyIsDown(87)) {
    y -= SPEED * deltaTime;
  }
  if (keyIsDown(83)) {
    y += SPEED * deltaTime;
  }
  if (keyIsDown(65)) {
    x -= SPEED * deltaTime;
  }
  if (keyIsDown(68)) {
    x += SPEED * deltaTime;
  }
  for (const button of buttons) {
    button.update(x, y, deltaTime);
  }
  for (const display of displays) {
    display.update(deltaTime);
  }
  for (const slider of sliders) {
    slider.update(x, y, deltaTime);
  }
  fill("black");
  rect(x, y, SIZE, SIZE);
}

class Display {
  constructor(x, y, w, h, sustain, name) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.sustain = sustain;
    this.name = name;
    this.timer = 0;
  }
  update(delta) {
    this.timer = max(this.timer - delta, 0);
    let mapped = map(this.timer, 0, this.sustain, 0, 1);
    let col = lerpColor(color("red"), color("green"), mapped);
    fill(col);
    rect(this.x, this.y, this.w, this.h);
  }
  getMessage(tag) {
    if (tag == this.name) this.timer = this.sustain;
  }
}

class Slider {
  constructor(x, y, w, h, name, param = true) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.param = param;
    this.maxVal = this.y + this.h - this.w;
    this.name = name;
    this.value = y;
  }
  playerIn(px, py) {
    return px > this.x - SIZE && px < this.x + this.w && py > this.y - SIZE && py < this.y + this.h
  }
  update(px, py, delta) {
    if (this.playerIn(px, py)) {
      const newVal = constrain(py, this.y, this.maxVal);
      if (newVal != this.value) {
        this.value = newVal;
        const mapped = map(this.value, this.y, this.maxVal, 0, 1);
        if (this.param) {
          device.parameters.forEach(parameter => {
            if (parameter.id == this.name) {
              parameter.value = mapped;
            }
          });
        } else {
          sendRNBOMessage(this.name, [mapped])
        }
      }
    }
    fill("black");
    const border = 5;
    rect(this.x + border, this.y, this.w - border * 2, this.h);
    fill("red");
    rect(this.x, this.value, this.w, this.w);
  }
}

class Button {
  constructor(x, y, w, h, sustain, name) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.sustain = sustain;
    this.name = name;
    this.timer = 0;
  }
  playerIn(px, py) {
    return px > this.x - SIZE && px < this.x + this.w && py > this.y - SIZE && py < this.y + this.h
  }
  update(px, py, delta) {
    if (this.playerIn(px, py)) {
      if (this.timer <= 0) sendRNBOMessage(this.name, [1]);
      this.timer = this.sustain;
    }
    else {
      if (this.timer <= delta && this.timer > 0) sendRNBOMessage(this.name, [0]);
      this.timer = max(this.timer - delta, 0);
    }
    let mapped = map(this.timer, 0, this.sustain, 0, 1);
    let col = lerpColor(color("red"), color("green"), mapped);
    fill(col);
    rect(this.x, this.y, this.w, this.h);
  }
}