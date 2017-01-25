window.onload = init;

var map;
var ctxMap;

var pl;
var ctxPl;

var en;
var ctxEn;

var msl;
var ctxMsl;

var stats;
var ctxStats;

var drawBtn;
var clearBtn;

var gameWidth = 800;
var gameHeight = 500;

var background = new Image();
background.src = "bg.jpg"

var background1 = new Image();
background1.src = "bg.jpg"

var tiles = new Image();
tiles.src = "tiles.png"

var player;
var enemies = [];
var missile = [];
var numMsl = 0;

var isPlaying;
var health;

var mapX = 0;
var map1X = gameWidth;

//For creating enemies
var spawnInterval;
var spawnTime = 7000;
var spawnAmount = 10;

var mouseX;
var mouseY;

var mouseControl = true;

var requestAnimFrame = window.requestAnimationFrame || 
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame ||
						window.oRequestAnimationFrame ||
						window.msRequestAnimationFrame;

function init()
{
	map = document.getElementById("map");
	ctxMap = map.getContext("2d");
	
	pl = document.getElementById("player");
	ctxPl = pl.getContext("2d");
	
	en = document.getElementById("enemy");
	ctxEn = en.getContext("2d");
	
	msl = document.getElementById("missile");
	ctxMsl = msl.getContext("2d");
	
	stats = document.getElementById("stats");
	ctxStats = stats.getContext("2d");
	
	map.width = gameWidth;
	map.height = gameHeight;
	pl.width = gameWidth;
	pl.height = gameHeight;
	en.width = gameWidth;
	en.height = gameHeight;
	msl.width =  gameWidth;
	msl.height = gameHeight;
	stats.width = gameWidth;
	stats.height = gameHeight;
	
	ctxStats.fillStyle = "#3D3D3D";
	ctxStats.font = "bold 15pt Arial";
	
	changeBtn = document.getElementById("changeBtn");
	changeBtn.addEventListener("click", changeControl, false);

	player = new Player();
	
	resetHealth();
	
	startLoop();
	
	document.addEventListener("mousemove", mouseMove, false);
	document.addEventListener("click", mouseClick, false);
	document.addEventListener("keydown", checkKeyDown, false);
	document.addEventListener("keyup", checkKeyUp, false);

}

function changeControl(e) 
{
	mouseControl = !mouseControl;	
}

function mouseMove(e)
{
	if(!mouseControl) return;
	mouseX = e.pageX - map.offsetLeft;
	mouseY = e.pageY - map.offsetTop;
	player.drawX = mouseX - player.width/2;
	player.drawY = mouseY - player.height/2;
	
	document.getElementById("gameName").innerHTML = "X: " + mouseX + " Y: " + mouseY;
}

function mouseClick(e)
{
	if(!mouseControl) return;
	player.isFire = true;
	fire();
	
}

function resetHealth()
{
	health = 100;
}

function spawnEnemy(count)
{
	for(var i = 0; i < count; i++)
	{
		enemies[i] = new Enemy();
	}
}

function startCreatingEnemies()
{
	stopCreatingEnemies();
	spawnInterval = setInterval(function(){spawnEnemy(spawnAmount)}, spawnTime);
}

function stopCreatingEnemies()
{
	clearInterval(spawnInterval);
}

function createMissiles()
{
	missile[numMsl] = new Missile();
	numMsl++;
}

function fire()
{
	if(player.isFire)
		{
			createMissiles();
			player.isFire = false;
		}
}

function loop()
{
	if(isPlaying)
	{
		fire();
		draw();
		update();
		requestAnimFrame(loop);
	}
}

function startLoop()
{
	isPlaying = true;
	loop();
	startCreatingEnemies();
}

function stopLoop()
{
	isPlaying = false;
}

function draw()
{
	player.draw();
	clearCtxMissile();
	for( var i = 0; i < missile.length; i++)
	{
		missile[i].draw();
	}
	clearCtxEnemy();
	for( var i = 0; i < enemies.length; i++)
	{
		enemies[i].draw();
	}
}

function update()
{
	moveBg();
	drawBg();
	updateStats();
	player.update();
	for( var i = 0; i < missile.length; i++)
	{
		missile[i].update();
	}
	for( var i = 0; i < enemies.length; i++)
	{
		enemies[i].update();
	}
}

function moveBg()
{
	var vel = 4;
	mapX -= vel;
	map1X -= vel;
	if(mapX + gameWidth < 0) mapX = gameWidth-10;
	if(map1X + gameWidth < 0) map1X = gameWidth-10;
}


//Objects
function Player()
{
	this.srcX = 0;
	this.srcY = 0;
	this.drawX = 0;
	this.drawY = 0;
	this.width = 100;
	this.height = 100;
	
	this.speed = 6;
	
	//For keybord
	this.isUp = false;
	this.isDown = false;
	this.isRight = false;
	this.isLeft = false;
	this.isFire = false;
}

