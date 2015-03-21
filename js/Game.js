var Platformy = Platformy || {},
	leftKey,
	rightKey,
	upKey,
	runKey,
	letGoOfJump = true;

Platformy.Game = function() {};

Platformy.Game.prototype = {
	init: function(payload) {
		this.mapIndex = payload.map;
		this.playerProperties = payload.player;
		console.log(payload);
	},
	create: function() {
		this.map = this.game.add.tilemap(this.mapIndex);
		this.game.world.setBounds(0, 0, this.map.widthInPixels, this.game.heightInPixels);
		this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

		//adding our physics system
		this.game.physics.startSystem(Phaser.Physics.P2JS);

		//Adding the tilesets
		this.map.addTilesetImage('tiles', 'tiles');

		//create layers
		sky = this.game.add.tileSprite(0, 0, this.map.widthInPixels, this.map.heightInPixels, "sky");
		background = this.game.add.tileSprite(0, this.map.heightInPixels-720, this.map.widthInPixels, this.map.heightInPixels, "background");
		this.backgroundLayer = this.map.createLayer('Background');
		this.platformLayer = this.map.createLayer('Platforms');

		//adding objects
		this.createBlocks();

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

		// HUD
		// @todo: make this better...
		// @todo: Group probably isn't right
		// @todo: load #s as a sprite sheet, use player.properties to append the right numbers in
		hud = this.game.add.group();
		hud.fixedToCamera = true;
		hud.create(70, 20, 'hud_player');
		hud.create(800, 20, 'hud_coin');
		hud.scale.set(.5, .5);

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
				element.y -= map.tileHeight;
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
		this.blocks = this.game.add.group();
		var game = this.game;

		var blocks;
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
		//A function to get the contents of a block
		this.getContents =  function(player) {

			//If it's a coin, play an animation and collect it.
			if(this.contents == 'coin' && !this.opened) {
				//@todo: allow for blocks with multiple coins
				var centerX = this.x - (this.width / 2);
				var above = this.y - this.height - 17; //17 is the height of the coin
				coin = this.game.add.sprite(centerX, above, 'coin');
				player.sprite.properties.coins += 1;

				collectCoin = this.game.add.tween(coin);

				collectCoin.to({
					y: this.y - 140
				}, 200);
			    collectCoin.start();
			    collectCoin.onComplete.add(function() {
			    	coin.destroy();
			    })
			    this.opened = true;
			}
		}

		//If the player is below the box, swap the sprite
		if(this.y < player.y) {
			this.loadTexture(this.bumpedSprite);
			this.getContents(player);
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
	},
	update: function() {
		var playerCollision = this.playerCollision;
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
