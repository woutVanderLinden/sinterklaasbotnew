class ConnectFour {
	constructor (id, info, room, restore) {
		this.id = id;
		info.rows = parseInt(info.rows);
		if (info.rows > 10 || info.rows < 5 || !info.rows) info.rows = 6;
		info.cols = parseInt(info.cols);
		if (info.cols > 10 || info.cols < 5 || !info.cols) info.cols = 7;
		this.rows = info.rows;
		this.cols = info.cols;
		this.turn = 'Y';
		this.room = room;
		this.Y = {
			id: '',
			name: ''
		};
		this.R = {
			id: '',
			name: ''
		};
		this.board = Array.from({ length: this.cols }).map(() => []);
		this.spectators = [];
		this.moves = [];
		this.started = false;
		if (restore) Object.assign(this, restore);
	}
	nextTurn (last) {
		const win = this.isWon(this.board, last);
		if (win) return win;
		this.turn = this.turn === 'Y' ? 'R' : 'Y';
		return false;
	}
	drop (col) {
		return new Promise((resolve, reject) => {
			col = parseInt(col);
			if (!(col >= 0 && col < this.cols)) return reject('Column does not exist');
			if (this.board[col].length === this.rows) return reject('Column is full');
			this.board[col].push(this.turn);
			this.moves.push(col);
			return resolve(this.nextTurn(col));
		});
	}
	isWon (board, col) {
		if (!board) board = this.board;
		const row = this.board[col].length - 1;
		let j;

		// Vertical
		if (row >= 3) {
			j = row - 3;
			if ([0, 1, 2, 3].every(k => board[col][j + k] === this.turn)) return this.turn;
		}

		// Horizontal
		for (j = Math.max(col - 3, 0); j <= Math.min(this.cols - 4, col); j++) {
			if ([0, 1, 2, 3].every(k => board[j + k][row] === this.turn)) return this.turn;
		}

		// Ascending
		j = [col - 3, row - 3];
		while (j[0] < 0 || j[1] < 0) {
			j[0]++;
			j[1]++;
		}
		while (j[0] <= Math.min(this.cols - 4, col) && j[1] <= Math.min(this.rows - 4, row)) {
			if ([0, 1, 2, 3].every(k => board[j[0] + k][j[1] + k] === this.turn)) return this.turn;
			j[0]++;
			j[1]++;
		}

		// Descending
		j = [col - 3, row + 3];
		while (j[0] < 0 || j[1] >= this.rows) {
			j[0]++;
			j[1]--;
		}
		while (j[0] <= Math.min(this.cols - 4, col) && j[1] >= Math.max(row - 3, 3)) {
			if ([0, 1, 2, 3].every(k => board[j[0] + k][j[1] - k] === this.turn)) return this.turn;
			j[0]++;
			j[1]--;
		}

		return false;
	}
	boardHTML (player, passed) {
		const colours = { 'Y': "#ffff00", 'R': "#e60000", 'E': "#111111", 'bg': "#0080ff" };
		const board = Array.from({ length: this.cols }).map((col, x) => {
			return Array.from({ length: this.rows }).map((_, y) => this.board[x][y] || 'E');
		});
		board.forEach(col => col.reverse());
		// eslint-disable-next-line max-len
		const html = `<center style="max-height: 400px; overflow-y: scroll;"><table style="border:none;background:${colours.bg};border-radius:5%;">${board[0].map((col, i) => board.map(row => row[i])).map((row) => `<tr>${row.map((bulb, y) => `<td>${player ? `<button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName},${prefix}connectfour ${this.room} click ${this.id} ${y}" style="background:none;border:none;padding:0">` : ''}<div style="height:${passed ? '15' : '35'}px;width:${passed ? '15' : '35'}px;background-image:radial-gradient(${colours[bulb]} 50%,#333333);border-radius:50%;margin:${passed ? '1.5' : '3'}px"></div>${player ? '</button>' : ''}</td>`).join('')}</tr>`).join('')}</table></center>`;
		return html;
	}
}

module.exports = ConnectFour;
