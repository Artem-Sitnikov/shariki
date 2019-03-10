function GameFrame() {
    Sprite.call(this);
    this.field = [];
    this.afterDisco = false;
    this.bonusActive = [];
    this.textur = [new PIXI.Texture.fromImage("box"), new PIXI.Texture.fromImage("icon_1"), new PIXI.Texture.fromImage("icon_2"), new PIXI.Texture.fromImage("icon_3"), new PIXI.Texture.fromImage("icon_4"), new PIXI.Texture.fromImage("icon_5"), new PIXI.Texture.fromImage("icon_6"), new PIXI.Texture.fromImage("icon_bomb"), new PIXI.Texture.fromImage("icon_rocket"), new PIXI.Texture.fromImage("icon_disco"), new PIXI.Texture.fromImage("icon_particle")];
    this.xPos = CONFIG.application.startField.xPos;
    this.start = [].concat(CONFIG.application.startField.field);
    this.income = [].concat(CONFIG.application.incomeSeq);
    this.afterIncome = [].concat(CONFIG.application.startField.afterDiscoField);
    this.searchRegion = this.searchRegion.bind(this);
    this.emitWin = this.emitWin.bind(this);
    this.formStartField();
    this.updatezOrder();

    // this.onResize();
    // this.gameField.width = LayoutManager.gameWidth;
    // this.gameField.height = LayoutManager.gameHeight;
}

GameFrame.prototype = Object.create(Sprite.prototype);

GameFrame.prototype.formStartField = function () {
    this.iconTextures = [];
    var t = new PIXI.Texture.fromImage("icon_blast");
    for (var i = 0; i < 12; i++) {
        var tex = new PIXI.Texture(t, new PIXI.Rectangle(Math.floor(i / 4) * 128, Math.floor(i / 4) * 128, 128, 128));
        this.iconTextures.push(tex);
    }

    this.iconCombineTextures = [];
    var t = new PIXI.Texture.fromImage("icon_combine");
    for (var i = 0; i < 12; i++) {
        var tex = new PIXI.Texture(t, new PIXI.Rectangle(Math.floor(i / 4) * 128, Math.floor(i / 4) * 128, 128, 128));
        this.iconCombineTextures.push(tex);
    }

    this.starsTextures = [];
    var t = new PIXI.Texture.fromImage("sparkle2");
    for (var i = 0; i < 12; i++) {
        var tex = new PIXI.Texture(t, new PIXI.Rectangle(i * 72, 0, 72, 72));
        this.starsTextures.push(tex);
    }

    this.starfallTextures = [];
    var t = new PIXI.Texture.fromImage("sparkle");
    for (var i = 0; i < 45; i++) {
        var tex = new PIXI.Texture(t, new PIXI.Rectangle((i % 8) * 128, Math.floor(i / 8) * 128, 128, 128));
        tex.a = i;
        this.starfallTextures.push(tex);
    }

    this.le = this.start.length;
    for (var i = 0; i < this.start.length; i++) {
        this.field[i] = [];
        for (var q = 0; q < this.start[i].length; q++) {
            var item = this.createItem(i, q, this.start[i][q]);
            this.addChild(item);
            this.field[i].push(item);
        }
    }
    this.updateView();
};
GameFrame.prototype.createItem = function (y, x, color) {

    var brick = this.addChild(new Sprite());

    brick.posX = x;
    brick.posY = y;
    brick.color = color;
    brick.power = 0;
    brick.diffY = 0;
    brick.isBonus = false;
    brick.position.set(this.xPos[x], -400 + (y * 100));
    var tex;
    if (color <= 6) {
        tex = new PIXI.Texture(this.textur[color], new PIXI.Rectangle(0, 0, 100, 120));
    }

    if (color > 6) {
        if (color === 7) {
            tex = new PIXI.Texture(this.textur[color], new PIXI.Rectangle(0, 0, 105, 105));
            brick.bonusType = "bomb";
        }
        if (color === 8) {
            tex = new PIXI.Texture(this.textur[8], new PIXI.Rectangle(0, 0, 100, 100));
            brick.bonusType = "rocketV";
        }

        if (color === 9) {
            tex = new PIXI.Texture(this.textur[8], new PIXI.Rectangle(0, 100, 100, 100));
            brick.bonusType = "rocketH";
        }

        if (color > 9) {
            var mult;
            switch (color) {
                case 10: {
                    mult = 0;
                    brick.bonusType = "doubledisco";
                    break;
                }
                case 11: {
                    mult = 1;
                    brick.bonusType = "doubledisco"; // normal state - disco
                    break;
                }
                case 12: {
                    mult = 2;
                    brick.bonusType = "doubledisco"; // normal state - disco
                    break;
                }
                case 13: {
                    mult = 3;
                    brick.bonusType = "doubledisco"; // normal state - disco
                    break;
                }
                case 14: {
                    mult = 4;
                    brick.bonusType = "doubledisco"; // normal state - disco
                    break;
                }
                case 15: {
                    mult = 5;
                    brick.bonusType = "doubledisco"; // normal state - disco
                    break;
                }
                case 16: {
                    mult = 6;
                    brick.bonusType = "doubledisco"; // normal state - disco
                    break;
                }
            }
            tex = new PIXI.Texture(this.textur[9], new PIXI.Rectangle(0, mult * 100, 100, 100));
        }

        brick.isBonus = true;
        brick.y += 10;

        var expl = brick.addChild(new Sprite.fromTextures(this.iconCombineTextures));
        expl.loop = false;
        expl.scale.set(3);
        expl.animationSpeed = 0.8;
        expl.onComplete = (function (exp) {
            this.removeChild(exp);
        }).bind(brick, expl);
    }

    brick.texture = tex;
    if (color > 6) this.showStars(brick);
    if (color != 0) brick.on("pointerdown", this.operateClick, this);
    return brick;
};

