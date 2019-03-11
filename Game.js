
var game = {};
var width = 1000;
var height = 800;

var colors = [0xFF0000, 0xFF8000, 0xFFFF00, 0x00FF00, 0x00FFFF,  0x0000FF, 0xFF00FF];

window.addEventListener("load", function () {
  game = new Game();
  game.run();
}, false);

function Game() {
    this.app = new PIXI.Application(width, height, {backgroundColor: 0xC0C0C0});
    document.body.appendChild(this.app.view);
}

Game.prototype.tick = function () {
    var delta = game.app.ticker.elapsedMS;
    if(game.f && game.f.tick) {
        game.f.tick(delta);
    }
};

Game.prototype.run = function () {
    this.f =this.app.stage.addChild(new Field(/*{width: width, height:height}*/));
    game.app.ticker.add(game.tick);
};
