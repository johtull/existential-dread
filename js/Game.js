function init() {
	document.addEventListener("keydown", function(e) {
		//wasd = 87, 65, 83, 68
		switch(e.keyCode) {
			case 87:
			case 32:
				wasd[0] = true;
				if(map.gravityOn && !player.isJumping && !player.isExhausted) {
					player.isJumping = true;
					player.lastX = player.x;
					player.lastY = player.y;
					if(player.isSprinting) {
						player.stamina -= 50;
						player.vertSpeed = player.defaultSprintJumpSpeed;
					}else {
						player.vertSpeed = map.gravitySpeed * -1;
					}
				}
				break;
			case 65:
				wasd[1] = true;
				player.isLeft = true;
				break;
			case 83:
				wasd[2] = true;
				break;
			case 68:
				wasd[3] = true;
				player.isLeft = false;
				break;
			case 16:
				if(!player.isExhausted && player.stamina > 0) {
					player.isSprinting = true;
				}
				break;
			case 70: // F
				if(player.lanternParts >= 5 && player.batteryCharge > 0) {
					player.lanternOn = !player.lanternOn;
				}
				break;
			case 81: // Q
				isGameOver = true;
				break;
			case 80: // P - pause
				isPaused = !isPaused;
				// if unpaused, restart main()
				if(!isPaused) {
					main();
				}else {
					if(!debug) {
						renderPause();
					}
				}
				break;
			default:
				if(debug) {
					console.log(e.keyCode);
				}
				break;
		}
	}, false);
	
	document.addEventListener("keyup", function(e) {
		//wasd = 87, 65, 83, 68
		switch(e.keyCode) {
			case 87:
			case 32:
				wasd[0] = false;
				break;
			case 65:
				wasd[1] = false;
				break;
			case 83:
				wasd[2] = false;
				break;
			case 68:
				wasd[3] = false;
				break;
			case 16:
				player.isSprinting = false;
				break;
			default:
				break;
		}
	}, false);
	
	
	isGameOver = false;
	isPaused = false;
	
	// init canvas and context
	canvas = document.getElementById('canvas');
	// check if canvas is supported
	if(!canvas.getContext) {
		alert("Your browser does not support HTML5 Canvas :(");
		return;
	}
	ctx = canvas.getContext('2d');
	
	canvas.background = new Image();
	canvas.background.src = bg_imgs[map.img];
	
	isLoadNextMap = true;
	
	if(!debug) {
		setTimeout(function(){
			renderTitle(0);
			setTimeout(function(){ playSound('hurrrr'); }, 1000);
			
			setTimeout(function() {
				renderMainTitle();
			}, 4000);
		}, 1000);
	}else {
		renderMainTitle();
	}
	
	
}
function resetGame() {
	isGameOver = false;
	
	document.getElementById('title').className = 'hidden';
	document.getElementById('back').className = 'hidden';
	document.getElementById('gameover').className = 'hidden';
	
	wasd = [false, false, false, false];
	player.health = player.statMax;
	player.stamina = player.statMax;
	player.vertSpeed = 0;
	player.isJumping = false;
	player.inDarkness = false;
	player.imgTick = 0;
	player.img = 2;
	player.isLeft = true;
	player.lanternParts = 0;
	player.batteryCharge = 250;
	
	map.nextMap = 'maps/map1.txt';
	isLoadNextMap = true;
	
	main();
}
function main() {
	if(isGameOver) {
		renderTitle(5);
		stopMusic();
		document.getElementById('back').className = 'hidden';
		document.getElementById('gameover').className = '';
	}else if(isLoadNextMap) {
		stopMusic()
		
		let data = canvas.toDataURL();
		let img = document.createElement('img');
		img.src = data;
		map.fadeImg = img;
		
		renderLevelFade();
		
		isLoadNextMap = false;
		
	}else if(!isPaused) {
		
		updatePlayer();
		collision();
		updateDarkness()
		draw();
		
		let tock = (new Date()).getTime();
		if(tock - tick > map.tickMS) {
			tick = tock;
			map.passedMS += map.tickMS;
			player.imgTick++;
			if(player.imgTick > player.imgTickMax) {
				player.imgTick = 0;
				
				if(player.isExhausted) {
					player.exhaustedTicks--;
					if(player.exhaustedTicks < 0) {
						player.exhaustedTicks = player.exhaustedTicksMax;
						player.isExhausted = false;
					}
				}
			}
		}
		
		if(map.condType === 'countdown') {
			if(Number(map.cond) - map.passedMS < 0) {
				renderTitle(6);
				stopMusic();
				document.getElementById('back').className = 'hidden';
				document.getElementById('gameover').className = '';
				return;
			}
		}
		
		if(debug) {
			//document.getElementById('player').textContent = JSON.stringify(player);
			//document.getElementById('map').textContent = JSON.stringify(map);
			document.getElementById('player').textContent = map.passedMS;
		}
		
		requestAnimationFrame(main);
	}
}