GameFrame.prototype.operateClick = function (e) {
    if (this.interactiveChildren === false) return;
    // console.log(e.target.posY, e.target.posX);
    // debugger
    if (e.target.isBonus) {
        this.applyBonus(e.target);
    } else {
        this.region = [];
        this.searchRegion(e.target.posY, e.target.posX);
        if (this.confirmRegion(this.region) <= 1) return;
        var power = this.region[0].power;
        // console.log("r = " + this.region.length);
        this.onClickActions(power, this.region, {x: e.target.posX, y: e.target.posY});
    }
};

GameFrame.prototype.updateView = function () {
    for (var i = 0; i < this.field.length; i++) {
        for (var q = 0; q < this.field[i].length; q++) {
            this.region = [];
            this.searchRegion(i, q);
            this.updateRegion(this.region);
        }
    }
};

GameFrame.prototype.searchRegion = function (y, x) {
    if (this.field[y][x] === null) return;
    for (var z = 0; z < this.region.length; z++) {
        if (this.region[z].posY === y && this.region[z].posX === x) return;
    }
    this.region.push(this.field[y][x]);
    if (this.field[y][x].color === 0) return;
    if ((y - 1) >= 0 && this.field[y - 1][x] != null) {
        if ((this.field[y - 1][x] != null) && (this.field[y - 1][x].color === this.field[y][x].color || this.field[y - 1][x].color === 0)) {
            this.searchRegion(y - 1, x);
        }
    }
    if ((y + 1) <= (this.le-1) && this.field[y + 1][x] != null) {
        if ((this.field[y + 1][x] != null) && (this.field[y + 1][x].color === this.field[y][x].color || this.field[y + 1][x].color === 0)) {
            this.searchRegion(y + 1, x);
        }
    }
    if ((x - 1) >= 0 && this.field[y][x - 1] != null) {
        if ((this.field[y][x - 1] != null) && (this.field[y][x - 1].color === this.field[y][x].color || this.field[y][x - 1].color === 0)) {
            this.searchRegion(y, x - 1);
        }
    }
    if ((x + 1) <= 6 && this.field[y][x + 1] != null) {
        if ((this.field[y][x + 1] != null) && (this.field[y][x + 1].color === this.field[y][x].color || this.field[y][x + 1].color === 0)) {
            this.searchRegion(y, x + 1);
        }
    }
};

