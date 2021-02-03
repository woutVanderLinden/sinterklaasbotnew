const quotesDataFile = AppOptions.data + 'quotes.json';
const jokesDataFile = AppOptions.data + 'jokes.json';

var quotesFFM = new Settings.FlatFileManager(quotesDataFile);
var jokesFFM = new Settings.FlatFileManager(jokesDataFile);

var quotes = {};
var jokes = {};
const {MongoClient} = require('mongodb');
const uri ="mongodb+srv://kingbaruk:H2MWiHQgN46qrUu>@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";

	console.log("hi this is a test "+uri);
async function listDatabases(client){

    databasesList = await client.db.admin().listDatabases();

    console.log("Databases:");

    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

};

async function createListing(client, newListing){

    const result = await client.db("testDb").collection("quotes").insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);

};

async function findOneListingByName(client, nameOfListing) {

    result = await client.db("testDb").collection("quotes").findOne({ name: nameOfListing });

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
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		
		await client.connect(uri);
		await listdatabases(client);
	} catch (e) {

    		console.error(e);

	}
	return client;
	
}
console.log('connecting');
dbconnect();
async function disconnect(client){
	

		await client.close();

}
async function updateListingByName(client, nameOfListing, updatedListing) {

    result = await client.db("testDb").collection("quotes")

                        .updateOne({ name: nameOfListing }, { $set: updatedListing });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);

    console.log(`${result.modifiedCount} document(s) was/were updated.`);

}
try {
	quotes = quotesFFM.readObj();
} catch (e) {
	errlog(e.stack);
	error("Could not import quotes: " + sys.inspect(e));
}

try {
	jokes = jokesFFM.readObj();
} catch (e) {
	errlog(e.stack);
	error("Could not import jokes: " + sys.inspect(e));
}

var saveQuotes = function () {
	quotesFFM.writeObj(quotes);
};

var saveJokes = function () {
	jokesFFM.writeObj(jokes);
};

var rand = function (obj) {
	var keys = Object.keys(obj);
	if (!keys.length) return null;
	return obj[keys[Math.floor(Math.random() * keys.length)]];
};

Settings.addPermissions(['quote', 'joke']);

exports.commands = {
	/*
	* Quotes
	*/
	addquote: 'quote',
	setquote: 'quote',
	delquote: 'quote',
	getquote: 'quote',
	randquote: 'quote',
	quote: function (arg, by, room, cmd) {
		if (cmd === "addquote" || cmd === "setquote" || cmd=== "quote") {
			console.log("quotebeing added");
			if (!this.isRanked('driver')) return false;
			const client=dbconnect();
			let quotes =findOneListingByName(client,"quotes")
			console.log(quotes);
			if(quotes==undefined){
				quotes={
					 name: 'quotes',
					'nederlands':[]
					
				};
			}
			if(quotes["nederlands"]==undefined){
				quotes["nederlands"]=[];
			}
			quotes["nederlands"].push(arg);
			this.reply("added quote " +arg);
			
			
			
			
			updateListingByName(client,"quotes" ,quotes);
			disconnect(client);
		} else if (cmd === "delquote") {
			if (!this.isRanked('driver')) return false;
			const client=dbconnect();
			let quotes =findOneListingByName(client,"quotes")
			
			quotes["nederlands"].removeItemOnce(arg);
			this.reply("removed quote " +arg);
			updateListingByName(client,"quotes" ,quotes);
			disconnect(client);
		} else if (cmd === "getquote") {
			var id = toId(arg);
			if (!id) return this.reply(this.trad('noid'));
			if (!quotes[id]) return this.restrictReply(this.trad('quote') + ' "' + id + '" ' + this.trad('n'), 'quote');
			return this.restrictReply(Tools.stripCommands(quotes[id]), "quote");
		} else {
			if (!this.isRanked('voice')) return false;
			const client=dbconnect();
			let quotes =findOneListingByName(client,"quotes")
			
			var list=quotes["nederlands"];
			var quote =  list[Math.floor(Math.random() * list.length)];
			let data = JSON.stringify(quotes);
			//fs.writeFileSync('quotes.json', data);
			this.reply("__"+ quote+"__");
			
		}
	},
	listquotes: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var data = '';
		for (var i in quotes) {
			data += i + ' -> ' + quotes[i] + '\n';
		}
		if (!data) return this.reply(this.trad('empty'));
		Tools.uploadToHastebin(this.trad('list') + ':\n\n' + data, function (r, link) {
			if (r) return this.pmReply(this.trad('list') + ': ' + link);
			else this.pmReply(this.trad('err'));
		}.bind(this));
	},
	/*
	* Jokes
	*/
	addjoke: 'joke',
	setjoke: 'joke',
	deljoke: 'joke',
	getjoke: 'joke',
	joke: function (arg, by, room, cmd) {
		if (cmd === "addjoke" || cmd === "setjoke") {
			if (!this.isRanked('admin')) return false;
			var args = arg.split(",");
			if (args.length < 2) return this.reply(this.trad('u1') + ": " + this.cmdToken + cmd + " " + this.trad('u2'));
			var id = toId(args[0]);
			if (!id) return this.reply(this.trad('noid'));
			args.splice(0, 1);
			var content = Tools.stripCommands(args.join(',').trim());
			if (!content) return this.reply(this.trad('u1') + ": " + this.cmdToken + cmd + " " + this.trad('u2'));
			if (jokes[id] && cmd !== "setjoke") return this.reply(this.trad('joke') + ' "' + id + '" ' + this.trad('already'));
			var text;
			if (jokes[id]) {
				text = this.trad('joke') + ' "' + id + '" ' + this.trad('modified');
			} else {
				text = this.trad('joke') + ' "' + id + '" ' + this.trad('created');
			}
			jokes[id] = content;
			saveJokes();
			this.sclog();
			this.reply(text);
		} else if (cmd === "deljoke") {
			if (!this.isRanked('admin')) return false;
			var id = toId(arg);
			if (!id) return this.reply(this.trad('noid'));
			if (!jokes[id]) return this.reply(this.trad('joke') + ' "' + id + '" ' + this.trad('n'));
			delete jokes[id];
			saveJokes();
			this.sclog();
			this.reply(this.trad('joke') + ' "' + id + '" ' + this.trad('d'));
		} else if (cmd === "getjoke") {
			var id = toId(arg);
			if (!id) return this.reply(this.trad('noid'));
			if (!jokes[id]) return this.restrictReply(this.trad('joke') + ' "' + id + '" ' + this.trad('n'), 'joke');
			return this.restrictReply(Tools.stripCommands(jokes[id]), "joke");
		} else {
			var joke = rand(jokes);
			if (joke === null) return this.restrictReply(this.trad('empty'), "joke");
			return this.restrictReply(Tools.stripCommands(joke), "joke");
		}
	},
	listjokes: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var data = '';
		for (var i in jokes) {
			data += i + ' -> ' + jokes[i] + '\n';
		}
		if (!data) return this.reply(this.trad('empty'));
		Tools.uploadToHastebin(this.trad('list') + ':\n\n' + data, function (r, link) {
			if (r) return this.pmReply(this.trad('list') + ': ' + link);
			else this.pmReply(this.trad('err'));
		}.bind(this));
	}
};
