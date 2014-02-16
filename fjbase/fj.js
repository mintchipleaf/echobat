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
var waitingToStart = true;

function anythingWasPressed() {
	return game.keyboard.isPressed("left") || game.keyboard.isPressed("right") || game.mouse.buttons[0];
}

game.scenes.add("title", new Splat.Scene(canvas, function() {
	waitingtostart = true;
	var playerImg = game.images.get("player");
	player = new Splat.AnimatedEntity(50, canvas.height / 2, 40, 130, playerImg, -30, -13);
},
function(elapsedMillis){
	if (waitingToStart) {
		//this.camera.vy = 0.6;
		//player.vx = this.camera.vx;
		if (anythingWasPressed()) {
			//game.sounds.play("music", true);
			waitingToStart = false;
			this.camera.vx = 0.6;

		}}
	//player.vx = this.camera.vx;
	player.x = this.camera.x + 100;
	bgX -= this.camera.vx / 1.5 * elapsedMillis;
	var bgW = game.images.get("bg").width;
	if (bgX > bgW) {
		bgX -= bgW;
	}
	if (!waitingToStart) {
		player.vy += elapsedMillis * 0.003;
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