GameFrame.prototype.updateRegion = function (arr) {
    var effectiveLength = this.confirmRegion(arr);
    var power = 0;
    if (effectiveLength > 4 && effectiveLength < 7) {
        power = 1;
    }
    if (effectiveLength > 6 && effectiveLength < 9) {
        power = 2;
    }
    if (effectiveLength > 8) {
        power = 3
    }

    for (var s = 0; s < arr.length; s++) {
        if (arr[s].color === 0 || arr[s].isBonus) return;
        arr[s].power = power;
        var tex = new PIXI.Texture(this.textur[arr[s].color], new PIXI.Rectangle(0, power * 120, 100, 120));
        arr[s].texture = tex;
    }
};

GameFrame.prototype.updatezOrder = function () {
    this.children.sort(function (a, b) {
        return (b.y - a.y) || (b.x - a.x) || 0;
    });
};

GameFrame.prototype.onClickActions = function (p, reg, start) {

    this.interactiveChildren = false;
    if (p === 0) {
        for (var i = 0; i < reg.length; i++) {
            this.field[reg[i].posY][reg[i].posX] = null;
            this.destroyItem(reg[i]);
        }
        this.checkEmptyField();
    }

    if (p > 0) {
        for (var i = 0; i < reg.length; i++) {
            if (reg[i].color != 0) {
                // var fr = reg[i].addChild(new Sprite("frame"));
                // fr.y += 10;
                var dx = 0, dy = 0;
                if (reg[i].posX > start.x) {
                    dx = 20;
                } else if (reg[i].posX < start.x) {
                    dx = -20;
                }

                if (reg[i].posY > start.y) {
                    dy = 20;
                } else if (reg[i].posY < start.y) {
                    dy = -20;
                }
                reg[i].moveTo(reg[i].x + dx, reg[i].y + dy, 60);
            }
        }
        setTimeout((function () {
            // debugger
            var total = 0;
            for (var q = 0; q < reg.length; q++) {

                if (reg[q].color === 0) {
                    this.field[reg[q].posY][reg[q].posX] = null;
                    this.destroyItem(reg[q]);
                } else {
                    var dist = this.calcDistance(this.field[start.y][start.x].x, reg[q].x, this.field[start.y][start.x].y, reg[q].y);
                    if (dist != 0) {
                        this.field[reg[q].posY][reg[q].posX] = null;
                        var time = 20000 / dist;
                        if (time > total) total = time;
                        // console.log("time = " + time);
                        reg[q].moveTo(this.field[start.y][start.x].x, this.field[start.y][start.x].y, time, null, (function (obj) {
                            this.emitScore(CONFIG.application.pointsPerBrick);
                            this.removeChild(obj);
                        }).bind(this, reg[q]));
                    }
                }
            }

            setTimeout((function () {
                // debugger
                // this.interactiveChildren = true;
                this.removeChild(this.field[start.y][start.x]);
                var ind;
                if (p === 1) {
                    ind = this.randomInteger(8, 9);
                }
                if (p === 2) {
                    ind = 7;
                }
                if (p === 3) {
                    ind = this.field[start.y][start.x].color + 10;
                }

                this.field[start.y][start.x] = this.addChild(this.createItem(start.y, start.x, ind));
                this.checkEmptyField();

            }).bind(this), total * 1.05);
        }).bind(this), 80);
    }
};

GameFrame.prototype.calcDistance = function (x1, x2, y1, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
};

GameFrame.prototype.checkEmptyField = function () {
    if (this.bonusActive.length > 0) return;
    var l = this.field[0].length;
    for (var q = 0; q < l; q++) {
        this.changed = true;
        while (this.changed) {
            this.changed = false;
            for (var i = this.field.length - 2; i >= 0; i--) {
                if (this.field[i + 1][q] === null && this.field[i][q] != null && this.field[i][q] != undefined) {
                    this.changed = true;
                    this.pullDown(i, q);
                }
            }
        }
    }
    // console.log(this.field);
    this.moveField();
};

GameFrame.prototype.pullDown = function (y, x) {
    if ((y) >= 0) {
        this.field[y + 1][x] = this.field[y][x];
        this.field[y + 1][x].posY = y + 1;
        this.field[y + 1][x].diffY += 100;
        this.field[y][x] = null;
    }
};

