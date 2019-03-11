
function Desktop (size){
    PIXI.Sprite.call(this);
    this.anchor.set(0.5);
    this.interactive = true;
    this.xMap = 0;
    this.yMap = 0;
    this.zIndex = 0;
    var g = new PIXI.Graphics();
    g.lineStyle(2, 0x000000, 0.5);
    g.beginFill(0x808080, 1);
    g.drawRoundedRect(0, 0, size, size, 10);
    g.endFill();
    this.addChild(g);
}
Desktop.prototype = Object.create(PIXI.Sprite.prototype);
