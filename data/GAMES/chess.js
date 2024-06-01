class Chess {
	constructor (id, room, restore) {
		this.id = id;
		this.room = room;
		this.started = false;
		this.W = {
			id: null,
			name: null,
			Km: false,
			Ram: false,
			Rhm: false,
			preMove: [],
			captures: [],
			isPromoting: false
		};
		this.B = {
			id: null,
			name: null,
			Km: false,
			Ram: false,
			Rhm: false,
			preMove: [],
			captures: [],
			isPromoting: false
		};
		this.moves = [];
		this.lastMove = [];
		this.lastMoveP2 = false;
		this.board = {};
		['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(file => this.board[file] = ['', '', '', '', '', '', '', '', '']);
		// pieces are saved as BN, WP, WQ, etc.
		this.turn = 'W';
		if (restore) Object.keys(restore).forEach(key => this[key] = restore[key]);
		this.imgsrc = {
			WK: `<img src="${websiteLink}/public/chess/WK.png" height="25" width="25" style="height: 25; width: 25" />`,
			WQ: `<img src="${Math.random() > 0.9 ? 'https://emoji.gg/assets/emoji/6215_RitaQueenHead.png' : `${websiteLink}/public/chess/WQ.png`}" height="25" width="25" style="height: 25; width: 25" />`,
			WB: `<img src="${websiteLink}/public/chess/WB.png" height="25" width="25" style="height: 25; width: 25" />`,
			WN: `<img src="${websiteLink}/public/chess/WN.png" height="25" width="25" style="height: 25; width: 25" />`,
			WR: `<img src="${websiteLink}/public/chess/WR.png" height="25" width="25" style="height: 25; width: 25" />`,
			WP: `<img src="${websiteLink}/public/chess/WP.png" height="25" width="25" style="height: 25; width: 25" />`,
			BK: `<img src="${websiteLink}/public/chess/BK.png" height="25" width="25" style="height: 25; width: 25" />`,
			BQ: `<img src="${websiteLink}/public/chess/BQ.png" height="25" width="25" style="height: 25; width: 25" />`,
			BB: `<img src="${websiteLink}/public/chess/BB.png" height="25" width="25" style="height: 25; width: 25" />`,
			BN: `<img src="${websiteLink}/public/chess/BN.png" height="25" width="25" style="height: 25; width: 25" />`,
			BR: `<img src="${websiteLink}/public/chess/BR.png" height="25" width="25" style="height: 25; width: 25" />`,
			BP: `<img src="${websiteLink}/public/chess/BP.png" height="25" width="25" style="height: 25; width: 25" />`
		};
		this.emosrc = {
			WK: '<div style="font-size:25px; color: black;">♔</div>',
			WQ: '<div style="font-size:25px; color: black;">♕</div>',
			WB: '<div style="font-size:25px; color: black;">♗</div>',
			WN: '<div style="font-size:25px; color: black;">♘</div>',
			WR: '<div style="font-size:25px; color: black;">♖</div>',
			WP: '<div style="font-size:25px; color: black;">♙</div>',
			BK: '<div style="font-size:25px; color: black;">♚</div>',
			BQ: '<div style="font-size:25px; color: black;">♛</div>',
			BB: '<div style="font-size:25px; color: black;">♝</div>',
			BN: '<div style="font-size:25px; color: black;">♞</div>',
			BR: '<div style="font-size:25px; color: black;">♜</div>',
			BP: '<div style="font-size:25px; color: black;">♟</div>'
		};
		this.src = null;
		this.colours = JSON.parse(fs.readFileSync('./data/DATA/chess_themes.json', 'utf8'))[Bot.AFD ? 'wario' : 'spooky'];
		this.spectators = {};
	}

	// TODO: Holy shit there is SO much to optimize here
	increment (character) {
		switch (character) {
			case 'a': return 'b';
			case 'b': return 'c';
			case 'c': return 'd';
			case 'd': return 'e';
			case 'e': return 'f';
			case 'f': return 'g';
			case 'g': return 'h';
			default: return null;
		}
	}
	decrement (character) {
		switch (character) {
			case 'b': return 'a';
			case 'c': return 'b';
			case 'd': return 'c';
			case 'e': return 'd';
			case 'f': return 'e';
			case 'g': return 'f';
			case 'h': return 'g';
			default: return null;
		}
	}
	setBoard () {
		this.board.a[1] = 'WR';
		this.board.b[1] = 'WN';
		this.board.c[1] = 'WB';
		this.board.d[1] = 'WQ';
		this.board.e[1] = 'WK';
		this.board.f[1] = 'WB';
		this.board.g[1] = 'WN';
		this.board.h[1] = 'WR';

		this.board.a[2] = 'WP';
		this.board.b[2] = 'WP';
		this.board.c[2] = 'WP';
		this.board.d[2] = 'WP';
		this.board.e[2] = 'WP';
		this.board.f[2] = 'WP';
		this.board.g[2] = 'WP';
		this.board.h[2] = 'WP';


		this.board.a[8] = 'BR';
		this.board.b[8] = 'BN';
		this.board.c[8] = 'BB';
		this.board.d[8] = 'BQ';
		this.board.e[8] = 'BK';
		this.board.f[8] = 'BB';
		this.board.g[8] = 'BN';
		this.board.h[8] = 'BR';

		this.board.a[7] = 'BP';
		this.board.b[7] = 'BP';
		this.board.c[7] = 'BP';
		this.board.d[7] = 'BP';
		this.board.e[7] = 'BP';
		this.board.f[7] = 'BP';
		this.board.g[7] = 'BP';
		this.board.h[7] = 'BP';

		this.started = true;
	}
	switchSides () {
		this.turn = this.turn === 'W' ? 'B' : 'W';
		return;
	}
	getPiece (square, board) {
		if (board) return board[square[0]][square[1]].split('');
		return this.board[square[0]][square[1]].split('');
	}
	adjFiles (file) {
		switch (file) {
			case 'a': return ['b'];
			case 'b': return ['a', 'c'];
			case 'c': return ['b', 'd'];
			case 'd': return ['c', 'e'];
			case 'e': return ['d', 'f'];
			case 'f': return ['e', 'g'];
			case 'g': return ['f', 'h'];
			case 'h': return ['g'];
			default: return [];
		}
	}
	knightSquares (file, rank) {
		rank = parseInt(String(rank));
		let ranks1 = [], ranks2 = [], files1 = this.adjFiles(file), files2, squares = [];
		if (rank + 1 < 9) ranks1.push(rank + 1);
		if (rank + 2 < 9) ranks2.push(rank + 2);
		if (rank - 1 > 0) ranks1.push(rank - 1);
		if (rank - 2 > 0) ranks2.push(rank - 2);
		switch (file) {
			case 'a': {
				files2 = ['c'];
				break;
			}
			case 'b': {
				files2 = ['d'];
				break;
			}
			case 'c': {
				files2 = ['a', 'e'];
				break;
			}
			case 'd': {
				files2 = ['b', 'f'];
				break;
			}
			case 'e': {
				files2 = ['c', 'g'];
				break;
			}
			case 'f': {
				files2 = ['d', 'h'];
				break;
			}
			case 'g': {
				files2 = ['e'];
				break;
			}
			case 'h':
			{
				files2 = ['f'];
				break;
			}
			default: break;
		}
		ranks1.forEach(grank => {
			files2.forEach(gfile => {
				squares.push(gfile + grank);
			});
		});
		ranks2.forEach(grank => {
			files1.forEach(gfile => {
				squares.push(gfile + grank);
			});
		});
		return squares;
	}
	getSquares (square, board, pre) {
		if (!board) {
			if (pre) {
				board = {};
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(file => board[file] = ['', '', '', '', '', '', '', '', '']);
			} else board = this.board;
		}
		const recept = this.getPiece(square, pre ? null : board);
		if (!(recept.length === 2)) return [];
		const piece = recept[1], side = recept[0];
		if (!piece);
		square = [square[0], parseInt(square[1])];
		if (pre) board[square[0]][square[1]] = recept;
		let squares = [];
		switch (piece) {
			case 'P': {
				switch (side) {
					case 'W': {
						if (square[1] < 8 && (pre || !board[square[0]][square[1] + 1])) squares.push(square[0] + (square[1] + 1));
						if (square[1] === 2 && (pre || !board[square[0]][3] && !board[square[0]][4])) squares.push(square[0] + '4');
						this.adjFiles(square[0]).forEach(file => {
							if (pre || board[file][square[1] + 1][0] === 'B') squares.push(file + (square[1] + 1));
						});
						break;
					}
					case 'B': {
						if (square[1] === 7 && (pre || !board[square[0]][6] && !board[square[0]][5])) squares.push(square[0] + '5');
						if (square[1] > 1 && (pre || !board[square[0]][square[1] - 1])) squares.push(square[0] + (square[1] - 1));
						this.adjFiles(square[0]).forEach(file => {
							if (pre || board[file][square[1] - 1][0] === 'W') squares.push(file + (square[1] - 1));
						});
						break;
					}
					default: break;
				}
				break;
			}
			case 'K': {
				const files = this.adjFiles(square[0]);
				files.push(square[0]);
				files.forEach(file => {
					for (let i = -1; i < 2; i++) {
						if (pre || square[1] + i < 9 && square[1] + i > 0 && !(file === square[0] && !i) && (!board[file][square[1] + i] || !board[file][square[1] + i].startsWith(side))) squares.push(file + (square[1] + i));
					}
				});
				if (pre) {
					const opp = this.turn === 'W' ? 'B' : 'W';
					if (this[opp].Km) break;
					if (!this[opp].Rhm) squares.push('g' + square[1]);
					if (!this[opp].Ram) squares.push('c' + square[1]);
				}
				break;
			}
			case 'R':{
				for (let i = square[1] - 1; i > 0; i--) {
					if (!board[square[0]][i]) {
						squares.push(square[0] + i);
						continue;
					}
					if (board[square[0]][i].startsWith(side)) break;
					else {
						squares.push(square[0] + i);
						break;
					}
				}
				for (let i = square[1] + 1; i < 9; i++) {
					if (!board[square[0]][i]) {
						squares.push(square[0] + i);
						continue;
					}
					if (board[square[0]][i].startsWith(side)) break;
					else {
						squares.push(square[0] + i);
						break;
					}
				}
				for (let i = this.increment(square[0]); i; i = this.increment(i)) {
					if (!board[i][square[1]]) {
						squares.push(i + square[1]);
						continue;
					}
					if (board[i][square[1]].startsWith(side)) break;
					else {
						squares.push(i + square[1]);
						break;
					}
				}
				for (let i = this.decrement(square[0]); i; i = this.decrement(i)) {
					if (!board[i][square[1]]) {
						squares.push(i + square[1]);
						continue;
					}
					if (board[i][square[1]].startsWith(side)) break;
					else {
						squares.push(i + square[1]);
						break;
					}
				}
				break;
			}
			case 'N': {
				squares = this.knightSquares(square[0], square[1]).filter(pos => !board[pos[0]][pos[1]].startsWith(side));
				break;
			}
			case 'B': {
				let j = 0;
				for (let i = this.increment(square[0]); i && square[1] + j < 8; i = this.increment(i)) {
					if (!board[i][square[1] + ++j]) {
						squares.push(i + (square[1] + j));
						continue;
					}
					if (board[i][square[1] + j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] + j));
						break;
					}
				}
				j = 0;
				for (let i = this.increment(square[0]); i && square[1] - j > 1; i = this.increment(i)) {
					if (!board[i][square[1] - ++j]) {
						squares.push(i + (square[1] - j));
						continue;
					}
					if (board[i][square[1] - j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] - j));
						break;
					}
				}
				j = 0;
				for (let i = this.decrement(square[0]); i && square[1] + j < 8; i = this.decrement(i)) {
					if (!board[i][square[1] + ++j]) {
						squares.push(i + (square[1] + j));
						continue;
					}
					if (board[i][square[1] + j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] + j));
						break;
					}
				}
				j = 0;
				for (let i = this.decrement(square[0]); i && square[1] - j > 1; i = this.decrement(i)) {
					if (!board[i][square[1] - ++j]) {
						squares.push(i + (square[1] - j));
						continue;
					}
					if (board[i][square[1] - j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] - j));
						break;
					}
				}
				break;
			}
			case 'Q': {
				for (let i = square[1] - 1; i > 0; i--) {
					if (!board[square[0]][i]) {
						squares.push(square[0] + i);
						continue;
					}
					if (board[square[0]][i].startsWith(side)) break;
					else {
						squares.push(square[0] + i);
						break;
					}
				}
				for (let i = square[1] + 1; i < 9; i++) {
					if (!board[square[0]][i]) {
						squares.push(square[0] + i);
						continue;
					}
					if (board[square[0]][i].startsWith(side)) break;
					else {
						squares.push(square[0] + i);
						break;
					}
				}
				for (let i = this.increment(square[0]); i; i = this.increment(i)) {
					if (!board[i][square[1]]) {
						squares.push(i + square[1]);
						continue;
					}
					if (board[i][square[1]].startsWith(side)) break;
					else {
						squares.push(i + square[1]);
						break;
					}
				}
				for (let i = this.decrement(square[0]); i; i = this.decrement(i)) {
					if (!board[i][square[1]]) {
						squares.push(i + square[1]);
						continue;
					}
					if (board[i][square[1]].startsWith(side)) break;
					else {
						squares.push(i + square[1]);
						break;
					}
				}
				let j = 0;
				for (let i = this.increment(square[0]); i && square[1] + j < 8; i = this.increment(i)) {
					if (!board[i][square[1] + ++j]) {
						squares.push(i + (square[1] + j));
						continue;
					}
					if (board[i][square[1] + j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] + j));
						break;
					}
				}
				j = 0;
				for (let i = this.increment(square[0]); i && square[1] - j > 1; i = this.increment(i)) {
					if (!board[i][square[1] - ++j]) {
						squares.push(i + (square[1] - j));
						continue;
					}
					if (board[i][square[1] - j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] - j));
						break;
					}
				}
				j = 0;
				for (let i = this.decrement(square[0]); i && square[1] + j < 8; i = this.decrement(i)) {
					if (!board[i][square[1] + ++j]) {
						squares.push(i + (square[1] + j));
						continue;
					}
					if (board[i][square[1] + j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] + j));
						break;
					}
				}
				j = 0;
				for (let i = this.decrement(square[0]); i && square[1] - j > 1; i = this.decrement(i)) {
					if (!board[i][square[1] - ++j]) {
						squares.push(i + (square[1] - j));
						continue;
					}
					if (board[i][square[1] - j].startsWith(side)) break;
					else {
						squares.push(i + (square[1] - j));
						break;
					}
				}
				break;
			}
			default: return [piece];
		}
		return squares;
	}
	getLocationsOfPiecesAgainst (piece, final, board) {
		if (!board) board = this.board;
		if (Array.isArray(final)) final = final.join('');
		if (!/^[BW][PKQRBN]$/.test(piece)) return null;
		const out = [];
		Object.keys(board).forEach(l => {
			for (let i = 1; i < 9; i++) {
				if (board[l][i] === piece) out.push(l + i);
			}
		});
		return out.filter(loc => this.getSquares(loc, board).includes(final));
	}
	checkChecks (side, board) {
		if (!board) board = this.board;
		let kSquare = null, checkedSquares = [];
		for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
			for (const rank of [1, 2, 3, 4, 5, 6, 7, 8]) {
				if (!board[file][rank]) continue;
				if (side === board[file][rank][0]) {
					if (board[file][rank][1] === 'K') {
						kSquare = file + rank;
						if (checkedSquares.includes(kSquare)) return true;
					}
					continue;
				}
				for (const square of this.getSquares(file + rank, board)) {
					if (!kSquare && !checkedSquares.includes(square)) checkedSquares.push(square);
					else {
						if (kSquare && square === kSquare) {
							return file + rank;
						}
					}
				}
			}
		}
		return false;
	}
	allValidMoves (side, board) {
		if (!board) board = this.board;
		let valids = [];
		['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(file => {
			[1, 2, 3, 4, 5, 6, 7, 8].forEach(rank => {
				if (!board[file][rank]) return;
				if (side === board[file][rank][0]) {
					valids = valids.concat(this.getValidMoves(file + rank, board).map(squ => `${this.getPiece(file + rank, board).join('')}${file}${rank}-${squ}`));
					return;
				}
			});
		});
		return valids;
	}
	checkAttacksAgainst (square, side, board) {
		if (!board) board = this.board;
		let flag = false;
		if (Array.isArray(square)) square = square.join('');
		['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(file => {
			[1, 2, 3, 4, 5, 6, 7, 8].forEach(rank => {
				if (flag) return;
				if (!board[file][rank]) return;
				if (side === board[file][rank][0]) return;
				if (this.getSquares(file + rank, board).includes(square)) return flag = true;
			});
		});
		return flag;
	}
	simPlay (side, piece, origin, final, board) {
		if (!board) board = JSON.parse(JSON.stringify(this.board));
		else board = JSON.parse(JSON.stringify(board));
		board[origin[0]][origin[1]] = '';
		board[final[0]][final[1]] = side + piece;
		return board;
	}
	getValidMoves (square, board) {
		const recept = this.getPiece(square), piece = recept[1], side = recept[0];
		if (!board) board = this.board;
		square = [square[0], parseInt(square[1])];
		let simSquares = [];
		if (piece === 'P') {
			if (side === 'W' && square[1] === 5 && this.lastMoveP2 && this.adjFiles(square[0]).includes(this.lastMoveP2)) simSquares.push(this.lastMoveP2 + 6);
			else if (side === 'B' && square[1] === 4 && this.lastMoveP2 && this.adjFiles(square[0]).includes(this.lastMoveP2)) simSquares.push(this.lastMoveP2 + 3);
		} else if (piece === 'K') {
			if (side === 'W' && !this.W.Km && this.board.h[1] === 'WR' && !this.board.f[1] && !this.board.g[1] && !this.W.Rhm && !this.checkAttacksAgainst('e1', 'W') && !this.checkAttacksAgainst('f1', 'W') && !this.checkAttacksAgainst('g1', 'W')) simSquares.push('g1');
			if (side === 'W' && !this.W.Km && this.board.a[1] === 'WR' && !this.board.d[1] && !this.board.c[1] && !this.board.b[1] && !this.W.Ram && !this.checkAttacksAgainst('e1', 'W') && !this.checkAttacksAgainst('d1', 'W') && !this.checkAttacksAgainst('c1', 'W')) simSquares.push('c1');
			if (side === 'B' && !this.B.Km && this.board.h[8] === 'BR' && !this.board.f[8] && !this.board.g[8] && !this.B.Rhm && !this.checkAttacksAgainst('e8', 'B') && !this.checkAttacksAgainst('f8', 'B') && !this.checkAttacksAgainst('g8', 'B')) simSquares.push('g8');
			if (side === 'B' && !this.B.Km && this.board.a[8] === 'BR' && !this.board.d[8] && !this.board.c[8] && !this.board.b[8] && !this.B.Ram && !this.checkAttacksAgainst('e8', 'B') && !this.checkAttacksAgainst('d8', 'B') && !this.checkAttacksAgainst('c8', 'B')) simSquares.push('c8');
		}
		simSquares = simSquares.concat(this.getSquares(square, board));
		return simSquares.filter(squ => !this.checkChecks(side, this.simPlay(side, piece, square, squ, board)));
	}
	play (side, origin, final, callback) {
		if (!side || !(typeof side === 'string') || !origin || !(typeof origin === 'string') || !final || !(typeof final === 'string') || !callback || !(typeof callback === 'function')) return console.log('Invalid arguments.');
		if (!(this.turn === side)) return callback(0, 'Not your turn.');
		let moves = this.getValidMoves(origin), piece = this.getPiece(origin), captureFlag = '', curBoard = JSON.parse(JSON.stringify(this.board));
		if (piece[0] !== side) return;
		piece = piece[1];
		this[side].preMove = [];
		if (!moves.includes(final)) return callback(0, 'Move was invalid.');
		this.lastMove = [origin, final];
		if (this.board[final[0]][final[1]] && !this.board[final[0]][final[1]].startsWith(side)) {
			const capture = this.board[final[0]][final[1]];
			captureFlag = 'x';
			this[side].captures.push(capture[1]);
			if (capture[1] === 'R' && capture[0] !== side && ['a1', 'a8', 'h1', 'h8'].includes(final) && !this[side === 'W' ? 'B' : 'W']['R' + final[0] + 'm']) this[side === 'W' ? 'B' : 'W']['R' + final[0] + 'm'] = true;
		}
		if (piece === 'P' && !(final[0] === origin[0]) && !this.board[final[0]][final[1]]) {
			this[side].captures.push('P');
			captureFlag = 'x';
			this.board[final[0]][origin[1]] = '';
		}
		if (piece === 'P' && Math.abs(final[1] - origin[1]) === 2) {
			this.board[final[0]][final[1]] = side + 'P';
			this.board[origin[0]][origin[1]] = '';
			this.lastMoveP2 = origin[0];
			this.moves.push(captureFlag ? `${origin[0]}x${final[0]}${final[1]}` : final);
			this.switchSides();
			if (!this.allValidMoves(this.turn, this.board).length) {
				if (this.checkChecks(this.turn, this.board)) {
					this.moves[this.moves.length - 1] += '#';
					return callback(3);
				} else {
					this.moves[this.moves.length - 1] += '$';
					return callback(4);
				}
			}
			if (this.checkChecks(this.turn, this.board)) this.moves[this.moves.length - 1] += '+';
			return callback(1);
		}
		this.lastMoveP2 = false;
		if (piece === 'K') {
			if (this.increment(this.increment(origin[0])) === final[0] || this.decrement(this.decrement(origin[0])) === final[0]) {
				if (final[0] === 'g') {
					this.board.g[origin[1]] = side + 'K';
					this.board.f[origin[1]] = side + 'R';
					this.board.e[origin[1]] = '';
					this.board.h[origin[1]] = '';
					this[side].Km = true;
					this[side].Rhm = true;
					this.moves.push('0-0');
					this.switchSides();
					if (!this.allValidMoves(this.turn, this.board).length) {
						if (this.checkChecks(this.turn, this.board)) {
							this.moves[this.moves.length - 1] += '#';
							return callback(3);
						} else {
							this.moves[this.moves.length - 1] += '$';
							return callback(4);
						}
					}
					if (this.checkChecks(this.turn, this.board)) this.moves[this.moves.length - 1] += '+';
					return callback(1);
				}
				if (final[0] === 'c') {
					this.board.c[origin[1]] = side + 'K';
					this.board.d[origin[1]] = side + 'R';
					this.board.e[origin[1]] = '';
					this.board.a[origin[1]] = '';
					this[side].Km = true;
					this[side].Ram = true;
					this.moves.push('0-0-0');
					this.switchSides();
					if (!this.allValidMoves(this.turn, this.board).length) {
						if (this.checkChecks(this.turn, this.board)) {
							this.moves[this.moves.length - 1] += '#';
							return callback(3);
						} else {
							this.moves[this.moves.length - 1] += '$';
							return callback(4);
						}
					}
					if (this.checkChecks(this.turn, this.board)) this.moves[this.moves.length - 1] += '+';
					return callback(1);
				}
			}
			this[side].Km = true;
		}
		if (piece === 'R' && ['a1', 'a8', 'h1', 'h8'].includes(origin)) this[side]['R' + origin[0] + 'm'] = true;
		this.board[origin[0]][origin[1]] = '';
		this.board[final[0]][final[1]] = side + piece;
		if (piece === 'P' && [1, 8].includes(parseInt(final[1]))) {
			this[side].isPromoting = 1;
			if (captureFlag) this[side].isPromoting = origin[0];
			return callback(2, final);
		}
		switch (piece) {
			case 'P':
			{
				this.moves.push(captureFlag ? `${origin[0]}x${final[0]}${final[1]}` : final);
				break;
			}
			case 'K':
			{
				this.moves.push(`K${captureFlag}${final}`);
				break;
			}
			default:
			{
				const pos = this.getLocationsOfPiecesAgainst(this.turn + piece, final, curBoard);
				if (pos.length === 1) this.moves.push(piece + captureFlag + final);
				else if (pos.filter(loc => loc[0] === origin[0]).length === 1) this.moves.push(piece + origin[0] + captureFlag + final);
				else if (pos.filter(loc => loc[1] === origin[1]).length === 1) this.moves.push(piece + origin[1] + captureFlag + final);
				else this.moves.push(piece + origin + captureFlag + final);
				break;
			}
		}
		this.switchSides();
		if (!this.allValidMoves(this.turn, this.board).length) {
			if (this.checkChecks(this.turn, this.board)) {
				this.moves[this.moves.length - 1] += '#';
				return callback(3);
			} else {
				this.moves[this.moves.length - 1] += '$';
				return callback(4);
			}
		}
		if (this.checkChecks(this.turn, this.board)) this.moves[this.moves.length - 1] += '+';
		return callback(1);
	}
	promote (piece, square, side, callback) {
		if (!(this.turn === side) || !this[side].isPromoting || !this.board[square[0]][square[1]] === side + 'P') return null;
		const captureFlag = this[side].isPromoting === 1 ? '' : this[side].isPromoting + 'x';
		this[side].isPromoting = false;
		this.board[square[0]][square[1]] = side + piece;
		this.moves.push(captureFlag + square + '=' + piece);
		this.switchSides();
		if (!this.allValidMoves(this.turn, this.board).length) {
			if (this.checkChecks(this.turn, this.board)) {
				this.moves[this.moves.length - 1] += '#';
				return callback(3);
			} else return callback(4);
		}
		if (this.checkChecks(this.turn, this.board)) this.moves[this.moves.length - 1] += '+';
		return callback(1);
	}
	getColourOf (square, flag) {
		if (flag) {
			if (flag === 'last' && this.colours.last) return this.colours.last;
			if (flag === 'sel' && this.colours.sel) return this.colours.sel;
			if (flag === 'hl' && this.colours.hl) return this.colours.hl;
		}
		if (typeof square === 'number') return square % 2 ? this.colours.B : this.colours.W;
		let a = parseInt(square[1]), b = 0;
		if (['b', 'd', 'f', 'h'].includes(square[0])) b = 1;
		return (a + b) % 2 ? this.colours.B : this.colours.W;
	}
	boardHTML (side, selected, highlighted, spectatorSide) {
		let html = '', imgsrc, room = this.room;
		if (room.startsWith('groupchat-') || this.useEmo) imgsrc = this.emosrc;
		else imgsrc = this.imgsrc;
		const iT = side === this.turn;
		if (selected && this.getPiece(selected)[0] !== side) selected = highlighted = null;
		const board = this.board;
		if (!spectatorSide) spectatorSide = 'W';
		// TODO: ...I'm crying now
		// Why is this code so horrible
		// 2020 PartMan, you suck
		switch (side) {
			case 'W': {
				html += `<table style="border-collapse:collapse;" border="1"><tr style="height: 15;"><th width="15" height="15"></th><th width="40">A</th><th width="40">B</th><th width="40">C</th><th width="40">D</th><th width="40">E</th><th width="40">F</th><th width="40">G</th><th width="40">H</th><th width="15"></th></tr>`;
				let j = 0;
				for (let i = 8; i > 0; i--) {
					html += `<tr style="height: 40;"><td height="40"><b><center>${i}</center></b></td>`;
					html += Object.keys(board).map(file => {
						if (selected && file + i === selected) return ['sel', board[file][i], file];
						if (highlighted && highlighted.includes(file + i)) return ['hl', board[file][i], file];
						if (this.colours.last && this.lastMove && this.lastMove.length && this.lastMove.includes(file + i)) return ['last', board[file][i], file];
						if (this.colours.last && this.W.preMove && this.W.preMove.length && this.W.preMove.includes(file + i)) return ['last', board[file][i], file];
						return [0, board[file][i], file];
					}).map(piece => {
						if (piece[0] === 0) return `<td style="background: ${this.getColourOf(j++)};" height="40"><button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} select ${this.id} ${piece[2]}${i}" style="background: none; border: none;">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</button></td>`;
						if (piece[0] === 'hl') return `<td style="background: linear-gradient(${this.getColourOf(j, 'hl')}, ${this.getColourOf(j, 'hl')}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j++)});" height="40"><button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} ${iT ? 'play' : 'premove'} ${this.id} ${selected}-${piece[2]}${i}" style="background: none; border: none; width: 100%; height: 100%;">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</button></td>`;
						if (piece[0] === 'sel') return `<td style="background: linear-gradient(${this.getColourOf(j, 'sel')}, ${this.getColourOf(j, 'sel')}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j++)});" height="40"><button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} deselect ${this.id}" style="background: none; border: none; width: 100%; height: 100%;">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</button></td>`;
						if (piece[0] === 'last') return `<td style="background: linear-gradient(${this.getColourOf(j, 'last')}, ${this.getColourOf(j, 'last')}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j++)}); text-align: center;" height="40">${iT ? '' : `<button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} select ${this.id} ${piece[2]}${i}" style="background: none; border: none;">`}${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}${iT ? '' : '</button>'}</td>`;
						return null;
					}).join('');
					html += `<th>${i}</th></tr>`;
					j++;
				}
				html += '<tr height="15"><th height="15"></th><th height="15">A</th><th height="15">B</th><th height="15">C</th><th height="15">D</th><th height="15">E</th><th height="15">F</th><th height="15">G</th><th height="15">H</th><th height="15"></th></tr></table>';
				break;
			}
			case 'B': {
				html += `<table style="border-collapse:collapse;" border="1"><tr style="height: 15;"><th width="15" height="15"></th><th width="40" height="15">H</th><th width="40" height="15">G</th><th width="40" height="15">F</th><th width="40" height="15">E</th><th width="40" height="15">D</th><th width="40" height="15">C</th><th width="40" height="15">B</th><th width="40" height="15">A</th><th width="15" height="15"></th></tr>`;
				let j = 0;
				for (let i = 1; i < 9; i++) {
					html += `<tr style="height: 40;"><td height="40"><b><center>${i}</center></b></td>`;
					html += Object.keys(board).reverse().map(file => {
						if (selected && file + i === selected) return ['sel', board[file][i], file];
						if (highlighted && highlighted.includes(file + i)) return ['hl', board[file][i], file];
						if (this.colours.last && this.lastMove && this.lastMove.length && this.lastMove.includes(file + i)) return ['last', board[file][i], file];
						if (this.colours.last && this.B.preMove && this.B.preMove.length && this.B.preMove.includes(file + i)) return ['last', board[file][i], file];
						return [0, board[file][i], file];
					}).map(piece => {
						if (piece[0] === 0) return `<td style="background: ${this.getColourOf(j++)};" height="40"><button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} select ${this.id} ${piece[2]}${i}" style="background: none; border: none;">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</button></td>`;
						if (piece[0] === 'hl') return `<td style="background: linear-gradient(${this.getColourOf(j, 'hl')}, ${this.getColourOf(j, 'hl')}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j++)});" height="40"><button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} ${iT ? 'play' : 'premove'} ${this.id} ${selected}-${piece[2]}${i}" style="background: none; border: none; width: 100%; height: 100%;">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</button></td>`;
						if (piece[0] === 'sel') return `<td style="background: linear-gradient(${this.getColourOf(j, 'sel')}, ${this.getColourOf(j, 'sel')}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j++)});" height="40"><button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} deselect ${this.id}" style="background: none; border: none; width: 100%; height: 100%;">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</button></td>`;
						if (piece[0] === 'last') return `<td style="background: linear-gradient(${this.getColourOf(j, 'last')}, ${this.getColourOf(j, 'last')}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j++)}); text-align: center;" height="40">${iT ? '' : `<button name="send" value="/msgroom ${this.room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${this.room} select ${this.id} ${piece[2]}${i}" style="background: none; border: none;">`}${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}${iT ? '' : '</button>'}</td>`;
						return null;
					}).join('');
					html += `<th width="15">${i}</th></tr>`;
					j++;
				}
				html += '<tr style="height: 35;"><th width="15"></th><th width="40">H</th><th width="40">G</th><th width="40">F</th><th width="40">E</th><th width="40">D</th><th width="40">C</th><th width="40">B</th><th width="40">A</th><th width="15"></th></tr></table>';
				break;
			}
			default: {
				switch (spectatorSide) {
					case 'B': {
						html += `<table style="border-collapse:collapse;" border="1"><tr style="height: 15;"><th width="15" height="15"></th><th width="40" height="15">H</th><th width="40" height="15">G</th><th width="40" height="15">F</th><th width="40" height="15">E</th><th width="40" height="15">D</th><th width="40" height="15">C</th><th width="40" height="15">B</th><th width="40" height="15">A</th><th width="15" height="15"></th></tr>`;
						let j = 0;
						for (let i = 1; i < 9; i++) {
							html += `<tr style="height: 40;"><td height="40"><b><center>${i}</center></b></td>`;
							html += Object.keys(board).reverse().map(file => {
								if (selected && file + i === selected) return ['sel', board[file][i], file];
								if (highlighted && highlighted.includes(file + i)) return ['hl', board[file][i], file];
								if (this.colours.last && this.lastMove && this.lastMove.length && this.lastMove.includes(file + i)) return ['last', board[file][i], file];
								return [0, board[file][i], file];
							}).map(piece => {
								const out = `<td style="text-align: center; background: ${piece[0] ? `linear-gradient(${this.getColourOf(j, piece[0])}, ${this.getColourOf(j, piece[0])}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j)})` : this.getColourOf(j)};" height="40" width="40">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</td>`;
								j++;
								return out;
							}).join('');
							html += `<th>${i}</th></tr>`;
							j++;
						}
						html += '<tr style="height: 35;"><th width="15"></th><th width="40">H</th><th width="40">G</th><th width="40">F</th><th width="40">E</th><th width="40">D</th><th width="40">C</th><th width="40">B</th><th width="40">A</th><th width="15"></th></tr></table>';
						break;
					}
					default: {
						html += `<table style="border-collapse:collapse;" border="1"><tr style="height: 15;"><th width="15" height="15"></th><th width="40">A</th><th width="40">B</th><th width="40">C</th><th width="40">D</th><th width="40">E</th><th width="40">F</th><th width="40">G</th><th width="40">H</th><th width="15"></th></tr>`;
						let j = 0;
						for (let i = 8; i > 0; i--) {
							html += `<tr style="height: 40;"><td height="40"><b><center>${i}</center></b></td>`;
							html += Object.keys(board).map(file => {
								if (selected && file + i === selected) return ['sel', board[file][i], file];
								if (highlighted && highlighted.includes(file + i)) return ['hl', board[file][i], file];
								if (this.colours.last && this.lastMove && this.lastMove.length && this.lastMove.includes(file + i)) return ['last', board[file][i], file];
								return [0, board[file][i], file];
							}).map(piece => {
								const out = `<td style="text-align: center; background: ${piece[0] ? `linear-gradient(${this.getColourOf(j, piece[0])}, ${this.getColourOf(j, piece[0])}), linear-gradient(${this.getColourOf(j)}, ${this.getColourOf(j)})` : this.getColourOf(j)};" height="40" width="40">${piece[1] ? imgsrc[piece[1]] || piece[1] : ''}</td>`;
								j++;
								return out;
							}).join('');
							html += `<th>${i}</th></tr>`;
							j++;
						}
						html += '<tr height="15"><th height="15"></th><th height="15">A</th><th height="15">B</th><th height="15">C</th><th height="15">D</th><th height="15">E</th><th height="15">F</th><th height="15">G</th><th height="15">H</th><th height="15"></th></tr></table>';
					}
				}
				break;
			}
		}
		return html;
	}
	spectatorSend (html) {
		return new Promise((resolve, reject) => {
			const sender = list => {
				if (!list.length) return resolve();
				Bot.say(this.room, `/sendhtmlpage ${list[0]}, Chess + ${this.room} + ${this.id}, ${html.replace('BOARDHTML', this.boardHTML(null, null, null, this.spectators[list.shift()]))}`);
				setTimeout(sender, 200, list);
			};
			const list = Object.keys(this.spectators);
			sender(list);
		});
	}

	static toPGN (game) {
		const out = [];
		game.moves.forEach((move, index) => {
			if (index % 2 === 0) out.push(index / 2 + 1 + '.');
			out.push(move);
		});
		out.push(game.result);
		const header = `[White "${game.W.name.replace(/"/g, '')}"]\n[Black "${game.B.name.replace(/"/g, '')}"]\n\n`;
		return header + out.join(' ').replace(/\$/g, '');
	}

	static FEN (line) {
		return new Promise((resolve, reject) => {
			const args = line.trim().split(' ');
			if (!args[0]) return reject(new Error('Missing board state'));
			if (!args[1]) return reject(new Error('Missing white/black\'s turn'));
			const turn = toID(args[1])[0];
			if (!'wb'.includes(turn)) return reject(new Error('Turn only works with W/B'));
			const expanded = args[0].replace(/\d/g, n => Array.from({ length: parseInt(n) }).map(() => '-').join(''));
			if (!/^(?:[rnbqkpRNBQKP-]{8}\/){7}[rnbqkpRNBQKP-]{8}/.test(expanded)) return reject(new Error('Invalid FEN'));
			const board = {}, files = 'abcdefgh';
			for (let i = 0; i < 8; i++) board[files[i]] = Array.from({ length: 9 }).map(() => null);
			expanded.split('/').forEach((term, i) => {
				const rank = 8 - i, row = term.split('');
				for (let j = 0; j < 8; j++) {
					const char = row.shift();
					switch (char) {
						case '-': board[files[j]][rank] = '  '; break;
						default: board[files[j]][rank] = `${char === char.toUpperCase() ? 'W' : 'B'}${char.toUpperCase()}`;
					}
				}
			});
			return resolve([board, turn.toUpperCase()]);
		});
	}

	static uploadToLichess (text, callback) {
		return axios.post('https://lichess.org/api/import', { pgn: text }).then(res => res.data.url);
	}
}

module.exports = Chess;
