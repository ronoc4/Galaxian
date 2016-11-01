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
    this.spaceShip = new Image();
    this.bullet = new Image();
    //Check if images have loaded before game
    var numImages = 3;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded++;
        if (numLoaded === numImages) {
            window.init();
        }
    }
    this.background.onload = function() {
        imageLoaded();
    }
    this.spaceship.onload = function() {
        imageLoaded();
    }
    this.bullet.onload = function() {
        imageLoaded();
    }

    // Set images src
    this.background.src = "img/bg.png";
    this.spaceShip.src = "img/spaceShip.gif";
    this.bullet.src = "img/bullet.png";
};

/*
 Abstract object for the game
 */
function Drawable() {
    this.init = function (x, y) {
        // Default vars
        this.x = x;
        this.y = y;
        //Need to set the height and width of each object to it’s associated image.
        this.width = width;
        this.height = height;
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



/**
 * Custom Pool object. Holds Bullet objects to be managed to prevent
 * garbage collection.
 *
 * http://blog.sklambert.com/html5-canvas-game-the-player-ship/#the-player-ship
 * http://gamedev.tutsplus.com/tutorials/implementation/object-pools-help-you-reduce-lag-in-resource-intensive-games/
 */
function Pool(maxSize) {
    var size = maxSize; // Max bullets allowed in the pool
    var pool = [];
    /*
     * Populates the pool array with Bullet objects
     */
    this.init = function() {
        for (var i = 0; i < size; i++) {
            // Initalize the bullet object
            var bullet = new Bullet();
            bullet.init(0,0, imageRepository.bullet.width,
                imageRepository.bullet.height);
            pool[i] = bullet;
        }
    };
    /*
     * Grabs the last item in the list and initializes it and
     * pushes it to the front of the array.
     */
    this.get = function(x, y, speed) {
        if(!pool[size - 1].alive) {
            pool[size - 1].spawn(x, y, speed);
            pool.unshift(pool.pop());
        }
    };
    /*
     * Used for the ship to be able to get two bullets at once. If
     * only the get() function is used twice, the ship is able to
     * fire and only have 1 bullet spawn instead of 2.
     */
    this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
        if(!pool[size - 1].alive &&
            !pool[size - 2].alive) {
            this.get(x1, y1, speed1);
            this.get(x2, y2, speed2);
        }
    };
    /*
     * Draws any in use Bullets. If a bullet goes off the screen,
     * clears it and pushes it to the front of the array.
     */
    this.animate = function() {
        for (var i = 0; i < size; i++) {
            // Only draw until we find a bullet that is not alive
            if (pool[i].alive) {
                if (pool[i].draw()) {
                    pool[i].clear();
                    pool.push((pool.splice(i,1))[0]);
                }
            }
            else
                break;
        }
    };
}

function Bullet() {
    //If true, Bullet is in use
    this.alive = false;

    //Sets Bullet values
    this.spawn = function (x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };

    /*
     * Uses a "dirty rectangle" to erase the bullet and moves it.
     * Returns true if the bullet moved off the screen, indicating that
     * the bullet is ready to be cleared by the pool, otherwise draws
     * the bullet.
     */
    this.draw = function () {
      this.context.clearRect(this.x, this.y, this.width, this.height);
        this.y -= this.speed;
        if( this.y <= 0 - this.height) {
            return true;
        } else {
            this.context.drawImage(ImageRepository.bullet, this.x, this.y);
        }
    };

    // Resets bullet values
    this.clear = function () {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
}

Bullet.prototype = new Drawable();

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


