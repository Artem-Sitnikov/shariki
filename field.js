function Field() {
    PIXI.Sprite.call(this);
    this.blockSize = 60;
    this.children = [];
    this.updateTimeout = 500;
    this.scope = 9;
    this.lock = false;
    this.deltaD = 0;
    this.ballHeight = {};
    this.jumpBall = 0;
    this.balls = [];
    this.lose = new PIXI.Text ("Game Over", new Lose());
    this.display = new PIXI.Text("0", new Display());
    this.gamePoints = 0;
    this.lockDes = false;
    this.lockBall = true;
    this.lockBallOnDes = false;
    this.hod = false;

    this.mapBalls = [];
    this.mapPF = [];
    this.mapDesktop = [];
    this.region = [];
    this.ballsFive = [];

    this.startPFx = null;
    this.startPFy = null;
    this.finPFx = null;
    this.finPFy = null;

    this.forColl = 0;

    this.addChildren();
}

Field.prototype = Object.create(PIXI.Sprite.prototype);

Field.prototype.addChildren = function () {
    this.balls = [];
    this.newBall(3);
    this.drawMapDesktop(this.scope);
    this.drawMapBalls();
    console.log(this.mapBalls);

    this.display.position.set( 4 * this.blockSize, 2 * this.blockSize);
    this.display.text = "0";
    this.addChild(this.display);

    this.reset = this.addChild(new Reset("reset", 'img/reset.png', 2 * this.blockSize, 2 * this.blockSize));
    this.reset.position.set( 2 * this.blockSize, 2 * this.blockSize);
    this.children.sort(function (a, b) {
        return a.zIndex - b.zIndex
    });

    this.reset.on('pointerdown', this.restart, this);
};

Field.prototype.drawMapDesktop = function (num){
    for (var i=0; i < num; i++){
        this.mapDesktop[i] = [];
        for (var u=0; u < num; u++){
            this.mapDesktop[i][u] = this.addChild(new Desktop(this.blockSize));
            this.mapDesktop[i][u].position.set(200 + (u * this.blockSize), 200 + (i * this.blockSize));
            this.mapDesktop[i][u].xMap = u;
            this.mapDesktop[i][u].yMap = i;
            this.mapDesktop[i][u].on('pointerdown', this.moveBallOnDes, this);
        }
    }
};

Field.prototype.drawMapBalls = function () {
    this.mapBalls = [];
    for (var i = 0; i < this.scope; i++) {
        this.mapBalls[i] = [];
        for (var k = 0; k < this.scope; k++){
            this.mapBalls[i][k] = 0;
        }
    }
    for (var u = 0; u < this.balls.length; u++) {
        var x = this.balls[u].xMap;
        var y = this.balls[u].yMap;
        this.mapBalls[y][x] = this.removeChild(this.balls[u]);
        this.mapBalls[y][x] = this.addChild(this.balls[u]);
            this.mapBalls[y][x].off("pointerdown", this.moveBall, this);
            this.mapBalls[y][x].on("pointerdown", this.moveBall, this);
    }
};

Field.prototype.restart = function () {
    this.lock = false;
    this.lockBallOnDes = false;
    this.children = [];
    this.mapBalls = [];
    this.mapPF = [];
    this.mapDesktop = [];
    this.gamePoints = 0;

    this.addChildren();
    console.log("reset");
};

Field.prototype.tick = function (delta) {
    this.deltaD = delta;
    if(this.lock) {
        if(this.updateTimeout > 0) {
            this.updateTimeout -=delta;
        } else {
            this.updateTimeout += 100;
            this.updateMovement();
        }
    }
};

Field.prototype.drawMapPF = function (){
    for (var i=0; i < this.scope; i++){
        this.mapPF[i] = [];
        for (var u=0; u < this.scope; u++) {

            if (u === this.ballHeight.xMap && i === this.ballHeight.yMap){
                this.mapPF[i][u] = 0;
            }else if (this.mapBalls[i][u] === 0){
                this.mapPF[i][u] = 0;
            } else {
                this.mapPF[i][u] = 1;
            }
        }
    }
};

Field.prototype.moveBall = function (e){
    if (this.lockBall){
        console.log(e.target.xMap, e.target.yMap);
        this.ballHeight.height*=2;
        this.ballHeight = e.target;
        e.target.height/=2;
        this.drawMapPF();
        this.lockBallOnDes = true;
        this.startPFx = e.target.xMap;
        this.startPFy = e.target.yMap;
    }
};

