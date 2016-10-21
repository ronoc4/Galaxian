/**
 * Created by conor on 10/21/16.
 *
 * Setting up the structure of the game and panning
 * a background
 *
 */

/* RESOURCES
 * 1. http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * 2. http://net.tutsplus.com/tutorials/javascript-ajax/prototypes-in-javascript-what-you-need-to-know/
 * 3. http://phrogz.net/js/classes/OOPinJS.html
 * 4. http://www.phpied.com/3-ways-to-define-a-javascript-class/
 */

/*
  Creating singleton object for images
 https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
 */

/*
 Initialize new game and start
 */
var game = new Game();

function init() {
    if(game.init())
        game.start();
}


var ImageRepository = new function () {
    // Define images
    this.empty = null;
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
    this.canvasHeight = 0;

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
    this.speed = 1; // Redefine speed of the background for panning

    // Implement abstract function
    this.draw = function() {
        // Pan background
        this.y += this.speed;
        this.context.drawImage(ImageRepository.background, this.x, this.y);

        // Draw another image at the top edge of the first image
        this.context.drawImage(ImageRepository.background, this.x, this.y - this.canvasHeight);

        // If the image scrolled off the screen, reset
        if (this.y >= this.canvasHeight)
            this.y = 0;
    };
}

// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();


/*
 Creates the Game object which will hold all objects and data for
 the game.
 */
function Game() {
    // Get the canvas element
    this.init = function() {
        // Get the canvas element
        this.bgCanvas = document.getElementById('background');

        // Test to see if canvas is supported
        if (this.bgCanvas.getContext) {
            this.bgContext = this.bgCanvas.getContext('2d');

            // Initialize objects to contain their context and canvas
            // information
            Background.prototype.context = this.bgContext;
            Background.prototype.canvasWidth = this.bgCanvas.width;
            Background.prototype.canvasHeight = this.bgCanvas.height;

            // Initialize the background object
            this.background = new Background();
            this.background.init(0,0); // Set draw point to 0,0
            return true;
        } else {
            return false;
        }
    };

    // Start the animation loop
    this.start = function() {
        animate();
    };
}


/*
 The animation loop. Calls the requestAnimationFrame shim to
 optimize the game loop and draws all game objects. This
 function must be a gobal function and cannot be within an
 object.
 */

function animate() {
    requestAnimationFrame( animate);
    game.background.draw();
}

/**
 requestAnim shim layer by Paul Irish
 Finds the first API that works to optimize the animation loop,
 otherwise defaults to setTimeout().
 https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();


