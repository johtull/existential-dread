var debug = false;

var canvas = {};
var ctx = {};

var isGameOver = false;
var isPaused = false;
var isSoundEnabled = true;
var isLoadNextMap = false;

var tick = new Date();

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
player_imgs.push(loadImage('img/player/idleLEFT.png', 32, 32));
player_imgs.push(loadImage('img/player/idleRIGHT.png', 32, 32));
player_imgs.push(loadImage('img/player/runLEFT.png', 32, 32));
player_imgs.push(loadImage('img/player/runRIGHT.png', 32, 32));
player_imgs.push(loadImage('img/player/crouchLEFT.png', 32, 32));
player_imgs.push(loadImage('img/player/crouchRIGHT.png', 32, 32));
player_imgs.push(loadImage('img/player/exhaustedLEFT.png', 32, 32));
player_imgs.push(loadImage('img/player/exhaustedRIGHT.png', 32, 32));
player_imgs.push(loadImage('img/player/jumpLEFT.png', 32, 32));
player_imgs.push(loadImage('img/player/jumpRIGHT.png', 32, 32));

player_imgs.push(loadImage('img/player/idlelanternLEFT.png', 32, 32));
player_imgs.push(loadImage('img/player/idlelanternRIGHT.png', 32, 32));
player_imgs.push(loadImage('img/player/runlanternLEFT.png', 32, 32));
player_imgs.push(loadImage('img/player/runlanternRIGHT.png', 32, 32));

player_imgs.push(loadImage('img/player/light.png', 160, 160));


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
tile_imgs.push(loadImage('img/tiles/TRAMPOLINE_HALF.png', 32, 32));

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
	tickMS: 100,
	passedMS: 0,
	alpha: 0,
	fadeImg: '',
	nextMap: 'maps/map1.txt',
	condType: '',
	cond: '',
	tiles: [],
	batteries: []
};

var player = {
	img: 2,
	imgTick: 0,//0-3
	imgTickMax: 3,
	isLeft: true,
	x: 64,
	y: 64,
	sizeX: 32,
	sizeY: 32,
	speed: 0,
	defaultSpeed: 5,
	defaultSprintSpeed: 7,
	defaultSprintJumpSpeed: -20,
	isSprinting: false,
	isJumping: false,
	lastX: 0,
	lastY: 0,
	vertSpeed: 0,
	statMax: 1000,
	health: 1000,
	stamina: 1000,
	lanternParts: 0,
	batteryCharge: 250,
	batteryRefill: 100,
	lanternOn: false,
	inDarkness: false,
	lanternLightSize: 96
};

var darkness = {
	id: 0,
	x1: 0,//left
	y1: 0,//top
	x2: 0,//right
	y2: 0,//bottom
	dir: 0, //wasd
	condType: 'time', //lantern
	cond: '30', // 3
	speed: 1,
	damage: 1
}

var darknesses = {
	instructions: [], // list of darkness objects loaded with the map
	darkness: [] // active darkness objects
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
	music.pause();
	music.currentTime = 0;
	music.src = path;
	music.loop = true;
	music.play();
}
function stopMusic() {
	music.pause();
	music.currentTime = 0;
}

// sfx
var gong = new Audio('audio/sfx/clank.wav');

// music
var music = new Audio();