Field.prototype.moveBallOnDes = function (e) {
    if (this.lockBallOnDes){
        this.lockBallOnDes = false;
        console.log(e.target.xMap, e.target.yMap);

        this.finPFx = e.target.xMap;
        this.finPFy = e.target.yMap;
        this.lockDes = true;
        this.lock = true;
        this.hod = false;
        this.updateMovement();
    }
};

Field.prototype.updateMovement = function (){

    if (this.lockDes){
        this.lockBall = false;
        this.movePF(this.ballHeight);
    } else {
        this.lockBall = true;
        this.lock = false;
    }
};

Field.prototype.movePF = function (ballHeight){

    var grid = new PF.Grid(this.mapPF);
    var finder = new PF.AStarFinder();
    var useGrid = grid.clone();
    this.whatBall();

    var path = finder.findPath(this.startPFx, this.startPFy, this.finPFx, this.finPFy, useGrid);
    if (path.length >= 2) {
        if (this.startPFx > path[1][0]){
            this.balls[this.jumpBall].xMap--;
            this.balls[this.jumpBall].position.set(this.balls[this.jumpBall].x - this.blockSize, this.balls[this.jumpBall].y);
            this.startPFx--;
            this.drawMapBalls();
        }
        if (this.startPFx < path[1][0]){
            this.balls[this.jumpBall].xMap++;
            this.balls[this.jumpBall].position.set(this.balls[this.jumpBall].x + this.blockSize, this.balls[this.jumpBall].y);
            this.startPFx++;
            this.drawMapBalls();
        }
        if (this.startPFy > path[1][1]){
            this.balls[this.jumpBall].yMap--;
            this.balls[this.jumpBall].position.set(this.balls[this.jumpBall].x, this.balls[this.jumpBall].y - this.blockSize);
            this.startPFy--;
            this.drawMapBalls();
        }
        if (this.startPFy < path[1][1]){
            this.balls[this.jumpBall].yMap++;
            this.balls[this.jumpBall].position.set(this.balls[this.jumpBall].x, this.balls[this.jumpBall].y + this.blockSize);
            this.startPFy++;
            this.drawMapBalls();
        }
        this.hod = true;
    } else if (this.hod){
        this.region = [];
        this.ballsFive = [];
        this.searchRegion(this.finPFy, this.finPFx);
        var find = this.searchFive();
        this.deleteBalls();
        if (!find) {
            this.newBall(3);
        }
        this.drawMapBalls();
        this.lockDes = false;
    } else {
        this.lockDes = false;
    }
    this.youLoser();
};

Field.prototype.whatBall = function (){
    for (var i = 0; i < this.balls.length; i++){
        if (this.startPFx === this.balls[i].xMap && this.startPFy === this.balls[i].yMap){
            this.jumpBall = i;
        }
    }
};

Field.prototype.newBall = function (j) {
    if (this.balls.length < (this.scope * this.scope)){
        for (var i = 0; i < j; i++){
            var flag = true;
            while (flag) {
                var nom = 0;
                var x = Math.floor(this.scope * Math.random());
                var y = Math.floor(this.scope * Math.random());

                for (var u = 0; u < this.balls.length; u++){
                    if (this.balls[u].xMap === x && this.balls[u].yMap === y){
                    } else {
                        nom++;
                    }
                }
                if (nom === this.balls.length){
                    flag = false;
                    this.balls.push(new Ball(x, y, Math.floor(7 * Math.random()), this.blockSize));
                }
            }
        }
    }
};