function updatePlayer() {
	if (player.x - map.x >= (map.screenX / 2) - (player.sizeX * 2) && map.x < map.floorX - map.screenX) {
		map.x += player.speed;
	}
	if ((player.x - map.x <= (map.screenX / 2) + player.sizeX && map.x > 0) || (map.x > map.floorX - map.screenX)) {
		map.x -= player.speed;
	}
	if (player.y - map.y >= (map.screenY / 4) && map.y < map.floorY) {
		if(player.vertSpeed !== 0 && player.vertSpeed > player.speed) {
			map.y += player.vertSpeed;
		}else {
			map.y += player.speed;
		}
	}
	if ((player.y - map.y + player.sizeY <= (map.screenY / 2) && map.y > 0)){// || (map.y > map.floorY - map.screenY)) {
		if(player.vertSpeed < 0 && Math.abs(player.vertSpeed) > player.speed) {
			map.y += player.vertSpeed;
		} else {
			map.y -= player.speed;
		}
	}
	
	// camera corrections
	if(map.x < 0) {
		map.x = 0;
	}
	if(map.y < 0) {
		map.y = 0;
	} else if(map.y > map.floorY - map.screenY) {
		map.y = map.floorY - map.screenY;
	}
	
	// direction increment || boundary enforcement
	// reset player speed modifiers
	player.speed = player.defaultSpeed;
	
	if(!player.isExhausted) {
		if(wasd[3] || player.x < 0) {
			if (player.isSprinting) {// && (player.getStam() > 0)) {
				player.speed = player.defaultSprintSpeed;
			}
			player.x += player.speed;
		}
		if(wasd[1] || player.x > map.floorX) {
			if (player.isSprinting) {// && (player.getStam() > 0)) {
				player.speed = player.defaultSprintSpeed;
			}
			player.x -= player.speed;
		}
		if(!map.gravityOn) {
			if(wasd[2] || player.y < 0) {
				player.y += player.speed;
			}
		}
		if(!map.gravityOn && (wasd[0] || player.y > map.floorY)) {
			player.y -= player.speed;
		}
		if(player.y > map.floorY) {
			player.y = map.floorY - player.sizeY;
		}
	}
		
	if(map.gravityOn) {
		if(player.y < map.floorY) {
			player.vertSpeed++;
			if(player.vertSpeed > map.gravitySpeed) {
				player.vertSpeed = map.gravitySpeed;
			}
		}else if(player.y >= map.floorY) {
			player.vertSpeed = 0;
			player.isJumping = false;
		}
		player.y = player.y + player.vertSpeed;
	}
	
	// animATION
	if(player.isExhausted) {
		if(player.isLeft) {
			player.img = 6;
		}else {
			player.img = 7;
		}
	}else {
		if(wasd[0] && player.isJumping) {
			if(player.isLeft) {
				player.img = 8;
			}else {
				player.img = 9;
			}
		}else if(wasd[1]) {
			if(player.lanternOn) {
				player.img = 12;
			}else {
				player.img = 2;
			}
		}else if(wasd[2]) {
			if(player.isLeft) {
				player.img = 4;
			}else {
				player.img = 5;
			}
		}else if(wasd[3]) {
			if(player.lanternOn) {
				player.img = 13;
			}else {
				player.img = 3;
			}
		}
		
		if((!player.isJumping && !wasd[1] && !wasd[2] && !wasd[3]) || (wasd[1] && wasd[3])) {
			if(player.lanternOn) {
				if(player.isLeft) {
					player.img = 10;
				}else {
					player.img = 11;
				}
			}else {
				if(player.isLeft) {
					player.img = 0;
				}else {
					player.img = 1;
				}
			}
		}
	}
	
	
	// STATS
	if(player.stamina < 0) {
		player.stamina = 0;
		player.isExhausted = true;
		player.isSprinting = false;
	}else if(player.stamina > player.statMax) {
		player.stamina = player.statMax;
	}
	if(player.isSprinting) {
		player.stamina -= 5;
	}else if(player.stamina < player.statMax) {
		player.stamina += 2;
	}
	// lantern
	if(player.batteryCharge < 0) {
		player.batteryCharge = 0;
		player.lanternOn = false;
	}else if(player.batteryCharge > player.statMax) {
		player.batteryCharge = player.statMax;
	}
	if(player.lanternOn) {
		player.batteryCharge--;
	}
	// hp
	if(player.health <= 0) {
		isGameOver = true;
	}
}//updatePlayer

