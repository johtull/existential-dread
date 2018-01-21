var debug = true;

var canvas = {};
var ctx = {};

var isGameOver = false;
var isPaused = false;

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
tile_imgs.push(loadImage('img/tiles/floor.png', 32, 32));
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
	vertSpeed: 0,
	lanternParts: 0,
	batteryCharge: 0,
	batteryRefill: 50
};

LoadMapJS.loadMap('maps/map1.txt', 64, 18);
/*
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
	x: 1 * 32,
	y: 30 * 32,
	sizeX: 32,
	sizeY: 32,
	isSolid: false,
	type: 'lantern',
	img: 1
});
map.tiles.push({
	x: 6 * 32,
	y: 30 * 32,
	sizeX: 32,
	sizeY: 32,
	isSolid: false,
	type: 'battery',
	img: 1
});
*/