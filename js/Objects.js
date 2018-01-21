var debug = true;


var canvas = {};
var ctx = {};

var isGameOver = false;
var isPaused = false;

var wasd = [false, false, false, false];

var bg_imgs = [];
let tmp = new Image(2048, 576);
tmp.src = 'img/bgs/level_1.png';
bg_imgs.push(tmp);

tmp = new Image(2048, 2048);
tmp.src = 'img/bgs/level_2.png';
bg_imgs.push(tmp);

tmp = new Image(2048, 576);
tmp.src = 'img/bgs/level_3.png';
bg_imgs.push(tmp);

var player_imgs = [];

tmp = new Image(32, 32);
tmp.src = 'img/player/player.png';
player_imgs.push(tmp);

var tile_imgs = [];

tmp = new Image(32, 32);
tmp.src = 'img/tiles/floor.png';
tile_imgs.push(tmp);

tmp = new Image(32, 32);
tmp.src = 'img/tiles/oomlie.png';
tile_imgs.push(tmp);



var tile = {
	x: 0,
	y: 0,
	sizeX: 32,
	sizeY: 32,
	isSolid: true,
	//isStatic: true,
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
	tiles: []
};

var player = {
	img: 0,
	x: 64,
	y: 64,
	sizeX: 32,
	sizeY: 64,
	speed: 0,
	defaultSpeed: 5,
	defaultSprintSpeed: 10,
	isSprinting: false,
	isJumping: false,
	vertSpeed: 0
};



// test load map
for(var h = 0; h < 32; h++) {
	if(h === 0 || h === 31) {
		for(var w = 0; w < 32; w++) {
			map.tiles.push({
				x: w * 32,
				y: h * 32,
				sizeX: 32,
				sizeY: 32,
				isSolid: true,
				img: 0
			});
		}
	}else {
		map.tiles.push({
			x: 0,
			y: h * 32,
			sizeX: 32,
			sizeY: 32,
			isSolid: true,
			img: 0
		});
		map.tiles.push({
			x: 31 * 32,
			y: h * 32,
			sizeX: 32,
			sizeY: 32,
			isSolid: true,
			img: 0
		});
	}
}
for(var h = 0; h < 29; h++) {
	for(var w = 0; w < 32; w++) {
		if(h === w && h % 2 === 0) {
			map.tiles.push({
				x: w * 32,
				y: h * 32,
				sizeX: 32,
				sizeY: 32,
				isSolid: true,
				img: 0
			});
		}
	}
}
for(var h = 29; h >= 0; h--) {
	for(var w = 0; w < 32; w++) {
		if(h === 32 - w && h % 2 === 0) {
			map.tiles.push({
				x: w * 32,
				y: h * 32,
				sizeX: 32,
				sizeY: 32,
				isSolid: true,
				img: 0
			});
		}
	}
}
map.tiles.push({
	x: 3 * 32,
	y: 5 * 32,
	sizeX: 32,
	sizeY: 32,
	isSolid: false,
	img: 1
});