Field.prototype.searchRegion = function (y, x) {
    if (this.mapBalls[y][x] === null) return;
    for (var z = 0; z < this.region.length; z++) {
        if (this.region[z].yMap === y && this.region[z].xMap === x) return;
    }
    this.region.push(this.mapBalls[y][x]);
    if ((y - 1) >= 0 && this.mapBalls[y - 1][x] != null) {
        if (this.mapBalls[y - 1][x].color === this.mapBalls[y][x].color ) {
            this.searchRegion(y - 1, x);
        }
    }
    if ((y + 1) <= (this.scope - 1) && this.mapBalls[y + 1][x] != null) {
        if (this.mapBalls[y + 1][x].color === this.mapBalls[y][x].color ) {
            this.searchRegion(y + 1, x);
        }
    }
    if ((x - 1) >= 0 && this.mapBalls[y][x - 1] != null) {
        if (this.mapBalls[y][x - 1].color === this.mapBalls[y][x].color ) {
            this.searchRegion(y, x - 1);
        }
    }
    if ((x + 1) <= (this.scope - 1) && this.mapBalls[y][x + 1] != null) {
        if (this.mapBalls[y][x + 1].color === this.mapBalls[y][x].color ) {
            this.searchRegion(y, x + 1);
        }
    }
    //
    if ((y - 1) >= 0 && (x - 1) >= 0 && this.mapBalls[y - 1][x - 1] != null) {
        if (this.mapBalls[y - 1][x - 1].color === this.mapBalls[y][x].color) {
            this.searchRegion(y - 1, x - 1);
        }
    }
    if ((y + 1) <= (this.scope - 1) && (x - 1) >= 0 && this.mapBalls[y + 1][x - 1] != null) {
        if (this.mapBalls[y + 1][x - 1].color === this.mapBalls[y][x].color ) {
            this.searchRegion(y + 1, x - 1);
        }
    }
    if ((y - 1) >= 0 && (x + 1) <= (this.scope - 1) && this.mapBalls[y - 1][x + 1] != null) {
        if (this.mapBalls[y - 1][x + 1].color === this.mapBalls[y][x].color ) {
            this.searchRegion(y - 1, x + 1);
        }
    }
    if ((y + 1) <= (this.scope - 1) && (x + 1) <= (this.scope - 1) && this.mapBalls[y + 1][x + 1] != null) {
        if (this.mapBalls[y + 1][x + 1].color === this.mapBalls[y][x].color ) {
            this.searchRegion(y + 1, x + 1);
        }
    }
};


Field.prototype.deleteBalls = function (){
    var k =this.ballsFive.length;
    for (var i = 0; i < k; i++){
        for (var u = 0; u < this.balls.length; u++){
            if (this.ballsFive[i].xMap === this.balls[u].xMap && this.ballsFive[i].yMap === this.balls[u].yMap){
                this.removeChild(this.balls[u]);
                this.balls.splice(u,1);
            }
        }
    }
    if (k > 0) {
        var newPoint = 2;
        for (var i = 0; i < k; i++) {
            newPoint *= 2;
        }
        this.gamePoints += newPoint;
        this.display.text = '' + this.gamePoints;
    }
};

