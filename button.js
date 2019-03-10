function Button  (name, img, width, height) {
    PIXI.Sprite.call(this);
    this.texture = PIXI.Texture.fromImage(img);
    this.name = name;
    this.width = width;
    this.height = height;
    this.anchor.set(0.5);
    this.interactive = true;
    this.zIndex = 0;
};

Button.prototype = Object.create(PIXI.Sprite.prototype);
