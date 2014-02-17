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

function anythingWasPressed() {
	return game.keyboard.isPressed("left") || game.keyboard.isPressed("right") || game.mouse.buttons[0];
}

game.scenes.add("title", new Splat.Scene(canvas, function() {
	waitingtostart = true;
	var playerImg = game.images.get("player");
	player = new Splat.AnimatedEntity(50, canvas.height / 2, 40, 130, playerImg, -30, -13);
},
function(elapsedMillis){
	if (!dead){
	player.x = this.camera.x + 150;
	}
	//waiting for input
	if (waitingToStart) {
		this.camera.vx = 0.6;
		player.y = 400;
		player.vx = this.camera.vx;
		if (anythingWasPressed()) {
			//game.sounds.play("music", true);
			waitingToStart = false;
			this.camera.vx = 0.6;

		}}

	player.move(elapsedMillis);
	
	bgX -= this.camera.vx / 1.5 * elapsedMillis;
	var bgW = game.images.get("bg").width;
	if (bgX > bgW) {
		bgX -= bgW;
	}
	
	//gravity
	if (!waitingToStart) {
		player.vy += elapsedMillis * 0.003;
	}
	if (!waitingToStart) {
		player.vy = 0.25;
	}
	
	//input
	if (game.keyboard.consumePressed("space")) {
		button = true;
	}
	
	//restart
	//if (dead && button) {
		//game.scenes.switchTo("title");
	//}
	
	//jump
	if(button && !dead && !waitingToStart){
		button = false;
		this.startTimer("jump up");
		player.vy = -10;
	}
	var jumptime = this.timer("jump up");
	if (jumptime > 200) {
		this.stopTimer("jump up");
			jumptime = 0;
	}
	
	//falling death
	var bgH = game.images.get("bg").height;
	if (player.y >= bgH - 90) {
		dead = true;
		player.vy = 0;
		player.vx = 0 - this.camera.vx + .8;
	}
	
	//ceiling
	if (player.y <= 0) {
			alert("whomp2");
		player.y = 0;
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