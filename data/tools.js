/************************
*        Utility        *
************************/

exports.quoteParse = function (quote, smogon, utg) {
	const ranks = ['★', '☆', '^', '⛵', 'ᗢ', '+', '%', '§', '@', '*', '#', '&', '~', '$', '-'];
	const chatRegex = new RegExp(`^(\\[(?:\\d{2}:){1,2}\\d{2}\\] |)([${ranks.join('')}]?)([a-zA-Z0-9][^:]{0,25}?): (.*)$`);
	const meRegex = new RegExp(`^(\\[(?:\\d{2}:){1,2}\\d{2}\\] |)• ([${ranks.join('')}]?)(\\[[a-zA-Z0-9][^\\]]{0,25}\\]) (.*)$`);
	const jnlRegex = /^(?:.*? (?:joined|left)(?:; )?){1,2}$/;
	const rawRegex = /^(\[(?:\d{2}:){1,2}\d{2}\] |)(.*)$/;
	return quote.split('\n').map((line, test) => {
		// eslint-disable-next-line max-len
		if (test = line.match(chatRegex)) return smogon ? `[SIZE=1][COLOR=rgb(102, 102, 102)]${test[1]}[/COLOR][/SIZE][SIZE=2][COLOR=rgb(102, 102, 102)] ${test[2]}[/COLOR][COLOR=rgb(${tools.HSLtoRGB(...tools.HSL(test[3]).hsl).join(', ')})][B]${test[3]}[/B]:[/COLOR] ${test[4]}[/SIZE]` : `<div class="chat chatmessage-a" style="padding:3px 0;"><small>${test[1] + test[2]}</small><span class="username">${utg ? `<username>${test[3]}:</username>` : tools.colourize(`${test[3]}:`)}</span><em> ${test[4]}</em></div>`;
		// eslint-disable-next-line max-len
		else if (test = line.match(meRegex)) return `<div class="chat chatmessage-${toID(test[3])}" style="padding:3px 0;"><small>${test[1]}</small>${tools.colourize('• ', test[3])}<em><small>${test[2]}</small><span class="username">${test[3].slice(1, -1)}</span><i> ${test[4]}</i></em></div>`;
		// eslint-disable-next-line max-len
		else if (test = line.match(jnlRegex)) return `<div class="message" style="padding:3px 0;"><small style="color: #555555"> ${test[0]}<br /></small></div>`;
		// eslint-disable-next-line max-len
		else if (test = line.match(rawRegex)) return `<div class="chat chatmessage-partbot" style="padding:3px 0;"><small>${test[1]}</small>${test[2]}</div>`;
	}).join(smogon ? '\n' : '');
};

exports.aliasDB = require('./ALIASES/commands.json');
exports.pmAliasDB = require('./ALIASES/pmcommands.json');
exports.goAliasDB = require('./ALIASES/go.json');

exports.commandAlias = function (alias) {
	if (exports.aliasDB[toID(alias)]) alias = exports.aliasDB[toID(alias)];
	return toID(alias);
};

exports.pmCommandAlias = function (alias) {
	if (exports.pmAliasDB[toID(alias)]) alias = exports.pmAliasDB[toID(alias)];
	return toID(alias);
};

