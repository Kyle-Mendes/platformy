var Platformy = Platformy || {};

Platformy.Preload = function() {};

Platformy.Preload.prototype = {
	preload: function() {
		//load game assets

		// The maps
		// @todo: Can these be loaded in as part of the game preload?
		this.load.tilemap('map1', 'assets/tilemaps/map1.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('map2', 'assets/tilemaps/map2.json', null, Phaser.Tilemap.TILED_JSON);

		// The image assets
		// this.load.image('player', 'assets/images/player/player.png');
		this.load.image('player_duck', 'assets/images/player/player_duck.png');
		this.load.spritesheet('player', 'assets/images/player/player.png', 70, 92, 5);

		// Map
		this.load.image('tiles', 'assets/images/tiles.png');
		this.load.image('background', 'assets/images/bg.png');
		this.load.image('sky', 'assets/images/sky.png');

		// Blocks
		this.load.image('boxItem', 'assets/images/boxItem.png');
		this.load.image('boxCoin', 'assets/images/boxCoin.png');
		this.load.image('boxEmpty', 'assets/images/boxEmpty.png');
		this.load.image('signExit', 'assets/images/signExit.png');

		// Items
		this.load.image('coin', 'assets/images/coin.png');
		this.load.image('life', 'assets/images/life.png');

		// HUD Icons
		this.load.image('hud_coin', 'assets/images/hud/hud_coin.png');
		this.load.image('hud_player', 'assets/images/hud/hud_player.png');
		this.load.image('hud_x', 'assets/images/hud/hud_x.png');
		this.load.spritesheet('hud_numbers', 'assets/images/hud/hud_numbers.png', 32, 40);
	},
	create: function() {
		welcomeMessage = this.game.add.text(175, 50, 'Platformy!', { font: '50px Arial', fill: '#fff' });
		startMessage = this.game.add.text(230, 500, 'Click anywhere to start', { font: '16px Arial', fill: '#fff'});
		startMessage.alpha = 0.2;
	},
	update: function() {
		if (startMessage.alpha >= 1) {
			this.game.add.tween(startMessage).to({alpha: .2}, 2000, Phaser.Easing.Linear.None, true);
		} else if (startMessage.alpha <= .2) {
			this.game.add.tween(startMessage).to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);
		}

		if (this.game.input.activePointer.isDown) {
			var payload = {
				map: 'map1',
				player: {
					lives: 3,
					coins: 0
				}
			};
			this.state.start('Game', true, false, payload);
		}
	}
};