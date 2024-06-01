class Othello {
	constructor (id, room, restore) {
		this.id = id;
		this.room = room.toLowerCase().replace(/[^a-z0-9-]/g, '');
		this.board = Array.from({ length: 8 }).map(row => Array.from({ length: 8 }).map(cell => 0));
		this.board[3][3] = this.board[4][4] = 'W';
		this.board[3][4] = this.board[4][3] = 'B';
		this.W = {
			name: '',
			id: ''
		};
		this.B = {
			name: '',
			id: ''
		};
		this.turn = null;
		this.started = false;
		this.spectators = [];
		this.moves = '';
		if (restore) Object.keys(restore).forEach(key => this[key] = restore[key]);
	}
	moveToString (i, j) {
		let num = ~~i * 8 + ~~j;
		if (num > 26) num -= 2;
		if (num > 32) num -= 2;
		return "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX".charAt(num);
	}
	other () {
		switch (this.turn) {
			case 'W': return 'B';
			case 'B': return 'W';
			default: return null;
		}
	}
	boardHTML (player, ended) {
		let str = '<center><table style="border-collapse:collapse;" border="1px solid black;">', wCount = 0, bCount = 0;
		for (let i = 0; i < 8; i++) {
			str += `<tr style="height: 35px;">`;
			for (let j = 0; j < 8; j++) {
				// eslint-disable-next-line max-len
				str += `<td style="width: 35px; background-color: green; vertical-align: middle; horizontal-align: center; text-align: center;">${this.board[i][j] ? `<span style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid black; display: inline-block; margin: auto; vertical-align: middle; background-color: ${this.board[i][j] === 'W' ? 'white' : 'black'};"></span>` : player ? `<button style="height: 35px; width: 35px; border: none; background: transparent;" name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}othello ${this.room} click ${this.id} ${i},${j}"></button>` : '&nbsp;'}</td>`;
				if (this.board[i][j] === 'W') wCount++;
				if (this.board[i][j] === 'B') bCount++;
			}
			str += `</tr>`;
		}
		str += `</table><br /><h1>${wCount}W / ${bCount}B</h1>`;
		if (player && !ended) str += `<br /><h2>Current turn: ${this.turn === 'W' ? 'White' : 'Black'}</h2>`;
		str += '</center>';
		return str;
	}
	start () {
		if (!this.W.id || !this.B.id) return null;
		this.turn = 'B';
		this.started = true;
		return true;
	}
	nextTurn (idled) {
		this.turn = this.other();
		let canPlay = false;
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (this.canPlay(i, j)) {
					canPlay = true;
					break;
				}
			}
			if (canPlay) break;
		}
		if (!canPlay) {
			if (idled) return this.end();
			this.moves += '-';
			return this.nextTurn(true);
		}
		return this.turn;
	}
	count (board) {
		if (!board) board = this.board;
		const out = { W: 0, B: 0 };
		Object.values(board).forEach(row => row.forEach(cell => {
			switch (cell) {
				case 'W': out.W++; break;
				case 'B': out.B++; break;
				default: break;
			}
		}));
		return out;
	}
	canPlay (i, j) {
		if (!this.turn || typeof i !== 'number' || typeof j !== 'number') return null;
		if (i >= 8 || j >= 8 || i < 0 || j < 0) return null;
		if (this.board[i][j]) return null;
		const board = JSON.parse(JSON.stringify(this.board));
		this.play(i, j, board);
		const [count, nCount] = [this.count(this.board), this.count(board)];
		if (count[this.other()] > nCount[this.other()]) return true;
		return false;
	}
	play (i, j, board) {
		let actual = false;
		if (!board) {
			board = this.board;
			actual = true;
		}
		if (board[i][j]) return null;
		board[i][j] = this.turn;
		for (let X = -1; X <= 1; X++) for (let Y = -1; Y <= 1; Y++) {
			if (!X && !Y) continue;
			for (let m = i, n = j; m < 8 && n < 8 && m >= 0 && n >= 0; m += X, n += Y) {
				if (m === i && n === j) continue;
				if (!board[m][n]) break;
				if (board[m][n] !== this.turn) continue;
				for (let x = i, y = j; x < 8 && y < 8 && x >= 0 && y >= 0; x += X, y += Y) {
					if (x === i && y === j) continue;
					if (board[x][y] === this.other()) board[x][y] = this.turn;
					else break;
				}
			}
		}
		if (actual) this.moves += this.moveToString(i, j);
		return board;
	}
	end () {
		this.started = null;
		let W = 0, B = 0;
		this.board.forEach(row => row.forEach(cell => {
			switch (cell) {
				case 'W': return W++;
				case 'B': return B++;
				default: return;
			}
		}));
		this.winner = W > B ? Bot.AFD ? 'B' : 'W' : Bot.AFD ? 'W' : 'B';
		if (W === B) this.winner = 'O';
		switch (this.winner) {
			case 'W': this.moves += 'Y'; break;
			case 'B': this.moves += 'Z'; break;
			case 'O': this.moves += '_'; break;
		}
		return JSON.stringify(this);
	}
	spectatorSend (html) {
		return new Promise((resolve, reject) => {
			const sender = list => {
				if (!list.length) return resolve();
				Bot.say(this.room, `/sendhtmlpage ${list.shift()}, Othello + ${this.room} + ${this.id}, ${html}`);
				sender(list);
			};
			const list = JSON.parse(JSON.stringify(this.spectators));
			sender(list);
		});
	}
}

module.exports = Othello;
