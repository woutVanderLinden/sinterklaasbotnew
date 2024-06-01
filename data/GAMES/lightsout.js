class LO {
	constructor (room, user, size) {
		this.name = user;
		this.user = toID(user);
		this.room = room.toLowerCase().replace(/[^a-z0-9-]/g, '');
		this.size = size || [5, 5];
		this.board = Array.from({ length: size[0] }).map(row => Array.from({ length: size[1] }).map(t => 0));
		['soln', 'moves', 'spectators'].forEach(k => this[k] = []);
		for (let i = 0; i < size[0]; i++) for (let j = 0; j < size[1]; j++) {
			if (Math.random() < 0.5 || this.soln.length === 0 && i === size[0] - 1 && j === size[1] - 1) this.soln.push([i, j]);
		}
		this.click = (a, b) => {
			if (!(a < this.size[0] && a >= 0 && b < this.size[1] && b >= 0)) return null;
			this.board[a][b] = this.board[a][b] ? 0 : 1;
			if (a) this.board[a - 1][b] = this.board[a - 1][b] ? 0 : 1;
			if (b) this.board[a][b - 1] = this.board[a][b - 1] ? 0 : 1;
			if (a + 1 < this.size[0]) this.board[a + 1][b] = this.board[a + 1][b] ? 0 : 1;
			if (b + 1 < this.size[1]) this.board[a][b + 1] = this.board[a][b + 1] ? 0 : 1;
			this.moves.push([a, b]);
			if (!this.board.reduce((a, b) => a + b.reduce((c, d) => c + d, 0), 0)) return true;
			return false;
		};
		this.soln.forEach(pair => this.click(...pair));
		this.moves = [];
		this.problem = tools.deepClone(this.board);
	}
	boardHTML (isPlayer, board, limit, colours = ["#6e6d62", "#fff9ba", "#111111"]) {
		// eslint-disable-next-line max-len
		return `<center${limit ? ` style="max-height: 200px; overflow-y: scroll;"` : ''}><table style="border:none;background:${colours[2]}">${(board || this.board).map((row, x) => `<tr>${row.map((bulb, y) => `<td>${isPlayer ? `<button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName},${prefix}lo ${this.room}, c ${x} ${y}" style="background:none;border:none;padding:0">` : ''}<div style="height:${board ? '15' : '35'}px;width:${board ? '15' : '35'}px;background-image:radial-gradient(${colours[bulb]} 60%,#333333);border-radius:${board ? '3.75' : '10'}px;margin:${board ? '1.5' : '3'}px"></div>${isPlayer ? '</button>' : ''}</td>`).join('')}</tr>`).join('')}</table></center>`;
	}
}

module.exports = LO;
