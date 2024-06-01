const dicts = {
	'csw19': require('./csw19.json'),
	'csw21': require('./csw21.json')
};

const mods = {
	clabbers: {
		aliases: ['anagrams', 'anagram', 'nagaram'],
		check: word => require('./clabbers.json')[word.split('').sort().join('')],
		sourceFile: 'clabbers'
	},
	crazymons: {
		aliases: ['oldpoke', 'oldmons', 'oldpokemon', 'oldpokemod', 'crazy', 'crazypokemon'],
		check: (word, isNormalWord) => {
			const isPokeword = mods.pokemon.check(word, false);
			if (isPokeword) return [5, 0];
			else if (isNormalWord) return [1, 0];
			else return false;
		}
	},
	pokemon: {
		aliases: ['mon', 'mons', 'poke', 'pokemod', 'pokewords'],
		check: (word, isNormalWord) => {
			const bonus = [2, 10];
			if (data.moves.hasOwnProperty(word)) return bonus;
			if (data.pokedex.hasOwnProperty(word) && !data.pokedex[word].forme) return bonus;
			if (data.abilities.find(a => toID(a) === word)) return bonus;
			if (data.items.hasOwnProperty(word)) return bonus;
			if (isNormalWord) return 1;
			return false;
		}
	}
};

module.exports = {
	dicts,
	mods,
	checkWord: function (word, dict = 'csw21', mod) {
		dict = toID(dict) || 'csw21';
		word = toID(word);
		mod = toID(mod);
		mod = mods.hasOwnProperty(mod) ? mod : Object.keys(mods).find(m => mods[m].aliases.includes(mod));
		if (!dicts.hasOwnProperty(dict)) return null;
		const isNormalWord = dicts[dict][word];
		if (mod && this.mods[mod]) return this.mods[mod].check(word, isNormalWord);
		else return isNormalWord;
	},
	isDict: dict => dicts.hasOwnProperty(toID(dict))
};
