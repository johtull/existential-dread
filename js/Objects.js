var debug = false;

var canvas = {};
var ctx = {};

var isGameOver = false;
var isPaused = false;
var isSoundEnabled = true;

var date = new Date();

var wasd = [false, false, false, false];

function loadImage(path, x, y) {
	let tmp = new Image(x, y);
	tmp.src = path;
	return tmp;
}

var bg_imgs = [];
bg_imgs.push(loadImage('img/bgs/level_1.png', 2048, 576));
bg_imgs.push(loadImage('img/bgs/level_2.png', 2048, 2048));
bg_imgs.push(loadImage('img/bgs/level_3.png', 2048, 576));

var player_imgs = [];
player_imgs.push(loadImage('img/player/player.png', 32, 32));

var tile_imgs = [];
tile_imgs.push(loadImage('img/tiles/cityblock.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/cityblock_half.png', 32, 16));
tile_imgs.push(loadImage('img/tiles/cityborder.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/factoryfloor.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/factoryfloor_half.png', 32, 16));
tile_imgs.push(loadImage('img/tiles/factoryborder.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/subwayblock.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/subwayblock_half.png', 32, 16));
tile_imgs.push(loadImage('img/tiles/subwayborder.png', 32, 32));

tile_imgs.push(loadImage('img/tiles/lantern_1.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/lantern_2.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/lantern_3.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/lantern_4.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/lantern_5.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/battery.png', 32, 32));

tile_imgs.push(loadImage('img/tiles/original_door.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/TRAMPOLINE.png', 32, 32));

tile_imgs.push(loadImage('img/tiles/oomlie.png', 32, 32));
tile_imgs.push(loadImage('img/tiles/ThomasMural.png', 32, 32));


var tile = {
	x: 0,
	y: 0,
	sizeX: 32,
	sizeY: 32,
	isSolid: true,
	//isStatic: true,
	type: '',
	img: 0
};

var map = {
	x: 0,
	y: 0,
	floorX: 1024,
	floorY: 1024,
	screenX: 640,
	screenY: 480,
	collisionThresholdX: 10,
	clippingX: 1.01,
	gravityOn: true,
	gravitySpeed: 15,
	img: 0,
	nextMap: '',
	tiles: []
};

var player = {
	img: 0,
	x: 64,
	y: 64,
	sizeX: 32,
	sizeY: 32,
	speed: 0,
	defaultSpeed: 5,
	defaultSprintSpeed: 10,
	isSprinting: false,
	isJumping: false,
	vertSpeed: 0,
	lanternParts: 0,
	batteryCharge: 0,
	batteryRefill: 50
};

var d_inst = {
	dir: 0, //wasd
	condType: 'time', //lantern
	cond: '30', // 3
	speed: 5
};

var darkness = {
	damage: 1,
	instructions: []
};


function playSound(sound) {
	if(isSoundEnabled) {
		eval(sound).pause();
		eval(sound).currentTime = 0;
		eval(sound).play();
	}
}
function loopSound(sound) {
	if(isSoundEnabled) {
		eval(sound).loop = true;
		eval(sound).currentTime = 0;
		eval(sound).play();
	}
}
function stopSound(sound) {
	eval(sound).pause();
	eval(sound).currentTime = 0;
}
function loopMusic(path) {
	if(isSoundEnabled) {
		music.pause();
		music.currentTime = 0;
		music.src = path;
		music.loop = true;
		music.play();
	}
}

// sfx
var gong = new Audio('audio/sfx/clank.wav');

// music
var music = new Audio();