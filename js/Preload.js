var Platformy = Platformy || {};

Platformy.Preload = function() {};

Platformy.Preload.prototype = {
	preload: function() {
		//load game assets

		// The maps
		this.load.tilemap('map1', 'assets/tilemaps/map1.json', null, Phaser.Tilemap.TILED_JSON);

		// The image assets
		// this.load.image('player', 'assets/images/player/player.png');
		this.load.image('player_duck', 'assets/images/player/player_duck.png');
		this.load.spritesheet('player', 'assets/images/player/player.png', 70, 92, 5);

		this.load.image('tiles', 'assets/images/tiles.png');
		this.load.image('background', 'assets/images/bg.png');
		this.load.image('sky', 'assets/images/sky.png');

		this.load.image('boxItem', 'assets/images/boxItem.png');
		this.load.image('boxEmpty', 'assets/images/boxEmpty.png');

		this.load.image('coin', 'assets/images/coin.png');
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
			this.state.start('Game', true, false, 'map1');
		}
	}
};