
const quotesDataFile = AppOptions.data + 'quotes.json';
const jokesDataFile = AppOptions.data + 'jokes.json';

var quotesFFM = new Settings.FlatFileManager(quotesDataFile);
var jokesFFM = new Settings.FlatFileManager(jokesDataFile);

var quotes = {};
var jokes = {};
const {MongoClient} = require('mongodb');
const uri ="mongodb+srv://kingbaruk:H2MWiHQgN46qrUu>@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";

	console.log("hi this is a test "+uri);
const listener = new EventEmitter();
listener.on('update', (roomid, data) => {
	if (!data.bracketData || data.bracketData.type !== 'tree') return;
	if (data.bracketData.rootNode && data.bracketData.rootNode.state === 'inprogress' && data.bracketData.rootNode.room) {
		const doubleElim = data.bracketData.rootNode.children[0] && data.bracketData.rootNode.children[1].children[0] && data.bracketData.rootNode.children[1] &&
			(data.bracketData.rootNode.children[1].children[1].children[0] && !data.bracketData.rootNode.children[1].children[0].children[0]);
		if (doubleElim) {
			ChatHandler.send(roomid, `/wall ${data.bracketData.rootNode.children[0].team} is on match point! <<${data.bracketData.rootNode.room}>>`);
		} else {
			ChatHandler.send(roomid, `/wall Watch the finals of the tournament! <<${data.bracketData.rootNode.room}>>`);
		}
	}
});
async function listDatabases(client){

    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");

    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

};

async function createListing(client, newListing){

    const result = await client.db("TestDb").collection("quotes").insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);

};

async function findOneListingByName(client, nameOfListing) {

    result = await client.db("TestDb").collection("quotes").findOne({ name: nameOfListing });

    if (result) {

        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);

        console.log(result);
	return result;
    } else {

        console.log(`No listings found with the name '${nameOfListing}'`);

    }

}
	async function updateListingByName(client, nameOfListing, updatedListing) {

    result = await client.db("TestDb").collection("quotes")

                        .updateOne({ name: nameOfListing }, { $set: updatedListing });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);

    console.log(`${result.modifiedCount} document(s) was/were updated.`);

}
async function quotefunc (arg, by, room, cmd,vart) {
		const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		
		await client.connect();
		await listDatabases(client);
		if (cmd === "addquote" || cmd === "setquote" || cmd=== "quote") {
			console.log("quotebeing added");
			
			if (!vart.isRanked('driver')) return false;
			
			console.log("the client is "+client);
			let quotes = await findOneListingByName(client,"quotes")
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
			vart.reply("added quote " +arg);
			
			
			
			
			await updateListingByName(client,"quotes" ,quotes);
			
		} else if (cmd === "delquote") {
			if (!vart.isRanked('driver')) return false;
			
			let quotes =await findOneListingByName(client,"quotes")
			
			quotes["nederlands"].removeItemOnce(arg);
			vart.reply("removed quote " +arg);
			await updateListingByName(client,"quotes" ,quotes);
		
		} else if (cmd === "uploadquotefile") {
			let rawdata = await fs.readFileSync('quotes.json');
			let student = await JSON.parse(rawdata);
			console.log("uploading quotes file"); 
			console.log("uploading quotes file "+student["nederlands"]);
			let quotes =await findOneListingByName(client,"quotes")
			
			quotes["nederlands"]=student["nederlands"];
			await updateListingByName(client,"quotes" ,quotes);
			
		} else {
			if (!vart.isRanked('voice')) return false;
			
			let quotes =await findOneListingByName(client,"quotes")
			
			var list=quotes["nederlands"];
			var quote =  list[Math.floor(Math.random() * list.length)];
			let data = JSON.stringify(quotes);
			if(quote.includes("porn")||quote.includes("rape")){
				quote="!htmlbox "+quote;
					vart.reply(quote);
			}
			else{
					vart.reply("__"+ quote+"__");
			}
			//fs.writeFileSync('quotes.json', data);
		
			
		}
	} catch (e) {

    		console.error(e);

	}
		
	finally{
		await client.close();
	}
	
}