GameFrame.prototype.applyBonus = function (obj) {
    this.interactiveChildren = false;
    var type = this.checkBonus(obj);
    console.log(type);
    this.bonusActive.push({});
    if (type === "rocketH") {
        this.emitScore(CONFIG.application.pointsPerBonus);
        this.removeChild(obj);
        this.showRockets(obj, type);

        var regLeft = [];
        for (var i = obj.posX - 1; i >= 0; i--) {
            regLeft.push(this.field[obj.posY][i]);
            this.field[obj.posY][i] = null;
        }

        var regRight = [];
        for (var q = obj.posX + 1; q < 7; q++) {
            regRight.push(this.field[obj.posY][q]);
            this.field[obj.posY][q] = null;
        }

        var ll = regLeft.length;
        var rl = regRight.length;
        var delay = 100;

        for (var a = 0; a < ll; a++) {
            setTimeout((function (obj) {
                this.destroyItem(obj)
            }).bind(this, regLeft[a]), a * delay);
        }

        for (var z = 0; z < rl; z++) {
            setTimeout((function (obj) {
                this.destroyItem(obj)
            }).bind(this, regRight[z]), z * delay);
        }
        this.field[obj.posY][obj.posX] = null;
        var time = (ll > rl) ? ll * delay : rl * delay;

        setTimeout((function () {
            this.bonusActive.shift();
            this.checkEmptyField();
        }).bind(this), time * 1.05);
    }

    if (type === "rocketV") {
        this.emitScore(CONFIG.application.pointsPerBonus);
        this.removeChild(obj);
        this.showRockets(obj, type);

        var regUp = [];
        for (var i = obj.posY - 1; i >= 0; i--) {
            regUp.push(this.field[i][obj.posX]);
            this.field[i][obj.posX] = null;
        }

        var regDown = [];
        for (var q = obj.posY + 1; q < this.le; q++) {
            regDown.push(this.field[q][obj.posX]);
            this.field[q][obj.posX] = null;
        }

        var ul = regUp.length;
        var dl = regDown.length;
        var delay = 100;

        for (var a = 0; a < ul; a++) {
            setTimeout((function (obj) {
                this.destroyItem(obj)
            }).bind(this, regUp[a]), a * delay);
        }

        for (var z = 0; z < dl; z++) {
            setTimeout((function (obj) {
                this.destroyItem(obj)
            }).bind(this, regDown[z]), z * delay);
        }
        this.field[obj.posY][obj.posX] = null;
        var time = (ul > dl) ? ul * delay : dl * delay;

        setTimeout((function () {
            this.bonusActive.shift();
            this.checkEmptyField();
        }).bind(this), time * 1.05);
    }

    if (type === "bomb") {
        this.emitScore(CONFIG.application.pointsPerBonus);
        var coords = [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: -1, y: 1}, {
            x: -1,
            y: 0
        }, {x: -1, y: -1}];
        var reg = [];
        for (var t = 0; t < coords.length; t++) {
            if (this.field[obj.posY + coords[t].y] && this.field[obj.posY + coords[t].y][obj.posX + coords[t].x] != null && this.field[obj.posY + coords[t].y][obj.posX + coords[t].x] != undefined)
                reg.push(this.field[obj.posY + coords[t].y][obj.posX + coords[t].x]);
        }

        this.removeChild(obj);
        this.showBoom(obj, false);
        this.field[obj.posY][obj.posX] = null;

        for (var e = 0; e < reg.length; e++) {
            if (reg[e].isBonus) {
                this.applyBonus(reg[e]);
            } else {
                this.field[reg[e].posY][reg[e].posX] = null;
                this.destroyItem(reg[e]);
            }
        }
        this.bonusActive.shift();
        this.checkEmptyField();

    }

    if (type === "disco") {
        this.field[obj.posY][obj.posX] = null;
        this.showStarFall(obj);
        obj.visible = false;
        var reg = [];
        var currentColor = obj.color - 10;
        for (var v = 0; v < this.field.length; v++) {
            for (var c = 0; c < this.field[v].length; c++) {
                if (this.field[v][c] && this.field[v][c].color === currentColor) {
                    reg.push(this.field[v][c]);
                }
            }
        }

        for (var p = 0; p < reg.length; p++) {
            this.searchRegion(reg[p].posY, reg[p].posX);
            for (var r = 0; r < this.region.length; r++) {
                if (reg.indexOf(this.region[r]) < 0) {
                    reg.push(this.region[r]);
                }
            }
        }

        for (var d = 0; d < reg.length; d++) {
            this.field[reg[d].posY][reg[d].posX] = null;
            this.destroyItem(reg[d]);
        }
        this.bonusActive.shift();
        this.checkEmptyField();
    }

    if (type === "bomborocket") {
        this.emitScore(CONFIG.application.pointsPerCombo);
        var coords = [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: -1, y: 1}, {
            x: -1,
            y: 0
        }, {x: -1, y: -1}];
        var reg = [obj];
        for (var t = 0; t < coords.length; t++) {
            if (this.field[obj.posY + coords[t].y] && this.field[obj.posY + coords[t].y][obj.posX + coords[t].x] != null && this.field[obj.posY + coords[t].y][obj.posX + coords[t].x] != undefined)
                reg.push(this.field[obj.posY + coords[t].y][obj.posX + coords[t].x]);
        }

        // this.removeChild(obj);
        this.showBoom(obj, false);
        // debugger

        for (var e = 0; e < reg.length; e++) {
            if (e % 2) {
                reg[e].bonusType = "rocketV";
                reg[e].color = 8;
            } else {
                reg[e].bonusType = "rocketH";
                reg[e].color = 9;
            }
        }

        for (var p = 0; p < reg.length; p++) {
            this.applyBonus(reg[p]);
        }

        if (this.afterDisco) {
            this.bonusActive.shift();
            var t = new Timer(1500, 0);
            t.once("finish", this.emitWin);

        } else {
            this.bonusActive.shift();
            this.checkEmptyField();
        }

    }

    if (type === "doublebomb") {
        var coords = [];
        this.emitScore(CONFIG.application.pointsPerCombo);
        for (var q = -3; q < 4; q++) {
            for (var i = -3; i < 4; i++) {
                coords.push({x: i, y: q});
            }
        }

        var reg = [];
        for (var t = 0; t < coords.length; t++) {
            if (this.field[obj.posY + coords[t].y] && this.field[obj.posY + coords[t].y][obj.posX + coords[t].x] != null && this.field[obj.posY + coords[t].y][obj.posX + coords[t].x] != undefined)
                reg.push(this.field[obj.posY + coords[t].y][obj.posX + coords[t].x]);
        }
        this.removeChild(obj);

        var tex = new PIXI.Texture(this.textur[7], new PIXI.Rectangle(0, 0, 105, 105));
        var bomb = this.addChild(new Sprite());
        bomb.position.set(obj.x, obj.y);
        bomb.texture = tex;

        bomb.scaleTo(3, 3, 300, null, (function () {
            bomb.scaleTo(2.5, 2.5, 70, null, (function () {
                bomb.scaleTo(3, 3, 70, null, (function () {
                    this.removeChild(bomb);
                    this.showBoom(obj, true);
                    this.field[obj.posY][obj.posX] = null;

                    for (var e = 0; e < reg.length; e++) {
                        if (reg[e].isBonus) {
                            // if(reg[e].bonusType === "bomb") {
                            //     reg[e].is
                            // } else {
                            this.applyBonus(reg[e]);
                            // }
                        } else {
                            this.field[reg[e].posY][reg[e].posX] = null;
                            this.destroyItem(reg[e]);
                        }
                    }
                    this.bonusActive.shift();
                    this.checkEmptyField();
                }).bind(this))
            }).bind(this));
        }).bind(this));

    }

    if (type === "doubledisco") {
        this.afterDisco = true;
        this.emitScore(CONFIG.application.pointsPerCombo);
        this.field[obj.posY][obj.posX] = null;
        this.showStarFall(obj);
        obj.visible = false;

        for (var q = 0; q < this.field.length; q++) {
            for (var i = 0; i < this.field[q].length; i++) {
                if (this.field[q] && this.field[q][i]) {
                    var obj = this.field[q][i];
                    this.field[q][i] = null;
                    this.destroyItem(obj);
                }
            }
        }
        this.bonusActive.shift();
        this.checkEmptyField();
    }

};

