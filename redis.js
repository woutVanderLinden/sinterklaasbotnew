'use strict';

const redis = require('thunk-redis');
const fs = require('fs');

const {exec} = require('child_process');

let tables;

try {
	tables = require('./data/tables.json');
} catch (e) {}

if (!Array.isArray(tables)) tables = [];

function writeTables() {
	fs.writeFileSync('./data/tables.json', JSON.stringify(tables));
}

module.exports = {
	databases: {},
	tables: tables,

	useDatabase(name) {
		if (this.databases[name]) return this.databases[name];

		let i = this.tables.indexOf(name);
		if (i === -1) {
			i = this.tables.length;
			this.tables.push(name);
			writeTables();
		}

	
	},

	restart() {
		this.restarting = true;
		return new Promise(resolve => {
			exec(`rm /var/run/redis_6379.pid && /etc/init.d/redis_6379 start`, async () => {
				this.restarting = false;
				resolve();
			});
		});
	}
};
