


function Ball (x, y, c, size){
    PIXI.Sprite.call(this);
    this.color = colors[c];
    this.interactive = true;
    this.x = 200 + (size/2) + (x * (size));
    this.y = 200 + (size/2) + (y * (size));
    this.xMap = x;
    this.yMap = y;

    var b = new PIXI.Graphics();
    b.lineStyle(2, 0x000000, 0.75);
    b.beginFill(colors[c], 1);
    b.drawCircle(/*200 + (size/2) + (x * (size)), 200 + (size/2) + (y * (size)),*/0,0,  size/3);
    b.endFill();
    this.addChild(b);
    this.zIndex = 1;
    // this.on("pointerdown", this.moveBall, this);
    // cont.addChild(this);
}
Ball.prototype = Object.create(PIXI.Sprite.prototype);

// Ball.prototype.moveBall = function (e){
//
//     console.log(e.target.x, e.target.y);
//     // f.startPF = e; // ?????????
//
//
//
// }