GameFrame.prototype.randomInteger = function (min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
};

GameFrame.prototype.destroyItem = function (obj) {
    if (obj === null || obj === undefined) return;
    if (obj.color === 0) {
        obj.scaleTo(0, 0, 10);
        this.removeChild(obj);
        var expl = this.addChild(new Sprite.fromPattern("explosion/"));
        expl.scale.set(0.95);
        expl.position.set(obj.x - 25, obj.y + 190);
        expl.loop = false;
        expl.animationSpeed = 0.6;
        expl.onComplete = (function () {
            this.removeChild(expl);
        }).bind(this, expl);
    }
    if (obj.color > 0 && obj.color < 7) {
        obj.scaleTo(0, 0, 50);
        this.removeChild(obj);
        this.showParts(obj);
        this.emitScore(CONFIG.application.pointsPerBrick);
        var expl = this.addChild(new Sprite.fromTextures(this.iconTextures));
        expl.loop = false;
        expl.scale.set(3);
        expl.animationSpeed = 0.8;
        expl.position.set(obj.x, obj.y);
        expl.onComplete = (function (exp) {
            this.removeChild(exp);
        }).bind(this, expl);
    }
    if (obj.color > 6) {
        this.applyBonus(obj);
    }
};

GameFrame.prototype.moveField = function () {
    this.interactiveChildren = false;
    var total = 0;
    for (var i = 0; i < this.field.length; i++) {
        for (var q = 0; q < this.field[i].length; q++) {
            if (this.field[i][q] != null) {
                var t = this.field[i][q].diffY;
                this.field[i][q].diffY = 0;
                if (t > total) total = t;
                this.field[i][q].moveTo(this.field[i][q].x, this.field[i][q].y + t, t);
            }
        }
    }

    setTimeout(this.addItems.bind(this), total);
};


