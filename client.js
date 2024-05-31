// Updated version of Ecuacion's connection.

const axios = require('axios');
const util = require('util');
const https = require('https');
const url = require('url');
const EventEmitter = require('events');
const WebSocketClient = require('websocket').client;

function toID (text) {
	if (typeof text !== 'string') return text;
	return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

class Client extends EventEmitter {
	constructor (opts = {}) {
		super();
		this.opts = {
			server: 'sim3.psim.us',
			serverid: 'showdown',
			port: 80,
			secprotocols: [],
			connectionTimeout: 2 * 60 * 1000,
			loginServer: 'https://play.pokemonshowdown.com/~~showdown/action.php',
			nickName: null,
			pass: null,
			avatar: null,
			status: null,
			retryLogin: 4 * 1000,
			autoConnect: true,
			autoReconnect: true,
			autoReconnectDelay: 5 * 1000,
			autoJoin: [],
			showErrors: true,
			debug: false
		};
		Object.assign(this.opts, opts);

		this._queued = [];

		this.keys = {};
		this.pageData = {};
		this.rooms = {};
		this.battleRooms = {};
		this.streams = {};

		[].forEach(room => {
			this.streams[room] = fs.createWriteStream(`./data/LOGS/${room}.txt`, { flags: 'a' });
		});

		this.jps = {};
		this.jpcool = {};
		fs.readdir('./data/JPS', (err, files) => {
			if (err) return console.log(err);
			files.forEach(room => {
				fs.readFile(`./data/JPS/${room}`, 'utf8', (e, file) => {
					if (e) return console.log(e);
					this.jps[room.substr(0, room.length - 5)] = JSON.parse(file);
				});
			});
		});

		this._customEvents = {};
		this.runEvent = function (event, ...args) {
			if (!event) return;
			if (typeof this._customEvents[event] === 'function') return this._customEvents[event](args);
			else return false;
		};
		this.registerEvent = function (event, func) {
			if (typeof func !== 'function') throw new TypeError('func must be a function');
			if (typeof this._customEvents[event] === 'function') {
				throw new Error(`Event '${event}' already exists`);
			} else this._customEvents[event] = func;
		};

		this.auth = Object.assign({}, config.auth);

		this.connection = null;
		this.status = {
			connected: false,
			nickName: null
		};
		this.challstr = {
			id: 0,
			str: ''
		};
		this.debug = function (str) {
			if (this.opts.debug) console.log('DEBUG: ' + str);
		};
		this.error = function (str) {
			if (this.opts.showErrors) console.log('ERROR: ' + str);
		};
		this.getRooms = function (user) {
			user = toID(user);
			return Object.keys(this.rooms).filter(room => this.rooms[room]?.users?.find(u => toID(u) === user));
		};
	}
}

// TODO: Cut down on unnecessary prototypes, or at least abstract them away

Client.prototype.init = function () {
	if (this.opts.autoConnect) this.connect();
	if (this.opts.connectionTimeout) this.startConnectionTimeOut();
};

Client.prototype.serve = function (user, html) {
	const id = toID(user);
	if (!this.keys[id]) this.keys[id] = 7000 + Math.floor(Math.random() * 93000);
	this.pageData[id] = html;
	return this.pm(user, `${websiteLink}/user/${id}/${this.keys[id]}`);
};

Client.prototype.sendHTML = function (user, html) {
	const cRooms = this.getRooms(user);
	for (const room of cRooms) {
		if (this.rooms[room] && ['*', '#', '&', '~', '★'].includes(this.rooms[room].rank)) {
			return this.say(room, `/pminfobox ${user}, ${html.replace(/\n/g, '')}`);
		}
	}
	if (!this.keys) return undefined;
	const id = toID(user);
	if (!this.keys[id]) this.keys[id] = 7000 + Math.floor(Math.random() * 93000);
	return this.serve(user, html);
};


/********************************
 *          Connection          *
 ********************************/

Client.prototype.connect = function (retry) {
	if (retry) this.debug('Retrying...');
	if (this.status.connected) return this.error('Already connected');
	this.closed = false;
	const webSocket = new WebSocketClient({ maxReceivedFrameSize: 104857600 });
	this.webSocket = webSocket;
	this.rooms = {};
	this.roomcount = 0;
	webSocket.on('connectFailed', err => {
		this.error('Could not connect to server ' + this.opts.server + ': ' + util.inspect(err));
		this.emit('disconnect', err);
		if (this.opts.autoReconnect) {
			this.debug('Retrying in ' + this.opts.autoReconnectDelay / 1000 + ' seconds');
			setTimeout(() => this.connect(true), this.opts.autoReconnectDelay);
		}
	});
	webSocket.on('connect', connection => {
		this.emit('connect', connection);
		this.debug('Connected to server: ' + this.opts.server);
		this.status.connected = true;
		this.connection = connection;
		this._spacer = setInterval(() => {
			this.send(this._queued.splice(0, 3));
		}, 100);
		connection.on('error', err => {
			this.error('Connection error: ' + util.inspect(err));
			this.connection = null;
			this.status.connected = false;
			this.emit('disconnect', err);
			if (this.opts.autoReconnect) {
				this.debug('Retrying in ' + this.opts.autoReconnectDelay / 1000 + ' seconds.');
				setTimeout(() => this.connect(true), this.opts.autoReconnectDelay);
			}
		});
		connection.on('close', () => {
			this.debug('Connection closed: ' + util.inspect(arguments));
			this.connection = null;
			this.status.connected = false;
			this.emit('disconnect', 0);
			clearInterval(this._spacer);
			if (!this.closed && this.opts.autoReconnect) {
				this.debug('Retrying in ' + this.opts.autoReconnectDelay / 1000 + ' seconds.');
				setTimeout(() => this.connect(true), this.opts.autoReconnectDelay);
			}
		});
		connection.on('message', message => {
			if (message.type === 'utf8') {
				this.emit('message', message.utf8Data);
				this.receive(message.utf8Data);
			}
		});
	});
	const id = ~~(Math.random() * 900) + 100;
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789_'.split('');
	const str = Array.from({ length: 8 }).map(() => chars.random()).join('');
	const conStr = `ws://${this.opts.server}:${this.opts.port}/showdown/${id}/${str}/websocket`;
	this.debug(`Connecting to ${conStr} - secondary protocols: ${util.inspect(this.opts.secprotocols)}`);
	webSocket.connect(conStr, this.opts.secprotocols);
};

Client.prototype.disconnect = function () {
	this.closed = true;
	this.connection?.close();
};

Client.prototype.softDisconnect = function () {
	this.connection?.close();
};

/***************************
 *          Login          *
 ***************************/

Client.prototype.rename = async function (nick, pass) {
	this.debug('Sending login request...');
	let res;
	if (!pass) {
		res = await axios.get(this.opts.loginServer, {
			params: { act: 'getassertion', userid: toID(nick), challengekeyid: this.challstr.id, challstr: this.challstr.str }
		});
	} else {
		res = await axios.post(this.opts.loginServer, {}, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			params: { act: 'login', name: toID(nick), pass: pass, challengekeyid: this.challstr.id, challstr: this.challstr.str }
		});
	}
	const response = res.data;
	try {
		if (response === ';') throw new Error('Username is registered but no password given');
		else if (response.length < 50) throw new Error(`Failed to login: ${response}`);
		else if (response.includes('heavy load')) throw new Error('The login server is under heavy load');

		let trnData;
		try {
			const resData = JSON.parse(response.substr(1));
			if (!resData.actionsuccess) throw new Error(`Failed to login: ${response}`);
			trnData = resData.assertion;
			if (trnData.startsWith(';;')) throw new Error(trnData.substr(2));
		} catch (err) {
			if (err.message.includes('JSON')) trnData = response;
			else throw err;
			// POST (registered) login uses JSON, GET (unregistered) login uses the string directly;
		}
		this.debug('Sending login trn...');
		this.send(`|/trn ${nick},0,${trnData}`);
		return Promise.resolve('Received assertion successfully');
	} catch (err) {
		this.error(err);
		if (this.opts.retryLogin) {
			this.debug(`Retrying login in ${this.opts.retryLogin / 1000} seconds...`);
			setTimeout(() => this.rename(nick, pass), this.opts.retryLogin);
		}
		this.emit('renamefailure', err);
	}
};

