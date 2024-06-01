exports.board = function (inputHeaders, input, sort, styling, widths, rank, limit) {
	/*
	headers: string[] - headers is an array of the array headers; ie, the title row
	input: [[]] - input is a nested array of the input of the table
	sort: function - sort is a single function that is run on each input element
	styling: string[] - styling is the styilng applied to separate elements
	widths: number[] - width is an array that takes the width of each column
	rank: string - creates a new column at the beginning with the ranks
	limit: number - Maximum entries to display.
	*/
	const headers = Array.from(inputHeaders);
	if (!Array.isArray(headers) || !headers[0] || typeof headers[0] !== 'string') return 1;
	if (!Array.isArray(input) || !input[0] || !Array.isArray(input[0])) return 2;
	if (typeof sort !== 'function') return 3;
	if (styling.length === 2) styling.push(styling[1]);
	if (!Array.isArray(styling) || styling.length !== 3 || typeof styling[0] !== 'string') return 4;
	const data = Array.from(input).filter(row => row.length === headers.length);
	if (rank) headers.unshift(rank);
	if (!widths || !Array.isArray(widths)) {
		widths = Array.from({ length: headers.length }).fill(Math.floor(100 / headers.length) + '%');
	}
	let html = '<table style="border-collapse:collapse; border-spacing:0; border-color:#aaa;"><colgroup>';
	for (let i = 0; i < headers.length; i++) html += `<col style="width:${widths[i]}">`;
	html += '</colgroup>';
	html += '<tr>';
	for (let i = 0; i < headers.length; i++) html += `<th style="${styling[0]}">${headers[i]}</th>`;
	html += '</tr>';
	if (!data.length) return 5;
	try {
		data.sort((x, y) => {
			return sort(y) - sort(x);
		}).forEach((row, index) => {
			if (rank) row.unshift(index + 1);
		});
		html += data.map((row, index) => {
			if (limit && index >= limit) return;
			let text = '<tr>';
			if (index % 2 === 0) text += row.map(term => `<td style="${styling[1]}">${term}</td>`).join('');
			else text += row.map(term => `<td style="${styling[2]}">${term}</td>`).join('');
			text += '</tr>';
			return text;
		}).join('');
		html += '</table>';
		return html;
	} catch (e) {
		console.log(e);
		return e.message;
	}
};
