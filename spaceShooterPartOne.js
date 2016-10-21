/**
 * Created by conor on 10/21/16.
 */
/*
  Creating singleton object for images
 https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
 */
var ImageRepository = new function () {
    // Define images
  this.background = new Image();
    // Set images src
  this.background.src = "img/bg.png";
};

/*
 Abstract object for the game
 */
function Drawable() {
    this.init = function (x, y) {
        // Default vars
        this.x = x;
        this.y = y;
    };
    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeigt = 0;

    // Abstract function for child objects
    this.draw = function () {

    };
}

/*
 Creates the Background object which will become a child of
 the Drawable object. The background is drawn on the "background"
 canvas and creates the illusion of moving by panning the image.
 */
function Background() {
    this.speed = 1;
    this.draw = function () {
        //Pan background
      this.y += this.speed;

        this.context.drawImage(ImageRepository.background, this.x, this.y);
        //Draw image on top of other image
        this.context.drawImage(ImageRepository.background, this.x, this.y -this.canvasHeigt);

        //Image reset
        if(this.y >= this.canvasHeigt) {
          this.y = 0;
      }

    };
}

// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();