/**********************************
 *          Sending data          *
 **********************************/

Client.prototype.send = function (data, delay) {
	const connection = this.connection;
	if (!delay) delay = 1200;
	if (connection && connection.connected) {
		if (!(data instanceof Array)) {
			data = [data.toString()];
		}
		if (data.length > 3) {
			let spacer;
			const nextToSend = () => {
				if (!data.length) return clearInterval(spacer);
				const toSend = JSON.stringify(data.splice(0, 3));
				this.emit('send', toSend);
				connection.send(toSend);
			};
			spacer = setInterval(nextToSend, delay);
			nextToSend();
		} else {
			data = JSON.stringify(data);
			this.emit('send', data);
			connection.send(data);
		}
	} else {
		this.error('Could not send data: ERR_NOT_CONNECTED');
		this.emit('sendfailure', -1);
	}
};

Client.prototype.say = function (room, msg) {
	if (room.charAt(0) === ',') return this.pm(room.substr(1), msg);
	else this._queued.push(room + '|' + msg);
};

Client.prototype.pm = function (user, msg) {
	this._queued.push('|/pm ' + user + ',' + msg);
};

Client.prototype.roomReply = function (room, user, msg) {
	const formatted = tools.escapeHTML(msg).replace(/\n/g, '<br/>');
	return this.say(room, `/sendprivatehtmlbox ${user}, ${formatted}`);
};

