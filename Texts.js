
function Wine() {
   PIXI.TextStyle.call(this);
   this.text = "YOU WIN";
   this.fontFamily = 'Arial';
   this.fontSize = 80;
   this.fontStyle = 'italic';
   this.fontWeight = 'bold';
   this.fill = ['#7CFC00', '#FFD700'];
   this.stroke =  '#4a1850';
   this.strokeThickness = 5;
   this.dropShadow = true;
   this.dropShadowColor = '#000000';
   this.dropShadowBlur = 4;
   this.dropShadowAngle = Math.PI / 6;
   this.dropShadowDistance = 6;
   this.wordWrap = true;
   this.wordWrapWidth = 440;
   this.alpha = 0.5;
}

Wine.prototype = Object.create(PIXI.TextStyle.prototype);

function Lose() {
    PIXI.TextStyle.call(this);
    this.text = "YOU Lose";
    this.fontFamily = 'Arial';
    this.fontSize = 80;
    this.fontStyle = 'italic';
    this.fontWeight = 'bold';
    this.fill = ['#800080', '#ff0000'];
    this.stroke =  '#808080';
    this.strokeThickness = 5;
    this.dropShadow = true;
    this.dropShadowColor = '#000000';
    this.dropShadowBlur = 4;
    this.dropShadowAngle = Math.PI / 6;
    this.dropShadowDistance = 6;
    this.wordWrap = true;
    this.wordWrapWidth = 440;
    this.alpha = 0.5;
}

Lose.prototype = Object.create(PIXI.TextStyle.prototype);

function Display() {
    PIXI.TextStyle.call(this);
    this.fontSize = 40;
    this.fontFamily = 'Arial';
    this.fill = ['#7CFC00', '#FFD700'];
    this.stroke =  '#4a1850';
    this.strokeThickness = 3;
    this.dropShadow = true;
    this.dropShadowColor = '#000000';
    this.dropShadowBlur = 4;
    this.dropShadowAngle = Math.PI / 6;
    this.dropShadowDistance = 3;
    this.wordWrap = true;
    this.wordWrapWidth = 440;
    this.alpha = 0.5;
}

Display.prototype = Object.create(PIXI.TextStyle.prototype);