function collision() {
	let shoves = 0;
	for(let i = 0; i < map.tiles.length; i++) {
		let tile = map.tiles[i];
		if(tile.isSolid) {
			// top of object
			if((player.x + player.sizeX > tile.x) &&
			   (player.x < tile.x + tile.sizeX) &&
			   (player.y + player.sizeY > tile.y - player.speed) &&
			   (player.y + player.sizeY < tile.y + (tile.sizeY/4) + player.speed)) {
					if(player.vertSpeed > 0) {
						player.vertSpeed = 0;
						player.isJumping = false;
						player.y = tile.y - player.sizeY;
				    }else if(!map.gravityOn) {
						player.y = tile.y - player.sizeY;
					}
			    }
			// bottom of object
			if((player.x + player.sizeX - map.collisionThresholdX > tile.x) &&
               (player.x < tile.x + tile.sizeX - map.collisionThresholdX) &&
			   (player.y > tile.y) &&
			   (player.y < tile.y + tile.sizeY)) {
				   // PROBLEM ???
					if(player.vertSpeed < 0) {
						if(debug) {
							ctx.strokeStyle = "#00FF00";
							ctx.strokeRect(tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
						}
					    player.vertSpeed = 0;
					    player.y = tile.y + tile.sizeY;
					}else if(!map.gravityOn) {
						player.y = tile.y + tile.sizeY;
					}
					
			    }
			// bottom of object clipping
		    //shove player to side from bottom if clipping
		    // DEBUG WHITE SQUARE
			if((player.x + player.sizeX > tile.x) &&
			(player.x < tile.x + tile.sizeX) &&
			(player.y > tile.y) &&
			(player.y < tile.y + tile.sizeY)) {
				if(player.x + player.sizeX - map.collisionThresholdX > tile.x) {
					player.x = tile.x + tile.sizeX;
					shoves++;
				}else if(player.x < tile.x + tile.sizeX - map.collisionThresholdX) {
					player.x = tile.x - player.sizeX; //map.clippingX
					shoves++;
				}
			}
			// xy movement collision
			if((player.x + player.sizeX > tile.x) &&
			   (player.x < tile.x + tile.sizeX) &&
			   (player.y + player.sizeY > tile.y) &&
			   (player.y < tile.y + tile.sizeY)) {
				   // static objects - no movement
				   if(wasd[1]) {
					   player.x += player.speed;
					   player.x = tile.x + tile.sizeX;
				   }else if (wasd[3]) {
					   player.x -= player.speed;
					   player.x = tile.x - player.sizeX;
				   }
			    }
		// non-solids - items
		}else if(!tile.isSolid) {
			if(tile.type !== '') {
				if((player.x < tile.x + tile.sizeX) &&
				   (player.x + player.sizeX > tile.x) &&
				   (player.y < tile.y + tile.sizeY) &&
				   (player.y + player.sizeY - 1 > tile.y)) {
						if(tile.type === 'jump') {
						  if(!player.isJumping) {
								player.y = tile.y - tile.sizeY;
								player.isJumping = true;
								player.vertSpeed = player.defaultSprintJumpSpeed;
							}
						}else {
							if(tile.type === 'battery') {
								player.batteryCharge += player.batteryRefill;
							}else if(tile.type === 'lantern') {
								player.lanternParts++;
							}else if(tile.type === 'door') {
								isLoadNextMap = true;
								return;
							}
							if(isSoundEnabled) {
								playSound('gong');
							}
							map.tiles.splice(i,1);
						}
				   }
			}
		}
	}
	//battery list
	for(let i = 0; i < map.batteries.length; i++) {
		let tile = map.batteries[i];
		if((player.x < tile.x + tile.sizeX) &&
		   (player.x + player.sizeX > tile.x) &&
		   (player.y < tile.y + tile.sizeY) &&
		   (player.y + player.sizeY - 1 > tile.y)) {
				if(tile.type === 'battery') {
					player.batteryCharge += player.batteryRefill;
					if(isSoundEnabled) {
						playSound('gong');
					}
					map.batteries.splice(i,1);
				}
		   }
	}
	
	if(shoves > 1) {
		player.x = player.lastX;
		player.y = player.lastY;
	}
	
	// check if player is in the darkness
	player.inDarkness = false;
	darknesses.darkness.forEach(function(e) {
		if((player.y + player.sizeY > e.y1 && e.dir === 0) ||
		   (player.x + player.sizeX > e.x1 && e.dir === 1) ||
		   (player.y < e.y2 && e.dir === 2) ||
		   (player.x < e.x2 && e.dir === 3)) {
			   player.inDarkness = true;
			   if(!player.lanternOn) {
				   player.health -= e.damage;
			   }
		   }
	});
}

function updateDarkness() {
	if(darknesses.instructions.length > 0) {
		let peek = darknesses.instructions[darknesses.instructions.length - 1];
		if((peek.condType === 'time' && map.passedMS > Number(peek.cond)) ||   (peek.condType === 'lantern' && player.lanternParts >= Number(peek.cond))) {
			let darkIndex = darknesses.darkness.findIndex(function(e) {
				return peek.id === e.id;
			});
			if(darkIndex < 0) {
				darknesses.darkness.push(Object.assign({}, peek));
			}else {
				let keys = Object.keys(peek);
				keys.forEach(function(k) {
					darknesses.darkness[darkIndex][k] = peek[k];
				});
			}
			darknesses.instructions.pop();
		}
	}
	for(let i = 0; i < darknesses.darkness.length; i++) {
		let dark = darknesses.darkness[i];
		if(dark.speed === 0) {
			continue;
		}
		switch(dark.dir) {
			case 0: //up
				if(dark.y1 >= 0 && dark.y1 <= map.floorY) {
					darknesses.darkness[i]['y1'] -= dark.speed;
				}
				break;
			case 1: //left
				if(dark.x1 >= 0 && dark.x1 <= map.floorX) {
					darknesses.darkness[i]['x1'] -= dark.speed;
				}
				break;
			case 2: //down
				if(dark.y2 <= map.floorY && dark.y2 >= 0) {
					darknesses.darkness[i]['y2'] += dark.speed;
				}
				break;
			case 3: //right
				if(dark.x2 <= map.floorX && dark.x2 >= 0) {
					darknesses.darkness[i]['x2'] += dark.speed;
				}
				break;
			default:
				break;
		}
	}
}

function draw() {
	if(ctx.globalAlpha < 1) {
		return;
	}
	
	// pre-rendering
	var p_cvs = document.createElement('canvas');
	p_cvs.width = canvas.width;
	p_cvs.height = canvas.height;
	var p_ctx = p_cvs.getContext('2d');
	
	// draw map
	p_ctx.drawImage(bg_imgs[map.img], (map.x * -1), (map.y * -1), map.floorX, map.floorY);
	
	if(debugTiles) {
		p_ctx.strokeStyle = "#FF0000";
	}
	
	// draw tiles
	for(let i = 0; i < map.tiles.length; i++) {
		let tile = map.tiles[i];
		if(tile.x - map.x < map.screenX && tile.y - map.y < map.screenY) {
			p_ctx.drawImage(tile_imgs[tile.img], tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
			if(debugTiles) {
				p_ctx.strokeRect(tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
				p_ctx.strokeText('['+i+']', tile.x - map.x, tile.y - map.y + tile.sizeY/2);
			}
		}
	}
	
	// darkness
	p_ctx.strokeStyle = "#000000";
	for(let i = 0; i < darknesses.darkness.length; i++) {
		// darkness pulsing
		//p_ctx.globalAlpha = Math.random() * (1 - 0.95) + 0.95;
		p_ctx.fillRect(darknesses.darkness[i]['x1'] - map.x,
					   darknesses.darkness[i]['y1'] - map.y,
					   darknesses.darkness[i]['x2'],
					   darknesses.darkness[i]['y2']);
	}
	//p_ctx.globalAlpha = 1;
	
	//make health bar flash
	if(player.inDarkness && player.lanternOn) {
		// draw flashlight background
		p_ctx.drawImage(player_imgs[14], player.x - map.x - (player.sizeX * 2), player.y - map.y - (player.sizeY * 2));
		// redraw blocks
		for(let i = 0; i < map.tiles.length; i++) {
			let tile = map.tiles[i];
			if(tile.x - map.x + player.lanternLightSize > player.x - map.x &&
			   tile.x - map.x - player.lanternLightSize < player.x + player.sizeX - map.x &&
			   tile.y - map.y + player.lanternLightSize > player.y - map.y &&
			   tile.y - map.y - player.lanternLightSize < player.y + player.sizeY - map.y) {
				p_ctx.drawImage(tile_imgs[tile.img], tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
				if(debugTiles) {
					p_ctx.strokeRect(tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
					p_ctx.strokeText('['+i+']', tile.x - map.x, tile.y - map.y + tile.sizeY/2);
				}
			}
		}
	}
	
	// render batteries - GLOW IN DARKNESS
	for(let i = 0; i < map.batteries.length; i++) {
		let tile = map.batteries[i];
		if(tile.x - map.x < map.screenX && tile.y - map.y < map.screenY) {
			p_ctx.drawImage(tile_imgs[tile.img], tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
			if(debugTiles) {
				p_ctx.strokeRect(tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
				p_ctx.strokeText('['+i+']', tile.x - map.x, tile.y - map.y + tile.sizeY/2);
			}
		}
	}
	
	// draw player
	p_ctx.drawImage(player_imgs[player.img], player.imgTick * player.sizeX, 0, player.sizeX, player.sizeY, player.x - map.x, player.y - map.y, player.sizeX, player.sizeY);
	if(debugTiles) {
		p_ctx.strokeRect(player.x - map.x, player.y - map.y, player.sizeX, player.sizeY);
	}
	
	// render UI
	p_ctx.fillStyle = "#AA0000";
	p_ctx.fillRect(507,10,100,10);
	p_ctx.fillStyle = "#FF0000";
	p_ctx.fillRect(510,7,player.health/10,10);
	p_ctx.fillStyle = "#00AA00";
	p_ctx.fillRect(507,25,100,10);
	p_ctx.fillStyle = "#00FF00";
	p_ctx.fillRect(510,22,player.stamina/10,10);
	if(player.lanternParts === 5) {
		p_ctx.fillStyle = "#AAAA00";
		p_ctx.fillRect(507,40,100,10);
		p_ctx.fillStyle = "#FFFF00";
		p_ctx.fillRect(510,37,player.batteryCharge/10,10);
	}
	if(map.condType === 'countdown') {
		p_ctx.fillStyle = "#000000";
		p_ctx.fillRect(507,55,52,23);
		p_ctx.font = '24px Verdana';
		p_ctx.textAlign = 'center';
		p_ctx.fillStyle = "#FF0000";
		p_ctx.fillText(Math.trunc((map.cond - map.passedMS) / 1000), 533, 75);
	}
	
	// render pre-rendered canvas
	ctx.drawImage(p_cvs, 0, 0, canvas.width, canvas.height);
}//draw

function renderPause() {
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#FF0000';
	ctx.font = '64px Verdana';
	ctx.textAlign = 'center';
	ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
	ctx.font = '16px Verdana';
	ctx.fillText('PRESS P TO RESUME', canvas.width/2, canvas.height/2 + 32);
}

function renderLevelFade() {
        
	/// increase alpha with delta value
	map.alpha -= 0.01;
	
	//// if delta <=0 or >=1 then reverse
	if (map.alpha <= 0) {
		map.alpha = 0;
	}
	
	/// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	/// set global alpha
	ctx.globalAlpha = map.alpha;
	
	/// re-draw image
	ctx.drawImage(map.fadeImg, 0, 0);
	
	if (map.alpha <= 0) {
		LoadMapJS.load32Map(map.nextMap);
		return;
	}
	
	/// loop using rAF
	requestAnimationFrame(renderLevelFade);
}
function renderTitle(img) {
	ctx.drawImage(title_imgs[img], 0, 0, 640, 480);
	if(img === 1) {
		document.getElementById('title').className = '';
		document.getElementById('back').className = 'hidden';
		document.getElementById('gameover').className = 'hidden';
	}else if(img > 1) {
		document.getElementById('title').className = 'hidden';
		document.getElementById('back').className = '';
	}
}
function renderMainTitle() {
	renderTitle(1);
	if(isSoundEnabled) {
		loopMusic('audio/music/existential_dread_0.wav');
	}
	document.getElementById('title').className = '';
	document.getElementById('back').className = 'hidden';
	document.getElementById('gameover').className = 'hidden';
}
function toggleSounds() {
	isSoundEnabled = !isSoundEnabled;
	if(isSoundEnabled) {
		startMusic();
	}else {
		stopMusic();
	}
}