GameFrame.prototype.addItems = function () {
    console.log("added");
    var incomeReg = [];
    // debugger
    // console.log(this.field);
    var l = this.field[0].length;
    for (var q = 0; q < l; q++) {
        for (var i = this.field.length - 1; i >= 0; i--) {
            if (this.field[i][q] === null) {
                var inc;
                if (this.afterDisco) {
                    // debugger
                    inc = this.afterIncome.shift();
                } else {
                    inc = this.income.shift();
                }
                if (inc != undefined) {
                    var item = this.createItem(i, q, inc);
                    this.field[i][q] = item;

                    item.y -= 1500;

                    incomeReg.push(item);
                    this.addChild(item);
                } else {
                    this.emitWin();
                }
            }
        }
    }

    console.log(incomeReg.length);
    for (var z = 0; z < incomeReg.length; z++) {
        incomeReg[z].moveTo(incomeReg[z].x, incomeReg[z].y + 1500, 350);
    }


    setTimeout((function () {
        this.updatezOrder();
        this.updateView();
        this.interactiveChildren = true;
    }).bind(this), 400);
};

GameFrame.prototype.confirmRegion = function (array) {
    var effectiveLength = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i].color != 0) {
            effectiveLength.push(array[i]);
        }
    }
    return effectiveLength.length;
};


GameFrame.prototype.showStars = function (obj) {
    var expl = obj.addChild(new Sprite.fromTextures(this.starsTextures));
    expl.loop = false;
    expl.scale.set(3);
    expl.animationSpeed = 0.4;
    expl.onComplete = (function (exp) {
        obj.removeChild(exp);
    }).bind(obj, expl);
};

GameFrame.prototype.showStarFall = function (obj) {
    var expl = this.addChild(new Sprite.fromTextures(this.starfallTextures));
    expl.loop = false;
    expl.scale.set(3);
    expl.animationSpeed = 0.4;
    expl.position.set(obj.x, obj.y);
    expl.onComplete = (function (exp) {
        obj.removeChild(exp);
        if (obj.parent) obj.parent.removeChild(obj);
    }).bind(obj, expl);
};


GameFrame.prototype.showParts = function (obj) {
    var tex = new PIXI.Texture.fromImage("icon_particle");
    var t = new PIXI.Texture(tex, new PIXI.Rectangle(0, (obj.color - 1) * 52, 52, 52));
    var part = this.addChild(ParticlesSprite.create([t], ICON_EMITTER)); //new PIXI.Texture.fromImage("chest_particle"),
    part.position.set(obj.x, obj.y);
    // this.updatezOrder();
    setTimeout((function (o) {
        this.removeChild(o);
    }).bind(this, part), 1500);
};

