/*
	Pokemon Showdown Bot, for NodeJS

	By: Ecuacion
*/

//var XLSX = require('xlsx');
try {
	
	require('xlsx');
} catch (e) {
	console.log('Installing dependencies... (xlsx)');
	require('child_process').spawnSync('sh', ['-c', 'npm install xlsx'], {stdio: 'inherit'});
}
let todraftmons={};
let users={};
let passedusers = [];
var http = require('http'); //importing http
var packdrafting=false;
var pointdrafting=false;
var auctioning=false;
var nominatedmon="";
var giftdrafting=false;
var currentStartScore=100;
var currentscore=0;
var currentHighestBidder="";
var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
var auctiondrafting=false;
var pointpicks=0;
startKeepAlive();
function draftmons(arg) {
	var result='';
		for (var i = 0; i < arg.length; i++) {
			console.log(arg[i]);
    //Do something
			
				result=result+","+arg[i];
			
			
		}
		result=result.substring(1,result.length-1);
	return 'draftable mons are ' +result;
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
try {
	
	
	require('sugar');
	global.draftvalues = {};
	global.draftvalues.pointpicks=0;
	global.draftvalues.todraftmons={};
	global.draftvalues.draftdirectionup={};
	global.draftvalues.users={};
	global.draftvalues.picknr={};
	global.draftvalues.turnorder=[];
	global.draftvalues.possiblepicks={};
	global.draftvalues.packdrafting=false;
	global.draftvalues.draftstarted=false;
	global.draftvalues.nextdrafter={};
	global.draftvalues.draftedmons={};
	global.draftvalues.currenttier={};
	global.draftvalues.pointdrafting=false;
	global.colors = require('colors');
	global.util = require('util');
	global.fs = require('fs');
	global.path = require('path');
	global.PSClient = require('./showdown-client.js');
	let rawdata = fs.readFileSync('convertcsvnew.json');
	let student = JSON.parse(rawdata);
	global.draftvalues.mondata=student;
	let colordata = fs.readFileSync('TypingsToColor.json');
	let colors = JSON.parse(colordata);
	global.draftvalues.typingcolors=colors;

	let rawdata2 = fs.readFileSync('weaknesssheet.json');
	let student2 = JSON.parse(rawdata2);
	global.draftvalues.weaknesssheet=student2;
} catch (e) {
	console.log(e.stack);
	console.log("ERROR: missing dependencies, try 'npm install'");
	process.exit(-1);
}
const {MongoClient} = require('mongodb');
const uri ="mongodb+srv://kingbaruk:H2MWiHQgN46qrUu>@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";

	console.log("hi this is a test "+uri);
async function listDatabases(client){

    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");

    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

};

async function createListing(client, newListing){

    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);

};

async function findOneListingByName(client, nameOfListing) {

    result = await global.client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });

    if (result) {

        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);

        console.log(result);
	return result;
    } else {

        console.log(`No listings found with the name '${nameOfListing}'`);

    }

}
	console.log(uri);
async function dbconnect(){

	const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = await new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		await client.connect();
		await listDatabases(client);
	} catch (e) {

    console.error(e);

	}
	
	finally{
		await client.close();
	}
}
dbconnect();

async function disconnect(client){
	

		await client.close();

}
console.log((
	'-----------------------------------------------\n' +
	'   Welcome to Pokemon Showdown Bot for Node!   \n' +
	'-----------------------------------------------\n'
).yellow);

global.Tools = require('./tools.js');
var cmdArgs = process.argv.slice(2);
if (!global.AppOptions) global.AppOptions = Tools.paseArguments(cmdArgs);

if (AppOptions.help) {
	console.log(
		"Options:\n" +
		"   [-h/-help] - Gives you this guide\n" +
		"   [-c/-config] config-file - Set a custom configuration file\n" +
		"   [-dt/-data] data-dir - Set a custom data directory\n" +
		"   [-p/-production] - Production mode (recommended)\n" +
		"   [-m/-monitor] - Monitor mode\n" +
		"   [-d/-debug] - Debug mode\n" +
		"   [-t/-test] - Test Mode\n"
	);
	process.exit();
}

if (!AppOptions.config) AppOptions.config = './config.js';
if (!AppOptions.data) AppOptions.data = './data/';
if (AppOptions.data.charAt(AppOptions.data.length - 1) !== '/') AppOptions.data += '/';

if (!fs.existsSync(AppOptions.data)) {
	console.log(AppOptions.data + " does not exist - creating data directory...");
	fs.mkdirSync(AppOptions.data);
}

