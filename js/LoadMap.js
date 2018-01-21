LoadMapJS = {
	// file path, width / 32, height / 32
	// LoadMapJS.loadMap('maps/map1.txt', 64, 18);
	loadMap:function(path, width, height) {
		let tileMap = [];
		fetch(path)
			.then(function(resp) {
				return resp.text();
			})
			.then(function(text) {
				let txtMap = text.replace(/\r/g, '').split('\n');
				let keyMap = {};
				
				let parseMap = false;
				let mapStartH = 0;
				
				for(var h = 0; h < txtMap.length; h++) {
					if(!parseMap) {
						if(txtMap[h] === '') {
							continue;
						}else if(txtMap[h] === 'START') {
							parseMap = true;
							mapStartH = h + 1;
							console.log(h);
							console.log(txtMap.length);
						}else {
							let key = txtMap[h].split('=');
							keyMap[key[0]] = JSON.parse(JSON.stringify(key[1]));
						}
					}else {
						for(var w = 0; w < width; w++) {
							let mapChar = txtMap[mapStartH].charAt(w);
							if(mapChar === ' ') {
								continue;
							}else if(typeof keyMap[mapChar] !== 'undefined') {
								let tmpTile = JSON.parse(keyMap[mapChar].toString());
								tmpTile.x = w * 32;
								tmpTile.y = (h - mapStartH) * 32;
								tileMap.push(tmpTile);
							}else {
								continue;
							}
						}
					}
				}
			});
		map = {
			x: 1408,
			y: 0,
			floorX: 2048,
			floorY: 576,
			screenX: 640,
			screenY: 480,
			collisionThresholdX: 10,
			clippingX: 1.01,
			gravityOn: false,
			gravitySpeed: 15,
			img: 0,
			tiles: tileMap
		};
		
		// add player config to txt file
		player.x = 62 * 32;
		player.y = 16 * 32;
		
		//console.log(tileMap);
	}
};