GameFrame.prototype.showRockets = function (obj, type) {

    var rot, dx = 0, dy = 0;
    if (type === "rocketV") {
        rot = Math.PI / 2;
        dx = -40;
    } else {
        rot = 0;
        dy = 40;
    }

    var rocket = this.addChild(new Sprite.fromPattern("rocket/"));
    rocket.scale.set(3.5);
    rocket.position.set(obj.x + dx, obj.y + dy);
    rocket.loop = false;
    rocket.rotation = rot;
    rocket.animationSpeed = 0.6;
    rocket.onComplete = (function (r) {
        this.removeChild(r);
    }).bind(this, rocket);
};

GameFrame.prototype.showBoom = function (obj, superBoom) {
    var boom = this.addChild(new Sprite.fromPattern("bomb/"));
    if (superBoom) {
        boom.scale.set(2);
    } else {
        boom.scale.set(1);
    }
    boom.position.set(obj.x, obj.y);
    boom.loop = false;
    boom.animationSpeed = 0.6;
    boom.onComplete = (function (r) {
        this.removeChild(r);
    }).bind(this, boom);
};

GameFrame.prototype.checkBonus = function (obj) {
    var y = obj.posY;
    var x = obj.posX;

    var breg = [];
    breg.push(obj);
    if ((y - 1) >= 0 && this.field[y - 1][x] != null) {
        if (this.field[y - 1][x].isBonus) {
            breg.push(this.field[y - 1][x]);
        }
    }
    if ((y + 1) <= (this.le-1) && this.field[y + 1][x] != null) {
        if (this.field[y + 1][x].isBonus) {
            breg.push(this.field[y + 1][x]);
        }
    }
    if ((x - 1) >= 0 && this.field[y][x - 1] != null) {
        if (this.field[y][x - 1].isBonus) {
            breg.push(this.field[y][x - 1]);
        }
    }
    if ((x + 1) <= 6 && this.field[y][x + 1] != null) {
        if (this.field[y][x + 1].isBonus) {
            breg.push(this.field[y][x + 1]);
        }
    }

    if (breg.length > 1) {
        // debugger
        if ((breg[0].color === 7 && (breg[1].color === 8 || breg[1].color === 9)) || (breg[1].color === 7 && (breg[0].color === 8 || breg[0].color === 9))) {
            return "bomborocket";
        }

        if ((breg[0].color === 7 && breg[1].color === 7)) {
            return "doublebomb";
        }

        if ((breg[0].color === 8 && (breg[1].color === 8 || breg[1].color === 9)) || (breg[0].color === 9 && (breg[1].color === 8 || breg[1].color === 9))) {
            return breg[0].bonusType;
        }

        if ((breg[0].color > 9 && breg[1].color > 9)) {
            return "doubledisco";
        }

        if ((breg[0].color === 8 && (breg[1].color > 9)) || (breg[0].color === 9 && (breg[1].color > 9))) {
            return obj.bonusType;
        }

        if ((breg[0].color > 9 && ((breg[1].color === 8 || breg[1].color === 9)))) {
            return obj.bonusType;
        }

        if ((breg[0].color === 7 && breg[1].color > 9) || (breg[1].color === 7 && breg[0].color > 9)) {
            return obj.bonusType;
        }

    } else {
        return obj.bonusType;
    }

};

GameFrame.prototype.emitScore = function (numb) {
    this.emit("scorechange", {score: numb});
};

GameFrame.prototype.emitWin = function () {
    this.emit("win");
};

GameFrame.prototype.detgesrt = function () {

};

GameFrame.prototype.detgesrt = function () {

};

GameFrame.prototype.detgesrt = function () {

};

GameFrame.prototype.detgesrt = function () {

};

GameFrame.prototype.detgesrt = function () {

};

GameFrame.prototype.detgesrt = function () {

};

GameFrame.prototype.detgesrt = function () {

};

GameFrame.prototype.detgesrt = function () {

};


