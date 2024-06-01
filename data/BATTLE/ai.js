class game {
	constructor (room, side) {
		if (!room) return null;
		this.room = room;
		this.side = side;
		this.ai = 2;
		this.active = null;
		this.enemy = null;
		this.enemyTeam = [];
		this.started = false;
		this.tier = null;
		this.setHazards = {};
		this.sideHazards = {};
		this.enemyData = {
			boosts: {
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			},
			ability: null,
			item: null
		};
		this.selfBoosts = {
			atk: 0,
			def: 0,
			spa: 0,
			spd: 0,
			spe: 0
		};
	}
	random (obj) {
		if (typeof obj !== 'object') return console.log('Wrong input for random.');
		let seed = Math.random() * Object.values(obj).reduce((a, b) => a + b, 0);
		for (const val in obj) {
			seed -= obj[val];
			if (seed < 0) return val;
		}
		return null;
	}
	getMon (name) {
		for (const mon of this.side.pokemon) {
			if (!mon) return;
			if (mon.ident === name) return mon;
		}
		return null;
	}
	getActive () {
		for (const mon of this.side.pokemon) {
			if (!mon) return;
			if (mon.active) return mon;
		}
		return null;
	}
	getIndex (name) {
		for (let i = 0; i < this.side.pokemon.length; i++) {
			const mon = this.side.pokemon[i];
			if (!mon) continue;
			if (mon.ident === name) return i;
		}
		return -1;
	}
	moveWt (name, mon, moves) {
		const move = data.moves[toID(name)];
		if (!moves) moves = [];
		if (!move || !mon) return 0.001;
		let bp = 0;
		if (move.basePower) bp += move.basePower;
		if (move.boosts && move.target === 'self') {
			if (move.boosts.atk > 0 || move.boosts.spa > 0) {
				const stat = move.boosts.atk > move.boosts.spa ? 'atk' : 'spa';
				if (
					!(stat === 'atk' && !moves.map(toID).filter(move => data.moves[move]?.category === 'Physical').length) &&
					!(stat === 'spa' && !moves.map(toID).filter(move => data.moves[move]?.category === 'Special').length)
				) bp += ((6 - this.selfBoosts[stat]) * move.boosts[stat] * 200) ** 0.5;
			}
			if (move.boosts.spe) bp += ((6 - this.selfBoosts.spe) * move.boosts.spe * 200) ** 0.5;
		}
		if (move.target === 'normal' && move.self && move.self.boosts) {
			bp += ((6 - this.selfBoosts.spe) * (move.self.boosts.spe || 0) * 200) ** 0.5;
		}
		if (move.secondary && move.secondary.self && move.secondary.self.boosts) {
			['atk', 'spa', 'spe'].forEach(boost => {
				bp += ((6 - this.selfBoosts[boost]) * (move.secondary.self.boosts[boost] || 0)) ** 20;
			});
		}
		if (
			this.enemy &&
			(this.enemyData.item === 'Air Balloon' || this.enemyData.ability === 'Levitate') &&
			move.type === 'Ground' && move.Category !== 'Status'
		) return 0.5;
		if (
			this.enemy &&
			Object.values(data.pokedex[toID(this.enemy)].abilities).includes('Levitate') &&
			move.type === 'Ground' && move.category !== 'Status'
		) bp /= 4;
		if (
			this.enemy &&
			toID(this.enemy) === 'shedinja'
			&& move.category !== 'Status' &&
			tools.getEffectiveness(move.type, 'shedinja') < 1
		) return 0;
		if (toID(move.name) === 'stealthrock' && !this.setHazards.sr) {
			bp += this.enemyTeam.length * 20;
		}
		if (toID(move.name) === 'spikes' && this.setHazards.spikes < 3) {
			bp += this.enemyTeam.length * (3 - (this.setHazards.spikes || 0)) * 10;
		}
		const hasStab = data.pokedex[toID(mon.details.split(',')[0])].types.includes(move.type) && move.category !== 'Status';
		bp *= hasStab ? mon.ability === 'adaptability' ? 2 : 1.5 : 1;
		if (this.enemy && move.category !== 'Status') {
			bp *= tools.getEffectiveness(move.type, this.enemy);
		}
		return bp;
	}
	firstPick () {
		if (!this.enemyTeam.length) return console.log('No team detected.');
		this.started = true;
		switch (this.ai) {
			case 0: return this.getIndex(this.side.pokemon.random().ident) + 1;
			case 1: case 2: {
				const out = {};
				this.side.pokemon.forEach(mon => {
					out[mon.ident] = mon.moves
						.filter(move => data.moves[move.replace(/\d/g, '')].category !== 'Status')
						.map(move => data.moves[move.replace(/\d/g, '')].type)
						.map(type => this.enemyTeam.map(foe => tools.getEffectiveness(type, foe)).reduce((a, b) => a + b))
						.reduce((a, b) => a > b ? a : b, 0);
				});
				const pick = this.random(out);
				return this.getIndex(pick) + 1;
			}
			default: return null;
		}
	}
	setEnemyData () {
		this.enemyData = {
			boosts: {
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			},
			ability: null,
			item: null
		};
		return;
	}
	setActiveBoosts () {
		this.selfBoosts = {
			atk: 0,
			def: 0,
			spa: 0,
			spd: 0,
			spe: 0
		};
		return;
	}
	switchPick (forced) {
		if (!this.enemy) {
			if (this.ai === 0) {
				return this.side.pokemon
					.map((blank, i) => i + 1)
					.filter(i => this.side.pokemon[i - 1].condition.includes('/') && !this.side.pokemon[i - 1].active)
					.random();
			} else {
				return this.side.pokemon
					.filter(mon => mon.condition.includes('/') && !mon.active)
					.random().ident
					.split(': ')
					.slice(1)
					.join(': ');
			}
		}
		switch (this.ai) {
			case 0: {
				if (forced) {
					return this.side.pokemon.map((blank, i) => i + 1)
						.filter(i => this.side.pokemon[i - 1].condition.includes('/') && !this.side.pokemon[i - 1].active)
						.random();
				}
				if (!forced && Math.random() > 0.1 || this.noSwitch) return false;
				const opts = this.side.pokemon
					.map((_, i) => i + 1)
					.filter(i => this.side.pokemon[i - 1].condition.includes('/') && !this.side.pokemon[i - 1].active);
				if (opts && opts.length) return opts.random();
				else return false;
			}
			case 1: {
				if (
					this.active[0] && !forced &&
					this.active[0].moves.filter(move => {
						return (move.hasOwnProperty('pp') ? move.pp : true) &&
							data.moves[move.id].category !== 'Status' &&
							tools.getEffectiveness(data.moves[move.id].type, this.enemy) > 1;
					}).length
				) return false;
				const out = {};
				this.side.pokemon.filter(mon => {
					return mon.condition.includes('/') && (!forced || !mon.active);
				}).forEach(mon => {
					out[mon.ident] = mon.moves
						.filter(move => data.moves[toID(move)] && data.moves[toID(move)].category !== 'Status')
						.map(move => data.moves[toID(move)].type)
						.map(type => tools.getEffectiveness(type, this.enemy))
						.reduce((a, b) => a > b ? a : b, 0) * (mon.active ? forced ? 0 : 10 : 1);
				});
				const pick = this.random(out);
				if (!pick) return false;
				if (this.getMon(pick).active && !forced) return false;
				return pick.split(': ').slice(1).join(': ');
			}
			case 2: {
				const out = {};
				this.side.pokemon.filter(mon => mon.condition.includes('/') && !mon.active).forEach(mon => {
					out[mon.ident] = mon.moves.map((m, i, ms) => this.moveWt(m, mon, ms) ** 4).reduce((a, b) => a > b ? a : b, 0);
				});
				// console.log(1, out);
				if (this.getActive()) {
					out[this.getActive().ident] = this.active[0].moves
						.filter(move => !move.disabled && (move.hasOwnProperty('pp') ? move.pp : true))
						.map((move, i, moves) => this.moveWt(move.move, this.getActive(), moves.map(v => v.move)) ** 4)
						.reduce((a, b) => a > b ? a : b, 0) * 10;
				}
				if (this.sideHazards.sr) {
					this.side.pokemon.filter(mon => {
						return mon.condition.includes('/') && !mon.active;
					}).forEach(mon => {
						out[mon.ident] /= 1.1 + tools.getEffectiveness('rock', mon.ident.split(': ').slice(1).join(': '));
					});
				}
				if (this.enemy) {
					this.side.pokemon.filter(mon => {
						return mon.condition.includes('/') && !mon.active;
					}).forEach(mon => {
						out[mon.ident] /= 1.1 + tools.getEffectiveness(this.enemy, mon.ident.split(': ').slice(1).join(': ')) ** 2;
					});
				}
				if (forced) delete out[this.getActive().ident];
				const pick = this.random(out);
				if (this.getMon(pick).active) return null;
				return pick.split(': ').slice(1).join(': ');
			}
			default: return null;
		}
	}
	pickMove () {
		if (!this.enemy || !this.active[0]) return;
		switch (this.ai) {
			case 0: {
				return this.active[0].moves.filter(move => {
					return (move.hasOwnProperty('pp') ? move.pp : true) && !move.disabled;
				}).random().move;
			}
			case 1: {
				const out = {};
				if (!this.active[0].moves.filter(move => (move.hasOwnProperty('pp') ? move.pp : true) && !move.disabled).length) {
					return 'Struggle';
				}
				this.active[0].moves
					.filter(m => {
						return (m.hasOwnProperty('pp') ? m.pp : true) && !m.disabled && data.moves[m.id].category !== 'Status';
					}).forEach(move => {
						const eff = tools.getEffectiveness(data.moves[move.id].type, this.enemy);
						const base = eff * (data.moves[move.id].basePower || 60);
						const dexMon = data.pokedex[toID(this.getActive().details.split(', ')[0])];
						const isStab = dexMon.types.includes(data.moves[move.id].type);
						const stab = isStab ? this.getActive().ability === 'adaptability' ? 2 : 1.5 : 1;
						out[move.move] = (base * stab) ** 4;
					});
				if (!Object.keys(out).length) {
					return this.active[0].moves.filter(move => {
						return (move.hasOwnProperty('pp') ? move.pp : true) && !move.disabled;
					}).random().move;
				}
				return this.random(out);
			}
			case 2: {
				const moves = this.active[0].moves
					.filter(move => (move.hasOwnProperty('pp') ? move.pp : true) && !move.disabled)
					.map(move => move.move);
				const out = {};
				moves.forEach(move => out[move] = this.moveWt(move, this.getActive(), moves) ** 4);
				// Bot.say(this.room, '!code ' + JSON.stringify(out, null, 2));
				return this.random(out);
			}
			default: return null;
		}
	}
}

exports.AI = {
	games: {},
	newGame: function (room, side) {
		if (!this.games[room]) this.games[room] = new game(room, side);
		return this.games[room];
	}
};