Client.prototype.joinRooms = function (rooms) {
	this.send(rooms.map(room => `|/join ${room.toLowerCase()}`));
};

Client.prototype.setAvatar = function (avatar) {
	this._queued.push('|/avatar ' + avatar);
};

Client.prototype.setStatus = function (status) {
	this._queued.push('|/status ' + status);
};

Client.prototype.leaveRooms = function (rooms) {
	this.send(rooms.map(room => `|/leave ${room.toLowerCase()}`));
};

Client.prototype.log = function (...things) {
	console.log(...things);
	return new Promise((resolve, reject) => {
		things.forEach(thing => {
			fs.appendFile('./logs.txt', `\n${require('util').format(thing)}`, function (e) {
				if (e) return console.log(e);
				try {
					client.channels.cache.get('719087165241425981')
						?.send('```\n' + require('util').format(thing).substr(0, 1990) + '```')
						?.then(() => resolve()) || resolve();
				} catch (e) {
					console.log(e);
					resolve();
				}
			});
		});
	});
};

/************************************
 *          Data reception          *
 ************************************/

Client.prototype.receive = function (message) {
	this.lastMessage = Date.now();
	const flag = message.substr(0, 1);
	switch (flag) {
		case 'a': {
			const data = JSON.parse(message.substr(1));
			if (Array.isArray(data)) data.forEach(piece => this.receiveMsg(piece));
			else this.receiveMsg(message);
			break;
		}
	}
};

Client.prototype.receiveMsg = function (message) {
	if (!message) return;
	if (message.includes('\n')) {
		const spl = message.split('\n');
		let room = 'lobby';
		if (spl[0].charAt(0) === '>') {
			room = spl[0].substr(1);
			if (room === '') room = 'lobby';
			// Is this deprecated now?
		}
		for (let i = 0, len = spl.length; i < len; i++) {
			if (spl[i].split('|')[1] && spl[i].split('|')[1] === 'init') {
				for (let j = i; j < len; j++) this.receiveLine(room, spl[j], true);
				break;
			} else this.receiveLine(room, spl[i]);
		}
	} else this.receiveLine('lobby', message);
};