async function infofunc (arg, by, room, cmd,vart) {
		const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		
		await client.connect();
		await listDatabases(client);
		if (cmd === "addinfo") {
			console.log("info added");
			
			if (!vart.isRanked('driver')) return false;
			var args = arg.split(",");
			if(args.length<2){
				return vart.reply("usage: user,info");
			}
			console.log("the client is "+client);
			let infos = await findOneListingByName(client,"info")
			console.log(quotes);
			if(infos==undefined){
				infos={
					 name: 'info',
					'nederlands':{}
					
				};
			}
			if(infos["nederlands"]==undefined){
				infos["nederlands"]={};
			}
			infos["nederlands"][args[0]]=args[1];
			vart.reply("added info to "+ args[0]);
			
			
			
			
			await updateListingByName(client,"info" ,infos);
			
		} else if (cmd === "delinfo") {
			if (!vart.isRanked('driver')) return false;
			
			let infos = await findOneListingByName(client,"info")
			console.log(quotes);
			if(infos==undefined){
				infos={
					 name: 'info',
					'nederlands':{}
					
				};
			}
			if(infos["nederlands"]==undefined){
				infos["nederlands"]={};
			}
			infos["nederlands"][arg]="";
			vart.reply("deleted info from "+ args);
		
		} else if (cmd === "uploadquotefile") {
			let rawdata = await fs.readFileSync('quotes.json');
			let student = await JSON.parse(rawdata);
			console.log("uploading quotes file"); 
			console.log("uploading quotes file "+student["nederlands"]);
			let quotes =await findOneListingByName(client,"quotes")
			
			quotes["nederlands"]=student["nederlands"];
			await updateListingByName(client,"quotes" ,quotes);
			
		} else {
			if (!vart.isRanked('voice')) return false;
			if (arg==""){
				
				arg=toId(by);
				console.log(arg);
			}
			let infos = await findOneListingByName(client,"info")
			var info=infos["nederlands"][arg];
			
			
			vart.reply("**"+arg+" :**"+ info);
			
			//fs.writeFileSync('quotes.json', data);
		
			
		}
	} catch (e) {

    		console.error(e);

	}
		
	finally{
		await client.close();
	}
	
}
	console.log(uri);
	
	async function bitterballenfunc (arg, by, room, cmd,vart) {
		const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		
		await client.connect();
		await listDatabases(client);
		console.log(cmd);
		if (cmd === "addbitterballen") {
			console.log("info added");
			
			if (!vart.isRanked('driver')) return false;
			var args = arg.split(",");
			if(args.length<2 && args.isInteger()){
				return vart.reply("usage: user,aantal bitterballen");
			}
			console.log("the client is "+client);
			let bitbals = await findOneListingByName(client,"bitterballen")
			console.log(bitbals);
			if(bitbals==undefined){
				infos={
					 name: 'bitterballen',
					'nederlands':{}
					
				};
			}
			if(bitbals["nederlands"]==undefined){
				bitbals["nederlands"]={};
			}
			if(bitbals["nederlands"][args[0]]==undefined){
				bitbals["nederlands"][args[0]]=0;
			}
			bitbals["nederlands"][args[0]]=parseInt(bitbals["nederlands"][args[0]])+parseInt(args[1]);
			vart.reply(args[0]+" heeft " +parseInt(bitbals["nederlands"][args[0]])+" bitterballen");
			
			
			
			
			await updateListingByName(client,"bitterballen" ,bitbals);
			
		} else if (cmd === "delinfo") {
			if (!vart.isRanked('driver')) return false;
			
			let infos = await findOneListingByName(client,"info")
			console.log(quotes);
			if(infos==undefined){
				infos={
					 name: 'bitterballen',
					'nederlands':{}
					
				};
			}
			if(infos["nederlands"]==undefined){
				infos["nederlands"]={};
			}
			infos["nederlands"].arg="";
			vart.reply("deleted info from "+ args);
			await updateListingByName(client,"bitterballen" ,bitbals);
		
		} else if (cmd === "uploadquotefile") {
			let rawdata = await fs.readFileSync('quotes.json');
			let student = await JSON.parse(rawdata);
			console.log("uploading quotes file"); 
			console.log("uploading quotes file "+student["nederlands"]);
			let quotes =await findOneListingByName(client,"quotes")
			
			quotes["nederlands"]=student["nederlands"];
			await updateListingByName(client,"quotes" ,quotes);
			
		} else {
			if (arg==""){
				arg=toId(by);
				console.log(arg);
			}
			let infos = await findOneListingByName(client,"bitterballen")
			var nrbitterballen=infos["nederlands"][arg];
			
			
			vart.reply(arg+" heeft "+nrbitterballen +" bitterballen");
			
			//fs.writeFileSync('quotes.json', data);
		
			
		}
	} catch (e) {

    		console.error(e);

	}
		
	finally{
		await client.close();
	}
	
}
	console.log(uri);
async function dbconnect(){

	const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
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
console.log('connecting');
dbconnect();
async function disconnect(client){
	

		await client.close();

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
	uploadquotefile:'quote',
	quote: function (arg, by, room, cmd) {
		quotefunc(arg,by,room,cmd,this);
	},
	addinfo: 'info',
	delinfo: 'info',
	info:function (arg, by, room, cmd) {
		infofunc(arg,by,room,cmd,this);
	},
	addbitterballen: 'bitterballen',
	removebitterballen: 'bitterballen',
	bitterballen:function (arg, by, room, cmd) {
		console.log("manupulating bitterballen");
		bitterballenfunc(arg,by,room,cmd,this);
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
