var canvas = document.getElementById("game");

var manifest = {
		"images" : {
			"player": "images/player.png",
			"bg": "images/bg.png"
		},
		"sounds": {
			
		},
		"fonts": [],
		"animations": {
			
		}
};


var game = new Splat.Game(canvas, manifest);

var player;
var bgX = 0;
var bgH = 0;
var waitingToStart = true;
var dead = false;
var button = false;
var jumping = false;
var falling = true;
var gravityon = true;

function anythingWasPressed() {
	return game.keyboard.isPressed("space") || game.keyboard.isPressed("up") || game.mouse.buttons[0];
}

game.scenes.add("title", new Splat.Scene(canvas, function() {
	waitingtostart = true;
	var playerImg = game.images.get("player");
	player = new Splat.AnimatedEntity(50, canvas.height / 2, 40, 130, playerImg, -30, -13);
},
function(elapsedMillis){
	//waiting for input
	if (waitingToStart) {
		this.camera.vx = 1;
		falling = false;
		player.y = 400;
		player.vx = this.camera.vx;
		if (anythingWasPressed()) {
			//game.sounds.play("music", true);
			waitingToStart = false;
			player.y = 400;
			player.vx = this.camera.vx;
			this.startTimer("fall down");	//start time for downwards fall
			falling = true;
			this.camera.vx = 1;

		}}

	player.move(elapsedMillis);

	//set player x pos to left camera side
	if (!dead){
		player.x = this.camera.x + 150;
	}
	
	bgX -= this.camera.vx / 1.5 * elapsedMillis;
	//var bgW = game.images.get("bg").width;
	
	//input
	if (game.keyboard.consumePressed("space") || game.keyboard.consumePressed("up") || game.mouse.buttons[0]) {
		button = true;
	}

	//On button hit
	if(button && !dead && !waitingToStart){
		button = false;
		gravity = false;
		jumping = true;
		nojump = true;
		falling = false;
		this.startTimer("jump up"); //Start jump timer
		this.stopTimer("fall down"); //stop falling
		falltime = 0;
		player.vy = -.5;
	}
	
	//timer for upwards flap
	var jumptime = this.timer("jump up");

	//if upwards flap, go up
	if(jumping){
		//bounce: player.vy = 0- ((newjump ) * .007);
		//weird fast jump: player.vy = 0- ((200 - jumptime ) * .007);
		//regular jump:
		player.vy = -.5;
	}
	
	//if flap done
	if (jumptime > 200) {
		this.stopTimer("jump up");
			jumptime = 0;			//reset timer	
			jumping = false;		//not jumping
		this.startTimer("fall down");	//start time for downwards fall
			falling = true;			//falling	
	} 
	
	//gravity
	var falltime = this.timer("fall down");
	if (falling) {
		player.vy = (falltime) / 600;
	}
	
	//floor death
	var bgH = game.images.get("bg").height;
	if (player.y >= bgH - 90) {
		dead = true;
		player.vy = 0;
		player.vx = 0 - this.camera.vx + .8;
	}
	
	//ceiling
	if (player.y <= 0) {
		player.y = 0;
		jumping = false;
		falling = true;
		this.startTimer("fall down");	//start time for downwards fall

	}
	
},
function(context){
	//context.drawImage(game.images.get("bg"),0,150);
	this.camera.drawAbsolute(context, function() {
		var bg = game.images.get("bg");
		for (var x = bgX - bg.width; x <= canvas.width; x += bg.width)  {
			context.drawImage(bg, x, 0 );
		}
	});
	player.draw(context);
	
	
}
));

game.scenes.switchTo("loading");