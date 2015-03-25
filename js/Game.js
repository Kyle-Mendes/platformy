/**
 * TODO:
 * Add enemies
 * Make a game over function / state
 * Fix all todos
 * World bounds would be nice
 * make a BG / fix the image bg
 * new levels
 * items? buttons? boxes for buttons?
 */

var Platformy = Platformy || {},
	leftKey,
	rightKey,
	upKey,
	runKey,
	lives,
	livesDigitOne,
	livesDigitTwo,
	coinsDigitOne,
	coinsDigitTwo,
	letGoOfJump = true;

Platformy.Game = function() {};

Platformy.Game.prototype = {
	init: function(payload) {
		this.mapIndex = payload.map;
		this.playerProperties = payload.player;
	},
	create: function() {
		this.map = this.game.add.tilemap(this.mapIndex);
		this.game.world.setBounds(0, 0, this.map.widthInPixels, this.game.heightInPixels);
		this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

		//adding our physics system
		//@todo: why isn't this working?
		this.game.physics.startSystem(Phaser.Physics.P2JS);

		//Adding the tilesets
		this.map.addTilesetImage('tiles', 'tiles');

		//create layers
		sky = this.game.add.tileSprite(0, 0, this.map.widthInPixels, this.map.heightInPixels, "sky");
		//adds the background image
		//@todo: grab this from the map properties
		background = this.game.add.tileSprite(0, this.map.heightInPixels-720, this.map.widthInPixels, this.map.heightInPixels, "background");
		this.backgroundLayer = this.map.createLayer('Background');
		this.platformLayer = this.map.createLayer('Platforms');

		//adding objects
		this.createBlocks();
		this.createExits();

		// Setting map collisions
		this.map.setCollisionBetween(1, 2000, true, this.platformLayer);
		this.game.physics.p2.convertTilemap(this.map, this.platformLayer, true);
		this.game.physics.p2.convertCollisionObjects(this.map, 'Objects');

		//resize the gameworld to match the layer dimensions
		this.platformLayer.resizeWorld();

		// add the player to the world
		//
		// @todo: calculate player position based of it's head
		this.player = this.game.add.sprite(this.map.properties.playerStartX, this.map.properties.playerStartY, 'player');

		// Assign the player properties from map to map
		this.player.properties = this.playerProperties;
		console.log('loaded the player', this.player);

		//  Here we add a new animation called 'walk'
	    //  Because we didn't give any other parameters it's going to make an animation from all available frames in the sprite sheet
	    this.player.animations.add('walk');
	    this.player.animations.add('idle', [0]);

		this.game.physics.p2.enableBody(this.player);
		this.player.body.fixedRotation = true;
		this.game.physics.p2.gravity.y = 1500;
		this.cursors = this.game.input.keyboard.createCursorKeys();

		//camera follows the player
		this.game.camera.follow(this.player);

		// Group that will hold any 1Ups that are generated
		lives = this.game.add.group();

		// HUD
		// @todo: make this better...
		// @todo: Group probably isn't right
		// @todo: load #s as a sprite sheet, use player.properties to append the right numbers in
		hud = this.game.add.group();
		hud.fixedToCamera = true;
		hud.create(70, 20, 'hud_player');
		hud.create(130, 28, 'hud_x');
		livesDigitOne = hud.create(160, 22, 'hud_numbers', 0);
		livesDigitTwo = hud.create(192, 22, 'hud_numbers', 0);

		hud.create(800, 20, 'hud_coin');
		hud.create(860, 28, 'hud_x');
		coinsDigitOne = hud.create(890, 22, 'hud_numbers', 0);
		coinsDigitTwo = hud.create(922, 22, 'hud_numbers', 0);
		hud.scale.set(.8, .8);
		this.updateHud(this.player);

		// Additional Controls
		leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Space);
		pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
	},
	//find objects in a Tiled layer that containt a property called "type" equal to a certain value
	findObjectsByType: function(type, map, layer) {
		var result = new Array();
		map.objects[layer].forEach(function(element){
			if(element.properties.type === type) {
				//Phaser uses top left, Tiled bottom left so we have to adjust
				element.y -= map.tileHeight/2;
				result.push(element);
			}
		});
		return result;
	},
	//create a sprite from an object
	//@todo: pull this, findObjectByType into another js file.
	createFromTiledObject: function(element, group) {
		var sprite = group.create(element.x, element.y, element.properties.sprite);

		//copy all properties to the sprite
		Object.keys(element.properties).forEach(function(key){
			//Set booleans from a string to a proper boolean
			if(element.properties[key] == "true") {
				element.properties[key] = true;
			} else if(element.properties[key] == "false") {
				element.properties[key] = false;
			}
			sprite[key] = element.properties[key];
		});
	},
	//@todo: change this to a "create" function that takes a key (block) as an arg.
	//@todo: have it just load ALL types?
	//    For each object in map.objects..
	//        if object.properties.type != createdTypes
	//            create(type)
	//            add to createdTypes
	createBlocks: function() {
		//create any blocks on the map
		var game = this.game;
		this.blocks = game.add.group();

		result = this.findObjectsByType('itemBlock', this.map, 'Objects');
		result.forEach(function(element) {
			this.createFromTiledObject(element, this.blocks);
		}, this);

		//Sets physics on the body.  No gravity, and don't move when colliding
		this.blocks.forEach(function(block) {
			game.physics.p2.enableBody(block);
			block.body.data.gravityScale = 0;
			block.body.dynamic = false;
		});
	},
	createExits: function() {
		//@todo: remove this when we have an all-encompassing one
		var game = this.game;
		this.exits = game.add.group();

		result = this.findObjectsByType('exit', this.map, 'Objects');
		result.forEach(function(element) {
			this.createFromTiledObject(element, this.exits);
		}, this);

		//Sets physics on the body.  Don't move when colliding
		this.exits.forEach(function(exit) {
			game.physics.p2.enableBody(exit);
			exit.body.dynamic = false;
		});
	},
	updateHud: function(player) {
		var lives = player.properties.lives,
			coins = player.properties.coins;

		/**
		 * Lives and coins are drawn by using a sprite sheet with numbers 0..9
		 * they are both drawn using 2 digit numbers (00..99)
		 * To get the first digit, we divide by 10 and round down. (19 / 10 = 1.9 ~ 1)
		 * To get the second digit, we divide by ten, and then use the remainder. (12 % 10 = 2)
		 */
		livesDigitOne.frame = Math.floor(lives / 10);
		livesDigitTwo.frame = lives % 10;

		coinsDigitOne.frame = Math.floor(coins / 10);
		coinsDigitTwo.frame = coins % 10;
	},
	checkIfCanJump: function() {
		var yAxis = p2.vec2.fromValues(0, 1);
		var result = false;

		for (var i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++)
		{
			var c = this.game.physics.p2.world.narrowphase.contactEquations[i];

			if (c.bodyA === this.player.body.data || c.bodyB === this.player.body.data)
			{
	            var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
	            if (c.bodyA === this.player.body.data) d *= -1;
	            if (d > 0.5) result = true;
	        }
	    }
	    return result;
	},
	move: function(direction, modifier) {
		var velocity = this.player.body.velocity.x,
			modifier = modifier || 1;

		//@todo: cleanup magic numbers
		if(direction == 'left') {
			if (velocity > -200 * modifier) {
				this.player.body.velocity.x -= 20 * modifier;
			} else if (velocity <= -350 * modifier) {
				this.player.body.velocity.x = -350 * modifier;
			} else if (velocity < -200 * modifier) {
				this.player.body.velocity.x -= 30 * modifier;
			}
		} else if(direction == 'right') {
			if (velocity < 200 * modifier) {
				this.player.body.velocity.x += 20 * modifier;
			} else if (velocity >= 350 * modifier) {
				this.player.body.velocity.x = 350 * modifier;
			} else if (velocity > 200 * modifier) {
				this.player.body.velocity.x += 30 * modifier;
			}
		}
	},
	playerCollision: function(player) {
		var game = Platformy.Game.prototype;
		//@todo: can this all be pulled into a prototype?
		//A function to get the contents of a block
		this.getContents =  function(player) {
			var centerX = this.x - (this.width / 2);
			var above = this.y - this.height - 17; //17 is the height of the coin

			//If it's a coin, play an animation and collect it.
			if(this.contents == 'coin' && !this.opened) {

				// Add a coin sprite and animate it
				this.animateCoin(centerX, above);

				//@todo: split this into another function.  It does too much.
				if (player.sprite.properties.coins == 99) {
					game.gainLife(player.sprite);
					player.sprite.properties.coins = 0;
				}
				player.sprite.properties.coins += 1;

				// Update the HUD to reflect the new coin count
				game.updateHud(player.sprite);

				// Remove a coin from the block
			    this.removeCoin();
			} else if (this.contents == 'life' & !this.opened) {
				this.generateLife(this);
			} else {
				this.loadTexture(this.bumpedSprite);
			}
		};
		this.animateCoin = function(x, y) {
			//@todo: coins are sticking behind if you hit two blocks at once (remove alpha to test)
			coin = this.game.add.sprite(x, y, 'coin');
			collectCoin = this.game.add.tween(coin);

			collectCoin.to({
				y: y - 100,
				alpha: 0
			}, 200);
		    collectCoin.start();
		    collectCoin.onComplete.add(function() {
		    	coin.destroy();
		    });
		};
		this.generateLife = function(block) {
			var x = block.x - 22,
				y = block.y - 83;
			life = lives.create(x, y, 'life');
			Platformy.game.physics.p2.enableBody(life);
			life.body.velocity.x = 300;
			this.loadTexture(this.bumpedSprite);
		};
		this.removeCoin = function() {
			this.coins -= 1;
			if (this.coins === 0) {
				this.opened = true;
				this.loadTexture(this.bumpedSprite);
			}
		};

		//If the player is below the box when they collide, get the contents
		if(this.y < player.y) {
			this.getContents(player);
		}
	},
	gainLife: function(object) {
		if (!!object.sprite && object.sprite.key == 'player') {
			if(object.sprite.properties.lives < 99) {
				object.sprite.properties.lives += 1;
				Platformy.Game.prototype.updateHud(object.sprite);
				life.destroy();
			}
		}
	},
	checkIfDead: function(player) {
		if (player.y > this.game.world.height && player.properties.lives > 0) {
			this.takeLife(player);
		} else if (player.properties.lives <= 0) {
			this.gameOver();
		}
	},
	takeLife: function(player) {
		player.reset(this.map.properties.playerStartX, this.map.properties.playerStartY);
		player.properties.lives -= 1;
		this.updateHud(player);
	},
	changeMap: function(player) {
		var properties = player.sprite.properties;
		var payload = {
			map: this.targetMap,
			player: {
				coins: properties.coins,
				lives: properties.lives
			}
		}
		this.game.state.start('Game', false, false, payload);
	},
	update: function() {
		var playerCollision = this.playerCollision,
			changeMap = this.changeMap,
			gainLife = this.gainLife;

		this.checkIfDead(this.player, this.game);

		// Makes the character jump, you have to let go to jump again.
		// @todo: calculate jump height based off of how long the button is pressed
		if(this.cursors.up.isDown && this.checkIfCanJump() && letGoOfJump) {
			this.player.body.velocity.y = -1050;
			letGoOfJump = false;
		} else if (!this.cursors.up.isDown) {
			letGoOfJump = true;
		}

		// Parallax
		background.x= this.game.camera.x*.05;

		// Callback function for when the player hits a block
		this.blocks.forEach(function(block) {
			block.body.onBeginContact.add(playerCollision, block)
		});

		// If the player touches an exit, start changing maps
		this.exits.forEach(function(exit) {
			exit.body.onBeginContact.add(changeMap, exit);
		});

		lives.forEach(function(life) {
			life.body.onBeginContact.add(gainLife, life);
			// @todo: do the velocity better.  please.
			// @todo: make the 1up rotate as it moves
			life.body.velocity.x = 200;
		});

		// @todo: Make it so you don't have to let go of a direction to toggle sprint
		if(this.cursors.left.isDown) {
		    this.player.animations.play('walk', 10, true);
		    this.player.scale.x = -1;
			if(this.cursors.left.shiftKey) {
				this.move('left', 1.4)
			} else {
				this.move('left');
			}
		} else if(this.cursors.right.isDown) {
		    this.player.animations.play('walk', 10, true);
		    this.player.scale.x = 1;
			if(this.cursors.right.shiftKey) {
				this.move('right', 1.4)
			} else {
				this.move('right');
			}
		} else {
			// If we're not moving, don't play the walk animation
		    this.player.animations.play('idle', 2, true);
		}
	}
};