exports.rankLevel = function (name, room) {
	const userid = toID(name);
	switch ((() => {
		let override;
		const roomName = Bot.rooms[room]?.users.find(u => toID(u) === userid);
		if (Bot.auth.admin.includes(userid)) return 'admin';
		else if (Bot.auth.coder.includes(userid)) return 'coder';
		else if (Bot.auth.locked.includes(userid)) return 'locked';
		else if (Bot.rooms[room]?.auth && (override = Object.entries(Bot.rooms[room].auth).find(([rank, list]) => {
			return list.includes(userid);
		})?.[0])) return override;
		else if (Bot.auth.alpha.includes(userid) || room !== 'global' && Bot.rooms[room] && /^[~&#@\*]/.test(roomName)) {
			return 'alpha';
		} else if (Bot.auth.beta.includes(userid) || room !== 'global' && Bot.rooms[room] && /^[%§]/.test(roomName)) {
			return 'beta';
		} else if (Bot.auth.gamma.includes(userid) || room !== 'global' && Bot.rooms[room] && /^[+]/.test(roomName)) {
			return 'gamma';
		} else if (room !== 'global' && Bot.rooms[room] && /^[!]/.test(roomName)) {
			return 'muted';
		} else return 'reg';
	})()) {
		case 'admin': return 10;
		case 'coder': return 9;
		case 'alpha': return 6;
		case 'beta': return 5;
		case 'gamma': return 4;
		case 'reg': return 3;
		case 'muted': return 2;
		case 'locked': return 1;
	}
};

exports.hasPermission = function (user, rank, room) {
	let auth;
	if (typeof user === 'number') auth = user;
	else auth = tools.rankLevel(user, room);
	let req;
	switch (rank) {
		case 'admin':
			req = 9;
			break;
		case 'coder':
			req = 8;
			break;
		case 'alpha':
			req = 5;
			break;
		case 'beta':
			req = 4;
			break;
		case 'gamma':
			req = 3;
			break;
		case 'none':
			req = 2;
			break;
		case 'muted':
			req = 1;
			break;
		case 'locked':
			req = 0;
			break;
		default:
			req = 0;
	}
	if (auth > req) return true;
	else return false;
};

exports.getRoom = function (room) {
	room = (room?.id || room?.name || room || '').toString().toLowerCase().replace(/[^a-z0-9-]/g, '');
	if (Bot.rooms.hasOwnProperty(room)) return room;
	return fs.readdirSync('./data/ROOMS').find(roomFile => {
		try {
			const required = require(`./ROOMS/${roomFile}`);
			if (required.aliases.includes(room)) return true;
		} catch {}
	})?.slice(0, -5) || room;
};

exports.blockedCommand = function (command, room) {
	try {
		room = room.toLowerCase().replace(/[^a-z0-9-]/g, '');
		command = tools.commandAlias(command);
		return Boolean(require(`./ROOMS/${room}.json`).disabled.includes(command));
	} catch {
		return false;
	}
};

exports.canHTML = function (room) {
	if (!room) return false;
	if (!Bot.rooms[room]) return false;
	if (['*', '#', '&', '#', '★'].includes(Bot.rooms[room].rank)) return true;
	return false;
};

exports.listify = function (array, delim = ', ', concat = ' and ') {
	if (!Array.isArray(array)) throw new TypeError(`Expected array as Array`);
	if (array.length < 3) return array.join(concat);
	const body = array.slice(0, -1).map(term => term + delim).join('').slice(0, concat.startsWith(' ') ? -1 : this.length);
	const suffix = (concat.startsWith(' ') ? '' : ' ') + concat + array.at(-1);
	return body + suffix;
};

exports.uploadToPastie = function (text) {
	return axios.post('https://pastie.io/documents', text).then(res => `https://pastie.io/raw/${res.data}`);
};

exports.warmup = function (room, commandName) {
	if (!cooldownObject[room] || !cooldownObject[room][commandName]) return;
	cooldownObject[room][commandName] = false;
	return;
};

exports.setCooldown = function (commandName, room, commandRequire) {
	if (!commandRequire || !commandName) return;
	if (!(typeof commandName === 'string') || !(typeof commandRequire === 'object') || Array.isArray(commandRequire)) return;
	if (!commandRequire.cooldown) return;
	if (!cooldownObject[room]) cooldownObject[room] = {};
	cooldownObject[room][commandName] = true;
	return setTimeout(tools.warmup, commandRequire.cooldown, room, commandName);
};

exports.HSL = function (name, original) {
	name = toID(name);
	const out = { source: name, hsl: null };
	if (COLORS[name] && name !== 'constructor' && !original) {
		out.base = exports.HSL(name, true);
		name = COLORS[name];
		out.source = name;
	}
	const hash = require('crypto').createHash('md5').update(name, 'utf8').digest('hex');
	const H = parseInt(hash.substr(4, 4), 16) % 360;
	const S = parseInt(hash.substr(0, 4), 16) % 50 + 40;
	let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30);
	const C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
	const X = C * (1 - Math.abs(H / 60 % 2 - 1));
	const m = L / 100 - C / 2;
	let R1;
	let G1;
	let B1;
	switch (Math.floor(H / 60)) {
		case 1:
			R1 = X;
			G1 = C;
			B1 = 0;
			break;
		case 2:
			R1 = 0;
			G1 = C;
			B1 = X;
			break;
		case 3:
			R1 = 0;
			G1 = X;
			B1 = C;
			break;
		case 4:
			R1 = X;
			G1 = 0;
			B1 = C;
			break;
		case 5:
			R1 = C;
			G1 = 0;
			B1 = X;
			break;
		case 0:
		default:
			R1 = C;
			G1 = X;
			B1 = 0;
			break;
	}
	const R = R1 + m;
	const G = G1 + m;
	const B = B1 + m;
	const lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722;
	let HLmod = (lum - 0.2) * -150;
	if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
	else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
	else HLmod = 0;
	const Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
	if (Hdist < 15) HLmod += (15 - Hdist) / 3;
	L += HLmod;
	out.hsl = [
		H,
		S,
		L
	];
	return out;
};