function Enemy()
{
	this.srcX = 0;
	this.srcY = 100;
	this.width = 60;
	this.height = 70;
	this.drawX = Math.floor(Math.random() * gameWidth) + gameWidth;
	this.drawY = Math.floor(Math.random() * (gameHeight - this.height));
	this.speed = 4.5;
}

function Missile()
{
	this.srcX = 0;
	this.srcY = 170;
	this.drawX = player.drawX + 100;
	this.drawY = player.drawY + 47;
	this.width = 9;
	this.height = 9;
	this.speed = 7;

}

Missile.prototype.draw = function()
{
	ctxMsl.drawImage(tiles, this.srcX, this.srcY, this.width, this.height,
			this.drawX, this.drawY, this.width, this.height);
}

Missile.prototype.update = function()
{
	this.drawX += this.speed;
	
	if(this.drawX  > gameWidth)
	{
		this.destroy();
	}
	
	for( var i = 0; i < enemies.length; i++)
	{
		if(this.drawX + this.width >= enemies[i].drawX &&
		this.drawY + this.height >= enemies[i].drawY &&
		this.drawX <= enemies[i].drawX + enemies[i].width &&
		this.drawY <= enemies[i].drawY + enemies[i].height )
		{
			enemies[i].destroy()
			this.destroy();
		}
	}
}

Missile.prototype.destroy = function()
{
	missile.splice(missile.indexOf(this), 1);
	numMsl = missile.length;
}

Enemy.prototype.draw = function()
{
	ctxEn.drawImage(tiles, this.srcX, this.srcY, this.width, this.height,
			this.drawX, this.drawY, this.width, this.height);
}

Enemy.prototype.update = function()
{
	this.drawX -= this.speed;
	if(this.drawX + this.width < 0)
	{
		this.destroy();
		health--;
	}
}

Enemy.prototype.destroy = function()
{
	enemies.splice(enemies.indexOf(this), 1);
}

Player.prototype.draw = function()
{
	clearCtxPlayer();
	ctxPl.drawImage(tiles, this.srcX, this.srcY, this.width, this.height,
		this.drawX, this.drawY, this.width, this.height);
}

Player.prototype.update = function()
{
	if(health < 0) resetHealth();
	
	if(this.drawX < 0) this.drawX = 0;
	if(this.drawX > gameWidth - this.width) this.drawX = gameWidth - this.width;
	if(this.drawY < 0) this.drawY = 0;
	if(this.drawY > gameHeight - this.height) this.drawY = gameHeight - this.height;
	
	
	this.chooseDir();
}

Player.prototype.chooseDir = function()
{
	if(mouseControl) return;
	if(this.isUp)
		this.drawY -= this.speed;
	if(this.isDown)
		this.drawY += this.speed;
	if(this.isRight)
		this.drawX += this.speed;
	if(this.isLeft)
		this.drawX -= this.speed;	
}

function checkKeyDown(e)
{
	if(mouseControl) return;
	var keyID = e.keyCode || e.which;
	var keyChar = String.fromCharCode(keyID);
	
	if(keyChar == "W")
	{
		player.isUp = true;
		e.preventDefault();
	}
	if(keyChar == "S")
	{
		player.isDown = true;
		e.preventDefault();
	}
	if(keyChar == "D")
	{
		player.isRight = true;
		e.preventDefault();
	}
	if(keyChar == "A")
	{
		player.isLeft = true;
		e.preventDefault();
	}
	if(keyChar == " ")
	{
		player.isFire = true;
		e.preventDefault();
	}
}

function checkKeyUp(e)
{
	if(mouseControl) return;
	var keyID = e.keyCode || e.which;
	var keyChar = String.fromCharCode(keyID);
	
	if(keyChar == "W")
	{
		player.isUp = false;
		e.preventDefault();
	}
	if(keyChar == "S")
	{
		player.isDown = false;
		e.preventDefault();
	}
	if(keyChar == "D")
	{
		player.isRight = false;
		e.preventDefault();
	}
	if(keyChar == "A")
	{
		player.isLeft = false;
		e.preventDefault();
	}
	if(keyChar == " ")
	{
		player.isFire = false;
		e.preventDefault();
	}
}

function clearRect()
{
	ctxMap.clearRect(0, 0, 800, 500);
}

function clearCtxPlayer()
{
	ctxPl.clearRect(0, 0, gameWidth, gameHeight);
}

function clearCtxEnemy()
{
	ctxEn.clearRect(0, 0, gameWidth, gameHeight);
}

function clearCtxMissile()
{
	ctxMsl.clearRect(0, 0, gameWidth, gameHeight);
}

function updateStats()
{
	ctxStats.clearRect(0, 0 , gameWidth, gameHeight);
	ctxStats.fillText("Health: " + health, 10, 20);
}

function drawBg()
{
	ctxMap.clearRect(0, 0, gameWidth, gameHeight);
	ctxMap.drawImage(background, 0, 0, 900, 675,
		mapX, 0, gameWidth, gameHeight);
	ctxMap.drawImage(background1, 0, 0, 900, 675,
		map1X, 0, gameWidth, gameHeight);
}