function init() {
	document.addEventListener("keydown", function(e) {
		//wasd = 87, 65, 83, 68
		switch(e.keyCode) {
			case 87:
			case 32:
				wasd[0] = true;
				if(map.gravityOn && !player.isJumping) {
					player.isJumping = true;
					if(player.isSprinting) {
						player.vertSpeed = map.gravitySpeed * 2 * -1;
					}else {
						player.vertSpeed = map.gravitySpeed * -1;
					}
				}
				break;
			case 65:
				wasd[1] = true;
				break;
			case 83:
				wasd[2] = true;
				break;
			case 68:
				wasd[3] = true;
				break;
			case 16:
				player.isSprinting = true;
				break;
			case 77:
				//soundEnabled = !soundEnabled;
				break;
			case 219: // [
				player.pt ++;
				break;
			case 221: // ]
				break;
			case 75: // K
				isGameOver = true;
				break;
			case 80: // P - pause
				isPaused = !isPaused;
				// if unpaused, restart main()
				if(!isPaused) {
					main();
				}else {
					renderPause();
				}
				break;
			default:
				console.log(e.keyCode);
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
}

function initGame() {
	
	document.getElementById("run-btn").remove();
	
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
	
	LoadMapJS.load32Map('maps/map1.txt');

	main();
}



//hit = new Audio('hit.wav');

function main() {
	if(isGameOver) {
		//renderGameOver();
		alert("The game is over.");
	}else if(!isPaused) {
		updatePlayer();
		collision();
		draw();
		
		if(debug) {
			document.getElementById('player').textContent = JSON.stringify(player);
			//document.getElementById('map').textContent = JSON.stringify(map);
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
	if ((player.y - map.y <= (map.screenY / 2) && map.y > 0)){// || (map.y > map.floorY - map.screenY)) {
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
	/* else if(map.x > (map.floorX/2) + player.sizeX) {
		map.x = (map.floorX/2) + player.sizeX;
	} */
	if(map.y < 0) {
		map.y = 0;
	} else if(map.y > map.floorY - map.screenY) {
		map.y = map.floorY - map.screenY;
	}
	/* else if(map.y > (map.floorY/2) + 32) {
		map.y = (map.floorY/2) + 32;
	} */
	
	// direction increment || boundary enforcement
	// reset player speed modifiers
	player.speed = player.defaultSpeed;
	
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
}

function collision() {
	
	for(var i = 0; i < map.tiles.length; i++) {
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
				}else if(player.x < tile.x + tile.sizeX - map.collisionThresholdX) {
					player.x = tile.x - player.sizeX * map.clippingX;
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
				   (player.y + player.sizeY > tile.y)) {
					   if(tile.type === 'battery') {
						   player.batteryCharge += player.batteryRefill;
					   }else if(tile.type === 'lantern') {
						   player.lanternParts++;
					   }else if(tile.type === 'door') {
						   LoadMapJS.load32Map(map.nextMap);
					   }
					   map.tiles.splice(i,1);
					   playSound('gong');
				   }
			}
		}
	}
}

function draw() {
	// pre-rendering
	var p_cvs = document.createElement('canvas');
	p_cvs.width = canvas.width;
	p_cvs.height = canvas.height;
	var p_ctx = p_cvs.getContext('2d');
	
	p_ctx.drawImage(bg_imgs[map.img], (map.x * -1), (map.y * -1), map.floorX, map.floorY);
	
	for(var i = 0; i < map.tiles.length; i++) {
		let tile = map.tiles[i];
		if(tile.x - map.x < map.screenX && tile.y - map.y < map.screenY) {
			p_ctx.drawImage(tile_imgs[tile.img], tile.x - map.x, tile.y - map.y, tile.sizeX, tile.sizeY);
		}
	}
	
	p_ctx.drawImage(player_imgs[player.img], player.x - map.x, player.y - map.y, player.sizeX, player.sizeY);
	
	//	show bench center
	//ctx.beginPath();
	//ctx.arc(player.x, player.y, 1, 1, Math.PI*2);
	//ctx.fillStyle = "#FF0000";
	//ctx.fill();
	//ctx.closePath();
	//p_ctx.font = "24px Verdana";
	//p_ctx.textAlign = 'left';
	//p_ctx.strokeText(player.health + '/' + player.maxHealth, 20, 40);
	//p_ctx.strokeText('Score: ' + player.points, 20, 80);
	
	ctx.drawImage(p_cvs, 0, 0, canvas.width, canvas.height);
}

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