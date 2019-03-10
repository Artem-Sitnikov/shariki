

function Reset (name, img, width, height){
    Button.call(this, name, img, width, height);

};

Reset.prototype = Object.create(Button.prototype);

