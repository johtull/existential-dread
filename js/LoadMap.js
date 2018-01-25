LoadMapJS = {
	// LoadMapJS.load32Map('maps/map1.txt');
	load32Map:function(path) {
		if(typeof path === 'undefined' || path === '') {
			return;
		}
		
		let tileMap = [];
		let keyMap = {};
		let darkList = [];
		
		fetch(path)
			.then(function(resp) {
				return resp.text();
			})
			.then(function(text) {
				let txtMap = text.replace(/\r/g, '').split('\n');
				let parseMap = false;
				let mapStartH = 0;
				
				for(var h = 0; h < txtMap.length; h++) {
					if(!parseMap) {
						if(txtMap[h] === '') {
							continue;
						}else if(txtMap[h] === 'START') {
							parseMap = true;
							mapStartH = h + 1;
						}else if(txtMap[h].startsWith('DARKNESS')) {
							let tmp = txtMap[h].split('=');
							let dark = JSON.parse(tmp[1].toString());
							darkness.damage = dark.damage;
						}else if(txtMap[h].startsWith('D_INST')) {
							let dinst = txtMap[h].split('=');
							darkList.push(Object.assign({}, JSON.parse(dinst[1].toString())));
						}else {
							let key = txtMap[h].split('=');
							keyMap[key[0].toString()] = JSON.parse(key[1].toString());
						}
					} else {
						for(var w = 0; w < keyMap['MAP'].width; w++) {
							let mapChar = txtMap[h].charAt(w).toString();
							if(mapChar === ' ') {
								continue;
							}else if(typeof keyMap[mapChar] !== 'undefined') {
								let tmpTile = keyMap[mapChar];
								if(typeof tmpTile.offsetX !== 'undefined') {
									tmpTile.x = w * 32 + tmpTile.offsetX;
								}else {
									tmpTile.x = w * 32;
								}
								if(typeof tmpTile.offsetY !== 'undefined') {
									tmpTile.y = ((h - mapStartH) * 32) + tmpTile.offsetY;
								}else {
									tmpTile.y = (h - mapStartH) * 32;
								}
								
								tileMap.push(Object.assign({}, tmpTile));
							}else {
								continue;
							}
						}
					}
				}
				
				map.x = keyMap['MAP'].x;
				map.y = keyMap['MAP'].y;
				map.floorX = keyMap['MAP'].floorX;
				map.floorY = keyMap['MAP'].floorY;
				map.img = keyMap['MAP'].img;
				map.nextMap = keyMap['MAP'].nextMap;
				map.tiles = tileMap;
			
				wasd = [false, false, false, false];
				player.vertSpeed = 0;
				player.x = keyMap['SPAWN'].x * keyMap['SPAWN'].mod;
				player.y = keyMap['SPAWN'].y * keyMap['SPAWN'].mod;
				
				darkness.instructions = darkList;
				
				/* let w_start = Date.now(),
					w_now = w_start;
				while (w_now - w_start < 1000) {
					w_now = Date.now();
				} */
				
				if(isSoundEnabled) {
					loopMusic(keyMap['MAP'].music);
				}
				
				ctx.globalAlpha = 1;
				map.alpha = 1;
				
				main();
			});// then
	}// loadMap
};