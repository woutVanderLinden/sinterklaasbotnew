class Battleship {
	constructor (id, room, restore) {
		const board = () => Array.from({ length: 10 }).map(() => Array.from({ length: 10 }).fill(null));
		this.newBoard = board;
		// Each cell:
		// null | { ship: shipname, destroyed: Boolean } : board
		// or
		// null | false | Shipname : guesses
		this.room = room;
		this.id = id;
		this.ships = {
			patrol: 2,
			submarine: 3,
			destroyer: 3,
			battleship: 4,
			carrier: 5
		};
		this.abbr = {
			patrol: 'P',
			submarine: 'S',
			destroyer: 'D',
			battleship: 'B',
			carrier: 'C'
		};
		this.A = {
			label: 'A',
			name: '',
			id: '',
			board: board(),
			guesses: board(),
			ships: Object.assign({}, this.ships),
			set: false
		};
		this.B = {
			label: 'B',
			name: '',
			id: '',
			board: board(),
			guesses: board(),
			ships: Object.assign({}, this.ships),
			set: false
		};
		this.started = false;
		this.turn = ['A', 'B'].random();
		this.spectators = [];
		if (restore) Object.keys(restore).forEach(key => this[key] = restore[key]);
	}
	validShips (input) {
		// input
		// {
		// 	carrier: ['f3','f7'],
		// }
		return new Promise((resolve, reject) => {
			const board = this.newBoard();
			const usedShips = [];
			Object.entries(input).forEach(([ship, pos]) => {
				if (!this.ships[ship]) throw new Error(`Unrecognized ship ${ship}`);
				pos = pos.map(k => ['abcdefghij'.indexOf(k[0]), ~~k.substr(1) - 1]);
				if (Math.max(...pos[0], ...pos[1]) > 9 || Math.min(...pos[0], ...pos[1]) < 0) {
					throw new Error(`${ship} coordinates out of range`);
				}
				const sameRow = pos[0][0] === pos[1][0];
				const sameCol = pos[0][1] === pos[1][1];
				if (!sameRow && !sameCol) {
					throw new Error(`Both points for ${ship} must be in the same row/column`);
				}
				if (sameRow) {
					const row = pos[0][0];
					const ends = pos[0][1] > pos[1][1] ? [pos[1][1], pos[0][1]] : [pos[0][1], pos[1][1]];
					if (ends[1] - ends[0] !== this.ships[ship] - 1) {
						throw new Error(`${ship} is ${this.ships[ship]} squares long, not ${ends[1] - ends[0] + 1}`);
					}
					for (let i = ends[0]; i <= ends[1]; i++) {
						if (board[row][i]) {
							throw new Error(`Square ${"ABCDEFGHIJ"[row]}${i + 1} is already occupied`);
						}
						board[row][i] = { ship, destroyed: false };
					}
				} else {
					const col = pos[0][1];
					const ends = pos[0][0] > pos[1][0] ? [pos[1][0], pos[0][0]] : [pos[0][0], pos[1][0]];
					if (ends[1] - ends[0] !== this.ships[ship] - 1) {
						throw new Error(`${ship} is ${this.ships[ship]} squares long, not ${ends[1] - ends[0] + 1}`);
					}
					for (let i = ends[0]; i <= ends[1]; i++) {
						if (board[i][col]) {
							throw new Error(`Square ${"ABCDEFGHIJ"[i]}${col + 1} is already occupied`);
						}
						board[i][col] = { ship, destroyed: false };
					}
				}
				usedShips.push(ship);
			});
			if (usedShips.length !== 5) {
				const missingShips = Object.keys(this.ships).filter(ship => !usedShips.includes(ship));
				throw new Error(`Missing ship(s): ${missingShips.join(', ')}`);
			}
			return resolve(board);
		});
	}
	setShips (input, player) {
		const self = this;
		return this.validShips(input).then(board => {
			self[player].board = board;
			return Promise.resolve(player);
		});
	}
	other (input) {
		return (turn => turn === 'A' ? 'B' : 'A')(input || this.turn);
	}
	attack (asPlayer, onSquare) {
		const self = this;
		return new Promise((resolve, reject) => {
			if (!self.started) throw new Error('Game not started!');
			if (!asPlayer) asPlayer = self.turn;
			else if (asPlayer !== self.turn) throw new Error('Not your turn!');
			const [y, x] = onSquare;
			const xInRange = x >= 0 && x < 10;
			const yInRange = y >= 0 && y < 10;
			if (!xInRange || !yInRange) throw new Error('Invalid coordinates!');
			const myCell = self[asPlayer].guesses[y][x];
			if (myCell === false) throw new Error('Already attacked cell!');
			const theirCell = self[self.other(asPlayer)].board[y][x];
			self.turn = self.other(self.turn);
			if (theirCell) {
				// Hit!
				self[asPlayer].guesses[y][x] = theirCell.ship;
				theirCell.destroyed = true;
				self[self.other(asPlayer)].ships[theirCell.ship]--;
				const over = Object.values(self[self.other(asPlayer)].ships).find(s => s) ? false : asPlayer;
				return resolve({ ship: theirCell.ship, ko: !self[self.other(asPlayer)].ships[theirCell.ship], over });
			} else {
				// Miss
				self[asPlayer].guesses[y][x] = false;
				self[self.other(asPlayer)].board[y][x] = false;
				return resolve(false);
			}
		});
	}
	boardHTML (side, clickable) {
		let sides;
		if (side) sides = [side];
		else sides = ['A', 'B'];
		const out = sides.map(s => {
			const p = this[s];
			// eslint-disable-next-line max-len
			const shoots = `<table style="background:#01AAD6;border-collapse:collapse;border:1px solid white;padding:0px"><tr style="height:30px;padding:0"><th style="width:30px;padding:0"></th>${Array.from({ length: 10 }).map((_, i) => `<th style="width:30px;padding:5px 0">${i + 1}</th>`).join('')}<th style="width:30px;padding:0"></th></tr>${p.guesses.map((r, i) => `<tr style="height:30px;"><th>${'ABCDEFGHIJ'.charAt(i)}</th>${r.map((c, j) => `<td style="padding:2px;border:1px solid white">${c === null ? clickable ? `<button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName},${prefix}battleship ${this.room} fire ${this.id} ${i}, ${j}" style="width:100%;height:100%;background:none;border:none">&nbsp;</button>` : '' : `<span style="display:inline-block;height:20px;width:20px;border-radius:50%;background:${c ? 'red' : 'white'};border:1px solid black;margin:1px;font-size:0.8em;color:black;text-align:center;line-height:20px;font-weight:bold">${c ? this.abbr[c] : '&nbsp;'}</span>`}</td>`).join('')}<th>${'ABCDEFGHIJ'.charAt(i)}</th></tr>`).join('')}<tr style="height:30px;padding:0"><th style="width:30px;padding:0"></th>${Array.from({ length: 10 }).map((_, i) => `<th style="width:30px;padding:5px 0">${i + 1}</th>`).join('')}<th style="width:30px;padding:0"></th></tr></table>`;
			// eslint-disable-next-line max-len
			const mine = `<table style="background:#01AAD6;border-collapse:collapse;border:1px solid white;padding:0px"><tr style="height:30px;padding:0"><th style="width:30px;padding:0"></th>${Array.from({ length: 10 }).map((_, i) => `<th style="width:30px;padding:5px 0">${i + 1}</th>`).join('')}<th style="width:30px;padding:0"></th></tr>${p.board.map((r, i) => `<tr style="height:30px;"><th>${'ABCDEFGHIJ'.charAt(i)}</th>${r.map((c, j) => `<td style="text-align:center;font-weight:bold;padding:2px;${c ? 'background:#555' : 'border:1px solid white'}">${c ? c.destroyed ? '<span style="display:inline-block;height:20px;width:20px;border-radius:50%;background:red;border:1px solid black;margin:1px;font-size:0.8em;color:black;text-align:center;line-height:20px">' : '' : ''}${c ? this.abbr[c.ship] : ''}${c?.destroyed ? '</span>' : ''}${c === false ? '<span style="display:inline-block;height:20px;width:20px;border-radius:50%;background:white;border:1px solid black;margin:1px">&nbsp;</span>' : ''}</td>`).join('')}<th>${'ABCDEFGHIJ'.charAt(i)}</th></tr>`).join('')}<tr style="height:30px;padding:0"><th style="width:30px;padding:0"></th>${Array.from({ length: 10 }).map((_, i) => `<th style="width:30px;padding:5px 0">${i + 1}</th>`).join('')}<th style="width:30px;padding:0"></th></tr></table>`;
			return [shoots, mine];
		});
		if (out.length === 1) return out[0];
		else return out;
	}
	givenBoardHTML (board) {
		// eslint-disable-next-line max-len
		return `<table style="background:#01AAD6;border-collapse:collapse;border:1px solid white;padding:0px"><tr style="height:30px;padding:0"><th style="width:30px;padding:0"></th>${Array.from({ length: 10 }).map((_, i) => `<th style="width:30px;padding:5px 0">${i + 1}</th>`).join('')}<th style="width:30px;padding:0"></th></tr>${board.map((r, i) => `<tr style="height:30px;"><th>${'ABCDEFGHIJ'.charAt(i)}</th>${r.map((c, j) => `<td style="line-height:24px;text-align:center;font-weight:bold;padding:2px;${c ? 'background:#555' : 'border:1px solid white'}">${c ? this.abbr[c.ship] : ''}</td>`).join('')}<th>${'ABCDEFGHIJ'.charAt(i)}</th></tr>`).join('')}<tr style="height:30px;padding:0"><th style="width:30px;padding:0"></th>${Array.from({ length: 10 }).map((_, i) => `<th style="width:30px;padding:5px 0">${i + 1}</th>`).join('')}<th style="width:30px;padding:0"></th></tr></table>`;
	}
}

module.exports = Battleship;