if (!fs.existsSync(AppOptions.data + "_temp/")) {
	console.log(AppOptions.data + "_temp/" + " does not exist - creating temp directory...");
	fs.mkdirSync(AppOptions.data + "_temp/");
}

if (!fs.existsSync(AppOptions.config)) {
	console.log(AppOptions.config + " does not exist - creating one with default settings...");
	fs.writeFileSync(AppOptions.config, fs.readFileSync('./config-example.js'));
}

global.Config = require(AppOptions.config);
Tools.checkConfig();

if (AppOptions.debugmode) info((['Debug', 'Monitor', 'Production'])[AppOptions.debugmode - 1] + ' mode');

info('Loading globals');

/* Globals */

global.Formats = {};

global.Settings = require('./settings.js');

global.DataDownloader = require('./data-downloader.js');

global.CommandParser = require('./command-parser.js');

global.SecurityLog = require('./security-log.js');

/* Commands */

if (!AppOptions.testmode) CommandParser.loadCommands();

/* Languages (translations) */

if (!AppOptions.testmode) Tools.loadTranslations();

/* Features */

global.Features = {};

if (!AppOptions.testmode) {
	var featureList = fs.readdirSync('./features/');

	featureList.forEach(function (feature) {
		if (fs.existsSync('./features/' + feature + '/index.js')) {
			try {
				var f = require('./features/' + feature + '/index.js');
				if (f.id) {
					Features[f.id] = f;
					ok("New feature: " + f.id + ' | ' + f.desc);
				} else {
					error("Failed to load feature: " + './features/' + feature);
				}
			} catch (e) {
				errlog(e.stack);
				error("Failed to load feature: " + './features/' + feature);
			}
		}
	});
}

global.reloadFeatures = function () {
	var featureList = fs.readdirSync('./features/');
	var errs = [];
	featureList.forEach(function (feature) {
		if (fs.existsSync('./features/' + feature + '/index.js')) {
			try {
				Tools.uncacheTree('./features/' + feature + '/index.js');
				var f = require('./features/' + feature + '/index.js');
				if (f.id) {
					if (Features[f.id] && typeof Features[f.id].destroy === "function") Features[f.id].destroy();
					Features[f.id] = f;
					if (typeof Features[f.id].init === "function") Features[f.id].init();
				}
			} catch (e) {
				errlog(e.stack);
				errs.push(feature);
			}
		}
	});
	info('Features reloaded' + (errs.length ? ('. Errors: ' + errs.join(', ')) : ''));
	return errs;
};

/* Bot creation and connection */

function botAfterConnect () {
	//join rooms
	if (typeof Config.rooms === "string") {
		joinByQueryRequest(Config.rooms);
	} else {
		var cmds = [];
		var featureInitCmds;
		for (var i = 0; i < Config.rooms.length; i++) {
			cmds.push('|/join ' + Config.rooms[i]);
		}
		for (var i = 0; i < Config.initCmds.length; i++) {
			cmds.push(Config.initCmds[i]);
		}
		for (var f in Features) {
			if (typeof Features[f].getInitCmds === "function") {
				try {
					featureInitCmds = Features[f].getInitCmds();
					if (featureInitCmds) cmds = cmds.concat(featureInitCmds);
				} catch (e) {
					errlog(e.stack);
				}
			}
		}
		Bot.send(cmds, 2000);
	}
}

