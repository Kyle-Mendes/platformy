var Platformy = Platformy || {};

Platformy.Boot = function() {};

Platformy.Boot.prototype = {
	create: function() {
		//the loading screen's background color
		this.game.stage.backgroundColor = '#000';

		//scaling options
		this.game.scaleMode = Phaser.ScaleManager.SHOW_ALL;

		//center the game on the page
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;

		//adding our physics system
		this.game.physics.startSystem(Phaser.Physics.P2JS);

		this.state.start('Preload');
	}
};

