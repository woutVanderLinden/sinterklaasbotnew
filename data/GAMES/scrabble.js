const WORDS = require('../WORDS/index.js');

class Scrabble {
	constructor (...input) {
		const [id, room, restore] = input;
		this.id = id;
		this.room = room;
		this.started = false;
		this.boardTemplate = [
			["TW", "-", "-", "DL", "-", "-", "-", "TW", "-", "-", "-", "DL", "-", "-", "TW"],
			["-", "DW", "-", "-", "-", "TL", "-", "-", "-", "TL", "-", "-", "-", "DW", "-" ],
			["-", "-", "DW", "-", "-", "-", "DL", "-", "DL", "-", "-", "-", "DW", "-", "-" ],
			["DL", "-", "-", "DW", "-", "-", "-", "DL", "-", "-", "-", "DW", "-", "-", "DL"],
			["-", "-", "-", "-", "DW", "-", "-", "-", "-", "-", "DW", "-", "-", "-", "-" ],
			["-", "TL", "-", "-", "-", "TL", "-", "-", "-", "TL", "-", "-", "-", "TL", "-" ],
			["-", "-", "DL", "-", "-", "-", "DL", "-", "DL", "-", "-", "-", "DL", "-", "-" ],
			["TW", "-", "-", "DL", "-", "-", "-", "★", "-", "-", "-", "DL", "-", "-", "TW"],
			["-", "-", "DL", "-", "-", "-", "DL", "-", "DL", "-", "-", "-", "DL", "-", "-" ],
			["-", "TL", "-", "-", "-", "TL", "-", "-", "-", "TL", "-", "-", "-", "TL", "-" ],
			["-", "-", "-", "-", "DW", "-", "-", "-", "-", "-", "DW", "-", "-", "-", "-" ],
			["DL", "-", "-", "DW", "-", "-", "-", "DL", "-", "-", "-", "DW", "-", "-", "DL"],
			["-", "-", "DW", "-", "-", "-", "DL", "-", "DL", "-", "-", "-", "DW", "-", "-" ],
			["-", "DW", "-", "-", "-", "TL", "-", "-", "-", "TL", "-", "-", "-", "DW", "-" ],
			["TW", "-", "-", "DL", "-", "-", "-", "TW", "-", "-", "-", "DL", "-", "-", "TW"]
		];
		this.board = tools.deepClone(this.boardTemplate);
		this.placed = this.board.map(row => row.map(() => null));
		this.players = {};
		this.order = [];
		this.bag = [];
		this.letters = {
			A: 9,
			B: 2,
			C: 2,
			D: 4,
			E: 12,
			F: 2,
			G: 3,
			H: 2,
			I: 9,
			J: 1,
			K: 1,
			L: 4,
			M: 2,
			N: 6,
			O: 8,
			P: 2,
			Q: 1,
			R: 6,
			S: 4,
			T: 6,
			U: 4,
			V: 2,
			W: 2,
			X: 1,
			Y: 2,
			Z: 1,
			" ": 2
		};
		this.points = {
			A: 1,
			B: 3,
			C: 3,
			D: 2,
			E: 1,
			F: 4,
			G: 2,
			H: 4,
			I: 1,
			J: 8,
			K: 5,
			L: 1,
			M: 3,
			N: 1,
			O: 1,
			P: 3,
			Q: 10,
			R: 1,
			S: 1,
			T: 1,
			U: 1,
			V: 4,
			W: 4,
			X: 8,
			Y: 4,
			Z: 10,
			" ": 0
		};
		this.colours = {
			'-': `#CCC5A8`,
			DL: `#C0D5D0`,
			TL: `#489AAB`,
			DW: `#F8B7A2`,
			TW: `#FF6251`,
			letter: `#FFCC66`,
			blank: `#555555`
		};
		Object.keys(this.letters).forEach(letter => this.bag.push(...Array.from({ length: this.letters[letter] }, () => letter)));
		this.bag.shuffle();
		this.spectators = [];
		if (restore) Object.keys(restore).forEach(key => this[key] = restore[key]);
		if (this.modded) this.mod(this.modded);
	}
	start () {
		return new Promise((resolve, reject) => {
			if (this.started) return reject(new Error(`Already started!`));
			this.order = Object.keys(this.players).shuffle();
			if (this.order.length > 4 || this.order.length < 2) return reject(new Error(`Invalid player count ${this.order.length}`));
			this.turn = 0;
			this.started = true;
			this.order.forEach(player => this.getPlayer(player).tiles.push(...this.bag.splice(0, 7)));
			this.passCount = 0;
			return resolve();
		});
	}
	getPlayer (context) {
		if (typeof context === 'number' && this.order.length && this.order[context]) return this.players[this.order[context]];
		return this.players[context?.id || toID(context)];
	}
	addPlayer (name) {
		return new Promise((resolve, reject) => {
			if (this.started) return reject('Already started');
			const id = toID(name);
			if (this.players[id]) return reject('Already a player');
			if (Object.keys(this.players).length >= 4) return reject('4 players already playing');
			this.players[id] = {
				id: id,
				name: name,
				tiles: [],
				score: 0
			};
			return resolve();
		});
	}
	removePlayer (player) {
		return new Promise((resolve, reject) => {
			player = this.getPlayer(player);
			if (!player) return reject('Player is not in the game');
			if (this.started) {
				const index = this.order.indexOf(player.id);
				if (index < 0) return reject('Player has already forfeited/been DQed');
				if (index <= this.turn) this.turn--;
				this.bag.push(...player.tiles);
				this.bag.shuffle();
				this.order.splice(index, 1);
				if (this.turn < 0) this.turn = this.order.length - 1;
				this.passCount--;
			}
			delete this.players[player.id];
			return resolve(this.started && this.order.length === 1);
		});
	}
	isTurn (user) {
		return toID(user) === this.getPlayer(this.turn)?.id;
	}
	checkWord (word) {
		return WORDS.checkWord(word, this.dict, this.modded);
	}
	play (start, down, word) {
		return new Promise((resolve, reject) => {
			if (!this.started) return reject('Not started');
			if (start[0] < 0 || start[0] >= 15 || start[1] < 0 || start[1] >= 15) return reject(`Invalid dimensions ${start}`);
			word = word.toUpperCase().replace(/[^A-Z']/g, '').replace(/[A-Z]'/g, m => m[0].toLowerCase()).replace("'", '');
			down = down ? 1 : 0;
			const right = down ? 0 : 1;
			const final = [start[0] + down * (word.length - 1), start[1] + right * (word.length - 1)];
			if (final[0] < 0 || final[0] >= 15 || final[1] < 0 || final[1] >= 15) {
				return reject(`What NO GOING OFF THE BOARD please kthx`);
			}
			const tiles = tools.deepClone(this.placed), placed = [];
			const playedLetters = [];
			for (let i = 0; i < word.length; i++) {
				const x = start[0] + i * down;
				const y = start[1] + i * right;
				if (this.placed[x][y]) continue;
				tiles[x][y] = word.charAt(i);
				playedLetters.push(word.charAt(i).toUpperCase() === word.charAt(i) ? word.charAt(i) : ' ');
				placed.push(`${x},${y}`);
			}
			if (!placed.length) return reject('Must play at least one letter');
			const hand = this.getPlayer(this.turn).tiles.slice(), playedClone = playedLetters.slice();
			let tmp;
			while (playedClone.length) {
				if (!hand.remove(tmp = playedClone.shift())) return reject(`Insufficient tiles for: ${tmp}`);
			}
			const temp = tools.deepClone(this.board);
			let wordPlaces = new Set();
			let connected = false;
			placed.forEach(inf => {
				inf = inf.split(',').map(num => ~~num);
				let [x, y] = inf;
				if (!connected) for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
					// check if connected
					if (i || j) if (!(i && j)) if (tiles[x + i]?.[y + j] && !placed.includes([x + i, y + j].join(','))) {
						connected = true;
					}
				}
				temp[x][y] = '-';
				while (tiles[x - 1]?.[y]) x--;
				const x1 = x;
				x = inf[0];
				while (tiles[x + 1]?.[y]) x++;
				const x2 = x;
				x = inf[0];
				while (tiles[x]?.[y - 1]) y--;
				const y1 = y;
				y = inf[1];
				while (tiles[x]?.[y + 1]) y++;
				const y2 = y;
				y = inf[1];
				const hor = [], ver = [];
				for (let i = x1; i <= x2; i++) ver.push([i, y]);
				for (let j = y1; j <= y2; j++) hor.push([x, j]);
				if (hor.length > 1) wordPlaces.add(hor.map(cell => cell.join(',')).join('|'));
				if (ver.length > 1) wordPlaces.add(ver.map(cell => cell.join(',')).join('|'));
			});
			if (!connected && !(this.board[7][7] === '★' && temp[7][7] === '-')) return reject('Not connected');
			wordPlaces = [...wordPlaces];
			const iScores = wordPlaces.map(wordSet => {
				const coords = wordSet.split('|').map(set => set.split(',').map(n => ~~n));
				const word = coords.map(coord => tiles[coord[0]][coord[1]]).join('');
				const bonus = this.checkWord(word);
				if (!bonus) return reject(`Invalid word: ${toID(word).toUpperCase()}`);
				let mult = 1;
				let thisc = 0;
				coords.forEach(coord => {
					const bSq = this.board[coord[0]][coord[1]], tile = tiles[coord[0]][coord[1]];
					let selfMult = 1;
					switch (bSq) {
						case 'DW': case '★': mult *= 2; break;
						case 'TW': mult *= 3; break;
						case 'DL': selfMult = 2; break;
						case 'TL': selfMult = 3; break;
						case '-': break;
					}
					thisc += tile === tile.toUpperCase() ? selfMult * this.points[tile] : 0;
					// Lowercase tiles are blanks
				});
				thisc *= mult;
				if (typeof bonus === 'number') thisc *= bonus;
				else if (Array.isArray(bonus)) thisc = Number(thisc * bonus[0] + bonus[1]);
				return thisc;
			});
			let score = iScores.reduce((a, b) => a + b, 0);
			if (!score) return reject('The first word must be at least two tiles long');
			const player = this.getPlayer(this.turn), bingo = playedLetters.length === 7;
			if (bingo) score += 50;
			player.score += score;
			this.board = temp;
			this.placed = tiles;
			while (playedLetters.length) player.tiles.remove(playedLetters.shift());
			const receivedTiles = [];
			while (player.tiles.length < 7 && this.bag.length) {
				receivedTiles.push(this.bag[0]);
				player.tiles.push(this.bag.shift());
			}
			this.nextTurn();
			return resolve([player.name, score, iScores, bingo, receivedTiles]);
		});
	}
	exchange (letters) {
		return new Promise((resolve, reject) => {
			if (!this.started) return reject('Hasn\'t started');
			const player = this.getPlayer(this.turn);
			if (typeof letters === 'string') letters = letters.toUpperCase().replace(/[^A-Z ]/g, '').split('');
			const clone = player.tiles.slice();
			if (this.bag.length < 7) {
				return reject(`Not enough letters in the bag (there must be at least 7 tiles in the bag to exchange letters)`);
			}
			for (const letter of letters) {
				if (!clone.remove(letter)) return reject(`Insufficient tiles of ${letter}`);
			}
			letters.forEach(letter => player.tiles.remove(letter));
			const newLetters = this.bag.splice(0, letters.length);
			this.bag.push(...letters);
			this.bag.shuffle();
			player.tiles.push(...newLetters);
			return resolve([letters, newLetters]);
		});
	}
	nextTurn (pass) {
		delete this.getPlayer(this.turn).selected;
		if (pass) this.passCount++;
		else this.passCount = 0;
		if (this.passCount > this.order.length) return true;
		this.turn = (this.turn + 1) % this.order.length;
		Object.values(this.players).forEach(player => {
			delete player.selected;
			delete player.exchange;
		});
	}
	deduct () {
		Object.values(this.players).forEach(player => {
			player.score -= tools.scrabblify(player.tiles.join(''));
		});
	}
	mod (mod) {
		mod = toID(mod);
		let modifier = Object.keys(WORDS.mods).find(k => k === mod);
		if (!modifier) modifier = Object.keys(WORDS.mods).find(k => WORDS.mods[k].aliases?.includes(mod));
		if (modifier) return this.modded = modifier;
		else return false;
	}
	log () {
		return this.placed.map(row => row.map(char => char || ' ').join('')).join('\n');
	}
	headerHTML (player) {
		if (this.ended) return `<center><h2>Game ended</h2></center>`;
		player = this.getPlayer(player);
		const turn = this.getPlayer(this.turn);
		if (player === turn) return `<center><h1>Your turn!</h1></center>`;
		else return `<center><h2>${tools.colourize(turn.name)}'s turn</h2></center>`;
	}
	boardHTML (player) {
		player = this.getPlayer(player) === this.getPlayer(this.turn);
		let html = `<div style="min-height:40%;max-height:70%;overflow-y:scroll;"><table align="center" border="2">`;
		for (let i = 0; i < 15; i++) {
			html += '<tr>';
			for (let j = 0; j < 15; j++) {
				let isNotBlank;
				// eslint-disable-next-line max-len
				const button = `<button name="send" style="border:none;background:none;height:20px;width:20px;padding:0;" value="/w ${Bot.status.nickName},${prefix}scrabble ${this.room} c ${this.id} ${i} ${j}">`;
				const split = (this.getPlayer(this.turn)?.selected || ',').split(',');
				const selected = this.started && (i === parseInt(split[0]) && j === parseInt(split[1]));
				// eslint-disable-next-line max-len
				if (this.placed[i][j]) html += `<td height="20" width="20" style="background:${this.colours.letter};color:${(isNotBlank = this.placed[i][j] === this.placed[i][j].toUpperCase()) ? 'black' : this.colours.blank};text-align:center;padding:0;${selected ? 'border:2px;border-style:outset;border-color:white;' : ''}">${player ? button : ''}<b style="font-size:16px;">${this.placed[i][j].toUpperCase()}<sub style="font-size:0.4em;">${isNotBlank ? this.points[this.placed[i][j]] : 0}</sub></b>${player ? '</button>' : ''}</td>`;
				// eslint-disable-next-line max-len
				else if (i === 7 && j === 7) html += `<td height="20" width="20" style="background:${this.colours.DW};color:black;text-align:center;padding:0;${selected ? 'border:2px;border-style:outset;border-color:white;' : ''}">${player ? button : ''}<b style="font-size:16px;">★</b>${player ? '</button>' : ''}</td>`;
				// eslint-disable-next-line max-len
				else html += `<td height="20" width="20" style="background:${this.colours[this.board[i][j]]};${selected ? 'border:2px;border-style:outset;border-color:white;' : ''}">${player ? button + '</button>' : ''}</td>`;
			}
			html += '</tr>';
		}
		html += '</table></div>';
		return html;
	}
	menuHTML (player) {
		let html = '<div style="vertical-align:middle;text-align:center;">';
		player = this.getPlayer(player);
		const isTurn = player === this.getPlayer(this.turn);
		if (isTurn && !this.ended) {
			// eslint-disable-next-line max-len
			if (player.exchange) html += `<div style="display:inline-block;width:70%;border:1px solid;padding:10px;margin:20px;"><form data-submitsend="/w ${Bot.status.nickName},${prefix}scrabble ${this.room} exchange ${this.id} {exchange}">Which letters would you like to exchange? <input type="text" name="exchange" width="100px" style="margin-right:20px;" placeholder="Tiles go here"/><input type="submit" value="Exchange!"/></form></div>`;
			// eslint-disable-next-line max-len
			else html += `<div style="display:inline-block;width:70%;border:1px solid;padding:10px;margin:20px;"><form data-submitsend="/w ${Bot.status.nickName},${prefix}scrabble ${this.room} play ${this.id} ${player.selected} {dir} {play}"><input type="radio" name="dir" value="down" id="rdw" required/><label for="rdw">Down</label>&nbsp;<input type="radio" name="dir" value="right" id="rrg"/><label for="rrg">Right</label><br/><input type="text" name="play" width="100px" style="margin-right:20px;" placeholder="Type your word here" required/><input type="submit" value="Play!"/></form></div>`;
			html += '<br/>';
		}
		// eslint-disable-next-line max-len
		html += `<div style="display:inline-block;width:250px;border:1px solid;margin-top:5%;padding-bottom:10px;margin-right:20px;"><h2>Your Tiles</h2>${player.tiles.map(tile => `<div height="20px" style="background:${this.colours.letter};color:black;text-align:center;padding:0;display:inline-block;margin:auto;min-width:20px;max-width:20px;"><b style="font-size:16px;">${tile === ' ' ? '&nbsp;&nbsp;' : tile}<sub style="font-size:0.4em;">${this.points[tile] || 0}</sub></b></div>`).join('&nbsp;&nbsp;')}</div>`;
		// eslint-disable-next-line max-len
		if (isTurn && !this.ended) html += `<div style="display:inline-block;width:150px;border:1px solid;padding:10px;margin:20px;"><button name="send" value="/w ${Bot.status.nickName},${prefix}scrabble ${this.room} pass ${this.id}" style="margin:auto;">Pass</button><br/><button name="send" value="/w ${Bot.status.nickName},${prefix}scrabble ${this.room} ${player.exchange ? 'close' : 'open'}exchange ${this.id}" style="margin:auto;">${player.exchange ? 'Go Back' : 'Exchange'}</button></div>`;
		html += '</div>';
		return html;
	}
	pointsHTML () {
		// eslint-disable-next-line max-len
		return `<div style="max-height:100px;border:1px solid;padding:30px;">${this.order.map(u => this.getPlayer(u)).map(u => `${tools.colourize(u.name + ':')} ${u.score}`).join('<br/>')}</div>`;
	}
	HTML (user) {
		const player = this.getPlayer(user);
		if (player) {
			// eslint-disable-next-line max-len
			return `/sendhtmlpage ${player.name},SCRABBLE + ${this.room} + ${this.id},${this.headerHTML(player)}${this.boardHTML(player)}${this.menuHTML(player)}${this.pointsHTML()}`;
		// eslint-disable-next-line max-len
		} else return `/sendhtmlpage ${user},SCRABBLE + ${this.room} + ${this.id},${this.headerHTML()}${this.boardHTML()}${this.pointsHTML()}`;
	}
	highlight () {
		return this.started ? `/highlighthtmlpage ${this.order[this.turn]}, SCRABBLE + ${this.room} + ${this.id}, Your turn!` : '';
	}
}

module.exports = Scrabble;
