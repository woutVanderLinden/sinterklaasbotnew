module.exports = function (type, by) {
	by = (by || ' Someone').replace(/^[^a-zA-Z0-9]*/, '');
	return new Promise((resolve, reject) => {
		switch (toID(type)) {

			case 'code': case 'repo': case 'codebase': case 'git': case 'github': {
				(async () => {
					try {
						require('child_process').execSync('git pull', { stdio: 'inherit' });
						Bot.log(`${by} hotpatched the code.`);
						return resolve('code');
					} catch (e) {
						Bot.log(e);
						return reject(e.message);
					}
				})();
				return;
			}

			case 'hotpatch': case 'self': case 'hotpatches': {
				delete require.cache[require.resolve('./hotpatch.js')];
				delete Bot.hotpatch;
				Bot.hotpatch = require('./hotpatch.js');
				Bot.log(`${by} hotpatched hotpatches.`);
				return resolve('hotpatches');
			}

			case 'global': {
				delete require.cache[require.resolve('../global.js')];
				globaljs = require('../global.js');
				Bot.log(`${by} hotpatched global.`);
				return resolve('global');
			}

			case 'tools': {
				delete require.cache[require.resolve('./tools.js')];
				global.tools = require('./tools.js');
				Bot.log(`${by} hotpatched tools.`);
				return resolve('tools');
			}

			case 'pokedex': case 'dex': {
				axios.get('https://play.pokemonshowdown.com/data/pokedex.json').then(res => {
					fs.writeFile('./data/DATA/pokedex.json', JSON.stringify(res.data, null, '\t'), err => {
						if (err) {
							Bot.log(err);
							return reject(err.message);
						}
						delete require.cache[require.resolve('./DATA/pokedex.json')];
						data.pokedex = require('./DATA/pokedex.json');
						Bot.log(`${by} hotpatched the Pokedex.`);
						return resolve('Pokedex');
					});
				});
				return;
			}

			case 'moves': case 'movedex': {
				axios.get('https://play.pokemonshowdown.com/data/moves.json').then(res => {
					fs.writeFile('./data/DATA/moves.json', JSON.stringify(res.data, null, '\t'), err => {
						if (err) {
							Bot.log(err);
							return reject(err.message);
						}
						delete require.cache[require.resolve('./DATA/moves.json')];
						data.pokedex = require('./DATA/moves.json');
						Bot.log(`${by} hotpatched the Movedex.`);
						return resolve('Movedex');
					});
				});
				return;
			}

			case 'go': case 'godex': case 'gomoves': {
				delete data.go;
				delete require.cache[require.resolve('./DATA/go.json')];
				data.go = require('./DATA/go.json');
				return resolve('GO Dex');
			}

			case 'unite': {
				delete data.unitedex;
				delete data.unitestats;
				delete data.uniteitems;
				return Promise.all(['pokemon.json', 'stats.json', 'battle_items.json', 'held_items.json'].map(file => {
					return axios.get(`https://unite-db.com/${file}`).then(res => {
						return fs.writeFile(`./data/UNITE/${file}`, JSON.stringify(res.data, null, '\t'));
					});
				})).then(() => {
					delete require.cache[require.resolve('./UNITE/pokemon.json')];
					delete require.cache[require.resolve('./UNITE/stats.json')];
					delete require.cache[require.resolve('./UNITE/battle_items.json')];
					delete require.cache[require.resolve('./UNITE/held_items.json')];
					data.unitedex = require('./UNITE/pokemon.json');
					data.unitestats = require('./UNITE/stats.json');
					data.uniteitems = {
						battle: require('./UNITE/battle_items.json'),
						held: require('./UNITE/held_items.json')
					};
					return resolve('Unite Dex');
				}).catch(err => {
					Bot.log(err);
					return reject(err.message);
				});
			}

			case 'aliases': {
				delete require.cache[require.resolve('./ALIASES/commands.json')];
				delete require.cache[require.resolve('./ALIASES/pmcommands.json')];
				delete require.cache[require.resolve('./ALIASES/discord.json')];
				tools.aliasDB = require('./ALIASES/commands.json');
				tools.pmAliasDB = require('./ALIASES/pmcommands.json');
				Bot.log(`${by} hotpatched aliases.`);
				return resolve('aliases');
			}

			case 'customcolours': case 'cc': case 'customcolors': {
				// TODO: Fix
				return axios.get('http://play.pokemonshowdown.com/config/colors.json').then(res => {
					fs.writeFile('./data/DATA/colors.json', JSON.stringify(res.data, null, '\t'), err => {
						if (err) return reject(err.message);
						delete require.cache[require.resolve('./DATA/colors.json')];
						global.COLORS = require('./DATA/colors.json');
						Bot.log(`${by} hotpatched custom colours.`);
						return resolve('custom colours');
					});
				});
			}

			case 'autores': case 'ar': {
				delete require.cache[require.resolve('../handlers/autores.js')];
				Bot.log(`${by} hotpatched autores.`);
				return resolve('autores');
			}

			case 'board': case 'boards': {
				delete require.cache[require.resolve('./TABLE/boards.js')];
				delete require.cache[require.resolve('./TABLE/board.js')];
				delete require.cache[require.resolve('./TABLE/templates.js')];
				tools.board = require('./TABLE/boards.js').render;
				Bot.log(`${by} hotpatched boards.`);
				return resolve('boards');
			}

			case 'games': case 'g': case 'game': {
				return GAMES.reload().then(() => {
					Bot.log(`${by} hotpatched games.`);
					return resolve('games');
				}).catch(err => {
					reject(err.message || 'Uh-oh');
					Bot.log(err);
					Bot.tempErr = err;
					Bot.say('botdevelopment', JSON.stringify(err));
				});
			}

			case 'battle': case 'ai': case 'battleai': case 'battles': {
				delete require.cache[require.resolve('../handlers/battle.js')];
				Bot.log(`${by} hotpatched battles.`);
				return resolve('battles');
			}

			case 'discordchat': case 'discord': case 'disc': {
				delete require.cache[require.resolve('../handlers/discord_chat.js')];
				Bot.log(`${by} hotpatched Discord chat.`);
				return resolve('Discord chat');
			}

			case 'chathandler': case 'chat': {
				delete require.cache[require.resolve('../handlers/chat.js')];
				delete Bot.chatHandler;
				Bot.chatHandler = require('../handlers/chat.js');
				Bot.log(`${by} hotpatched the chat handler.`);
				return resolve('chat handler');
			}

			case 'pmhandler': case 'pms': {
				delete require.cache[require.resolve('../handlers/pmhandler.js')];
				delete Bot.pmHandler;
				Bot.pmHandler = require('../handlers/pmhandler.js');
				Bot.log(`${by} hotpatched the PM handler.`);
				return resolve('PM handler');
			}

			case 'pages': case 'page': case 'pagehandler': {
				delete Bot.pageHandler;
				delete require.cache[require.resolve('../handlers/pages.js')];
				Bot.pageHandler = require('../handlers/pages.js');
				return resolve('page handler');
			}

			case 'tour': case 'tours': case 'tournaments': case 'tournament': {
				delete require.cache[require.resolve('../handlers/tours.js')];
				Bot.log(`${by} hotpatched tournaments.`);
				return resolve('tournaments');
			}

			case 'ticker': case 'tick': {
				delete require.cache[require.resolve('../handlers/ticker.js')];
				Bot.log(`${by} hotpatched the ticker.`);
				return resolve('ticker');
			}

			case 'minor': case 'minorhandler': case 'minors': {
				delete require.cache[require.resolve('../handlers/minorhandler.js')];
				const minor = require('../handlers/minorhandler.js');
				minor.initialize();
				Object.keys(minor).forEach(key => Bot._events[key] = minor[key]);
				Bot.log(`${by} hotpatched the minorhandler.`);
				return resolve('minorhandler');
			}

			case 'router': case 'route': case 'routes': case 'site': {
				delete Bot.router;
				delete require.cache[require.resolve('../handlers/router.js')];
				Bot.router = require('../handlers/router.js');
				Bot.log(`${by} hotpatched the router.`);
				return resolve('router');
			}

			case 'watcher': case 'watch': {
				Bot.watcher.close();
				delete Bot.watcher;
				delete require.cache[require.resolve('../handlers/watcher.js')];
				Bot.watcher = require('../handlers/watcher.js')();
				Bot.log(`${by} hotpatched the watcher.`);
				return resolve('watcher');
			}

			case 'rooms': case 'room': case 'roomdata': case 'roomsettings': case 'roominfo': {
				return fs.readdir('./data/ROOMS').then(files => {
					files.forEach(file => {
						const room = file.slice(0, -5);
						delete require.cache[require.resolve(`./ROOMS/${file}`)];
						const roomData = require(`./ROOMS/${file}`);
						if (!Bot.rooms.hasOwnProperty(room)) return;
						if (roomData.assign) Object.keys(roomData.assign).forEach(key => Bot.rooms[room][key] = roomData.assign[key]);
						['auth', 'aliases', 'ignore', 'permissions', 'blacklist', 'whitelist', 'template'].forEach(key => {
							if (roomData.hasOwnProperty(key)) Bot.rooms[room][key] = roomData[key];
						});
					});
					return resolve('rooms');
				}).catch(e => {
					Bot.log(e);
					reject(e.message);
				});
			}

			case 'commandhandler': case 'commands': {
				try {
					delete require.cache[require.resolve(`../handlers/commands.js`)];
					delete Bot.commandHandler;
					const handler = require('../handlers/commands.js');
					Bot.commandHandler = handler;
					return resolve('command handler');
				} catch (e) {
					Bot.log(e);
					return reject(e.message);
				}
			}

			case 'schedule': {
				try {
					Object.values(Bot.schedule || {}).forEach(timer => timer._repeat ? clearInterval(timer) : clearTimeout(timer));
					delete Bot.schedule;
					delete require.cache[require.resolve('../handlers/schedule.js')];
					const setSchedule = require('../handlers/schedule.js');
					Bot.schedule = setSchedule();
					return resolve('schedule');
				} catch (e) {
					Bot.log(e);
					return reject(e.message);
				}
			}

			case 'words': {
				try {
					const { dicts, mods } = require('./WORDS/index.js');
					const sources = Object.keys(dicts).concat(Object.values(mods).map(mod => mod.sourceFile).filter(f => f));
					sources.forEach(path => {
						delete require.cache[require.resolve(`./WORDS/${path}.json`)];
					});
					delete require.cache[require.resolve('./WORDS/index.js')];
					return resolve('words');
				} catch (e) {
					Bot.log(e);
					return reject(e.message);
				}
			}

			case 'events': {
				// TODO: Do this
				return reject('Pfft skill issue');
			}

			default: return reject('Unable to find a valid hotpatch.');
		}
	});
};