Field.prototype.searchFive = function (){
    var flag = false;
    if (this.region.length > 4) {
        var color = this.region[0].color;
        for (var b = 0; b < this.region.length; b++){
            var x = this.region[b].xMap;
            var y = this.region[b].yMap;
            // line five
            if ((x - 2) >= 0 && (x + 2) < this.scope){
                if ((this.mapBalls[y][x - 2] !== 0) && this.mapBalls[y][x - 1] !== 0 && this.mapBalls[y][x + 1] !== 0 && this.mapBalls[y][x + 2] !== 0 ) {
                    if (this.mapBalls[y][x - 2].color === color && this.mapBalls[y][x - 1].color === color && this.mapBalls[y][x + 1].color === color && this.mapBalls[y][x + 2].color === color ) {
                        this.addToBallsFive(this.mapBalls[y][x]);
                        this.addToBallsFive(this.mapBalls[y][x - 2]);
                        this.addToBallsFive(this.mapBalls[y][x - 1]);
                        this.addToBallsFive(this.mapBalls[y][x + 1]);
                        this.addToBallsFive(this.mapBalls[y][x + 2]);
                        flag = true;
                    }
                }
            }
            // column five
            if ((y - 2) >= 0 && (y + 2) < this.scope){
                if ((this.mapBalls[y - 2][x] !== 0) && this.mapBalls[y - 1][x] !== 0 && this.mapBalls[y + 1][x] !== 0 && this.mapBalls[y + 2][x] !== 0 ) {
                    if (this.mapBalls[y - 2][x].color === color && this.mapBalls[y - 1][x].color === color && this.mapBalls[y + 1][x].color === color && this.mapBalls[y + 2][x].color === color ) {
                        this.addToBallsFive(this.mapBalls[y][x]);
                        this.addToBallsFive(this.mapBalls[y - 2][x]);
                        this.addToBallsFive(this.mapBalls[y - 1][x]);
                        this.addToBallsFive(this.mapBalls[y + 1][x]);
                        this.addToBallsFive(this.mapBalls[y + 2][x]);
                        flag = true;
                    }
                }
            }
            // + five
            if ((y - 1) >= 0 && (y + 1) < this.scope && (x - 1) >= 0 && (x + 1) < this.scope){
                if ((this.mapBalls[y - 1][x] !== 0) && this.mapBalls[y + 1][x] !== 0 && this.mapBalls[y][x - 1] !== 0 && this.mapBalls[y][x + 1] !== 0 ) {
                    if (this.mapBalls[y - 1][x].color === color && this.mapBalls[y + 1][x].color === color && this.mapBalls[y][x - 1].color === color && this.mapBalls[y][x + 1].color === color ) {
                        this.addToBallsFive(this.mapBalls[y][x]);
                        this.addToBallsFive(this.mapBalls[y - 1][x]);
                        this.addToBallsFive(this.mapBalls[y + 1][x]);
                        this.addToBallsFive(this.mapBalls[y][x - 1]);
                        this.addToBallsFive(this.mapBalls[y][x + 1]);
                        flag = true;
                    }
                }
            }
            // x five
            if ((y - 1) >= 0 && (y + 1) < this.scope && (x - 1) >= 0 && (x + 1) < this.scope){
                if ((this.mapBalls[y - 1][x - 1] !== 0) && this.mapBalls[y + 1][x - 1] !== 0 && this.mapBalls[y - 1][x + 1] !== 0 && this.mapBalls[y + 1][x + 1] !== 0 ) {
                    if (this.mapBalls[y - 1][x - 1].color === color && this.mapBalls[y + 1][x - 1].color === color && this.mapBalls[y - 1][x + 1].color === color && this.mapBalls[y + 1][x + 1].color === color ) {
                        this.addToBallsFive(this.mapBalls[y][x]);
                        this.addToBallsFive(this.mapBalls[y - 1][x - 1]);
                        this.addToBallsFive(this.mapBalls[y + 1][x - 1]);
                        this.addToBallsFive(this.mapBalls[y - 1][x + 1]);
                        this.addToBallsFive(this.mapBalls[y + 1][x + 1]);
                        flag = true;
                    }
                }
            }
            // five /
            if ((y - 2) >= 0 && (y + 2) < this.scope && (x - 2) >= 0 && (x + 2) < this.scope){
                if ((this.mapBalls[y - 2][x + 2] !== 0) && this.mapBalls[y - 1][x + 1] !== 0 && this.mapBalls[y + 1][x - 1] !== 0 && this.mapBalls[y + 2][x - 2] !== 0 ) {
                    if (this.mapBalls[y - 2][x + 2].color === color && this.mapBalls[y - 1][x + 1].color === color && this.mapBalls[y + 1][x - 1].color === color && this.mapBalls[y + 2][x - 2].color === color ) {
                        this.addToBallsFive(this.mapBalls[y][x]);
                        this.addToBallsFive(this.mapBalls[y - 2][x + 2]);
                        this.addToBallsFive(this.mapBalls[y - 1][x + 1]);
                        this.addToBallsFive(this.mapBalls[y + 1][x - 1]);
                        this.addToBallsFive(this.mapBalls[y + 2][x - 2]);
                        flag = true;
                    }
                }
            }
            // five \
            if ((y - 2) >= 0 && (y + 2) < this.scope && (x - 2) >= 0 && (x + 2) < this.scope){
                if ((this.mapBalls[y - 2][x - 2] !== 0) && this.mapBalls[y - 1][x - 1] !== 0 && this.mapBalls[y + 1][x + 1] !== 0 && this.mapBalls[y + 2][x + 2] !== 0 ) {
                    if (this.mapBalls[y - 2][x - 2].color === color && this.mapBalls[y - 1][x - 1].color === color && this.mapBalls[y + 1][x + 1].color === color && this.mapBalls[y + 2][x + 2].color === color ) {
                        this.addToBallsFive(this.mapBalls[y][x]);
                        this.addToBallsFive(this.mapBalls[y - 2][x - 2]);
                        this.addToBallsFive(this.mapBalls[y - 1][x - 1]);
                        this.addToBallsFive(this.mapBalls[y + 1][x + 1]);
                        this.addToBallsFive(this.mapBalls[y + 2][x + 2]);
                        flag = true;
                    }
                }
            }
        }
    }
    return flag
};


Field.prototype.addToBallsFive = function (b) {
    var f = true;
    if (this.ballsFive.length === 0){
        this.ballsFive.push(b);
    } else {
        for (var i = 0; i < this.ballsFive.length; i++){
            if (b.xMap === this.ballsFive[i].xMap && b.yMap === this.ballsFive[i].yMap){
                f = false;
            }
        }
        if (f){
            this.ballsFive.push(b);
        }
    }
};

Field.prototype.youLoser = function () {
    if (this.balls.length === (this.scope * this.scope)) {
        this.lose.position.set(width / 4, height /2);
        this.addChild (this.lose);
    }
};