Client.prototype.receiveLine = function (room, message, isIntro) {
	const larg = message.substr(1).split('|');
	this.emit('line', room, message, isIntro, larg);
	if (room.startsWith('battle-')) this.emit('battle', room, message, isIntro, larg);
	switch (larg[0]) {
		case 'formats':
			break;
		case 'challstr':
			this.challstr = { id: larg[1], str: larg[2] };
			if (this.opts.nickName) this.rename(this.opts.nickName, this.opts.pass);
			break;
		case 'updateuser':
			if (larg[1].startsWith(' Guest ')) break;
			this.status.nickName = larg[1].substr(1);
			this.log('Connected to Pokémon Showdown.');
			if (!this.opts.status) this.setStatus('say ' + this.status.nickName + '? for help.');
			else this.setStatus(this.opts.status);
			if (parseInt(larg[2])) this.joinRooms(config.autoJoin);
			if (this.opts.avatar) this.setAvatar(this.opts.avatar);
			break;
		case 'c': {
			const by = larg[1];
			const timeOff = Date.now();
			larg.splice(0, 2);
			if (isIntro) this.emit('intro', room, timeOff, by, larg.join('|'));
			else if (by.substr(1) === this.status.nickName) this.emit('chatsuccess', room, timeOff, by, larg.join('|'));
			else this.emit('chat', room, timeOff, by, larg.join('|'));
			break;
		}
		case 'c:': {
			const by = larg[2];
			const timeOff = parseInt(larg[1]) * 1000;
			larg.splice(0, 3);
			if (isIntro) this.emit('intro', room, timeOff, by, larg.join('|'));
			else if (by.substr(1) === this.status.nickName) this.emit('chatsuccess', room, timeOff, by, larg.join('|'));
			else this.emit('chat', room, timeOff, by, larg.join('|'));
			break;
		}
		case 'init':
			if (!this.rooms[room]) {
				this.rooms[room] = { rank: false, users: [] };
				// if (this.baseAuth[room]) this.rooms[room].auth = Object.assign({}, this.baseAuth[room]);
				tools.loadShops(room);
				tools.loadLB(room);
				this.jpcool[room] = {};
			}
			this.send(`|/cmd roominfo ${room}`);
			this.emit('joinRoom', room);
			break;
		case 'users': {
			const args = larg[1].split(',');
			const amt = parseInt(args.shift());
			if (args.length !== amt) console.log('User initialization error: length did not match.', room);
			args.forEach(user => this.rooms[room].users.push(user));
			break;
		}
		case 'title':
			if (this.rooms[room]) this.rooms[room].title = larg[1];
			if (!room.startsWith('groupchat-') && !room.startsWith('battle-')) console.log(`Joined ${larg[1]}.`);
			break;
		case 'deinit':
			if (this.rooms[room]) {
				if (!room.startsWith('groupchat-') && !room.startsWith('battle-')) {
					console.log(`Left ${this.rooms[room].title}.`);
				}
				delete this.rooms[room];
			}
			break;
		case 'popup':
			this.emit('popup', larg.join('|').substr(6));
			break;
		case 'error':
			larg.splice(0, 1);
			this.emit('chaterror', room, larg.join('|'), isIntro);
			break;
		case 'popup':
			larg.splice(0, 1);
			this.emit('popup', larg.join('|'));
			break;
		case 'tour': case 'tournament':
			if (!isIntro) this.emit('tour', room, larg.slice(1, larg.length));
			break;
		case 'pm': {
			const by = larg[1];
			const dest = larg[2];
			larg.splice(0, 3);
			const pmcontent = larg.join('|');
			if (pmcontent.startsWith('/error ')) break;
			else if (by.substr(1) === this.status.nickName) this.emit('pmsuccess', dest, pmcontent);
			else this.emit('pm', by, pmcontent);
			break;
		}
		case 'queryresponse': {
			if (larg[1] === 'userdetails') {
				larg.splice(0, 2);
				this.emit('userdetails', larg.join('|'));
			} else {
				larg.splice(0, 1);
				this.emit('queryresponse', larg.join('|'));
			}
			break;
		}
		case 'j': case 'J':
			if (!this.rooms[room].users.includes(larg[1])) this.rooms[room].users.push(larg[1]);
			this.emit('join', toID(larg[1]), room, Date.now());
			break;
		case 'n': case 'N':
			const by = toID(larg[1]);
			const old = toID(larg[2]);
			this.emit('nick', by, old, room, Date.now());
			this.rooms[room]?.users.remove(this.rooms[room]?.users.find(u => toID(u) === toID(old)));
			this.rooms[room]?.users.push(larg[1]);
			const rank = tools.rankLevel(old);
			if (old === toID(this.status.nickName)) this.rooms[room].rank = larg[1].charAt(0);
			// TODO: Move the old alt-checking code to a handler
			break;
		case 'l': case 'L':
			const user = toID(larg[1]);
			this.rooms[room].users.remove(this.rooms[room].users.find(u => toID(u) === user));
			// ['admin', 'coder', 'alpha', 'beta', 'gamma', 'locked'].forEach(type => this.auth[type + 'alts']?.remove(user));
			this.emit('leave', user, room, Date.now());
			break;
		case 'raw': {
			larg.shift();
			this.emit('raw', room, larg.join('|'), isIntro);
			break;
		}
		case 'updatechallenges': {
			this.emit('updatechallenges', larg.slice(1).join('|'));
			break;
		}
		default: {
			this.emit('other', room, larg.join('|'));
			break;
		}
	}
};

/**************************************
 *          Connection Timer          *
 **************************************/

Client.prototype.startConnectionTimeOut = function () {
	this.stopConnectionTimeOut();
	this.connectionTimeOutInterval = setInterval(() => {
		if (this.status.connected && this.lastMessage) {
			const t = Date.now();
			if (t - this.lastMessage > this.opts.connectionTimeout) {
				this.error('Connection timeout: ' + (t - this.lastMessage));
				this.softDisconnect();
			}
		}
	}, this.opts.connectionTimeout);
};

Client.prototype.stopConnectionTimeOut = function () {
	if (this.connectionTimeOutInterval) clearInterval(this.connectionTimeOutInterval);
};

module.exports = Client;
