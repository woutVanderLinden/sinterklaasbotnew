const templates = require('./templates.js').templates;

exports.render = function (input, headers, sort, widths, template, keys, limit, rank, escapeHTML) {
	let info;
	if (Array.isArray(input)) info = Array.from(input);
	else if (typeof input === 'object' && Array.isArray(keys)) {
		info = Object.keys(input).map(player => keys.map(key => input[player][key]));
	} else return null;
	const board = require('./board.js').board;
	if (!templates[template]) return null;
	info = info.map(row => row.map(term => escapeHTML ? tools.escapeHTML(term.toString()) : term.toString()));
	return board(headers, info, sort, templates[template], widths, rank, limit);
};

// TODO: Make this use object params