function joinByQueryRequest(target) {
	if (target === 'official' || target === 'public' || target === 'all') {
		info('Joining ' + target + ' rooms');
		console.log("here");
	} else {
		error('Config.rooms, as a string must be "official", "public" or "all"');
		var cmds = [];
		var featureInitCmds;
		for (var i = 0; i < Config.initCmds.length; i++) {
			cmds.push(Config.initCmds[i]);
		}
		for (var f in Features) {
			if (typeof Features[f].getInitCmds === "function") {
				try {
					featureInitCmds = Features[f].getInitCmds();
					if (featureInitCmds) cmds = cmds.concat(featureInitCmds);
				} catch (e) {
					errlog(e.stack);
				}
			}
		}
		Bot.send(cmds, 2000);
		return;
	}
	var qParser = function (data) {
		data = data.split('|');
		if (data[0] === 'rooms') {
			data.splice(0, 1);
			var str = data.join('|');
			var cmds = [];
			var featureInitCmds;
			try {
				var rooms = JSON.parse(str);
				var offRooms = [], publicRooms = [];
				if (rooms.official) {
					for (var i = 0; i < rooms.official.length; i++) {
						if (rooms.official[i].title) offRooms.push(toId(rooms.official[i].title));
					}
				}
				if (rooms.chat) {
					for (var i = 0; i < rooms.chat.length; i++) {
						if (rooms.chat[i].title) publicRooms.push(toId(rooms.chat[i].title));
					}
				}
				if (target === 'all' || target === 'official') {
					for (var i = 0; i < offRooms.length; i++) cmds.push('|/join ' + offRooms[i]);
				}
				if (target === 'all' || target === 'public') {
					for (var i = 0; i < publicRooms.length; i++) cmds.push('|/join ' + publicRooms[i]);
				}
			} catch (e) {}
			for (var i = 0; i < Config.initCmds.length; i++) {
				cmds.push(Config.initCmds[i]);
			}
			for (var f in Features) {
				if (typeof Features[f].getInitCmds === "function") {
					try {
						featureInitCmds = Features[f].getInitCmds();
						if (featureInitCmds) cmds = cmds.concat(featureInitCmds);
					} catch (e) {
						errlog(e.stack);
					}
				}
			}
			Bot.send(cmds, 2000);
			Bot.removeListener('queryresponse', qParser);
		}
	};
	Bot.on('queryresponse', qParser);
	Bot.send('|/cmd rooms');
}

