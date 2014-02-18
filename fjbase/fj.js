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

const GravSpeed = 0.5;	//Constant for gravity

var player;
var bgX = 0;
var bgH = 0;
var waitingToStart = true;
var dead = false;
var button = false;
var gravity = true;
var jumping = false;
var falling = false;

function anythingWasPressed() {
	return game.keyboard.isPressed("left") || game.keyboard.isPressed("right") || game.mouse.buttons[0];
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
		player.y = 400;
		player.vx = this.camera.vx;
		if (anythingWasPressed()) {
			//game.sounds.play("music", true);
			waitingToStart = false;
			this.camera.vx = 1;

		}}

	player.move(elapsedMillis);

	if (!dead){
		player.x = this.camera.x + 150;
	}
	
	bgX -= this.camera.vx / 1.5 * elapsedMillis;
	var bgW = game.images.get("bg").width;
	if (bgX > bgW) {
		bgX -= bgW;
	}
	
	//gravity
	/*if (!waitingToStart && gravity) {
		player.vy += elapsedMillis * 0.003;
	}*/
	if (!waitingToStart && gravity) {
		player.vy = GravSpeed;
	}
	
	//input
	if (game.keyboard.consumePressed("space")) {
		button = true;
	}
	
	//restart
	//if (dead && button) {
		//game.scenes.switchTo("title");
	//}
	
	//flap
	var jump = 0;
	if(button && !dead && !waitingToStart){
		button = false;
		gravity = false;
		jumping = true;
		falling = false;
		this.startTimer("jump up");
		player.vy = -.5;		
	}
	
	//timer for upwards flap
	var jumptime = this.timer("jump up");

	//if upwards flap, go fast then slow down
	if(jumping){
		//player.vy = 0- ((jumptime ) * .007);
		player.vy = -.5;
	}
	
	//if flap done
	if (jumptime > 400) {
		this.stopTimer("jump up");
			jumptime = 0;			//reset timer	
			jumping = false;		//not jumping
			gravity = true;			//turn gravity on again
		this.startTimer("fall down");	//start time for downwards fall
			falling = true;			//falling	
	} //else if (jumptime > 100) { jumping = false;}
	
	//timer for downwards fall
	/*var falltime = 500 - this.timer("fall down");

	//if downwards fall, 
	if (falling) {
		player.vy = ((falltime / 400));
	}
	
	//if fall done
	if (falltime < 200) {
		this.stopTimer("fall down"); //reset timer
		falltime = 0;
		gravity = true;
		falling = false;
		
	
	}*/
	
	//falling death
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