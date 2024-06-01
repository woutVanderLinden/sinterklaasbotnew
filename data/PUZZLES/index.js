const protoDB = require('origindb')('data/PUZZLES/db'), DB = protoDB('teams');

const guildID = '816252178104320011';

const announcementChannel = client.channels.cache.get('816341849076793394');
const hintChannel = client.channels.cache.get('816335136035438622');
const logChannel = client.channels.cache.get('816335564894765109');
const parentChannel = client.channels.cache.get('816350143938428989');

const IDs = {
	staff: '816252289953038336',
	staffChannel: '816255459690020865'
};

module.exports = {
	guildID: guildID,
	live: true,
	IDs: IDs,
	hintChannel: hintChannel,
	save: function () {
		return protoDB.save();
	},
	log: function (input) {
		let out;
		if (typeof input === 'string') out = input;
		else if (typeof input === 'function') out = input.toString();
		else out = require('util').inspect(input);
		return logChannel.send(`${out.substr(0, 1990)}`);
	},
	getPuzzle: function (puzzle) {
		const puzzles = JSON.parse(fs.readFileSync('./data/PUZZLES/puzzles.json', 'utf8'));
		puzzle = typeof puzzle === 'object' ? puzzle.id : toID(String(puzzle));
		if (puzzle === 'constructor') return null;
		return puzzles.find(pzz => pzz.id === puzzle || pzz.index === puzzle.toUpperCase() || pzz.aliases.includes(puzzle)) || false;
	},
	displayPuzzle: function (puzzle) {
		puzzle = this.getPuzzle(puzzle);
		if (!puzzle) return 'Something went wrong! (Unable to find puzzle)';
		const Discord = require('discord.js'), embed = new Discord.MessageEmbed();
		embed.setColor('#0099ff');
		embed.setTitle(`Puzzle ${puzzle.index}: ${puzzle.title}`).addFields(puzzle.embedFields).setURL(puzzle.url);
		if (puzzle.embedImage) embed.setImage(puzzle.embedImage);
		return embed;
	},
	getTeam: function (context) {
		if (typeof context === 'object' && context.role) {
			return context;
		} else if (typeof context === 'object' && context.roles && context.roles.cache) {
			return Object.values(DB.object()).find(team => context.roles.cache.find(role => role.id === team.role));
		} else if (typeof context === 'string' && /^\d+$/.test(toID(context))) {
			return Object.values(DB.object()).find(team => team.role === toID(context) || team.channel === toID(context));
		} else if (typeof context === 'string') {
			return Object.values(DB.object()).find(team => team.name === context.trim()) ||
				Object.values(DB.object()).find(team => team.id === toID(context));
		} else return null;
	},
	allTeams: function () {
		return DB.keys();
	},
	addTeam: function (message, name) {
		name = name.trim();
		if (this.getTeam(message, name)) return message.channel.send(`The specified team already exists.`);
		const id = toID(name), channelName = name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
		if (id === 'constructor') return message.channel.send('...really?');
		message.guild.roles.create({
			data: {
				name: name,
				hoist: true
			}
		}).then(role => {
			const team = {
				members: [],
				name: name,
				id: id,
				role: role.id,
				puzzles: {},
				unlocked: ['1', '2', '3', '4', '5', 'M'],
				unsolved: ['1', '2', '3', '4', '5', 'M'],
				hints: 0
			};
			['1', '2', '3', '4', '5', 'M'].forEach(lv => team.puzzles[lv] = 0);
			if (!message.mentions.users.size) {
				message.channel.send(`WARN: no users were mentioned. Team will be created, but role will have to be manually added.`);
			}
			const memProm = [];
			for (const clientUser of message.mentions.users) {
				const guildMember = message.guild.members.cache.get(clientUser[1].id);
				memProm.push(new Promise((resolve, reject) => {
					guildMember.roles.add(role).then(user => {
						team.members.push(user.id);
						resolve(clientUser.username || clientUser.name);
					}).catch(e => {
						Bot.log(e);
						message.channel.send(e.message);
					});
				}));
			}
			Promise.all(memProm).then(mems => {
				DB.set(id, team);
				message.channel.send(`Successfully added ${role.name}!`);
				message.guild.channels.create(channelName, {
					type: 'text',
					parent: parentChannel,
					permissionOverwrites: [
						{
							id: guildID,
							deny: ['VIEW_CHANNEL']
						},
						{
							id: role.id,
							allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
						},
						{
							id: IDs.staff,
							allow: ['VIEW_CHANNEL']
						}
					]
				}).then(channel => {
					channel.send(`Welcome to the UGO Puzzle Weekend!`);
					channel.send(this.help(false));
					this.log(`${team.name} has been registered!`);
					DB.object()[id].channel = channel.id;
					this.save();
				});
			}).catch(e => {
				Bot.log(e);
				message.channel.send(`Something went wrong! ID#1: (${e.message})`);
			});
		}).catch(e => {
			Bot.log(e);
			message.channel.send(`Something went wrong! ID#2: (${e.message})`);
		});
	},
	addHints: function (team, amount, log) {
		return new Promise((resolve, reject) => {
			team = this.getTeam(team);
			if (!team) return reject('Invalid team.');
			if (team.hints + amount < 0) return reject(`Team only has ${team.hints} hints.`);
			const teamDB = DB.object()[team.id];
			teamDB.hints += amount;
			this.save();
			if (log) this.log(`${team.name} received ${amount} hint(s).`);
			resolve(teamDB.hints);
		});
	},
	massHints: function (amt) {
		return Promise.all(Object.keys(DB.object()).map(team => this.addHints(team, amt, false)));
	},
	update: function (context) {
		const inTeam = this.getTeam(context);
		if (!inTeam) return null;
		const team = DB.object()[inTeam.id];
		team.unlocked = [];
		const solved = Object.values(team.puzzles).filter(puzzle => puzzle).length;
		for (let i = 1; i <= 5; i++) team.unlocked.push(String(i));
		team.unlocked.push('M');
		team.unsolved = team.unlocked.filter(puzzle => team.puzzles[puzzle] === 0);
		this.save();
		return true;
	},
	guess: function (team, puzzle, answer) {
		team = this.getTeam(team);
		puzzle = this.getPuzzle(puzzle);
		return new Promise((resolve, reject) => {
			if (!team || !puzzle) return reject('Unable to find the puzzle you meant.');
			if (team.puzzles[puzzle.index]) return reject('You have already solved this puzzle!');
			if (toID(answer) === toID(puzzle.solution)) {
				DB.object()[team.id].puzzles[puzzle.index] = Date.now();
				this.save();
				this.update(team);
				if (puzzle.index !== 'M') {
					this.log(`:white_check_mark: ${team.name} completed Puzzle#${puzzle.index}: ${puzzle.title}.`);
				} else {
					announcementChannel.send(`<@&${team.role}> finished the metapuzzle! :D`);
					this.log(`<@&${IDs.staff}> ${team.name} finished the metapuzzle yeet`);
				}
				if (!team.unsolved.length) {
					this.log(`${team.name} completed all puzzles!`);
					client.channels.cache.get(team.channel).send('Congratulations on finishing all puzzles!');
				}
				return resolve(true);
			}
			this.log(`:x: ${team.name} guessed [${toID(answer).toUpperCase()}] for ${puzzle.title}.`);
			return resolve(false);
		});
	},
	help: function (isStaff) {
		const Discord = require('discord.js'), embed = new Discord.MessageEmbed();
		// eslint-disable-next-line max-len
		embed.setTitle('UGO Puzzle Weekend').setColor('#1F618D').addField('\u200b', `**${prefix}help** - Brings up this dialogue.\n**${prefix}puzzles** - Shows all the puzzles that you have unsolved; add 'all' to view all unlocked puzzles.\n**${prefix}puzzle (id / name)** - Views the specified puzzle.\n**${prefix}guess (puzzle), (answer)** - Makes a guess on the specified puzzle. Feel free to use multiple guesses, but no spamguessing, please!\n**${prefix}solved** - Displays a list of all unlocked puzzles and (if solved) their solutions.\n**${prefix}hints** - Displays the number of hints you have remaining.\n**${prefix}usehint (puzzle)** - Uses a hint on the specified puzzle; requires you to confirm.${isStaff ? '\n\n\n' : ''}`);
		// eslint-disable-next-line max-len
		if (isStaff) embed.addField('Staff Commands', `**${prefix}addteam (Team Name), @User1, @User2...** - Adds the given team to the puzzle hunt, and allots the mentioned users to the team.\n**${prefix}puzzlers** - Displays the puzzles solved by all teams, or the specified team.\n**${prefix}addhints (@Team), (amount)** - Gives the specified team (amount) hints. May be negative.\n**${prefix}deliverhints (amount)** - Adds (amount) hints to every team in the hunt. Use once a day to deliver the daily hint.\n**${prefix}allhints** - Displays the number of hints every team has.\n**${prefix}refundhint (@Team)** - Adds one hint to the given team; usually used to refund an accidental hint.`);
		return embed;
	}
};
