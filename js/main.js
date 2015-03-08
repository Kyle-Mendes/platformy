var Platformy = Platformy || {};

Platformy.game = new Phaser.Game(1080, 600, Phaser.AUTO, '');

Platformy.game.state.add('Boot', Platformy.Boot);
Platformy.game.state.add('Preload', Platformy.Preload);
Platformy.game.state.add('Game', Platformy.Game);
Platformy.game.state.add('GameOver', Platformy.GameOver);

Platformy.game.state.start('Boot');