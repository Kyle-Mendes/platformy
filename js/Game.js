var Platformy = Platformy || {},
	leftKey,
	rightKey,
	upKey,
	runKey;

Platformy.Game = function() {};

Platformy.Game.prototype = {
	init: function(mapIndex) {
		this.mapIndex = mapIndex;
	},
	create: function() {
		this.map = this.game.add.tilemap('map1');

		//Adding the tilesets
		this.map.addTilesetImage('tiles', 'tiles');

		//create layers
		background = this.game.add.tileSprite(0, this.map.heightInPixels-700, this.map.widthInPixels, this.map.heightInPixels, "sky");
		console.log(background);
		this.backgroundLayer = this.map.createLayer('Background');
		this.platformLayer = this.map.createLayer('Platforms');

		// Setting map collisions
		this.map.setCollisionBetween(1, 2000, true, this.platformLayer);
		this.game.physics.p2.convertTilemap(this.map, this.platformLayer, true);
		this.game.physics.p2.convertCollisionObjects(this.map, 'Objects');

		// Paralax effect on the background
		background.scrollFactorX = .5;

		//resize the gameworld to match the layer dimensions
		this.platformLayer.resizeWorld();

		// add the player to the world
		this.player = this.game.add.sprite(300, 1000, 'player');
		this.game.physics.p2.enableBody(this.player);
		this.player.body.fixedRotation = true;
		this.game.physics.p2.gravity.y = 1500;
		this.player.body.collideWorldBounds = true;
		this.cursors = this.game.input.keyboard.createCursorKeys();

		//camera follows the player
		this.game.camera.follow(this.player);

		// Additional Controls
		leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Space);
		pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
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

		// console.log(velocity);

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
	update: function() {
		if(this.cursors.up.isDown && this.checkIfCanJump()) {
			this.player.body.velocity.y = -900;
		}

		console.log(this.cursors.right.shiftKey);

		// @todo: Make it so you don't have to let go of a direction to sprint
		if(this.cursors.left.isDown) {
			if(this.cursors.left.shiftKey) {
				this.move('left', 1.4)
			} else {
				this.move('left');
			}
		} else if(this.cursors.right.isDown) {
			if(this.cursors.right.shiftKey) {
				this.move('right', 1.4)
			} else {
				this.move('right');
			}
		}
	}
};
