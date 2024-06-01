class LoA {
	constructor (id, room, restore) {
		this.room = room.toLowerCase().replace(/[^a-z0-9-]/g, '');
		this.id = id;
		this.board = Array.from({ length: 8 }).map(row => Array.from({ length: 8 }).map(cell => 0));
		for (let i = 1; i < 7; i++) this.board[0][i] = this.board[7][i] = 'W';
		for (let i = 1; i < 7; i++) this.board[i][0] = this.board[i][7] = 'B';
		this.W = {
			name: '',
			player: ''
		};
		this.B = {
			name: '',
			player: ''
		};
		this.turn = null;
		this.started = false;
		if (restore) Object.keys(restore).forEach(key => this[key] = restore[key]);
	}
	other () {
		switch (this.turn) {
			case 'W': return 'B';
			case 'B': return 'W';
			default: return null;
		}
	}
	piecesOnLine (x, y, hor, ver) {
		if (x > 7 || x < 0 || y > 7 || y < 0) return null;
		let m = Number(Boolean(hor)), n = Number(Boolean(ver));
		let counter = 0;
		if (!m && !n) [m, n] = [-1, 1];
		for (let i = 1; i < 8 && x + i * m < 8 && x + i * m > 0 && y + i * n < 8 && y + i * n > 0; i++) {
			if (this.board[x + i * m][y + i * n]) counter++;
		}
		for (let i = 1; i < 8 && x - i * m < 8 && x - i * m > 0 && y - i * n < 8 && y - i * n > 0; i++) {
			if (this.board[x - i * m][y - i * n]) counter++;
		}
		if (this.board[x][y]) counter++;
		return counter;
	}
	display (sel, hl, side) {
		let str = '<center><table style="border-collapse:collapse;" border="1px solid black;">';
		for (let i = 0; i < 8; i++) {
			str += `<tr style="height: 35px;">`;
			for (let j = 0; j < 8; j++) {
				// eslint-disable-next-line max-len
				str += `<td style="width: 35px; background-color: green; vertical-align: middle; horizontal-align: center; text-align: center;">${this.board[i][j] ? `<span style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid black; display: inline-block; margin: auto; vertical-align: middle; background-color: ${this.board[i][j] === 'W' ? 'white' : 'black'};"></span>` : `<button style="height: 35px; width: 35px; border: none; background: transparent;" name="send" value="/msg ${Bot.status.nickName}, ${prefix}linesofaction ${this.room} click ${i},${j}"></button>`}</td>`;
			}
			str += `</tr>`;
		}
		str += '</table></center>';
		return str;
	}
	start () {
		if (!this.W.player || !this.B.player) return null;
		this.turn = 'B';
		this.started = true;
		return true;
	}
	nextTurn (idled) {
	}
}

module.exports = LoA;
