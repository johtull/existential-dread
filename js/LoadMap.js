LoadMapJS = {
	loadTextFile:function(path, callback) {   
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', path, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);  
	}
	,
	load32Map:function(path) {
		if(typeof path === 'undefined' || path === '') {
			return;
		}
		
		LoadMapJS.loadTextFile(path, function(text) {
			
			let tileList = [];
			let keyMap = {};
			let darkList = [];
			let batteryList = [];
		
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
							if(tmpTile.type === 'battery') {
								batteryList.push(Object.assign({}, tmpTile));
							}else {
								tileList.push(Object.assign({}, tmpTile));
							}
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
			map.tiles = tileList;
			map.batteries = batteryList;
			map.passedMS = 0;
			map.condType = keyMap['MAP'].condType;
			map.cond = keyMap['MAP'].cond;
		
			wasd = [false, false, false, false];
			player.vertSpeed = 0;
			player.x = keyMap['SPAWN'].x * keyMap['SPAWN'].mod;
			player.y = keyMap['SPAWN'].y * keyMap['SPAWN'].mod;
			player.inDarkness = false;
			
			darknesses.instructions = [];
			darknesses.darkness = [];
			darknesses.instructions = darkList.reverse();
			
			if(isSoundEnabled) {
				loopMusic(keyMap['MAP'].music);
			}
			
			ctx.globalAlpha = 1;
			map.alpha = 1;
			
			main();
		});
	}// loadMap
};