exports.colourize = function (text, name, useOriginal) {
	if (!name) name = toID(text);
	if (COLORS[toID(name)] && !useOriginal) name = COLORS[toID(name)];
	const [H, S, L] = exports.HSL(name).hsl;
	return '<strong style=\"' + `color:hsl(${H},${S}%,${L}%);` + '\">' + tools.escapeHTML(text) + '</strong>';
};

exports.escapeHTML = function (str) {
	if (!str) return '';
	return ('' + str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/\//g, '&#x2f;');
};

exports.unescapeHTML = function (str) {
	if (!str) return '';
	return ('' + str)
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#x2f;/g, '/');
};

exports.HSLtoRGB = function (h, s, l) {
	// input [[0, 360], [0, 100], [0, 100]]
	let r, g, b;

	h /= 360;
	s /= 100;
	l /= 100;

	if (s === 0) r = g = b = l;
	else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

exports.RGBtoHEX = function (r, g, b) {
	const hex = '#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2);
	return hex.toUpperCase();
};

exports.HSLtoHEX = function (h, s, l) {
	return exports.RGBtoHEX(...exports.HSLtoRGB(h, s, l));
};

exports.modeArray = function (arr) {
	if (!Array.isArray(arr)) return;
	const arrObj = {};
	arr.forEach(elem => {
		if (!arrObj['elem' + elem]) arrObj['elem' + elem] = 1;
		else arrObj['elem' + elem]++;
	});
	const maxF = Object.values(arrObj).sort((a, b) => b - a)[0];
	return Object.keys(arrObj).filter(elem => arrObj[elem] === maxF).map(elem => elem.substr(4)).sort();
};

exports.toHumanTime = function (millis) {
	if (typeof millis === 'string') millis = parseInt(millis);
	if (typeof millis !== 'number') return;
	const time = {};
	time.year = Math.floor(millis / (365 * 24 * 60 * 60 * 1000));
	millis %= 365 * 24 * 60 * 60 * 1000;
	time.week = Math.floor(millis / (7 * 24 * 60 * 60 * 1000));
	millis %= 7 * 24 * 60 * 60 * 1000;
	time.day = Math.floor(millis / (24 * 60 * 60 * 1000));
	millis %= 24 * 60 * 60 * 1000;
	time.hour = Math.floor(millis / (60 * 60 * 1000));
	millis %= 60 * 60 * 1000;
	time.minute = Math.floor(millis / (60 * 1000));
	millis %= 60 * 1000;
	time.second = Math.floor(millis / 1000);
	millis %= 1000;
	time.millisecond = millis;
	const output = [];
	let foundFirst = false;
	let foundSecond = false;
	Object.keys(time).forEach(val => {
		if (foundFirst && !foundSecond) {
			if (time[val] === 0);
			else output.push(time[val] + ' ' + val + (time[val] === 1 ? '' : 's'));
			foundSecond = true;
		} else {
			if (time[val] && !foundSecond) {
				foundFirst = true;
				output.push(time[val] + ' ' + val + (time[val] === 1 ? '' : 's'));
			}
		}
	});
	return output.join(' and ') || '0 seconds';
};

exports.fromHumanTime = function (text) {
	text = text.replace(/(?:^| )an? /ig, '1');
	text = text.toLowerCase().replace(/[^a-z0-9\.:]/g, '');
	const digital = text.match(/^(?:(\d+):)?(\d+):(\d+):(\d+)$/);
	if (digital) {
		const [match, day, hrs, min, sec] = digital;
		return day * 24 * 60 * 60 * 1000 + hrs * 60 * 60 * 1000 + min * 60 * 1000 + sec  * 1000;
	} else text = text.replace(/:/g, '');
	let time = 0;
	const units = {
		mis: {
			regex: /\d+(?:\.\d+)?m(?:illi)?s(?:ec(?:ond?)?s?)?/,
			length: 1
		},
		sec: {
			regex: /\d+(?:\.\d+)?(?:s(?:ec(?:onds?)?)?)/,
			length: 1000
		},
		min: {
			regex: /\d+(?:\.\d+)?m(?:in(?:ute?)?s?)?/,
			length: 60 * 1000
		},
		hrs: {
			regex: /\d+(?:\.\d+)?(?:h(?:(?:ou)?r)?)s?/,
			length: 60 * 60 * 1000
		},
		day: {
			regex: /\d+(?:\.\d+)?d(?:ays?)?/,
			length: 24 * 60 * 60 * 1000
		},
		wks: {
			regex: /\d+(?:\.\d+)?(?:w(?:(?:ee)?k)?)s?/,
			length: 7 * 24 * 60 * 60 * 1000
		}
	};
	Object.values(units).forEach(unit => {
		const match = text.match(unit.regex);
		if (!match) return;
		text = text.replace(match[0], '');
		time += parseFloat(match[0]) * unit.length;
	});
	return time;
};

exports.getSetsFrom = function (link) {
	switch (link.split('.')[0]) {
		case 'pokepast': {
			// TODO: Use axios
			if (!link.endsWith('/json')) link += '/json';
			require('request')(link, (error, response, body) => {
				if (error) throw error;
				const data = JSON.parse(body).paste;
				return data.replace(/\r\n/g, '');
			});
		}
	}
};

exports.utm = function (text) {
	return text.split(/\n\s*\n/)
		.map(mon => parseMon(mon))
		.filter(mon => typeof mon === 'object')
		.map(mon => {
			// eslint-disable-next-line max-len
			return `${mon.name}|${mon.species || ''}|${toID(mon.item)}|${toID(mon.ability)}|${mon.moves.map(move => toID(move)).join(',')}|${mon.nature}|${Object.values(mon.evs).filter(ev => ev === 0).length === 6 ? '' : Object.values(mon.evs).map(ev => ev || '').join(',')}|${mon.gender || ''}|${Object.values(mon.ivs).filter(iv => iv === 31).length === 6 ? '' : Object.values(mon.ivs).map(iv => iv === 31 ? '' : iv).join(',')}|${mon.shiny ? 'S' : ''}|${mon.level === 100 ? '' : mon.level}|${mon.happiness !== 255 || mon.hiddenpower ? [mon.happiness || '', mon.hiddenpower || '', ''].join(',') : ''}`;
		}).join(']');
};

exports.runEarly = function (timer) {
	if (!timer) return false;
	timer._onTimeout();
	clearTimeout(timer);
	return true;
};

exports.getPorts = function (name, source) {
	if (!Array.isArray(source)) return null;
	const front = source.filter(elem => {
		if (!elem) return false;
		elem = toID(elem);
		if (name.startsWith(elem)) return true;
		for (let i = 2; i < elem.length; i++) {
			if (name.startsWith(elem.slice(elem.length - i, elem.length))) return true;
		}
		return false;
	});
	const end = source.filter(elem => {
		if (!elem) return false;
		elem = toID(elem);
		if (elem.startsWith(name)) return true;
		for (let i = 2; i < name.length; i++) {
			if (elem.startsWith(name.slice(name.length - i, name.length))) return true;
		}
		return false;
	});
	return [front.sort(), end.sort()];
};

exports.board = require('./TABLE/boards.js').render;

exports.toName = function (text) {
	text = text.trim();
	return text[0].toUpperCase() + text.substr(1);
};

exports.getEffectiveness = function (mon1, mon2) {
	if (Array.isArray(mon1)) mon1 = mon1.map(t => tools.toName(toID(t)));
	if (Array.isArray(mon2)) mon2 = mon2.map(t => tools.toName(toID(t)));
	if (typeof mon1 === 'string') {
		if (data.pokedex[toID(mon1)]) mon1 = data.pokedex[toID(mon1)].types;
		else if (typelist.includes(mon1.toLowerCase())) mon1 = [tools.toName(mon1)];
	}
	if (typeof mon2 === 'string') {
		if (data.pokedex[toID(mon2)]) mon2 = data.pokedex[toID(mon2)].types;
		else if (typelist.includes(mon2.toLowerCase())) mon2 = [tools.toName(mon2)];
	}
	if (!Array.isArray(mon1) || !Array.isArray(mon2)) return null;
	let x = 1;
	mon1.forEach(offType => {
		if (!data.typechart[offType]) return;
		mon2.forEach(defType => {
			if (!data.typechart[defType]) return;
			switch (data.typechart[defType].damageTaken[offType]) {
				case 0: x *= 1; break;
				case 1: x *= 2; break;
				case 2: x *= 0.5; break;
				case 3: x *= 0; break;
			}
		});
	});
	return x;
};

exports.toSprite = function (mon, full, style) {
	const cds = require('./DATA/iconcoords.json');
	if (typelist.includes(toID(mon))) {
		mon = toID(mon);
		mon = mon[0].toUpperCase() + mon.substr(1);
		// eslint-disable-next-line max-len
		return `<img src="https://play.pokemonshowdown.com/sprites/types/${mon}.png" alt="${mon}" class="pixelated" width="32" height="14" style="${style}">`;
	}
	if (!cds[toID(mon)]) return mon;
	mon = toID(mon);
	// eslint-disable-next-line max-len
	if (!full) return `<span class="picon" style="background: transparent url('https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png?v2') no-repeat scroll ${cds[mon][0]}px ${cds[mon][1]}px; ${style}"></span>`;
	// eslint-disable-next-line max-len
	return `<span class="picon" style="background: transparent url('https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png?v2') no-repeat scroll ${cds[mon][0]}px ${cds[mon][1]}px; display: inline-block; width: 40px; height: 30px; ${style}"></span>`;
};

exports.random = function (input) {
	switch (typeof input) {
		case 'number': return Math.floor(Math.random() * input);
		case 'object': {
			if (Array.isArray(input)) {
				input = input.slice().sort((a, b) => a - b);
				if (input.length === 2) return input[0] + Math.floor(Math.random() * (input[1] - input[0]));
				return null;
			}
			const keys = Object.keys(input), values = Object.values(input);
			let sum = 0;
			values.forEach(num => {
				if (Array.isArray(num)) num = num.reduce((a, b) => a * b, 1);
				if (!(num >= 0)) throw new TypeError(`Object values must be non-negative numbers`);
				sum += num;
			});
			if (!sum) throw new Error(`The sum of object values must be positive!`);
			let seed = Math.random() * sum;
			for (const val in input) {
				seed -= Array.isArray(input[val]) ? input[val].reduce((a, b) => a * b, 1) : input[val];
				if (seed < 0) return val;
			}
			return null;
		}
		default: return null;
	}
};

exports.deepClone = function (aObject) {
	if (!aObject) return aObject;
	const bObject = Array.isArray(aObject) ? [] : {};
	for (const k in aObject) {
		const v = aObject[k];
		bObject[k] = typeof v === 'object' ? exports.deepClone(v) : v;
	}

	return bObject;
};

exports.getAlts = async function alts (user, trace = 1) {
	trace = 1;
	if (typeof user === 'object') user = user.name || user.username || user.userid || user.id;
	if (typeof user !== 'string') throw new TypeError('Username must be a string.');
	user = toID(user);
	if (!trace) return await DATABASE.getAlts(user) || [];
	const done = new Set([user]);
	let next = await DATABASE.getAlts(user) || [];
	let i = 0;
	while (next.length) {
		const newNext = [];
		if (i++ > trace) break;
		if (next.map(alt => {
			if (done.has(alt)) return true;
			const alts = await(DATABASE.getAlts(alt)) || [];
			done.add(alt);
			if (!alts.length) return true;
			else newNext.push(...alts);
		}).every(skip => skip)) break;
		next = newNext;
	}
	return [...done];
};


/************************
*         Shops         *
************************/

// TODO: Better points system; migrate point metadata to room

exports.loadShops = function (...shops) {
	if (!shops.length) shops = fs.readdirSync('./data/SHOPS').map(shop => shop.slice(0, shop.length - 5));
	shops.map(shop => shop.toLowerCase().replace(/[^a-z0-9-]/g, ''));
	shops.forEach(shop => {
		if (!Bot.rooms[shop]) return console.log(`Not in ${shop} to load Shop.`);
		fs.readFile(`./data/SHOPS/${shop}.json`, 'utf8', (err, file) => {
			if (err) return;
			const dat = JSON.parse(file);
			Bot.rooms[shop].shop = dat;
			console.log(`Loaded the ${Bot.rooms[shop].title} Shop.`);
		});
	});
};

exports.updateShops = function (...shops) {
	if (!shops.length) shops = fs.readdirSync('./data/SHOPS').map(shop => shop.slice(0, shop.length - 5));
	shops.map(shop => shop.toLowerCase().replace(/[^a-z0-9-]/g, ''));
	shops.forEach(shop => {
		if (!Bot.rooms[shop]) return console.log(`Not in ${shop} to update Shop.`);
		fs.writeFile(`./data/SHOPS/${shop}.json`, JSON.stringify(Bot.rooms[shop].shop, null, 2), (err) => {
			if (err) return;
		});
	});
};

exports.loadLB = function (...rooms) {
	if (!rooms.length) rooms = fs.readdirSync('./data/POINTS').map(room => room.slice(0, room.length - 5));
	rooms.map(room => room.toLowerCase().replace(/[^a-z0-9-]/g, ''));
	rooms.forEach(room => {
		if (!Bot.rooms[room]) return console.log(`Not in ${room} to load the leaderboard.`);
		fs.readFile(`./data/POINTS/${room}.json`, 'utf8', (err, file) => {
			if (err) return;
			const dat = JSON.parse(file);
			Bot.rooms[room].lb = dat;
			console.log(`Loaded the ${Bot.rooms[room].title} leaderboard.`);
		});
	});
};

exports.updateLB = function (...rooms) {
	if (!rooms.length) rooms = fs.readdirSync('./data/POINTS').map(room => room.slice(0, room.length - 5));
	rooms.map(room => room.toLowerCase().replace(/[^a-z0-9-]/g, ''));
	rooms.forEach(room => {
		if (!Bot.rooms[room]) return console.log(`Not in ${room} to update leaderboard.`);
		fs.writeFile(`./data/POINTS/${room}.json`, JSON.stringify(Bot.rooms[room].lb, null, 2), (err) => {
			if (err) return;
		});
	});
};

exports.addPoints = function (type, username, points, room) {
	return new Promise((resolve, reject) => {
		if (typeof type !== 'number') return reject(new Error('Type must be a number.'));
		points = parseInt(points);
		if (isNaN(points)) return reject(new Error('Points must be a valid number'));
		const user = toID(username);
		if (!room || !Bot.rooms[room].lb) return reject(new Error('Invalid room / no leaderboard'));
		if (type >= Bot.rooms[room].lb.points.length) return reject(new Error('Type is too high!'));
		if (!Bot.rooms[room].lb.users[user]) {
			Bot.rooms[room].lb.users[user] = {
				name: username,
				points: Array.from({ length: Bot.rooms[room].lb.points.length }).map(t => 0)
			};
		}
		Bot.rooms[room].lb.users[user].points[type] += points;
		tools.updateLB(room);
		return resolve(username);
	});
};


/************************
*        Games          *
************************/

// TODO: This should be contained in the command

exports.newDeck = function (type, amt) {
	// TODO: Move all of these to the individual game command files
	if (!type) type = 'regular';
	type = toID(type);
	switch (type) {
		case 'regular': case 'reg': {
			if (!amt) amt = 1;
			const deck = [];
			const suits = ['H', 'S', 'D', 'C'];
			const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
			for (let i = 0; i < amt; i++) suits.forEach(suit => ranks.forEach(rank => deck.push(rank + suit)));
			return deck;
		}
		case 'explodingvoltorb': case 'ev': {
			if (!amt || amt < 2 || amt > 5) return null;
			const deck = [], post = [];
			const amounts = {
				snorlax: 5,
				meowth: 4,
				liepard: 4,
				skitty: 4,
				lugia: 4,
				espurr: 3,
				flareon: 7,
				jolteon: 7,
				vaporeon: 7,
				espeon: 7,
				umbreon: 7
			};
			Object.entries(amounts).forEach(([mon, amount]) => deck.push(...Array(amount).fill(mon)));
			post.push(...Array(amt).fill('voltorb'));
			post.push(...Array(6).fill('quagsire'));
			// for (let i = 0; i < 5; i++) deck.push('snorlax');
			// for (let i = 0; i < 4; i++) deck.push('meowth');
			// for (let i = 0; i < 4; i++) deck.push('liepard');
			// for (let i = 0; i < 4; i++) deck.push('skitty');
			// for (let i = 0; i < 4; i++) deck.push('lugia');
			// for (let i = 0; i < 3; i++) deck.push('espurr');
			// for (let i = 0; i < 7; i++) deck.push('flareon');
			// for (let i = 0; i < 7; i++) deck.push('jolteon');
			// for (let i = 0; i < 7; i++) deck.push('vaporeon');
			// for (let i = 0; i < 7; i++) deck.push('espeon');
			// for (let i = 0; i < 7; i++) deck.push('umbreon');
			// for (let i = 1; i < amt; i++) post.push('voltorb');
			// for (let i = 0; i < 6; i++) post.push('quagsire');
			return [deck, post];
		}
	}
};

exports.toShuffleImage = function (mon) {
	mon = mon.toLowerCase();
	switch (mon) {
		case 'espeon': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/e/ef/Espeon.png';
		case 'espurr': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/99/Espurr.png';
		case 'flareon': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/1/17/Flareon.png';
		case 'jolteon': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/1/1e/Jolteon.png';
		case 'liepard': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/3/3b/Liepard.png';
		case 'lugia': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/a/a7/Lugia.png';
		case 'meowth': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/99/Meowth.png';
		case 'quagsire': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/1/1b/Quagsire.png';
		case 'skitty': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/f/f0/Skitty.png';
		case 'snorlax': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/0/0b/Snorlax.png';
		case 'umbreon': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/9f/Umbreon.png';
		case 'vaporeon': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/f/fc/Vaporeon.png';
		case 'voltorb': return 'https://vignette.wikia.nocookie.net/pkmnshuffle/images/8/80/Voltorb.png';
		default: return '';
	}
};

exports.deal = function (players) {
	const out = { players: {} }, cards = exports.newDeck('ev', players.length);
	if (!cards) return null;
	const [deck, post] = cards;
	deck.shuffle();
	players.forEach(player => out.players[toID(player)] = [post.pop(), deck.splice(0, 7)]);
	out.deck = deck.concat(post).shuffle();
	return out;
};

exports.cardFrom = function (str) {
	if (data.pokedex[str]) return data.pokedex[str].name;
	if (!str || !/^(?:[AJQK2-9]|10)[HSDC]$/.test(str)) return null;
	const arr = str.split(''), suit = { H: '♡', S: '♠', D: '♢', C: '♣' }[arr.pop()];
	return [arr.join(''), suit];
};

exports.cardWeight = function (card) {
	if (!Array.isArray(card)) card = tools.cardFrom(card);
	if (!card) return null;
	if (/\d/.test(card[0])) return parseInt(card);
	if (['J', 'Q', 'K'].includes(card[0])) return 10;
	if (card[0] === 'A') return 1;
	return null;
};

exports.sumBJ = function (cards) {
	if (!Array.isArray(cards)) return null;
	if (typeof cards[0] === 'string') cards = cards.map(card => tools.cardFrom(card));
	let sum = 0, aces = 0;
	cards.forEach(card => {
		let wt = tools.cardWeight(card);
		if (!wt) return;
		if (wt === 1) {
			wt = 11;
			aces++;
		}
		return sum += wt;
	});
	while (sum > 21 && aces > 0) {
		sum -= 10;
		aces--;
	}
	return sum;
};

exports.getActions = function (hand) {
	if (!hand || !Array.isArray(hand)) return null;
	const actions = [];
	let allFive = true;
	if (hand.includes('skitty')) actions.push('Skitty');
	if (hand.includes('meowth')) actions.push('Meowth');
	if (hand.includes('liepard')) actions.push('Liepard');
	if (hand.includes('lugia')) actions.push('Lugia');
	if (hand.includes('espurr')) actions.push('Espurr');
	['espeon', 'flareon', 'jolteon', 'umbreon', 'vaporeon'].forEach(vee => {
		const dupe = hand.filter(m => m === vee).length;
		if (dupe >= 2) actions.push(`2x${data.pokedex[vee].name}`);
		if (dupe >= 3) actions.push(`3x${data.pokedex[vee].name}`);
		if (!hand.includes(vee)) allFive = false;
	});
	if (allFive) actions.push('Eevee Power');
	return actions;
};

exports.handHTML = function (hand) {
	if (!hand || !Array.isArray(hand)) return null;
	// eslint-disable-next-line max-len
	return '<center> ' + hand.filter(card => ['espeon', 'espurr', 'flareon', 'jolteon', 'liepard', 'lugia', 'meowth', 'quagsire', 'skitty', 'snorlax', 'umbreon', 'vaporeon', 'voltorb'].includes(card)).map(card => `<img src="${exports.toShuffleImage(card)}" height="48" width="48">`).join('') + '</center>';
};

exports.scrabblify = function (text) {
	if (!typeof text === 'string') return 0;
	const tarr = text.toUpperCase().split('');
	function points (letter) {
		if (!typeof letter === 'string' || !letter.length === 1) return 0;
		if ('EAOTINRSLU'.includes(letter)) return 1;
		else if ('DG'.includes(letter)) return 2;
		else if ('CMBP'.includes(letter)) return 3;
		else if ('HFWYV'.includes(letter)) return 4;
		else if ('K'.includes(letter)) return 5;
		else if ('JX'.includes(letter)) return 8;
		else if ('ZQ'.includes(letter)) return 10;
		else if ('1234567890'.includes(letter)) return ~~letter;
		else return 0;
	}
	return tarr.reduce((x, y) => x + points(y), 0);
};

exports.queryGO = function (name) {
	if (typeof name !== 'string') throw new TypeError('Expected type \'string\' in aliasGO');
	name = toID(name);
	const formeNames = {
		alola: ['a', 'alola', 'alolan'],
		galar: ['g', 'galar', 'galarian'],
		mega: ['m', 'mega'],
		primal: ['p', 'primal']
	};
	const alts = [name];
	Object.entries(formeNames).forEach(([key, values]) => {
		values.forEach(val => {
			if (name.startsWith(val)) alts.push(name.substr(val.length) + key);
			if (name.endsWith(val)) alts.push(name.slice(0, -val.length) + key);
		});
	});
	return alts.map(alt => alt === 'constructor' ? 'null' : toID(exports.goAliasDB[alt] || alt)).map(alt => {
		if (data.go.pokedex[alt]) return {
			type: 'pokemon',
			info: data.go.pokedex[alt]
		};
		else if (data.go.moves.fast[alt]) return {
			type: 'fast_move',
			info: data.go.moves.fast[alt]
		};
		else if (data.go.moves.charged[alt]) return {
			type: 'charged_move',
			info: data.go.moves.charged[alt]
		};
	}).find(res => res);
};

exports.getCP = function (mon, level, ivs) {
	if (!level) level = 40;
	if (!ivs) ivs = { atk: 15, def: 15, sta: 15 };
	if (Array.isArray(ivs)) ivs = { atk: ivs[0], def: ivs[1], sta: ivs[2] };
	const CP_M = require('./DATA/pokemongocp.json');
	mon = toID(mon);
	if (mon === 'constructor') return 0;
	mon = data.go.pokedex[mon];
	if (!mon) return 0;
	const stats = mon.baseStats;
	const atk = stats.atk + ivs.atk, def = stats.def + ivs.def, sta = stats.sta + ivs.sta;
	const out = Math.floor(atk * def ** 0.5 * sta ** 0.5 * (CP_M[level] || 0.7903) ** 2 / 10);
	return out > 10 ? out : 10;
};


/************************
*      Prototypes       *
************************/

String.prototype.frequencyOf = function (text) {
	if (!typeof text === 'string') return;
	return this.split(text).length - 1;
};

String.prototype.splitFirst = function (delim, amount) {
	if (typeof amount !== 'number') amount = 1;
	if (amount < 0 || amount - parseInt(amount)) throw new Error('\'amount\' must be a non-negative integer');
	if (typeof delim !== 'string' && !delim instanceof RegExp) throw new TypeError(`'delim' must be a string / regular expression`);
	const out = [];
	let input = this.toString();
	let isR = false;
	if (delim instanceof RegExp) {
		isR = true;
		delim = new RegExp(delim, delim.flags.replace('g', ''));
	}
	for (let i = 0; i < amount; i++) {
		if (isR) {
			const match = input.match(delim);
			if (!match) return [...out, input];
			const m = match[0];
			out.push(input.substr(0, match.index));
			input = input.substr(match.index + m.length);
			for (let j = 1; j < match.length; j++) out.push(match[j]);
		} else {
			const match = input.indexOf(delim);
			if (match < 0) return [...out, input];
			out.push(input.substr(0, match));
			input = input.substr(match + delim.length);
		}
	}
	out.push(input);
	return out;
};

Array.prototype.shuffle = function () {
	for (let i = this.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[this[i], this[j]] = [this[j], this[i]];
	}
	return Array.from(this);
};

Array.prototype.remove = function (...terms) {
	let out = true;
	terms.forEach(term => {
		if (this.indexOf(term) >= 0) this.splice(this.indexOf(term), 1);
		else out = false;
	});
	return out;
};

Array.prototype.random = function (amount) {
	if (!amount || typeof amount !== 'number') return this[Math.floor(Math.random() * this.length)];
	const sample = Array.from(this), out = [];
	let i = 0;
	while (sample.length && i++ < amount) {
		const term = sample[Math.floor(Math.random() * sample.length)];
		out.push(term);
		sample.remove(term);
	}
	return out;
};

Set.prototype.find = function (fn) {
	for (const term of this) if (fn(term)) return term;
	return undefined;
};


// TODO: Rehaul this entire file holy shit
// TODO: Add a cmd function