var opts = {
	serverid: Config.serverid,
	secprotocols: [],
	connectionTimeout: Config.connectionTimeout,
	loginServer: 'https://play.pokemonshowdown.com/~~' + Config.serverid + '/action.php',
	nickName: null,
	pass: null,
	retryLogin: false,
	autoConnect: false,
	autoReconnect: false,
	autoReconnectDelay: 0,
	autoJoin: [],
	showErrors: (Config.debug ? Config.debug.debug : true),
	debug: (Config.debug ? Config.debug.debug : true)
};
function startKeepAlive() {
    setInterval(function() {
        var options = {
            host: 'newsinterklaasbot.herokuapp.com',
            port: 80,
            path: '/'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    console.log("HEROKU RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 20 * 60 * 1000); // load every 20 minutes
}
startKeepAlive();

port = process.env.PORT || 8000;
const uri2 =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri2);
	console.log("test");
console.log(port);
console.log("test");
global.Bot = new PSClient(Config.server, 8000, opts);
const express = require('express')
const app = express();



app.listen(port);

var connected = false;
Bot.on('connect', function (con) {
	ok('Connected to server ' + Config.serverid + ' (' + Tools.getDateString() + ')');
	SecurityLog.log('Connected to server ' + Bot.opts.server + ":" + Bot.opts.port + " (" + Bot.opts.serverid + ")");
	connected = true;
	for (var f in Features) {
		try {
			if (typeof Features[f].init === "function") Features[f].init();
		} catch (e) {
			errlog(e.stack);
			error("Feature Crash: " + f + " | " + util.inspect(e));
			SecurityLog.log("FEATURE CRASH: " + f + " | " + e.message + "\n" + e.stack);
		}
	}
});

Bot.on('formats', function (formats) {
	global.Formats = {};
	var formatsArr = formats.split('|');
	var commaIndex, arg, formatData, code, name;
	for (var i = 0; i < formatsArr.length; i++) {
		commaIndex = formatsArr[i].indexOf(',');
		if (commaIndex === -1) {
			Formats[toId(formatsArr[i])] = {name: formatsArr[i], team: true, ladder: true, chall: true};
		} else if (commaIndex === 0) {
			i++;
			continue;
		} else {
			name = formatsArr[i];
			formatData = {name: name, team: true, ladder: true, chall: true};
			code = commaIndex >= 0 ? parseInt(name.substr(commaIndex + 1), 16) : NaN;
			if (!isNaN(code)) {
				name = name.substr(0, commaIndex);
				if (code & 1) formatData.team = false;
				if (!(code & 2)) formatData.ladder = false;
				if (!(code & 4)) formatData.chall = false;
				if (!(code & 8)) formatData.disableTournaments = true;
			} else {
				if (name.substr(name.length - 2) === ',#') { // preset teams
					formatData.team = false;
					name = name.substr(0, name.length - 2);
				}
				if (name.substr(name.length - 2) === ',,') { // search-only
					formatData.chall = false;
					name = name.substr(0, name.length - 2);
				} else if (name.substr(name.length - 1) === ',') { // challenge-only
					formatData.ladder = false;
					name = name.substr(0, name.length - 1);
				}
			}
			formatData.name = name;
			Formats[toId(name)] = formatData;
		}
	}
	ok('Received battle formats. Total: ' + formatsArr.length);
	if (!Config.disableDownload) {
		DataDownloader.download();
	}
});

Bot.on('challstr', function (challstr) {
	info('Received challstr, logging in...');
	if (!Config.nick) {
		Bot.rename('Bot ' + Tools.generateRandomNick(10));
	} else {
		Bot.rename(Config.nick, Config.pass);
	}
});

var retryingRename = false;
Bot.on('renamefailure', function (e) {
	if (e === -1)  {
		if (!Config.nick) {
			debug('Login failure - generating another random nickname');
			Bot.rename('Bot ' + Tools.generateRandomNick(10));
		} else {
			error('Login failure - name registered, invalid or no password given');
			if (!Bot.status.named) {
				info("Invalid nick + pass, using a random nickname");
				Config.nick = '';
				Bot.rename('Bot ' + Tools.generateRandomNick(10));
			}
		}
	} else {
		if (Config.autoReloginDelay) {
			error('Login failure, retrying in ' + (Config.autoReloginDelay / 1000) + ' seconds.');
			retryingRename = true;
			setTimeout(function () {
				retryingRename = false;
				if (!Config.nick) {
					Bot.rename('Bot ' + Tools.generateRandomNick(10));
				} else {
					Bot.rename(Config.nick, Config.pass);
				}
			}, Config.autoReloginDelay);
		} else {
			error('Login failure');
		}
	}
});

Bot.on('rename', function (name, named) {
	monitor('Bot nickname has changed: ' + (named ? name.green : name.yellow) + (named ? '' : ' [guest]'));
	SecurityLog.log('Bot nickname has changed to: ' + name + (named ? '' : ' [guest]'));
	if (named) {
		if (!Config.nick) {
			if (Bot.roomcount > 0) return; // Namechange, not initial login
			ok('Successfully logged in as ' + name);
			botAfterConnect();
		} else if (toId(Config.nick) === toId(name)) {
			ok('Successfully logged in as ' + name);
			botAfterConnect();
		}
	}
});

/* Reconnect timer */

var reconnectTimer = null;
var reconnecting = false;
Bot.on('disconnect', function (e) {
	if (connected) SecurityLog.log('Disconnected from server');
	connected = false;
	if (Config.autoReconnectDelay) {
		if (reconnecting) return;
		reconnecting = true;
		error('Disconnected from server, retrying in ' + (Config.autoReconnectDelay / 1000) + ' seconds');
		reconnectTimer = setTimeout(function () {
			reconnecting = false;
			info('Connecting to server ' + Config.server + ':' + Config.port);
			Bot.connect();
		}, Config.autoReconnectDelay);
	} else {
		error('Disconnected from server, exiting...');
		process.exit(0);
	}
});

/* Commands */

Bot.on('chat', function (room, timeOff, by, msg) {
	CommandParser.parse(room, by, msg);
	Settings.userManager.reportChat(by, room);
});

Bot.on('pm', function (by, msg) {
	CommandParser.parse(',' + by, by, msg);
});

Bot.on('userjoin', function (room, by) {
	Settings.userManager.reportJoin(by, room);
});

Bot.on('userleave', function (room, by) {
	Settings.userManager.reportLeave(by, room);
});

Bot.on('userrename', function (room, old, by) {
	Settings.userManager.reportRename(old, by, room);
});

/* Features */
async function announcefinals(data,room){
	
if (!data.bracketData || data.bracketData.type !== 'tree') return;
	if (data.bracketData.rootNode && data.bracketData.rootNode.state === 'inprogress' && data.bracketData.rootNode.room) {
	//	const doubleElim = data.bracketData.rootNode.children[0] && data.bracketData.rootNode.children[1].children[0] && data.bracketData.rootNode.children[1] &&
	//		(data.bracketData.rootNode.children[1].children[1].children[0] && !data.bracketData.rootNode.children[1].children[0].children[0]);
	//	if (doubleElim) {
	//		Bot.say(room, `/wall ${data.bracketData.rootNode.children[0].team} is on match point! <<${data.bracketData.rootNode.room}>>`);
		//} else {
			Bot.say(room, `/wall Watch the finals of the tournament! <<${data.bracketData.rootNode.room}>>`);
	//	}
	}
}
Bot.on('line', function (room, message, isIntro, spl) {
	
	var messes1=message.split("|");

	
	if(message.startsWith("|tournament|update|")){
	   
		var messes=message.split("|");
		announcefinals(JSON. parse(messes[3]),room);
	   }
	for (var f in Features) {
		try {
			if (typeof Features[f].parse === "function") Features[f].parse(room, message, isIntro, spl);
		} catch (e) {
			errlog(e.stack);
			error("Feature Crash: " + f + " | " + util.inspect(e));
			SecurityLog.log("FEATURE CRASH: " + f + " | " + e.message + "\n" + e.stack);
			Features[f].disabled = true;
			Features[f].parse = null;
			info("Feature " + f + " has been disabled");
		}
	}
});

/* Info and debug */

Bot.on('joinroom', function (room, type) {
	SecurityLog.log("Joined room: " + room + " [" + type + "]");
	if (type === 'chat') monitor('Joined room ' + room, 'room', 'join');
	else if (type === 'battle') monitor('Joined battle ' + room, 'battle', 'join');
	else monitor('Joined room ' + room + ' [' + Bot.rooms[room].type + ']', 'room', 'join');
});

Bot.on('joinfailure', function (room, e, moreInfo) {
	SecurityLog.log('Could not join ' + room + ': [' + e + '] ' + moreInfo);
	monitor('Could not join ' + room + ': [' + e + '] ' + moreInfo, 'room', 'error');
});

Bot.on('leaveroom', function (room) {
	var roomType = Bot.rooms[room] ? Bot.rooms[room].type : 'chat';
	SecurityLog.log("Left room: " + room + " [" + roomType + "]");
	if (roomType === 'chat') monitor('Left room ' + room, 'room', 'leave');
	else if (roomType === 'battle') monitor('Left battle ' + room, 'battle', 'leave');
	else monitor('Left room ' + room + ' [' + Bot.rooms[room].type + ']', 'room', 'leave');
});

Bot.on('message', function (msg) {
	recv(msg);
});

Bot.on('send', function (msg) {
	sent(msg);
});

ok('Bot object is ready');

/* Global Monitor */

var checkSystem = function () {
	var status = '';
	var issue = false;
	status += 'Connection: ';
	if (connected) {
		status += 'connected'.green;
		status += ' | Nickname: ';
		if (Bot.status.named) {
			status += Bot.status.nickName.green;
		} else if (retryingRename) {
			status += Bot.status.nickName.yellow;
		} else {
			status += Bot.status.nickName.red;
			issue = 'login';
		}
	} else if (reconnecting) {
		status += 'retrying'.yellow;
	} else {
		issue = 'connect';
		status += 'disconnected'.red;
	}
	monitor(status + ' (' + Tools.getDateString() + ')', 'status');
	if (issue) {
		switch (issue) {
			case 'connect':
				monitor("Monitor failed: Connection issue. Reconnecting...");
				SecurityLog.log("Monitor failed: Connection issue. Reconnecting...");
				Bot.connect();
				break;
			case 'login':
				monitor("Monitor failed: Login issue. Logging in a random username.");
				SecurityLog.log("Monitor failed: Login issue. Logging in a random username.");
				Config.nick = '';
				Bot.rename('Bot ' + Tools.generateRandomNick(10));
				break;
		}
	
}
};
if (!AppOptions.testmode) {
	var utilChecker = setInterval(checkSystem, 60 * 60 * 1000);
	ok('Global monitor is working');
}

//CrashGuard
if (!AppOptions.testmode && Config.crashguard) {
	process.on('uncaughtException', function (err) {
		SecurityLog.log("CRASH: " + err.message + "\n" + err.stack);
		error(("" + err.message).red);
		errlog(("" + err.stack).red);
	});
	ok("Crashguard enabled");
}

//WatchConfig
if (!AppOptions.testmode && Config.watchconfig) {
	Tools.watchFile(AppOptions.config, function (curr, prev) {
		if (curr.mtime <= prev.mtime) return;
		try {
			Tools.uncacheTree(AppOptions.config);
			global.Config = require(AppOptions.config);
			Tools.checkConfig();
			Settings.applyConfig();
			CommandParser.reloadTokens();
			info(AppOptions.config + ' reloaded');
		} catch (e) {
			error('could not reload ' + AppOptions.config + " | " + e.message);
			errlog(e.stack);
		}
	});
	ok("Watchconfig enabled");
}

console.log("\n-----------------------------------------------\n".yellow);

//Connection
if (AppOptions.testmode) {
	ok("Test mode enabled");
} else {
	info('Connecting to server ' + Config.server + ':' + Config.port);
	Bot.connect();
	Bot.startConnectionTimeOut();
}
