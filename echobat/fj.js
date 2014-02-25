var canvas = document.getElementById("game");

var manifest = {
		"images" : {
			"player": "images/player.png",
			"bg": "images/bg.png",
			"obstacle": "images/obstacle.png"
		},
		"sounds": {
			//"echo": "sounds/echo.wav"
			
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

function echo(scene) {
	var echo = scene.timer("echo");
	if (echo > 400) {
		scene.stopTimer("echo");
		echoing = false;
	}
	if (!echo) {
		scene.startTimer("echo");
	}
}

function addObstacles(scene) {
	var lastObstacle = obstacles[obstacles.length -1];
	var nextObstacleX = scene.camera.x + scene.camera.width;
	var gapHeight = 280;
	var minGapY = 200;
	var maxGapY = canvas.height - minGapY;
	var gapY = minGapY + (Math.random() * (maxGapY - minGapY - gapHeight));

	if (lastObstacle) {
		nextObstacleX = lastObstacle.x + 800;
	} if (!lastObstacle || lastObstacle.x < scene.camera.x + scene.camera.width) {
		var img = game.images.get("obstacle");
		var obstacle = new Splat.AnimatedEntity(nextObstacleX , gapY - img.height, img.width, img.height, img, 0, 0);
		obstacles.push(obstacle);
		var obstacle = new Splat.AnimatedEntity(nextObstacleX , gapY + gapHeight, img.width, img.height, img, 0, 0);
		obstacles.push(obstacle);	
	}
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
var echoing = false;
var newBest = false;
var obstacles = [];

function anythingWasPressed(){
	return game.keyboard.isPressed("space") || game.keyboard.isPressed("up") || game.mouse.buttons[0];
}
/****************************************************************/
game.scenes.add("title", new Splat.Scene(canvas, function(){
	waitingtostart = true;
	var playerImg = game.images.get("player");
	player = new Splat.AnimatedEntity(50, canvas.height / 2, 40, 130, playerImg, -30, -13);
	this.camera.x = 0;
	dead = false;
	waitingToStart = true;
	obstacles = [];
	score = 0;
	fading = 0;
	newBest = false;
},
/****************************************************************/
function(elapsedMillis){
	//waiting for input
	if (waitingToStart) {
		this.camera.vx = .6;
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
	
	bgX -= this.camera.vx / 1.5 * elapsedMillis;
	
	//input
	if (game.keyboard.consumePressed("space") || game.keyboard.consumePressed("up") || game.mouse.buttons[0]){
		button = true;
		game.mouse.buttons[0] = false;
	}

	//On button hit
	if(button && !dead && !waitingToStart) {
		button = false;
		gravity = false;
		jumping = true;
		falling = false;
		this.startTimer("jump up"); //Start jump timer
		this.stopTimer("fall down"); //stop falling
		falltime = 0;
		echoing = true;
		this.startTimer("echo");
	}
	
	//timer for upwards flap
	var jumptime = this.timer("jump up");

	//if upwards flap, go up
	if(jumping){
		nojump = true;
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
		player.vy = falltime / 600;
	}
	
	//floor death
	var bgH = game.images.get("bg").height;
	if (player.y >= bgH){
		dead = true;
		falling = false;
		//player.vy = 0;
		player.vx = 0;
		this.camera.vx = 0;
		this.camera.vy = 0;
	}
	
	//ceiling
	if (player.y <= 0){
		player.y = 0;
		jumping = false;
		falling = true;
		this.startTimer("fall down");	//start time for downwards fall
	}
	
	//draw obstacles
	if (!waitingToStart) {
		addObstacles(this);
	}
	
	//echo
	if (echoing) {
		echo(this);
	}
	
	//scoring
	for (var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];
		if (!obstacle.counted && obstacle.x + obstacle.width < player.x && obstacle.y > player.y && !dead) {
			score++;
			//game.sounds.play("point");
			if (score > best) {
				setBest(score);
				newBest = true;
			}
			obstacle.counted = true;
			console.log(score);
		}
		if (player.collides(obstacle)) {
			falling = true;
			this.startTimer("fall time");
			this.camera.vx = 0;
			player.vy = 1;
			dead = true;
			return;
		}
	}

	//death
	if (dead) {
		var ftb = this.timer("fade to black");
		if (ftb > 800) {
			this.stopTimer("fade to black");
			game.scenes.switchTo("title");
		}
		if (!ftb) {
			this.startTimer("fade to black");
		}
	}
},
/****************************************************************/
function(context){
	//background
	this.camera.drawAbsolute(context, function(){
		var bg = game.images.get("bg");
		for (var x = bgX - bg.width; x <= canvas.width; x += bg.width){
			context.drawImage(bg, x, 0 );
		}
	});
	
	//echo
	var echo = this.timer("echo");
	var opacity = 0;
	/*if (echo > 0) {
		opacity = 1 / (echo / 600);
		//console.log(opacity);
	}*/
	if (echo > 0) {
		opacity = (50 / echo);
		console.log(opacity);
	}
	
	//obstacles
	for (var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];
			context.fillStyle = "rgba(0, 150, 0, " + opacity + ")"
			context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
	}
	
	//player
	player.draw(context);
	
	//score
	this.camera.drawAbsolute(context, function(){	
		context.font = "100px consolas"
		context.fillStyle = "#FFFFFF"
		context.fillText(score, 100, 100);
	})
	
	//score fade screen
	var ftb = this.timer("fade to black");
	if (ftb > 0) {
		var opacity = ftb / 300;
		context.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
		context.fillRect(this.camera.x, this.camera.y, canvas.width, canvas.height);

		this.camera.drawAbsolute(context, function() {
			context.fillStyle = "#ffffff";
			context.font = "50px pixelade";
			context.fillText("SCORE", 0, 300);
			context.font = "100px pixelade";
			context.fillText(score, 0, 400);

			context.font = "50px pixelade";
			if (newBest) {
				context.fillStyle = "rgba(0, 150, 0, 1)";
				context.fillText("NEW BEST!", 0, 600);
			} else {
				context.fillText("BEST", 0, 600);
			}

			context.font = "100px pixelade";
			context.fillText(best, 0, 700);
		});
		return;
	}
}
));

game.scenes.switchTo("loading");
