/*		if (Math.random() > 0.5) {
			img = game.animations.get(onRight ? "laser-right" : "laser-left");
			if (onRight) {
				obstacle = new Splat.AnimatedEntity(canvas.width - wallImg.width - img.width + 8 + 4, y + 10, 8, 211, img, -4, -10);
			} else {
				obstacle = new Splat.AnimatedEntity(x + 29, y + 10, 8, 211, img, -29, -10);\
			}
		} else {
			img = game.images.get("spikes");
			obstacle = new Splat.AnimatedEntity(x, y, img.width, img.height, img, 0, 0);
			if (onRight) {
				obstacle.draw = drawFlipped;
				obstacle.x = canvas.width - wallImg.width - img.width + 8;
			}
		}
		obstacles.push(obstacle);
*/


var canvas = document.getElementById("game");

var manifest = {
		"images" : {
			"player": "images/player.png",
			"bg": "images/bg.png",
			"obstacle": "images/obstacle.png"
		},
		"sounds": {
			
		},
		"fonts": [],
		"animations": {
			
		}
};


var game = new Splat.Game(canvas, manifest);

function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) {
		return parts.pop().split(";").shift();
	}
}
function getBest() {
	var b = parseInt(getCookie("bestScore"));
	if (isNaN(b) || b < 0 || !b) {
		b = 0;
	}
	return b;
}

function setBest(b) {
	best = b;
	var expire = new Date();
	expire.setTime(expire.getTime() + 1000 * 60 * 60 * 24 * 365);
	var cookie = "bestScore=" + best + "; expires=" + expire.toUTCString() + ";";
	document.cookie = cookie;
}

var player;
var bgX = 0;
var bgH = 0;
var score = 0;
var best = 0;
var waitingToStart = true;
var dead = false;
var button = false;
var jumping = false;
var falling = true;
var gravityon = true;
var obstacles = [];

function anythingWasPressed(){
	return game.keyboard.isPressed("space") || game.keyboard.isPressed("up") || game.mouse.buttons[0];
}

game.scenes.add("title", new Splat.Scene(canvas, function(){
	waitingtostart = true;
	var playerImg = game.images.get("player");
	player = new Splat.AnimatedEntity(50, canvas.height / 2, 40, 130, playerImg, -30, -13);
},
function(elapsedMillis){
	//waiting for input
	if (waitingToStart) {
		this.camera.vx = .8;
		falling = false;
		player.y = 400;
		player.vx = this.camera.vx;
		if (anythingWasPressed()) {
			//game.sounds.play("music", true);
			waitingToStart = false;
			player.y = 400;
			player.vx = this.camera.vx;
			this.startTimer("fall down");	//start time for downwards fall
			this.startTimer("obstacles");
			falling = true;
		}}

	for (var i = 0; i < obstacles.length; i++) {
		obstacles[i].move(elapsedMillis);
	}
		
	player.move(elapsedMillis);

	//set player x pos to left camera side
	/*if (!dead){
		player.x = this.camera.x + 150;
	}*/
	
	bgX -= this.camera.vx / 1.5 * elapsedMillis;
	//var bgW = game.images.get("bg").width;
	
	//input
	if (game.keyboard.consumePressed("space") || game.keyboard.consumePressed("up") || game.mouse.buttons[0]){
		button = true;
	}

	//On button hit
	if(button && !dead && !waitingToStart){
		button = false;
		gravity = false;
		jumping = true;
		falling = false;
		this.startTimer("jump up"); //Start jump timer
		this.stopTimer("fall down"); //stop falling
		falltime = 0;
	}
	
	//timer for upwards flap
	var jumptime = this.timer("jump up");

	//if upwards flap, go up
	if(jumping){
	nojump = true;
		//bounce: player.vy = 0- ((newjump ) * .007);
		//weird fast jump: player.vy = 0- ((200 - jumptime ) * .007);
		//regular jump:
		player.vy = -.9;
	}
	
	//if flap done
	if (jumptime > 150) {
	button = false;
		this.stopTimer("jump up");
			jumptime = 0;				//reset timer	
			jumping = false;			//not jumping
		this.startTimer("fall down");	//start time for downwards fall
			falling = true;				//falling	
	} 
	
	//gravity
	var falltime = this.timer("fall down");
	if (falling) {
		player.vy = (falltime) / 600;
	}
	
	//floor death
	var bgH = game.images.get("bg").height;
	if (player.y >= bgH - 90){
		dead = true;
		player.vy = 0;
		player.vx = 0; //- this.camera.vx + .8;
	}
	
	//ceiling
	if (player.y <= 0){
		player.y = 0;
		jumping = false;
		falling = true;
		this.startTimer("fall down");	//start time for downwards fall
	}
	
/********************
 ********************
 ********************
 ********************/
		img = game.images.get("obstacle");
		obstacle = new Splat.AnimatedEntity(canvas.width , 0, img.width, img.height, img, 0, 0);
		obstacles.push(obstacle);
		
		//while (obstacles.length > 0 && obstacles[0].y > this.camera.y + this.camera.height) {
		//	obstacles.shift();
		//}

	
	//scoring
	for (var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];
		if (!obstacle.counted && obstacle.y > player.y + player.height) {
			score++;
			//game.sounds.play("point");
			if (score > best) {
				setBest(score);
				//newBest = true;
			}
			obstacle.counted = true;
			console.log(score);
		}
		if (player.collides(obstacle)) {
			/*if (!this.timer("flash")) {
				var explode;
				if (player.sprite.name.indexOf("left") > -1) {
					explode = game.animations.get("player-explode-left");
				} else {
					explode = game.animations.get("player-explode-right");
				}
				explode.reset();
				player.sprite = explode;

				if (obstacle.sprite == game.animations.get("laser-left") || obstacle.sprite == game.animations.get("laser-right")) {
					game.sounds.play("laser");
				} else if (obstacle.sprite == game.images.get("spikes")) {
					game.sounds.play("spikes");
				}
			}
			this.startTimer("flash");*/
			falling = true;
			this.startTimer("fall time");
			this.camera.vx = 0;
			player.vy = 1;
			dead = true;
			return;
		}
	}

	
},
function(context){
	//context.drawImage(game.images.get("bg"),0,150);
	//Draw background tiling
	this.camera.drawAbsolute(context, function(){
		var bg = game.images.get("bg");
		for (var x = bgX - bg.width; x <= canvas.width; x += bg.width){
			context.drawImage(bg, x, 0 );
		}
	});
	
	//Draw obstacles
	/*this.camera.drawAbsolute(context, function(){
		var obstacle = game.images.get("obstacle");
		var canvasH = canvas.height - obstacle.height;
		for (var x = bgX; x <= canvas.width; x += 700)
		{
			var random = Math.random();
			context.drawImage(obstacle, x, 0);
			context.drawImage(obstacle, x, canvasH);
		}
	});*/
	
	for (var i = 0; i < obstacles.length; i++) {
		obstacles[i].draw(context);
	}
	
	player.draw(context);
	
	
}
));

game.scenes.switchTo("loading");