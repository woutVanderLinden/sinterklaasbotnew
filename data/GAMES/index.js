module.exports = {
	_games: {},
	list () {
		return [
			'battleship',
			'chainreaction',
			'chess',
			'connectfour',
			'lightsout',
			'linesofaction',
			'mastermind',
			'othello',
			'scrabble'
		];
	},
	init () {
		const self = this;
		return Promise.all(self.list().map(game => {
			return new Promise((resolve, reject) => {
				try {
					self._games[game] = require(`./${game}.js`);
					resolve();
				} catch (e) {
					reject(e);
				}
			});
		}));
	},
	reload () {
		const self = this;
		return new Promise((resolve, reject) => {
			try {
				self.list().forEach(game => delete require.cache[require.resolve(`./${game}.js`)]);
				delete self._games;
				self._games = {};
				self.init();
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	},
	get (game) {
		game = toID(game);
		if (!this.list().includes(game)) return null;
		return this._games[game];
	},
	create (game, ...opts) {
		game = this.get(game);
		if (!game) return null;
		return new game(...opts);
	}
};
