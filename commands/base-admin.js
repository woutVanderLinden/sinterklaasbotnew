/*
	Admin Commands
*/

const {MongoClient} = require('mongodb');
async function listDatabases(client){
	//hinicework
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
	console.log("try");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

};
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
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

function startNewGiftTier(replier,room) {
	global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]= !global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)];
	global.draftvalues.nrdrafted=0;
	global.draftvalues.monslists=[];
	 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]=0;
	if(0 == global.draftvalues.currenttier[toId(room)]){
		global.draftvalues.monslists=[];
		global.draftvalues.draftstarted=false;
		return replier.send(global.draftvalues.draftroom,"the draft is over")
	}
	global.draftvalues.tierPicks=global.draftvalues.todraftmons[toId(room)]["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"];
	console.log("ended "+ global.draftvalues.currenttier[toId(room)]);

	var list=global.draftvalues.turnorder;
	if(global.draftvalues.currenttier[toId(room)])
	for (var i = 0; i < list.length; i++) {
		global.draftvalues.drafted[i]=false;
		global.draftvalues.monslists.push(generateMonsList(global.draftvalues.todraftmons[toId(room)],room));
		console.log(global.draftvalues.monslists);
		/*pm them the list we can do this here*/
	}


	/*give everyone a monlist*/
	 replier.send(global.draftvalues.draftroom,"sending drafts");
	pmlists(global.draftvalues.monslists, room, replier);
}

exports.commands = {
	c: 'custom',
	
	custom: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var tarRoom;
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			tarRoom = toRoomid(arg.slice(1, arg.indexOf(']')));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.sclog();
		this.say(tarRoom || room, arg);
	},

	sendpm: 'pm',
	pm: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [message]");
		var targetUser = toId(args.shift());
		var msg = args.join(",").trim();
		if (!targetUser || !msg) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [message]");
		this.sclog();
		this.sendPM(targetUser, msg);
	},
	
	sayinroom: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')&& !toId(by) =="yveltalnl") return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [message]");
		var targetUser = toId(args.shift());
		var msg = args.join(",").trim();
		if (!targetUser || !msg) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [message]");
		this.sclog();
		this.sendPM(targetUser, msg);
	},

	"join": function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		if (!arg) return;
		arg = arg.split(',');
		var cmds = [];
		for (var i = 0; i < arg.length; i++) {
			cmds.push('|/join ' + arg[i]);
		}
		this.sclog();
		this.send(cmds);
	},

	invite: function (arg, by, room, cmd) {
		this.reply('/invite '+arg);
	},
	leave: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		if (!arg) {
			if (this.roomType !== 'pm') this.reply('/leave');
			this.sclog();
			return;
		}
		arg = arg.split(',');
		var cmds = [];
		for (var i = 0; i < arg.length; i++) {
			cmds.push(toId(arg[i]) + '|/leave');
		}
		this.sclog();
		this.send(cmds);
	},

	joinallrooms: 'joinall',
	joinrooms: 'joinall',
	joinall: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var target = 'all';
		arg = toId(arg);
		if (arg.length || cmd === 'joinrooms') {
			if (arg === 'official') target = 'official';
			else if (arg === 'public') target = 'public';
			else if (arg === 'all') target = 'all';
			else return this.reply('Usage: ' + this.cmdToken + cmd + ' [official/public/all]');
		}
		var qParser = function (data) {
			data = data.split('|');
			if (data[0] === 'rooms') {
				data.splice(0, 1);
				var str = data.join('|');
				var cmds = [];
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
				Bot.send(cmds, 2000);
				Bot.removeListener('queryresponse', qParser);
			}
		};
		Bot.on('queryresponse', qParser);
		this.sclog();
		Bot.send('|/cmd rooms');
	},

	lang: 'language',
	language: function (arg, by, room, cmd) {
		if (!this.isRanked('roomowner')) return false;
		var tarRoom = room;
		var targetObj = Tools.getTargetRoom(arg);
		var textHelper = '';
		if (targetObj && this.isExcepted) {
			arg = targetObj.arg;
			tarRoom = targetObj.room;
			textHelper = ' (' + tarRoom + ')';
		}
		if (!Bot.rooms[tarRoom] || Bot.rooms[tarRoom].type !== 'chat') return this.reply(this.trad('notchat') + textHelper);
		var lang = toId(arg);
		if (!lang.length) return this.reply(this.trad('nolang') + ". " + this.trad('v') + ': ' + Object.keys(Tools.translations).join(', '));
		if (!Tools.translations[lang]) return this.reply(this.trad('v') + ': ' + Object.keys(Tools.translations).join(', '));
		if (!Settings.settings['language']) Settings.settings['language'] = {};
		Settings.settings['language'][tarRoom] = lang;
		Settings.save();
		this.sclog();
		this.language = lang;
		this.reply(this.trad('l') + textHelper);
	},

	settings: 'set',
	set: function (arg, by, room, cmd) {
		if (!this.isRanked('roomowner')) return false;
		var tarRoom = room;
		var targetObj = Tools.getTargetRoom(arg);
		var textHelper = '';
		if (targetObj && this.isExcepted) {
			arg = targetObj.arg;
			tarRoom = targetObj.room;
			textHelper = ' (' + tarRoom + ')';
		}
		if (!Bot.rooms[tarRoom] || Bot.rooms[tarRoom].type !== 'chat') return this.reply(this.trad('notchat') + textHelper);
		var args = arg.split(",");
		if (args.length < 2) return this.reply(this.trad('u1') + ": " + this.cmdToken + cmd + " " + this.trad('u2'));
		var perm = toId(args[0]);
		var rank = args[1].trim();
		if (!(perm in Settings.permissions)) {
			return this.reply(this.trad('ps') + ": " + Object.keys(Settings.permissions).sort().join(", "));
		}
		if (rank in {'off': 1, 'disable': 1}) {
			if (!this.canSet(perm, true)) return this.reply(this.trad('denied'));
			Settings.setPermission(tarRoom, perm, true);
			Settings.save();
			this.sclog();
			return this.reply(this.trad('p') + " **" + perm + "** " + this.trad('d') + textHelper);
		}
		if (rank in {'on': 1, 'all': 1, 'enable': 1}) {
			if (!this.canSet(perm, ' ')) return this.reply(this.trad('denied'));
			Settings.setPermission(tarRoom, perm, ' ');
			Settings.save();
			this.sclog();
			return this.reply(this.trad('p') + " **" + perm + "** " + this.trad('a') + textHelper);
		}
		if (Config.ranks.indexOf(rank) >= 0) {
			if (!this.canSet(perm, rank)) return this.reply(this.trad('denied'));
			Settings.setPermission(tarRoom, perm, rank);
			Settings.save();
			this.sclog();
			return this.reply(this.trad('p') + " **" + perm + "** " + this.trad('r') + ' ' + rank + " " + this.trad('r2') + textHelper);
		} else {
			return this.reply(this.trad('not1') + " " + rank + " " + this.trad('not2'));
		}
	},

	/*
	the following commands are used for drafting
	*/
	
	startgiftdraft: function(arg, by, room, cmd) {
		if (!this.isRanked('admin')&& !toId(by) =="yveltalnl") return false;
		
		/*
		console.log('started reading file');
		let rawdata = fs.readFileSync('newdrafttest2.json');
		let student = JSON.parse(rawdata);
		console.log(student);
		*/
		global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
		global.draftvalues.currenttier[toId(room)]=global.draftvalues.maxtier;
		//global.draftvalues.todraftmons[toId(room)]=student;
		global.draftvalues.giftdrafting=true;
		global.draftvalues.draftstarted=true;
		 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]=0;

		global.draftvalues.drafted=[];
		startNewGiftTier(this, room);
		console.log(global.draftvalues.users[toId(by)]["draftedmons"]);
	},
	
	/*
	the following commands are used for packdrafting
	*/
	
	startpackdraft: function(arg, by, room, cmd) {
		if (!this.isRanked('admin')&& !toId(by) =="yveltalnl") return false;
		console.log('started reading file');
		let rawdata = fs.readFileSync('newdrafttest.json');
		let student = JSON.parse(rawdata);
		console.log(student);
		global.draftvalues.currenttier[toId(room)]=0;
		global.draftvalues.todraftmons[toId(room)]=student;
		
		global.draftvalues.packdrafting=true;
		global.draftvalues.draftstarted=true;
		 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]=0;
		global.draftvalues.nextdrafter=0;
		//this.reply('draft order is '+result);
		console.log(global.draftvalues.draftstarted);
		console.log(global.draftvalues.todraftmons);
		let rawdata2 = fs.readFileSync('draftedmons.json');
		let student2 = JSON.parse(rawdata2);
		if(global.draftvalues.draftedmons={}){
			global.draftvalues.draftedmons=student2;
		}
		var draftmons=global.draftvalues.todraftmons[toId(room)];
		global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
		var list=global.draftvalues.users[toId(room)];
		var newlist=pickmultimons(draftmons["tierlist"][global.draftvalues.currenttier[toId(room)]]["pokemon"],6,list);
		global.draftvalues.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
	var list=global.draftvalues.users[toId(room)];
		return this.reply('use ?draft {pokemonname} to draft your mons, Choose next mon '+list[0]);
	},
	
	forcejoin:  async function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		if(arg==""){
			return this.reply("no player mentioned")
		}
		if(global.draftvalues.users[toId(room)]==undefined){
			global.draftvalues.users[toId(room)]=[];
		}
		if(global.draftvalues.users[toId(room)].includes(arg)){
			return this.reply(arg+ " already joined the draft")
		}
		else{
			console.log(global.draftvalues.users);
			var bool = JSON.stringify(global.draftvalues.users) === "{}";
			if (bool){
				/*first load in the draft file list*/
				//lets try that now
				console.log('started reading file');
				const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
				console.log(uri);
				console.log("test");

				const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

				try {

					await client.connect();
					const quotes =await findOneListingByName(client,"pokemon");
					global.draftvalues.users=quotes["pokemon"];


					//return this.reply(draftmonsprint2(list));
				} catch (e) {
					console.error(e);
				}
				finally{
					await client.close();
				}
			}

			if(global.draftvalues.draftstarted==true){
				return this.send(global.draftvalues.draftroom,"draft already started");
			}
			else{

			}


			let rawdata = fs.readFileSync('DraftTest3.json');
			let student = JSON.parse(rawdata);
			console.log(student);


			global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)]=student;
			console.log('drafter added');

			global.draftvalues.maxtier=student["length"];
			console.log(global.draftvalues.users[toId(global.draftvalues.draftroom)]);
			if(global.draftvalues.turnorder==undefined){
				global.draftvalues.turnorder=[];
			}
			if(global.draftvalues.turnorder.includes(toId(by))){
				return this.send(global.draftvalues.draftroom,toId(by)+ " already joined the draft")
			}
			else{

				var newuser={};
				newuser["erekredieten"]=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)]["Points"];
				newuser["draftedmons"]=[];
				newuser["tieredpicks"]=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)]["TierPicks"];
				newuser["totaldraftscore"]=0;
				global.draftvalues.users[toId(arg)]=newuser;
				global.draftvalues.turnorder.push(toId(arg));
				console.log(global.draftvalues.users[toId(room)]);
				return this.send(global.draftvalues.draftroom,toId(arg)+ " joined the draft")
			}
			
			//global.draftvalues.users[toId(room)].push(arg);
			//global.draftvalues.users.push(toId(by));
			return this.reply(arg+ " joined the draft")
		}
	},
	kick:function (arg, by, room, cmd){
		if (!this.isRanked('admin')) return false;
		if(global.draftvalues.users[toId(room)]==undefined){
			global.draftvalues.users[toId(room)]=[];
		}
		if(global.draftvalues.users[toId(room)].includes(arg)){
			global.draftvalues.users[toId(room)]=removeItemOnce(global.draftvalues.users[toId(room)],arg);
		}
		return this.reply("kicked "+arg );
	},
	joindraft:  function (arg, by, room, cmd){

		console.log(global.draftvalues.users);

	
		if(global.draftvalues.draftstarted==true){
			return this.send(global.draftvalues.draftroom,"draft already started");
		}
		else{

		}
		console.log('drafter added');

		//global.draftvalues.maxtier=student["length"];


		if(global.draftvalues.turnorder.includes(toId(by))){
			return this.send(global.draftvalues.draftroom,toId(by)+ " already joined the draft")
		}
		else{

			var newuser={};
			newuser["erekredieten"]=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)]["Points"];
			newuser["draftedmons"]=[];
			newuser["tieredpicks"]=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)]["TierPicks"];
			newuser["totaldraftscore"]=0;
			global.draftvalues.users[toId(by)]=newuser;
			global.draftvalues.turnorder.push(toId(by));
			console.log(global.draftvalues.users[toId(by)]);
			return this.send(global.draftvalues.draftroom,toId(by)+ " joined the draft")
		}
	},
	seedraft: 'seedrafters',
	seedrafters: function(arg, by, room, cmd){
		console.log(global.draftvalues.users);
		console.log(global.draftvalues.turnorder);
		var list=global.draftvalues.turnorder;
		var result='';
		for (var i = 0; i < list.length; i++) {
			console.log(list[i]);
    //Do something

			result=result+","+list[i];
		}
		result=result.substring(1,result.length);
		//console.log
		return this.reply(result)
	},
	takecredits: function (	arg, by, room, cmd){
	if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [creditstotake]");
		var name=toId(args[0]);
		global.draftvalues.users[name]["erekredieten"]=global.draftvalues.users[name]["erekredieten"]-parseInt( args[1]);
					
		this.reply(toId(by) +" took "+args[1]+ " erekredieten from "+args[0]); 
		
	},
	taketierpicks: function (	arg, by, room, cmd){
	if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [tierpicktoremove]");
			var name=toId(args[0]);
		global.draftvalues.users[name]["tieredpicks"]=removeItemOnce(global.draftvalues.users[name]["tieredpicks"], parseInt(args[1]));
					
		this.reply(toId(by) +" took "+args[1]+ " tieredpick from "+args[0]); 
		
	},
	viewcredits: async function (arg, by, room, cmd){
	if (!by.startsWith("+")&&!by.startsWith("#")&&!by.startsWith("%")&&!by.startsWith("@")){
					return false;
				}	
	const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		await client.connect();
		let quotes =await findOneListingByName(client,"pokemon");
		var list;
		if(arg==''){
				var creds=global.draftvalues.users[toId(by)]["erekredieten"];
			 this.reply(toId(by) +" has " +creds+" erekredieten left."+" and tieredpicks:"+global.draftvalues.users[toId(by)]["tieredpicks"]);
		}
		else{
				var creds=global.draftvalues.users[toId(arg)]["erekredieten"];
			 this.reply(arg +" has "+ creds+" erekredieten left"+" and tieredpicks:"+global.draftvalues.users[toId(arg)]["tieredpicks"]);
		}
	
			
	} catch (e) {
    		console.error(e);
	}	
	finally{
		await client.close();
	}
	},
	viewdraft: async function (arg, by, room, cmd){
		if(toId(by)!=toId(room)){
			if (!by.startsWith("+")&&!by.startsWith("#")&&!by.startsWith("%")&&!by.startsWith("@")){
				return false;
			}
		}

	const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		await client.connect();
		let quotes = await findOneListingByName(client,"pokemon");
		var list;
		var type;
		if(arg==''){
				type=quotes["pokemon"][toId(by)]["TerralyzeType"];
				list=quotes["pokemon"][toId(by)]["draftedmons"];
		}
		else{
			type=quotes["pokemon"][toId(arg)]["TerralyzeType"];
				list=quotes["pokemon"][toId(arg)]["draftedmons"];
		}
		if(toId(by)==toId(room)){
			return this.reply(draftmonsprint(list));
		}else{
			return this.reply(draftmonsprint2(type,list));
		}
	
			
	} catch (e) {
    		console.error(e);
	}	
	finally{
		await client.close();
	}
		/*
		await client.connect();
		await listDatabases(client);
		let rawdata = fs.readFileSync('draftedmons.json');
		let student = JSON.parse(rawdata);
		if(arg==''){
			if(toId(by)==toId(room)){
				
				return this.reply(draftmonsprint(student[toId(by)]));
		
			}else{
				
				if (!by.startsWith("+")&&!by.startsWith("#")&&!by.startsWith("%")&&!by.startsWith("@")){
					return false;
				}
				else{
					
					return this.reply(draftmonsprint2(student[toId(by)]));
				}
			}
			
		}
		else{
			if(toId(by)==toId(room)){
				return this.reply(draftmonsprint(student[toId(arg)]));
			
			}else{
				return this.reply(draftmonsprint2(student[toId(arg)]));
			
			}
		}*/
	},
	viewdraft2: async function (arg, by, room, cmd){
		
		if (!by.startsWith("+")&&!by.startsWith("#")&&!by.startsWith("%")&&!by.startsWith("@")){
					return false;
				}	
	const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	
	try {
		await client.connect();
		let quotes =await findOneListingByName(client,"pokemon");
		var list;
		if(arg==''){
				var list=quotes["pokemon"][toId(by)]["draftedmons"];
		}
		else{
				var list=quotes["pokemon"][toId(arg)]["draftedmons"];
		}
		if(toId(by)==toId(room)){
			return this.reply(draftmonsprint3(list));
		}else{
			return this.reply(draftmonsprint2(list));
		}
	
			
	} catch (e) {
    		console.error(e);
	}	
	finally{
		await client.close();
	}
	},
	draftable:'drafttable',
	drafttable: function (arg, by, room, cmd){
		if(global.draftvalues.giftdrafting){
			pmlists(global.draftvalues.monslists,room, this);
			return;
		}
		var list=global.draftvalues.turnorder;
		var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
		var toreply= "!htmlbox Tier"+ arg + "drafter "+ list[global.draftvalues.nextdrafter] + " picksleft:" +val;
		arg=toId(arg);
		//const str = 'abc efg';
		const arg2 = arg.charAt(0).toUpperCase() + arg.slice(1);
		var draftmons=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)];
		console.log(arg2);
		if(toId(by)==toId(room)){
			return  this.send(global.draftvalues.draftroom,toreply+"<div  style='color: black; border: 2px solid red; background-color: rgb(255, 204, 204); padding: 4px;'>"+draftmonsprint5(draftmons["tierlist"][arg2]["pokemon"],"rgb(255, 204, 204)")+ "</div>");

		}else{
			return  this.send(global.draftvalues.draftroom,toreply+"<div  style='color: black; border: 2px solid red; background-color: rgb(255, 204, 204); padding: 4px;'>"+draftmonsprint5(draftmons["tierlist"][arg2]["pokemon"],"rgb(255, 204, 204)")+ "</div>");

		}

		

	},
	continuedraft:async function (arg, by, room, cmd) {
		console.log('started reading file');
		const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
		console.log(uri);
		console.log("test");

		const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

		try {
			await client.connect();
			let quotes = await findOneListingByName(client,"pokemon")
			console.log(quotes);
			global.draftvalues = quotes["cache"];
		}
		finally {
			await client.close();
		}
		var list=global.draftvalues.turnorder;
		var username=list[global.draftvalues.nextdrafter];
		this.send(global.draftvalues.draftroom,username + " turn");
		if(global.draftvalues.pointdrafting){

			var newlist=global.draftvalues.users[username]["draftedmons"];
			var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
			word=word+"<div>";
			while (index<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
				index++;
			}
			word=word+"</div>";
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

			var index2=1;
			while (index2<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
				index2++;
			}
			word=word+"</div>";
			word=word+"</div>";
			console.log(word);
			this.send(global.draftvalues.draftroom, word);

		}
		else{
			var newlist=global.draftvalues.users[username]["draftedmons"];
			var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
			word=word+"<div>";
			while (index<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
				index++;
			}
			word=word+"</div>";
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

			var index2=1;
			while (index2<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
				index2++;
			}
			word=word+"</div>";
			word=word+"</div>";
			console.log(word);
			this.send(global.draftvalues.draftroom, word);
			return this.send(global.draftvalues.draftroom, name +" drafted "+arg+", the next drafter is "+username+ " picks left: " + picksleft);
		}
		},
	continueauctiondraft:async function (arg, by, room, cmd) {
		console.log('started reading file');
		const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
		console.log(uri);
		console.log("test");

		const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

		try {
			await client.connect();
			let quotes = await findOneListingByName(client,"pokemon")
			console.log(quotes);
			global.draftvalues = quotes["cache"];
		}
		finally {
			await client.close();
		}
		global.auctionDrafting = true;
		var list=global.draftvalues.turnorder;
		var username=list[global.draftvalues.nextdrafter];
		this.send(global.draftvalues.draftroom,username + " turn");
		if(global.auctionDrafting) {
			var newlist=global.draftvalues.users[username]["draftedmons"];
			var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';
			var index=1;
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Showlist</button>';
			word=word+"</div>";
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

			word=word+"</div>";
			word=word+"</div>";
			console.log(word);
			this.send(global.draftvalues.draftroom, word);
			return;
		}
			if(global.draftvalues.pointdrafting){

			var newlist=global.draftvalues.users[username]["draftedmons"];
			var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
			word=word+"<div>";
			while (index<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
				index++;
			}
			word=word+"</div>";
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

			var index2=1;
			while (index2<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
				index2++;
			}
			word=word+"</div>";
			word=word+"</div>";
			console.log(word);
			this.send(global.draftvalues.draftroom, word);

		}
		else{

			var newlist=global.draftvalues.users[username]["draftedmons"];
			var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
			word=word+"<div>";
			while (index<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
				index++;
			}
			word=word+"</div>";
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

			var index2=1;
			while (index2<6){
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
				index2++;
			}
			word=word+"</div>";
			word=word+"</div>";
			console.log(word);
			this.send(global.draftvalues.draftroom, word);
			return this.send(global.draftvalues.draftroom, name +" drafted "+arg+", the next drafter is "+username+ " picks left: " + picksleft);
		}
	},

	startauctiondraft: async function (arg, by, room, cmd){

		if (!this.isRanked('admin')) return false;
		if(global.draftvalues.draftstarted==true){
			return this.reply("draft already started");
		}




		/*
            let rawdata = fs.readFileSync('DraftTest.json');
            let student = JSON.parse(rawdata);
            console.log(student);
            global.draftvalues.currenttier[toId(room)]=1;
            pointdrafting=true;
            global.draftvalues.todraftmons[toId(room)]=student;
            global.draftvalues.maxtier=student["length"];
            °/
         */
		/*then load the participant list*/
		global.draftvalues.typedrafting=true;
		global.draftvalues.typeturnorder = [...turnorder];
		global.draftvalues.availableTypes = ["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
		global.draftvalues.tierPicks = global.draftvalues.todraftmons[toId(room)]["freepicks"];
		var list=global.draftvalues.turnorder;
		global.draftvalues.giftdrafting=false;
		console.log(list);
		list=shuffle(list);
		console.log(list);
		var result='';
		for (var i = 0; i < list.length; i++) {
			console.log(list[i]);
			//Do something
			result=result+","+list[i];
		}
		result=result.substring(1,result.length);
		global.draftvalues.draftstarted=true;
		global.draftvalues.picknr[toId(global.draftvalues.draftroom)] = 0;

		global.draftvalues.nextdrafter=0;
		global.draftvalues.draftstarted=true;
		this.reply('draft order is '+result);
		console.log(global.draftvalues.draftstarted);
		console.log(global.draftvalues.todraftmons);


		//let rawdata3 = fs.readFileSync('convertcsv.json');
		//global.draftvalues.mondata = JSON.parse(rawdata3);
		//global.draftvalues.draftedmons=quotes;
		//if(global.draftvalues.draftedmons={});
		//}
		var draftmons=global.draftvalues.todraftmons[toId(room)];
		global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
		var tiername="Tier"+global.draftvalues.currenttier[toId(room)];
		//global.draftvalues.cur[toId(room)]
		console.log(tiername);
		global.draftvalues.possiblepicks=draftmons["tierlist"];
		global.draftvalues.currentStartScore = draftmons["tierlist"]["Tier1"]["points"];
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][tiername]["pokemon"]));

			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][tiername]["pokemon"]));

			}

		 */
		this.reply("use ?draftable tier(x) to watch the corresponding tier. Or use the search or recommend function for a pick");
		var username = list[0];
		var newlist=global.draftvalues.users[username]["draftedmons"];
		var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
		var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';
		var index=1;
		word=word+"<div>";
		word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Showlist</button>';
		word=word+"</div>";
		word=word+"<div>";
		word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

		var index2=1;

		word=word+"</div>";
		word=word+"</div>";
		console.log(word);
		this.send(global.draftvalues.draftroom, word);

		var typeword = "!htmlbox  <div>" + printPosTypes() + "</div>"
		return this.reply(typeword);
		return this.reply(' the next drafter is '+list[0]);

	},

	startdraft: async function (arg, by, room, cmd){

		if (!this.isRanked('admin')) return false;
		if(global.draftvalues.draftstarted==true){
			return this.reply("draft already started");
		}
		if(global.auctionDrafting){
			global.draftvalues.typedrafting=true;
			global.draftvalues.typeturnorder = [...global.draftvalues.turnorder];
			global.draftvalues.tierPicks = global.draftvalues.todraftmons[toId(room)]["freepicks"];
			var list=global.draftvalues.turnorder;
			global.draftvalues.availableTypes = ["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
			global.draftvalues.giftdrafting=false;
			console.log(list);
			list=shuffle(list);
			console.log(list);
			var result='';
			for (var i = 0; i < list.length; i++) {
				console.log(list[i]);
				//Do something
				result=result+","+list[i];
			}
			result=result.substring(1,result.length);
			global.draftvalues.draftstarted=true;
			global.draftvalues.picknr[toId(global.draftvalues.draftroom)] = 0;

			global.draftvalues.nextdrafter=0;

			global.draftvalues.draftstarted=true
			this.reply('draft order is '+result);
			console.log(global.draftvalues.draftstarted);
			console.log(global.draftvalues.todraftmons);
			console.log(global.draftvalues.nextdrafter);

			//let rawdata3 = fs.readFileSync('convertcsv.json');
			//global.draftvalues.mondata = JSON.parse(rawdata3);
			//global.draftvalues.draftedmons=quotes;
			//if(global.draftvalues.draftedmons={});
			//}
			var draftmons=global.draftvalues.todraftmons[toId(room)];
			global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
			var tiername="Tier"+global.draftvalues.currenttier[toId(room)];
			//global.draftvalues.cur[toId(room)]
			console.log(tiername);
			global.draftvalues.possiblepicks=draftmons["tierlist"];
			global.draftvalues.nrofpicks=draftmons["freepicks"];
			global.draftvalues.currentStartScore = draftmons["tierlist"]["Tier1"]["points"];
			/*
            if(toId(by)==toId(room)){
                    this.reply(draftmonsprint(draftmons["tierlist"][tiername]["pokemon"]));

                }else{
                    this.reply(draftmonsprint2(draftmons["tierlist"][tiername]["pokemon"]));

                }

             */
			this.reply("use ?draftable tier(x) to watch the corresponding tier. Or use the search or recommend function for a pick");
			var username = list[0];
			var newlist=global.draftvalues.users[username]["draftedmons"];
			var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';
			var index=1;
			word=word+"<div>";

			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier1" style="background-color: rgb(204, 255, 204)">Show List</button>';
			index++;

			word=word+"</div>";
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

			index2++;

			word=word+"</div>";
			word=word+"</div>";
			console.log(word);
			this.send(global.draftvalues.draftroom, word);
			var typeword = "!htmlbox  <div>" + printPosTypes() + "</div>"
			console.log("types " + typeword);
			this.reply(typeword);
			return this.reply(' the next drafter is '+list[0]);
		}


		
	/*
		let rawdata = fs.readFileSync('DraftTest.json');
		let student = JSON.parse(rawdata);
		console.log(student);
		global.draftvalues.currenttier[toId(room)]=1;
		pointdrafting=true;
		global.draftvalues.todraftmons[toId(room)]=student;
		global.draftvalues.maxtier=student["length"];
		°/
	 */
		/*then load the participant list*/

		global.draftvalues.tierPicks = global.draftvalues.todraftmons[toId(room)]["freepicks"];
		var list=global.draftvalues.turnorder;
		global.draftvalues.giftdrafting=false;
		console.log(list);
		list=shuffle(list);
		console.log(list);
		var result='';
		for (var i = 0; i < list.length; i++) {
			console.log(list[i]);
    		//Do something
			result=result+","+list[i];
		}
		result=result.substring(1,result.length);
		global.draftvalues.draftstarted=true;
		 global.draftvalues.picknr[toId(global.draftvalues.draftroom)] = 0;

		global.draftvalues.nextdrafter=0;
		global.draftvalues.draftstarted=true
		this.reply('draft order is '+result);
		console.log(global.draftvalues.draftstarted);
		console.log(global.draftvalues.todraftmons);
		let rawdata2 = fs.readFileSync('draftedmons.json');
		let student2 = JSON.parse(rawdata2);

		//let rawdata3 = fs.readFileSync('convertcsv.json');
		//global.draftvalues.mondata = JSON.parse(rawdata3);
		//global.draftvalues.draftedmons=quotes;
		//if(global.draftvalues.draftedmons={});
		//}
		var draftmons=global.draftvalues.todraftmons[toId(room)];
		global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
		var tiername="Tier"+global.draftvalues.currenttier[toId(room)];
		console.log(tiername);
		global.draftvalues.possiblepicks=draftmons["tierlist"];
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][tiername]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][tiername]["pokemon"]));
		
			}

		 */
		this.reply("use ?draftable tier(x) to watch the corresponding tier. Or use the search or recommend function for a pick");
		var username = list[0];
		var newlist=global.draftvalues.users[username]["draftedmons"];
		var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
		var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';
		var index=1;
		word=word+"<div>";
		while (index<6){
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
			index++;
		}
		word=word+"</div>";
		word=word+"<div>";
		word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

		var index2=1;
		while (index2<6){
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
			index2++;
		}
		word=word+"</div>";
		word=word+"</div>";
		console.log(word);
		this.send(global.draftvalues.draftroom, word);
		return this.reply(' the next drafter is '+list[0]);
	},
	forcepick: 'forcepickmon', 
	forcepickmon:  function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) {return false;}
		var args = arg.split(",");
		console.log(args);
		if (args.length < 2){
			return this.reply("Usage: " + this.cmdToken + cmd + " [user], [montopick]");
		}
		if(!global.draftvalues.draftstarted){
				return this.reply('draft did not start yet');
	
		}
		var list=global.draftvalues.users[toId(room)];
		console.log(args);
		
		var name=toId(args[0]);
		arg=(args[1]);
			var args3=arg.split("-");
			arg='';
			for (var i = 0; i < args3.length; i++) {
					args3[i]=jsUcfirst(args3[i]);
					arg=arg+'-'+jsUcfirst(args3[i]);
			}
			arg=arg.substring(1,arg.length);
			var args2=arg.split(" ");
			arg='';
			for (var i = 0; i < args2.length; i++) {
					args2[i]=jsUcfirst(args2[i]);
					arg=arg+' '+jsUcfirst(args2[i]);
			}
			arg=arg.substring(1,arg.length);
			console.log(arg);
		var list=global.draftvalues.turnorder;

		if(list[global.draftvalues.nextdrafter]!=toId(by) && !global.draftvalues.typedrafting){
			return this.send(global.draftvalues.draftroom,'it is not your turn');
		}
		if(global.draftvalues.typedrafting){
			if(global.draftvalues.typeturnorder[global.draftvalues.nextdrafter]!=toId(by)){
				return this.send(global.draftvalues.draftroom,'it is not your turn');
			}
			if(global.draftvalues.availableTypes.includes(arg)){
				global.passedusers = [];
				global.nominatedType = toId(arg);
				global.currentscore = 0;
				global.currentHighestBidder = name;
				global.draftvalues.availableTypes.remove(arg)
				var timeout = 10000 + Math.random() * 25000;
				var nomtype = global.nominatedType;
				if(global.draftvalues.typedrafting) {
					nomtype = global.nominatedType;
				}
				else{
					nomtype = global.nominatedmon;
				}
				setTimeout(() => this.send(global.draftvalues.draftroom,endbid(nomtype)), timeout)
				return this.send(global.draftvalues.draftroom, name +" nominated "+arg+ " for "+ global.currentscore);
			}
			return this.send(global.draftvalues.draftroom, "That is not a type");
		}
		var args=arg.split("-");
		arg='';
		for (var i = 0; i < args.length; i++) {
			if(args[i]=="a"){
				args[i]="alola";
			}
			if(args[i]=="g"){
				args[i]="galar";
			}
			if(args[i]=="h"){
				args[i]="hisui";
			}
			if(args[i]=="o"){
				args[i]="o";
			}
			else{
				args[i]=jsUcfirst(args[i]);
			}

			arg=arg+'-'+args[i];
		}
		arg=arg.substring(1,arg.length);
		var args2=arg.split(" ");
		arg='';
		for (var i = 0; i < args2.length; i++) {
			args2[i]=jsUcfirst(args2[i]);
			arg=arg+' '+jsUcfirst(args2[i]);
		}
		arg=arg.substring(1,arg.length);
		if(global.auctionDrafting){
			var index= global.draftvalues.turnorder.indexOf(name);

			global.passedusers = [];
			var draftmons=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)];
			var i=1;
			console.log(draftmons);
			while(i<=draftmons["length"]){
				var possiblepic=draftmons["tierlist"]["Tier"+i]["pokemon"];
				var creditsleft = global.draftvalues.users[name]["Points"]
				//var picksleft=draftmons["freepicks"]-global.draftvalues.picknr[toId(global.draftvalues.draftroom)]-1-global.draftvalues.users[name]["tieredpicks"].length;
				if(possiblepic.includes(arg)){

					draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);

					global.nominatedmon = arg;
					global.currentscore = global.draftvalues.currentStartScore;
					if(global.draftvalues.currentStartScore > global.draftvalues.users[name]["erekredieten"]){
						this.reply("you don't have enough credits staring offer will be 0");
						global.currentscore = 0;
					}
					this.send(global.draftvalues.draftroom, name +" nominated "+arg+ " for "+ global.currentscore);
					global.auctioning = true;
					global.currentHighestBidder = toId(by);
					var timeout = 10000 + Math.random() * 25000;
					var monname = global.nominatedmon;
					setTimeout(() => this.send(global.draftvalues.draftroom,endbid(monname)), timeout)
					this.send(global.draftvalues.draftroom, "!dt "+ global.nominatedmon);
					return;
					i=100;
				}
				i++;
			}
			if(i!=101){
				return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
			return;

		}
        if(global.draftvalues.giftdrafting){

            var index= global.draftvalues.turnorder.indexOf(name);
            if(global.draftvalues.drafted[index]==true){
                return this.reply('please, wait until everyone is finished');

            }
            var draftlist=global.draftvalues.monslists[index];
            var args=arg.split("-");
            arg='';
            for (var i = 0; i < args.length; i++) {
                if(args[i]=="a"){
                    args[i]="alola";
                }

                if(args[i]=="g"){
                    args[i]="galar";
                }

				if(args[i]=="h"){
					args[i]="hisui";
				}
				if(args[i]!="o"){
					args[i]=jsUcfirst(args[i]);
					arg=arg+'-'+jsUcfirst(args[i]);
				}

            }
            arg=arg.substring(1,arg.length);
            var args2=arg.split(" ");
            arg='';
            for (var i = 0; i < args2.length; i++) {
                args2[i]=jsUcfirst(args2[i]);
                arg=arg+' '+jsUcfirst(args2[i]);
            }
            arg=arg.substring(1,arg.length);

            if(!global.draftvalues.pointdrafting){
                var draftmons=global.draftvalues.todraftmons[toId(room)];
                if(global.draftvalues.monslists[index].includes(arg)||(global.draftvalues.monslists[index].includes('Silvally')&&args[0]=='Silvally')){
                    global.draftvalues.users[name]["draftedmons"].push(arg);
                    removeItemOnce(global.draftvalues.monslists[index],arg);
                    global.draftvalues.drafted[index]=true;
                    console.log(global.draftvalues.monslists[index]);
                    saveTeamsToCloud();
                    this.reply('drafted '+arg);
                }
                else{
                    return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
                }
            }
            var alltrue=true;
            for(var j=0;j<global.draftvalues.drafted.length;j++){
                if(!global.draftvalues.drafted[j]){
                    alltrue=false;
                }
            }
            if(alltrue) {
                global.draftvalues.picknr[toId(global.draftvalues.draftroom)]++;
                if(global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=global.draftvalues.tierPicks){
                    global.draftvalues.currenttier[toId(room)]--;
                    console.log("started new tier");
                    startNewGiftTier(this, room);
                }
                else{
                    if(global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]){

						global.draftvalues.monslists.push(global.draftvalues.monslists.shift());
                    }
                    else{
						global.draftvalues.monslists.push(global.draftvalues.monslists.shift());
						global.draftvalues.monslists.push(global.draftvalues.monslists.shift());
						global.draftvalues.monslists.push(global.draftvalues.monslists.shift());

					}

                    for (var i = 0; i < global.draftvalues.turnorder.length; i++) {
                        global.draftvalues.drafted[i]=false;
                    }
                    console.log("secondlist "+global.draftvalues.monslists);
                    pmlists(global.draftvalues.monslists,room, this);
                }
            }
            return;
            /* now we still have to redeploy the draft and go on but only if everyone drafted*/
        }

		if(list[global.draftvalues.nextdrafter]!=name){
				return this.reply('it is not your turn');
	
		}
		
		
		console.log(global.draftvalues.users);
		if(global.draftvalues.users[name]["draftedmons"]==undefined){
			global.draftvalues.users[name]["draftedmons"]=[];
		}
		console.log("global.draftvalues.pointdrafting "+global.draftvalues.pointdrafting);
		if(!global.draftvalues.pointdrafting){
			var draftmons=global.draftvalues.todraftmons[toId(room)];
			if(global.draftvalues.possiblepicks.includes(arg)||(global.draftvalues.possiblepicks.includes('Silvally')&&args[0]=='Silvally')){
				global.draftvalues.users[name]["draftedmons"].push(arg);
				draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"],arg);

			}
			else{
					return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
		} 
		else{
			var draftmons=global.draftvalues.todraftmons[toId(room)];
			var i=1;
			while(i<=draftmons["length"]){
				var possiblepic=draftmons["tierlist"]["Tier"+i]["pokemon"];
				if(possiblepic.includes(arg)||(possiblepic.includes('Silvally')&&args[0]=='Silvally')){
					if(global.draftvalues.users[name]["tieredpicks"].includes(i)){
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						global.draftvalues.users[name]["tieredpicks"]=removeItemOnce(global.draftvalues.users[name]["tieredpicks"],i);
						this.reply( name +" used a tierpick to draft a tier "+i+" "+arg+ "( erekredieten. "+global.draftvalues.users[name]["erekredieten"]+" tierpicks "+global.draftvalues.users[name]["tieredpicks"]+ " )");
					
					}
					else{
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						var pointscost=draftmons["tierlist"]["Tier"+i]["points"];
						var currentscore=global.draftvalues.users[name]["erekredieten"];
						var picksleft=draftmons["freepicks"]- global.draftvalues.picknr[toId(global.draftvalues.draftroom)]-1-global.draftvalues.users[name]["tieredpicks"].length;
						console.log("freepicks "+draftmons["freepicks"]+" picknr: "+ global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+" pickleft"+picksleft);
						if(picksleft*40>currentscore-pointscost){
							return this.reply("please make sure you have at least "+picksleft*40+ "Erekredieten left" );
						}
						global.draftvalues.users[name]["erekredieten"]=global.draftvalues.users[name]["erekredieten"]-draftmons["tierlist"]["Tier"+i]["points"];
					
						this.reply( name +" paid "+draftmons["tierlist"]["Tier"+i]["points"]+ " erekredieten.( Erekredieten "+global.draftvalues.users[name]["erekredieten"]+" tieredpicks:"+global.draftvalues.users[name]["tieredpicks"]+ ")");
					
					}
					
					global.draftvalues.users[name]["draftedmons"].push(arg);
					i=100;
				}
				i++;
			}
			if(i!=101){
				return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
			
					
		}
		let data = JSON.stringify(global.draftvalues.draftedmons);
		
		fs.writeFileSync('draftedmons.json', data);
		if(!global.draftvalues.packdrafting){
			if(global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]){
				global.draftvalues.nextdrafter=global.draftvalues.nextdrafter+1;
				if(global.draftvalues.nextdrafter>list.length-1){
					saveTeamsToCloud();
					global.draftvalues.nextdrafter=global.draftvalues.nextdrafter-1;
					global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=false;
					console.log("order changed  "+global.draftvalues.nextdrafter);
					 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]= global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+1;
					if(global.draftvalues.pointdrafting&& global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.draftvalues.users[toId(room)]=[];
						global.draftvalues.draftstarted=false;
						return this.reply('The draft over is good luck and have fun ');
					}
					if(!global.draftvalues.pointdrafting){

						if( global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.draftvalues.nextdrafter=global.draftvalues.nextdrafter-1;
				if(global.draftvalues.nextdrafter<0){
					saveTeamsToCloud();
					global.draftvalues.nextdrafter=0;
					global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
					console.log("order changed");
					 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]= global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+1;
					if(global.draftvalues.pointdrafting&& global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["freepicks"]){
						global.draftvalues.users[toId(room)]=[];
						//saveTeamsToCloud();
						global.draftvalues.draftstarted=false;
						return this.reply('The draft over is good luck and have fun ');
					}
					console.log("picknr is"+ global.draftvalues.picknr[toId(global.draftvalues.draftroom)]);
					if(!global.draftvalues.pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]);
						if( global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			}
		
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][global.draftvalues.currenttier]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][global.draftvalues.currenttier]["pokemon"]]));
		
			}

*///pick a new six mons to draft
			var username=list[global.draftvalues.nextdrafter];
			if(global.draftvalues.pointdrafting){
				var newlist=global.draftvalues.users[username]["draftedmons"];
				var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
				var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
				word=word+"<div>";
				while (index<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
					index++;
				}
				word=word+"</div>";
				word=word+"<div>";
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

				var index2=1;
				while (index2<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
					index2++;
				}
				word=word+"</div>";
				word=word+"</div>";
				console.log(word);
				this.send(global.draftvalues.draftroom, word);
				//return this.reply( name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.draftvalues.users[username]["erekredieten"]+" tieredpicks:"+global.draftvalues.users[username]["tieredpicks"]+" )");
			}
			else{

				var newlist=global.draftvalues.users[username]["draftedmons"];
				var val= global.draftvalues.tierPicks - global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
				var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
				word=word+"<div>";
				while (index<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
					index++;
				}
				word=word+"</div>";
				word=word+"<div>";
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

				var index2=1;
				while (index2<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
					index2++;
				}
				word=word+"</div>";
				word=word+"</div>";
				console.log(word);
				this.send(global.draftvalues.draftroom, word);
				return this.reply( name +" drafted "+arg+", the next drafter is "+username);
			}
	//var list=global.draftvalues.users[toId(room)];
		 }
		else{
		var newlist=pickmultimons(draftmons["tierlist"][global.draftvalues.currenttier[toId(room)]]["pokemon"],6,list);
			global.draftvalues.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
		return this.reply(' Choose next mon '+list[0]);
		}
	},
	forcepickaltmon:  function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [montopick]");
		if(!global.draftvalues.draftstarted){
				return this.reply('draft did not start yet');
	
		}
			//var list=global.draftvalues.users[toId(room)];
		var list=global.draftvalues.turnorder
		var name=toId(args[0]);
		if(global.draftvalues.draftedmons[name]==undefined){
			global.draftvalues.draftedmons[name]=[];
		}
		args[1]=jsUcfirst(args[1]);
		var draftmons=global.draftvalues.todraftmons[toId(room)];
			
					global.draftvalues.users[name]["draftedmons"].push(args[1]);
			//global.draftvalues.users[name]["draftedmons"].push(args[1]);
		//	draftmons["tierlist"][global.draftvalues.currenttier[toId(room)]]["pokemon"]=removeItemOnce(draftmons["tierlist"][global.draftvalues.currenttier[toId(room)]]["pokemon"],args[1]);
		
		
		if(!global.draftvalues.packdrafting){
			if(global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]){
				global.draftvalues.nextdrafter=global.draftvalues.nextdrafter+1;
				if(global.draftvalues.nextdrafter>=list.length){
					saveTeamsToCloud();
					global.draftvalues.nextdrafter=global.draftvalues.nextdrafter-1;
					global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=false;
					console.log("order changed  "+global.draftvalues.nextdrafter);
					 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]= global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+1;
					if(global.draftvalues.pointdrafting&& global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.draftvalues.users[toId(room)]=[];
						global.draftvalues.draftstarted=false;
						return this.reply('The draft over is good luck and have fun ');
					}
					if(!global.draftvalues.pointdrafting){

						if( global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.draftvalues.nextdrafter=global.draftvalues.nextdrafter-1;
				if(global.draftvalues.nextdrafter<0){
					saveTeamsToCloud();
					global.draftvalues.nextdrafter=0;
					global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
					console.log("order changed");
					 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]= global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+1;
					if(global.draftvalues.pointdrafting&& global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["freepicks"]){
						global.draftvalues.users[toId(room)]=[];
						//saveTeamsToCloud();
						global.draftvalues.draftstarted=false;
						return this.reply('The draft over is good luck and have fun ');
					}
					console.log("picknr is"+ global.draftvalues.picknr[toId(global.draftvalues.draftroom)]);
					if(!global.draftvalues.pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]);
						if( global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			}
		
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][global.draftvalues.currenttier]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][global.draftvalues.currenttier]["pokemon"]]));
		
			}

*///pick a new six mons to draft
			var username=list[global.draftvalues.nextdrafter];
			if(global.draftvalues.pointdrafting){
				var newlist=global.draftvalues.users[username]["draftedmons"];
				var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
				var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
				word=word+"<div>";
				while (index<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
					index++;
				}
				word=word+"</div>";
				word=word+"<div>";
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

				var index2=1;
				while (index2<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
					index2++;
				}
				word=word+"</div>";
				word=word+"</div>";
				console.log(word);
				this.send(global.draftvalues.draftroom, word);
				return this.reply( name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.draftvalues.users[username]["erekredieten"]+" tieredpicks:"+global.draftvalues.users[username]["tieredpicks"]+" )");
			}
			else{
				var newlist=global.draftvalues.users[username]["draftedmons"];
				var val= global.draftvalues.tierPicks - global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
				var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
				word=word+"<div>";
				while (index<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
					index++;
				}
				word=word+"</div>";
				word=word+"<div>";
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

				var index2=1;
				while (index2<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
					index2++;
				}
				word=word+"</div>";
				word=word+"</div>";
				console.log(word);
				this.send(global.draftvalues.draftroom, word);
				return this.reply( name +" drafted "+arg+", the next drafter is "+username);
			}
	//var list=global.draftvalues.users[toId(room)];
		 }
		else{
		var newlist=pickmultimons(draftmons["tierlist"][global.draftvalues.currenttier[toId(room)]]["pokemon"],6,list);
			global.draftvalues.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
			return this.reply(' Choose next mon '+list[0]);
		}
		return this.reply( name +' forcibly drafted alternative mon not on the list '+args[1]+ ', the next drafter is '+list[global.draftvalues.nextdrafter]);
	
	},
	
	showmonscore:  function (arg, by, room, cmd) {
		arg = global.nominatedmon;
		arg=jsUcfirst(toId(arg));
		return this.reply(arg +" score is "+calculatescore(room,arg,toId(by)));
	},
	pass: function (arg, by, room, cmd) {
		var name = toId(by);
		if(!global.draftvalues.turnorder.includes(name)){
			return this.reply("you're not in the draft " + name);
		}
		if(toId(by) == global.currentHighestBidder){
			return this.reply("You're the highest bidder currently you can't pass");
		}
		global.passedusers.push(toId(by));
		this.reply(toId(by)+" passed");
		if(global.passedusers.length == global.draftvalues.turnorder.length-1 || (global.auctionDrafting && global.passedusers.length == global.draftvalues.typeturnorder.length-1)){
			if(global.draftvalues.typedrafting) {
				this.send(global.draftvalues.draftroom,endbid(global.nominatedType));
			}
			else{
				this.send(global.draftvalues.draftroom,endbid(global.nominatedmon));
			}

			//this.send(global.draftvalues.draftroom,endbid(global.nominatedmon));
		}
	},
	nominatedmon:  function (arg, by, room, cmd) {
		this.send(global.draftvalues.draftroom, "!dt "+ global.nominatedmon);
		return this.reply("The current highest bid on " + nominatedmon + " is "+ currentscore + " from "+ global.currentHighestBidder);
	},
	offer: 'bid',
	bid:  function (arg, by, room, cmd) {
		var value = parseInt(arg);
		var name = toId(by);
		if(!global.draftvalues.turnorder.includes(name) || (global.draftvalues.typedrafting && !global.draftvalues.typeturnorder.includes(name))){
			return this.reply("you're not in the draft " + name);
		}
		if(value > global.draftvalues.users[name]["erekredieten"]){
			return this.reply("you don't have enough credits");
		}
		if(value > global.currentscore){
			global.currentscore = value;
			global.currentHighestBidder = toId(by);
		}
		if(!global.draftvalues.typedrafting){
			this.send(global.draftvalues.draftroom, "!dt "+ global.nominatedmon);
			return this.reply("The current highest bid on " + nominatedmon + " is "+ currentscore + " from "+ global.currentHighestBidder);
		}
		return this.reply("The current highest bid on " + global.nominatedType + " is "+ currentscore + " from "+ global.currentHighestBidder);
	},
	offermore: 'bidmore',
	bidmore:  function (arg, by, room, cmd) {
		var value = 300;
		var name = toId(by);
		if(!global.draftvalues.turnorder.includes(name) || (global.draftvalues.typedrafting && !global.draftvalues.typeturnorder.includes(name) )){
			return this.reply("you're not in the draft " + name);
		}
		console.log(arg);
		if(arg != ""){
			value = parseInt(arg);
		}
		console.log(value);
		if(value > global.draftvalues.users[name]["erekredieten"]){
			return this.reply("you don't have enough credits");
		}
		if(value > global.currentscore +9){
			value = global.currentscore+10;
			global.currentscore = value;
			global.currentHighestBidder = toId(by);
		}
		if(!global.draftvalues.typedrafting) {
			this.send(global.draftvalues.draftroom, "!dt " + global.nominatedmon);
			return this.reply("The current highest bid on " + nominatedmon + " is "+ currentscore + " from "+ global.currentHighestBidder);
		}
		return this.reply("The current highest bid on " + global.nominatedType + " is "+ currentscore + " from "+ global.currentHighestBidder);
	},
	endbid:  function (arg, by, room, cmd) {
		if (!this.isRanked('admin') || !global.auctionDrafting) {return false;}
		if(global.draftvalues.typedrafting) {
			this.send(global.draftvalues.draftroom,endbid(global.nominatedtype));
		}
		else{
			this.send(global.draftvalues.draftroom,endbid(global.nominatedmon));
		}
		return;
	},
	toggleauction:  function (arg, by, room, cmd) {
		if (!this.isRanked('admin') || global.auctionDrafting) {return false;}
		global.auctioning = !global.auctioning;
		return this.reply("auctioning set to" + global.auctioning);
	},

	pickmon: 'draft',
	nominate: 'draft',
	
	draft:  function (arg, by, room, cmd) {
		var name=toId(by);
		if(!global.draftvalues.turnorder.includes(name)){
			return this.reply("you're not in the draft " + name);
		}
		if(global.auctioning){
			return this.reply("wait till this auction is done " + name);
		}
		var list=global.draftvalues.turnorder;

		if(list[global.draftvalues.nextdrafter]!=toId(by) && !global.draftvalues.typedrafting){
			return this.send(global.draftvalues.draftroom,'it is not your turn');
		}
		if(global.draftvalues.typedrafting){
			if(global.draftvalues.typeturnorder[global.draftvalues.nextdrafter]!=toId(by)){
				return this.send(global.draftvalues.draftroom,'it is not your turn');
			}
			if(global.draftvalues.availableTypes.includes(arg)){
				global.passedusers = [];
				global.nominatedType = toId(arg);
				global.currentscore = 0;
				global.currentHighestBidder = name;
				global.draftvalues.availableTypes.remove(arg)
				var timeout = 10000 + Math.random() * 25000;
				var nomtype = global.nominatedType;
				if(global.draftvalues.typedrafting) {
					nomtype = global.nominatedType;
				}
				else{
					nomtype = global.nominatedmon;
				}
				setTimeout(() => this.send(global.draftvalues.draftroom,endbid(nomtype)), timeout)
				return this.send(global.draftvalues.draftroom, name +" nominated "+arg+ " for "+ global.currentscore);
			}
			return this.send(global.draftvalues.draftroom, "That is not a type");
		}
		var args=arg.split("-");
		arg='';
		for (var i = 0; i < args.length; i++) {
			if(args[i]=="a"){
				args[i]="alola";
			}
			if(args[i]=="g"){
				args[i]="galar";
			}
			if(args[i]=="h"){
				args[i]="hisui";
			}
			if(args[i]=="o"){
				args[i]="o";
			}
			else{
				args[i]=jsUcfirst(args[i]);
			}

			arg=arg+'-'+args[i];
		}
		arg=arg.substring(1,arg.length);
		var args2=arg.split(" ");
		arg='';
		for (var i = 0; i < args2.length; i++) {
			args2[i]=jsUcfirst(args2[i]);
			arg=arg+' '+jsUcfirst(args2[i]);
		}
		arg=arg.substring(1,arg.length);
		if(global.auctionDrafting){
			var index= global.draftvalues.turnorder.indexOf(name);

			global.passedusers = [];
			var draftmons=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)];
			var i=1;
			console.log(draftmons);
			while(i<=draftmons["length"]){
				var possiblepic=draftmons["tierlist"]["Tier"+i]["pokemon"];
				var creditsleft = global.draftvalues.users[name]["Points"]
				//var picksleft=draftmons["freepicks"]-global.draftvalues.picknr[toId(global.draftvalues.draftroom)]-1-global.draftvalues.users[name]["tieredpicks"].length;
				if(possiblepic.includes(arg)){

					draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);

					global.nominatedmon = arg;
					global.currentscore = global.draftvalues.currentStartScore;
					if(global.draftvalues.currentStartScore > global.draftvalues.users[name]["erekredieten"]){
						this.reply("you don't have enough credits staring offer will be 0");
						global.currentscore = 0;
					}
					this.send(global.draftvalues.draftroom, name +" nominated "+arg+ " for "+ global.currentscore);
					global.auctioning = true;
					global.currentHighestBidder = toId(by);
					var timeout = 10000 + Math.random() * 25000;
					var monname = global.nominatedmon;
					setTimeout(() => this.send(global.draftvalues.draftroom,endbid(monname)), timeout)
					this.send(global.draftvalues.draftroom, "!dt "+ global.nominatedmon);
					return;
					i=100;
				}
				i++;
			}
			if(i!=101){
				return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
			return;

		}
		//let data = JSON.stringify(global.draftvalues.draftedmons);

				if(global.draftvalues.giftdrafting){

					var index= global.draftvalues.turnorder.indexOf(name);
					if(global.draftvalues.drafted[index]==true){
						return this.send(global.draftvalues.draftroom, 'please, wait until everyone is finished '+ name);

					}
					var draftlist=global.draftvalues.monslists[index];


					if(!global.draftvalues.pointdrafting){
						var draftmons=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)];
						if(global.draftvalues.monslists[index].includes(arg)||(global.draftvalues.monslists[index].includes('Silvally')&&args[0]=='Silvally')){
							global.draftvalues.users[name]["draftedmons"].push(arg);
							removeItemOnce(global.draftvalues.monslists[index],arg);
							global.draftvalues.drafted[index]=true;
							console.log(global.draftvalues.monslists[index]);
							saveTeamsToCloud();
							this.send(global.draftvalues.draftroom, name + 'drafted '+arg);
						}
						else{
							return this.send(global.draftvalues.draftroom, arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
						}
					}
					var alltrue=true;
					for(var j=0;j<global.draftvalues.drafted.length;j++){
						if(!global.draftvalues.drafted[j]){
							alltrue=false;
						}
					}
					if(alltrue) {
						global.draftvalues.picknr[toId(global.draftvalues.draftroom)]++;
						if(global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=global.draftvalues.tierPicks){
							global.draftvalues.currenttier[toId(global.draftvalues.draftroom)]--;
							console.log("started new tier");
							startNewGiftTier(this, global.draftvalues.draftroom);
						}
						else{
							if(global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]){

								global.draftvalues.monslists.push(global.draftvalues.monslists.shift());
							}
							else{
								global.draftvalues.monslists.push(global.draftvalues.monslists.shift());
								global.draftvalues.monslists.push(global.draftvalues.monslists.shift());
								global.draftvalues.monslists.push(global.draftvalues.monslists.shift());

							}
//
							for (var i = 0; i < global.draftvalues.turnorder.length; i++) {
								global.draftvalues.drafted[i]=false;
							}
							console.log("secondlist "+global.draftvalues.monslists);
							pmlists(global.draftvalues.monslists,global.draftvalues.draftroom, this);
							console.log(global.draftvalues.users[toId(by)]["draftedmons"]);
						}
					}
					return;
					/* now we still have to redeploy the draft and go on but only if everyone drafted*/
				}
		if(!global.draftvalues.draftstarted){

				return this.reply('draft did not start yet');
	
		}
			console.log("drafter" + list[global.draftvalues.nextdrafter]);
		if(list[global.draftvalues.nextdrafter]!=toId(by)){
				return this.send(global.draftvalues.draftroom,'it is not your turn');
	
		}
		
		var name=toId(by);
		console.log(global.draftvalues.users);
		if(global.draftvalues.users[name]["draftedmons"]==undefined){
			global.draftvalues.users[name]["draftedmons"]=[];
		}
		console.log("global.draftvalues.pointdrafting "+global.draftvalues.pointdrafting);
		if(!global.draftvalues.pointdrafting){
			var draftmons=global.draftvalues.todraftmons[toId(room)];
			if(global.draftvalues.possiblepicks.includes(arg)||(global.draftvalues.possiblepicks.includes('Silvally')&&args[0]=='Silvally')){
				global.draftvalues.users[name]["draftedmons"].push(arg);
				draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"],arg);

			}
			else{
					return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
		} 
		else{
			var draftmons=global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)];
			var i=1;
			console.log(draftmons);
			while(i<=draftmons["length"]){
				var possiblepic=draftmons["tierlist"]["Tier"+i]["pokemon"];
				var picksleft=draftmons["freepicks"]-global.draftvalues.picknr[toId(global.draftvalues.draftroom)]-1-global.draftvalues.users[name]["tieredpicks"].length;
				if(possiblepic.includes(arg)){
					if(global.draftvalues.users[name]["tieredpicks"].includes(i)){
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						global.draftvalues.users[name]["tieredpicks"]=removeItemOnce(global.draftvalues.users[name]["tieredpicks"],i);
						this.send(global.draftvalues.draftroom, name +" used a tierpick to draft a tier "+i+" "+arg+ " (erekredieten. "+global.draftvalues.users[name]["erekredieten"] +"tierpicks "+global.draftvalues.users[name]["tieredpicks"]+ " )");
						global.draftvalues.users[name]["totaldraftscore"]=global.draftvalues.users[name]["totaldraftscore"]+calculatescore(room,arg,name);
					}
					else{
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						var pointscost=draftmons["tierlist"]["Tier"+i]["points"];
						var currentscore=global.draftvalues.users[name]["erekredieten"];

						console.log("freepicks "+draftmons["freepicks"]+" picknr: "+global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+" pickleft "+picksleft);
						if(picksleft*40>currentscore-pointscost||picksleft<0){
							return this.reply("please make sure you have at least "+picksleft*40+ " Erekredieten left" );
						}
						global.draftvalues.users[name]["erekredieten"]=global.draftvalues.users[name]["erekredieten"]-draftmons["tierlist"]["Tier"+i]["points"];

						this.send(global.draftvalues.draftroom, name +" paid "+draftmons["tierlist"]["Tier"+i]["points"]+ " erekredieten for "+ arg +".( Erekredieten "+global.draftvalues.users[name]["erekredieten"]+" tieredpicks:"+global.draftvalues.users[name]["tieredpicks"]+ ")");
						global.draftvalues.users[name]["totaldraftscore"]=global.draftvalues.users[name]["totaldraftscore"]+calculatescore(room,arg,name);
					}
					
					global.draftvalues.users[name]["draftedmons"].push(arg);
					i=100;
				}
				i++;
			}
			if(i!=101){
				return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
			
					
		}
		let data = JSON.stringify(global.draftvalues.draftedmons);
		
		fs.writeFileSync('draftedmons.json', data);
		if(!global.draftvalues.packdrafting){
			if(global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]){
				global.draftvalues.nextdrafter=global.draftvalues.nextdrafter+1;
				if(global.draftvalues.nextdrafter>=list.length){
					saveTeamsToCloud();
					global.draftvalues.nextdrafter=global.draftvalues.nextdrafter-1;
					global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=false;
					console.log("order changed  "+global.draftvalues.nextdrafter);
					 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]= global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+1;
					if(global.draftvalues.pointdrafting&& global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.draftvalues.users[toId(global.draftvalues.draftroom)]=[];
						global.draftvalues.draftstarted=false;
						return this.send(global.draftvalues.draftroom,'The draft over is good luck and have fun ');
					}
					if(!global.draftvalues.pointdrafting){

						if( global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]){
							this.send(global.draftvalues.draftroom, name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.draftvalues.nextdrafter=global.draftvalues.nextdrafter-1;
				if(global.draftvalues.nextdrafter<0){
					saveTeamsToCloud();
					global.draftvalues.nextdrafter=0;
					global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
					console.log("order changed");
					global.draftvalues.picknr[toId(global.draftvalues.draftroom)]= global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+1;
					if(global.draftvalues.pointdrafting&& global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["freepicks"]){
						global.draftvalues.users[toId(global.draftvalues.draftroom)]=[];
						//saveTeamsToCloud();
						global.draftvalues.draftstarted=false;
						return this.send(global.draftvalues.draftroom,'The draft over is good luck and have fun ');
					}
					console.log("picknr is"+ global.draftvalues.picknr[toId(global.draftvalues.draftroom)]);
					if(!global.draftvalues.pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]);
						if( global.draftvalues.picknr[toId(global.draftvalues.draftroom)]>=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["picks"]){
							this.send( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			}
		
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][global.draftvalues.currenttier]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][global.draftvalues.currenttier]["pokemon"]]));
		
			}

*///pick a new six mons to draft

			var username=list[global.draftvalues.nextdrafter];
			picksleft = draftmons["freepicks"]-global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			saveTeamsToCloud();
			this.send(global.draftvalues.draftroom,username + " turn");
			if(global.draftvalues.pointdrafting){

				var newlist=global.draftvalues.users[username]["draftedmons"];
				var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
				var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
				word=word+"<div>";
				while (index<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
					index++;
				}
				word=word+"</div>";
				word=word+"<div>";
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

				var index2=1;
				while (index2<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
					index2++;
				}
				word=word+"</div>";
				word=word+"</div>";
				console.log(word);
				this.send(global.draftvalues.draftroom, word);

			}
			else{
				var newlist=global.draftvalues.users[username]["draftedmons"];
				var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
				var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
				word=word+"<div>";
				while (index<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier'+ index +'" style="background-color: rgb(204, 255, 204)">Tier'+index+"</button>";
					index++;
				}
				word=word+"</div>";
				word=word+"<div>";
				word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

				var index2=1;
				while (index2<6){
					word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend Tier'+ index2 +'" style="background-color: rgb(204, 204, 255)">recommend Tier'+index2+"</button>";
					index2++;
				}
				word=word+"</div>";
				word=word+"</div>";
				console.log(word);
				this.send(global.draftvalues.draftroom, word);
				return this.send(global.draftvalues.draftroom, name +" drafted "+arg+", the next drafter is "+username+ " picks left: " + picksleft);
			}
	//var list=global.draftvalues.users[toId(room)];
		 }
		else{
		var newlist=pickmultimons(draftmons["tierlist"][global.draftvalues.currenttier[toId(room)]]["pokemon"],6,list);
			global.draftvalues.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
		return  this.send(global.draftvalues.draftroom,' Choose next mon '+list[0]);
		}
	},

	showsprite: function (arg, by, room, cmd) {
		var args = arg.split(",");
		console.log(args);
		if(args.length>1){
			if(args[1]=='shiny'){
				console.log(args[0]);
				return this.reply("!show https://play.pokemonshowdown.com/sprites/ani-shiny/"+args[0]+".gif");
			}
			else{
				
				return this.reply("!show https://play.pokemonshowdown.com/sprites/"+args[1]+"/"+args[0]+".png");
			}
		}
		else{
			return this.reply("!show https://play.pokemonshowdown.com/sprites/ani/"+arg+".gif");
		}
	},
	makegroupchat: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		this.reply('groupchat made');
		this.reply('/makegroupchat '+arg);
		this.send('/invite kingbaruk,'+'groupchat-sinterklaas-'+arg);
	
	},
	invite: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		this.reply('invite made');
		return this.send('/invite '+ arg);

	},
	creategiftdraft:function (arg, by, room, cmd) {
		global.draftvalues.draftroom= room;
		console.log(global.draftvalues.draftroom);
		this.reply("!htmlbox <p> hi </p>");
		this.send(global.draftvalues.draftroom, '!htmlbox  <h1>Giftdraft</h1> <p>Press this button or ?joindraft to join </p> <button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?joindraft"> joindraft </button>' );

	},

	createauctiondraft:async function (arg, by, room, cmd) {
		global.draftvalues.draftroom= room;
		global.auctionDrafting = true;
		var bool = JSON.stringify(global.draftvalues.users) === "{}";
		if (bool){
			/*first load in the draft file list*/
			//lets try that now
			console.log('started reading file');
			const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
			console.log(uri);
			console.log("test");
			const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

			try {

				await client.connect();
				const quotes =await findOneListingByName(client,"pokemon");
				global.draftvalues.users=quotes["pokemon"];


				//return this.reply(draftmonsprint2(list));
			} catch (e) {
				console.error(e);
			}
			finally{
				await client.close();
			}
		}
		let rawdata = fs.readFileSync('AuctionList1.json');
		if(arg != ""){
			let rawdata = fs.readFileSync(arg + '.json');
		}

		let student = JSON.parse(rawdata);
		console.log(student);
		global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)]=student;
		global.draftvalues.draftroom= room;
		console.log(global.draftvalues.draftroom);
		if(global.draftvalues.turnorder==undefined){
			global.draftvalues.turnorder=[];
		}
		console.log(global.draftvalues.draftroom);
		this.reply("!htmlbox <p> hi </p>");
		this.send(global.draftvalues.draftroom, '!htmlbox  <h1>Auctiondraft</h1> <p>Press this button or ?joindraft to join </p> <button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?joindraft"> joindraft </button>' );

	},

	createdraft:async function (arg, by, room, cmd) {
		var bool = JSON.stringify(global.draftvalues.users) === "{}";
		if (bool){
			/*first load in the draft file list*/
			//lets try that now
			console.log('started reading file');
			const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
			console.log(uri);
			console.log("test");
			const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

			try {

				await client.connect();
				const quotes =await findOneListingByName(client,"pokemon");
				global.draftvalues.users=quotes["pokemon"];


				//return this.reply(draftmonsprint2(list));
			} catch (e) {
				console.error(e);
			}
			finally{
				await client.close();
			}
		}
		else{

		}
		let rawdata = fs.readFileSync('DraftTest3.json');
		let student = JSON.parse(rawdata);
		console.log(student);
		global.draftvalues.todraftmons[toId(global.draftvalues.draftroom)]=student;
		global.draftvalues.pointdrafting=true;
		global.draftvalues.draftroom= room;
		console.log(global.draftvalues.draftroom);
		if(global.draftvalues.turnorder==undefined){
			global.draftvalues.turnorder=[];
		}
		this.reply("!htmlbox <p> hi </p>");
		this.send(global.draftvalues.draftroom, '!htmlbox  <h1>normal draft</h1> <p>Press this button or ?joindraft to join </p> <button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?joindraft"> joindraft </button>' );

	},

	search:function (arg, by, room, cmd) {
		arg=arg.toLowerCase();
		var args = arg.split(",");
		var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
		var filtertypings=[];
		var posfilterroles=["entryhazards","hazardremoval","itemremover","pivot","cleric","pivot","scarf","physicalsweeper","specialsweeper","physicalbulkyattacker","specialbulkyattacker","physicalwall","specialwall","physicalsetup","specialsetup","status","priority","speedcontrol","sun","rain","hail","sand"];
		var filterroles=[];
		var x =0;
		var tierrecommend = false;
		var pointrecommend = false;
		while(x<args.length){
			var argx=args[x];

			if(posfilterroles.includes(toId(argx))){
				filterroles.push(toId(argx));
			}
			var draftsshown=6;
			if(argx.includes("tier")){
				argx=toId(argx);
				argx=jsUcfirst(argx);
				tierrecommend=true;
				var tier=argx;
			}
			argx=toId(argx);
			argx=jsUcfirst(argx);
			if(postypings.includes(argx)){
				filtertypings.push(argx);
			}
			if(!Number.isNaN(parseInt(argx))){
				if(parseInt(argx)<40){
					draftsshown=parseInt(argx);
				}
				else{
					maxpoints=parseInt(argx);
					pointrecommend=true;
				}
			}
			x++;
		}
		var g =1;
		var draftmons=[];
		var best={};
		var listsix=[];
		var i=1;
		if(toId(by)==toId(room)){
			draftmons=global.draftvalues.todraftmons[Object.keys(global.draftvalues.todraftmons)[0]];
		}
		else{
			draftmons=global.draftvalues.todraftmons[toId(room)];
		}
		while(g<=draftmons["length"]) {

			var possiblepic = [];
			if (tierrecommend) {
				possiblepic = draftmons["tierlist"][tier]["pokemon"];
				g = 100;
			} else {
				if (pointrecommend) {
					while (possiblepic = draftmons["tierlist"]["Tier" + g]["points"] > maxpoints) {

						g++
					}

				}
				possiblepic = draftmons["tierlist"]["Tier" + g]["pokemon"];
			}
			var j = 0;

			while (j < possiblepic["length"]) {
				var monname = possiblepic[j];
				console.log(monname);
				var t=1.0;
				if(filtertypings.length>0){
					if(filtertypings.includes(global.draftvalues.mondata[monname]["Typing 2"])||filtertypings.includes(global.draftvalues.mondata[monname]["Typing1"])){

					}
					else{
						t=t*0;
					}

				}if(filterroles.length>0){
					var r=0;

					while(r<filterroles.length){
						if((global.draftvalues.mondata[monname][filterroles[r]]||0)==0){
							t=t*0;
						}
						r++;
					}


				}
				t=99-t;
				var maxlength=draftsshown+3;
				maxlength=draftsshown;
				if(listsix.length<maxlength){
					while(listsix.includes(t)){
						t=t+0.1;

					}
					listsix.push(t);
					listsix.sort();
					best[t]={};
					best[t]["name"]=possiblepic[j];
					if(tierrecommend){
						best[t]["credits"]=draftmons["tierlist"][tier]["points"];
					}
					else{
						best[t]["credits"]=draftmons["tierlist"]["Tier"+g]["points"];
					}

					console.log(best);
				}
				else{

					while(listsix.includes(t)){
						t=t+0.1;

					}
					listsix.push(t);
					listsix.sort();
					best[t]={};
					best[t]["name"]=possiblepic[j];
					if(tierrecommend){
						best[t]["credits"]=draftmons["tierlist"][tier]["points"];
					}
					else{
						best[t]["credits"]=draftmons["tierlist"]["Tier"+g]["points"];
					}
					if(listsix.length>draftsshown){
						delete best[listsix[draftsshown]];
						listsix.pop();
					}
				}
				j++;
			}
			g++;
		}
		var newlistsix={};
		var secondarg=[];
		var y=0;
		console.log(listsix);
		console.log(best);
		shuffle(listsix);
		while(y<draftsshown){
			var newobj={};

			newobj["name"]=best[listsix[y]]["name"];
			newobj["credits"]=best[listsix[y]]["credits"];
			newlistsix[y]=newobj;
			y++;
		}
		//thislistsix
		//return  this.reply("!htmlbox <div  style='color: black; border: 2px solid red; background-color: rgb(255, 204, 204); padding: 4px;'>"+draftmonsprint5(newlistsix,"rgb(255, 204, 204)")+ "</div>");

		return this.reply(draftmonsprint4(newlistsix,draftsshown,by,room));
		//global.draftvalues.users[name]["erekredieten"]
		//mondata
	},
	draftweak: 'draftweakness',

	draftweakness: function(arg, by, room, cmd){
		var name=toId(by);
		var weaktable = weaknessTable(name);
		var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];

		var word = '!htmlbox <div id="dvContents" style="border: 1px dotted black; padding: 5px; width:305px"> <table cellspacing="0" rules="all" border="1">';
		var i =0;
		while(i<6){
			var j =0;
			word= word+"<tr>";
			while(j<3){
				word= word+"<td>"+postypings[i*3+j]+ ": " + weaktable[postypings[i*3+j]] +"</td>";
				j++
			}
			word= word+"</tr>";
			i++
		}
		word= word + "</table> </div>"
		return this.reply(word);
	},


	recommend:function (arg, by, room, cmd) {
		
		arg=arg.toLowerCase();
		var args = arg.split(",");
		
		var filtered=false;
		if (arg!=""){
			filtered=true;
		}
		
		var tierrecommend=false;
		var pointrecommend=false;
		var maxpoints=0;
		var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
		var filtertypings=[];
		var posfilterroles=["entryhazards","hazardremoval","itemremover","pivot","cleric","pivot","scarf","physicalsweeper","specialsweeper","physicalbulkyattacker","specialbulkyattacker","physicalwall","specialwall","physicalsetup","specialsetup","status","priority","speedcontrol","sun","rain","hail","sand"];
		var filterroles=[];
		var userlist=global.draftvalues.turnorder;
		var x=0;
		var name=toId(by);
		while(x<args.length){
			var argx=args[x];
			
			if(posfilterroles.includes(toId(argx))){
				filterroles.push(toId(argx));
			}
			if(userlist.includes(toId(argx))){
			   name=toId(argx);
			}
			var draftsshown=6;
			if(argx.includes("tier")){
				argx=toId(argx);
				argx=jsUcfirst(argx);
				tierrecommend=true;
				var tier=argx;
			}
			argx=toId(argx);
			argx=jsUcfirst(argx);
			if(postypings.includes(argx)){
				filtertypings.push(argx);   
			}
			if(!Number.isNaN(parseInt(argx))){
				if(parseInt(argx)<40){
					draftsshown=parseInt(argx);
				}
				else{
					maxpoints=parseInt(argx);
					pointrecommend=true;
				}
			}
			x++;
		}
		
		var draftmons=[];
		if(toId(by)==toId(room)){
			draftmons=global.draftvalues.todraftmons[Object.keys(global.draftvalues.todraftmons)[0]];
		}
		else{
			draftmons=global.draftvalues.todraftmons[toId(room)];
		}
		console.log(toId(by));
		
		//var name=toId(by);
		var best={};
		var listsix=[];
		var i=1;
		var typings=[];
	var totalhazards=0.0;
	var totalremovers=0.0;
	var totalclerics=0.0;
	var totalpivots=0.0;
	var totalscarfs=0.0;
	var totalitemremover=0.0;
	var totalphysicals=0.0;
	var totalspecials=0.0;
	var totalphysicalb=0.0;
	var totalspecialb=0.0;
	var totalphysicalw=0.0;
	var totalspecialw=0.0;
	var totalphysicalup=0.0;
	var totalspecialup=0.0;
	var totalspeedup=0.0;
	var totalprio=0.0;
	var totalstatus=0.0;
	var totalscreen=0.0;
	var hassun=false;
	var hasrain=false;
	var hashail=false;
	var hassand=false;
	var monschosen=global.draftvalues.users[name]["draftedmons"];
	var i=0;
	while(i<monschosen.length){
		var currentmon=monschosen[i];
		if(!(currentmon in global.draftvalues.mondata)){
			i++;
			continue;
		}
		if(!typings.includes(global.draftvalues.mondata[currentmon]["Typing1"])){
			typings.push(global.draftvalues.mondata[currentmon]["Typing1"]);
		}
		if(global.draftvalues.mondata[currentmon]["Typing 2"]!=""){
			
			if(!typings.includes(global.draftvalues.mondata[currentmon]["Typing 2"])){
				typings.push(global.draftvalues.mondata[currentmon]["Typing 2"]);
			}
		}
		totalhazards=totalhazards+(currentmon["entryhazards"]||0);
		totalremovers=totalremovers+(currentmon["hazardremoval"]||0);
		totalitemremover=totalitemremover+(currentmon["itemremover"]||0);
		totalpivots=totalpivots+(currentmon["pivot"]||0);
		totalclerics=totalclerics+(currentmon["cleric"]||0);
		totalscarfs=totalscarfs+(currentmon["scarf"]||0);
		totalphysicals=totalphysicals+(currentmon["physicalsweeper"]||0);
		totalspecials=totalspecials+(currentmon["specialsweeper"]||0);
		totalphysicalb=totalphysicalb+(currentmon["physicalbulkyattacker"]||0);
		totalspecialb=totalspecialb+(currentmon["specialbulkyattacker"]||0);
		totalphysicalw=totalphysicalw+(currentmon["physicalwall"]||0);
		totalspecialw=totalspecialw+(currentmon["specialwall"]||0);
		totalphysicalup=totalphysicalup+(currentmon["physicalsetup"]||0);
		totalspecialup=totalspecialup+(currentmon["specialsetup"]||0);
		totalspeedup=totalspeedup+(currentmon["speedcontrol"]||0);
		totalprio=totalprio+(currentmon["priority"]||0);
		totalstatus=totalstatus+(currentmon["status"]||0);
		totalscreen=totalscreen+(currentmon["screens"]||0);
		if(currentmon["sun"]==6){
			hassun=true;
		}
		if((currentmon["rain"]||0)==6){
			hasrain=true;
		}
		if((currentmon["hail"]||0)==6){
			 hashail=true;
		}
		if((currentmon["sand"]||0)==6){
			 hassand=true;
		}
		i++;
	
				
	}
		var g =1;
		while(g<=draftmons["length"]){
			console.log("g"+g);
			var possiblepic=[];
			if(tierrecommend){
				possiblepic=draftmons["tierlist"][tier]["pokemon"];
				g=100;
			}
			else{
				if(pointrecommend){
					while(possiblepic=draftmons["tierlist"]["Tier"+g]["points"]>maxpoints){
						
						g++
					}
					
				}
				possiblepic=draftmons["tierlist"]["Tier"+g]["pokemon"];
			}
			var j=0;
			while(j<possiblepic["length"]){
				console.log("j"+j);
				console.log(possiblepic["length"]);
				var monname=possiblepic[j];
				var t=0.0;
				console.log(monname);
				var table2 = weaknessTable(name);
				var weaktable = weaknessForPokemon(monname);
				var typePointer=0;
				while(typePointer<postypings.length) {
					var currentType = postypings[typePointer];
					if(weaktable[currentType]<0){
						if(table2[currentType]>=3){
							t=t+20;
						} else{
							if(table2[currentType]>0){

								t=t+10;
							}
						}
					}
					else{
						if(weaktable[currentType]>0){
							if(table2[currentType]==2){
								t=t-5;
							}
							if(table2[currentType]>0){
								t=t-3;
							}
						}

					}
					typePointer++;
				}
				console.log("scorehere:" +currentType +" "+  t);
				if(typings.includes(global.draftvalues.mondata[monname]["Typing1"])){
					if(global.draftvalues.mondata[monname]["Typing 2"]!=undefined){
						
							if(typings.includes(global.draftvalues.mondata[monname]["Typing 2"])){

							}
							else{
								t=t+5;
							}
						
						
					}
				}
				else{
					console.log(global.draftvalues.mondata[monname]["Typing 2"]);
					if(global.draftvalues.mondata[monname]["Typing 2"]!=undefined){
						if(typings.includes(global.draftvalues.mondata[monname]["Typing 2"])){
								t=t+5;
						}
						else{
								t=t+20;
						}
					}
					else{
						t=t+15;
					}
				}
				console.log("beforeentry"+t);
				if(totalhazards<5){
					t=t+(global.draftvalues.mondata[monname]["entryhazards"]||0);
				 }
				console.log("postentry"+t);
				if(totalremovers<5){
					t=t+(global.draftvalues.mondata[monname]["hazardremoval"]||0);
				 }
				if(totalitemremover<5){
					t=t+(global.draftvalues.mondata[monname]["itemremover"]||0);
				}
				if((global.draftvalues.mondata[monname]["pivot"]||0)>0){
					
					t=t+(global.draftvalues.mondata[monname]["pivot"]||0);
				}
				if(totalclerics<5){
					t=t+(global.draftvalues.mondata[monname]["cleric"]||0);
				}
				if(totalscarfs<5){
					t=t+(global.draftvalues.mondata[monname]["scarf"]||0);
				}
				var physicalt=0.0;
				var specialt=0.0;
				
				if(totalphysicals>5){
					var divider=totalphysicals/5+.5;
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsweeper"]||0)/divider;
				}
				else{
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsweeper"]||0);
				}
				
				if(totalphysicalb>5){
					var divider=totalphysicalb/5+.5;
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalbulkyattacker"]||0)/divider;
				}
				else{
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalbulkyattacker"]||0);
				}
				console.log("beforesetup"+t);
				if(totalphysicalup>5){
					var divider=totalphysicalup/5+.5;
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsetup"]||0)/divider;
				}
				else{
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsetup"]||0);
				}
				console.log("aftersetup"+t);
				if(totalspecials>5){
					var divider=totalspecials/5+.5;
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsweeper"]||0)/divider;
				}
				else{
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsweeper"]||0);
				}
				if(totalspecialb>5){
					var divider=totalspecialb/5+.5;
					specialt=specialt+(global.draftvalues.mondata[monname]["specialbulkyattacker"]||0)/divider;
				}
				else{
					specialt=specialt+(global.draftvalues.mondata[monname]["specialbulkyattacker"]||0);
				}
				if(totalspecialup>5){
					var divider=totalspecialup/5+.5;
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsetup"]||0)/divider;
				}
				else{
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsetup"]||0);
				}
				
					
				
				var totalphysical=totalphysicalup+totalphysicals+totalphysicalb;
				var totalspecial=totalspecialup+totalspecials+totalspecialb;
				
				if(totalphysical+8<totalspecial){
					specialt=specialt/2;
				}
				if(totalspecial+8<totalphysical){
					physicalt=physicalt/2;
				}
			
				t=t+physicalt+specialt;
				
				if(totalphysicalw>5){
					var divider=totalphysicalw/5+.5;
					t=t+(global.draftvalues.mondata[monname]["physicalwall"]||0)/divider;
				}
				else{
					t=t+(global.draftvalues.mondata[monname]["physicalwall"]||0);
				}
				if(totalspecialw>5){
					var divider=totalspecialw/5+.5;
					t=t+(global.draftvalues.mondata[monname]["specialwall"]||0)/divider;
				}
				else{
					t=t+(global.draftvalues.mondata[monname]["specialwall"]||0);
				}
				console.log("zfterwall"+t);
				t=t+(global.draftvalues.mondata[monname]["speedcontrol"]||0);
				if(totalprio>5){
					var divider=totalprio/5+.5;
					t=t+(global.draftvalues.mondata[monname]["priority"]||0)/divider;
				}
				else{
					t=t+(global.draftvalues.mondata[monname]["priority"]||0);
				}
				if(totalstatus<8){
					t=t+(global.draftvalues.mondata[monname]["status"]||0);
				}
				if(totalscreen<8){
					t=t+(global.draftvalues.mondata[monname]["screens"]||0);
				}
				if((global.draftvalues.mondata[monname]["sun"]||0)==6){
					t=t+3;
				}
				else{
					if(hassun){
						t=t+(global.draftvalues.mondata[monname]["sun"]||0);
					}
				}
				if((global.draftvalues.mondata[monname]["rain"]||0)==6){
					t=t+3;
				}
				else{
					if(hasrain){
						t=t+(global.draftvalues.mondata[monname]["rain"]||0);
					}
				}
				if((global.draftvalues.mondata[monname]["hail"]||0)==6){
					t=t+3;
				}
				else{
					if(hashail){
						t=t+(global.draftvalues.mondata[monname]["hail"]||0);
					}
				}
				if((global.draftvalues.mondata[monname]["sand"]||0)==6){
					t=t+3;
				}
				else{
					if(hassand){
						t=t+(global.draftvalues.mondata[monname]["sand"]||0);
					}
				}
				console.log(t);
				if(filtertypings.length>0){
					if(filtertypings.includes(global.draftvalues.mondata[monname]["Typing 2"])||filtertypings.includes(global.draftvalues.mondata[monname]["Typing1"])){
						
					}
					else{
						t=t*0;
					}
					
				}if(filterroles.length>0){
					var r=0;
					while(r<filterroles.length){
						if((global.draftvalues.mondata[monname][filterroles[r]]||0)==0){
							t=t*0;
						}
						r++;
					}
					
					
				}
				t=200-t;
				var maxlength=draftsshown+3;
				if(filtered){
					maxlength=draftsshown;
				}
				if(listsix.length<maxlength){
					while(listsix.includes(t)){
						t=t+0.1;
						
					}
					listsix.push(t);
					listsix.sort();
					best[t]={};
					best[t]["name"]=possiblepic[j];
					if(tierrecommend){
						best[t]["credits"]=draftmons["tierlist"][tier]["points"];
					}
					else{
						best[t]["credits"]=draftmons["tierlist"]["Tier"+g]["points"];
					}
					
					console.log(best);
				}
				else{
					
					while(listsix.includes(t)){
						t=t+0.1;
						
					}
					listsix.push(t);
					listsix.sort();
					best[t]={};
					best[t]["name"]=possiblepic[j];
					if(tierrecommend){
						best[t]["credits"]=draftmons["tierlist"][tier]["points"];
					}
					else{
						best[t]["credits"]=draftmons["tierlist"]["Tier"+g]["points"];
					}
					if(filtered){
						if(listsix.length>draftsshown){
							delete best[listsix[draftsshown]];
							listsix.pop();
						}
					}
					else{
						if(listsix.length>draftsshown+3){
							delete best[listsix[draftsshown+3]];
							listsix.pop();
						}
					}
					
				}
				j++;
			}
			g++;
		}
		var newlistsix={};
		var secondarg=[];
		var y=0;
		console.log(listsix);
		console.log(best);
		shuffle(listsix);
		while(y<draftsshown){
			var newobj={};
			
			newobj["name"]=best[listsix[y]]["name"];
			newobj["credits"]=best[listsix[y]]["credits"];
			newlistsix[y]=newobj;
			y++;
		}
		//thislistsix
		this.send(global.draftvalues.draftroom, draftmonsprint4(newlistsix,draftsshown,by,global.draftvalues.draftroom));
		//global.draftvalues.users[name]["erekredieten"]
		//mondata
	
	},
	readexceltest: function (arg, by, room, cmd) {
		
			//var data = e.target.result;
			var data="test.xlsx";
			 var workbook = XLSX.read(data, {
				 type: 'binary'
			});
			
			workbook.SheetNames.forEach(function(sheetName) {
				// Here is your object
				var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
				var json_object = JSON.stringify(XL_row_object);
				console.log(json_object);
			});
		
		
	},

  
  
	battlepermissions: 'battleset',
	battlesettings: 'battleset',
	battleset: function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply(this.trad('u1') + ": " + this.cmdToken + cmd + " " + this.trad('u2'));
		var perm = toId(args[0]);
		var rank = args[1].trim();
		if (!(perm in Settings.permissions)) {
			return this.reply(this.trad('ps') + ": " + Object.keys(Settings.permissions).sort().join(", "));
		}
		if (rank in {'off': 1, 'disable': 1}) {
			Settings.setPermission('battle-', perm, true);
			Settings.save();
			this.sclog();
			return this.reply(this.trad('p') + " **" + perm + "** " + this.trad('d'));
		}
		if (rank in {'on': 1, 'all': 1, 'enable': 1}) {
			Settings.setPermission('battle-', perm, ' ');
			Settings.save();
			this.sclog();
			return this.reply(this.trad('p') + " **" + perm + "** " + this.trad('a'));
		}
		if (Config.ranks.indexOf(rank) >= 0) {
			Settings.setPermission('battle-', perm, rank);
			Settings.save();
			this.sclog();
			return this.reply(this.trad('p') + " **" + perm + "** " + this.trad('r') + ' ' + rank + " " + this.trad('r2'));
		} else {
			return this.reply(this.trad('not1') + " " + rank + " " + this.trad('not2'));
		}
	}
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
	console.log('shuffle');
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
};

function removedraftedspecies(arg,list){
	//var list=global.draftvalues.users[toId(room)];
	if(list.length === 0){
		return;
	}
	var name=toId(list[0]);

	var listtoremove=global.draftvalues.draftedmons[name];
	//console.log("toremovelist "+listtoremove);
	//console.log("list "+arg);
	if(listtoremove!=undefined){
		
		for(var i=0;i<listtoremove.length;i++){
			for(var j=0;j<arg.length;j++){
				
				if(samespecies(arg[j],listtoremove[i])){
					arg.splice(j,1);
					j--;
				}
				
			}
		}
	}
}

function samespecies(arg1,arg2){
	var args1=arg1.split("-");
	var args2=arg2.split("-");
	
	return args1[0]===args2[0];
}
function draftmonsprint3(arg){
		arg=arg.reverse();
		var result='!code ';
			for (var i = 0; i < arg.length; i++) {
				console.log(arg[i]);
		//Do something
				//<a href="//dex.pokemonshowdown.com/pokemon/cofagrigus" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="Cofagrigus" style="vertical-align:-7px;margin:-2px" />Cofagrigus</a>
					var name=arg[i];
					var word='=image(CONCATENATE("https://play.pokemonshowdown.com/sprites/bw/'+ name.toLowerCase() +'.png"))\n';
					result=result+word;
					
				
				
			}
			console.log(result);
			result=result.substring(0,result.length-1);
			result=result;
		return result;
	};
 function draftmonsprint2(type, arg){
		arg=arg.sort();
		var result='!htmlbox ';
		if(type != undefined){
			result = result+ '<div style="color: black; border: 2px solid silver; background-color: rgb(234, 245, 234); padding: 4px;"> Terastalyze type: <psicon type="'+type+'" style="vertical-align:-2px;margin: 0px" /></div>';
		}

			for (var i = 0; i < arg.length; i++) {
				console.log(arg[i]);
		//Do something
				//<a href="//dex.pokemonshowdown.com/pokemon/cofagrigus" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="Cofagrigus" style="vertical-align:-7px;margin:-2px" />Cofagrigus</a>
					var name=arg[i];
					var word='<a href="//dex.pokemonshowdown.com/pokemon/'+ name+'" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="'+name+'" style="vertical-align:-7px;margin:-2px" />'+name+'</a>,';
					result=result+word;
			}
			result=result.substring(0,result.length-1);
			result=result;
		return result;
	};

function draftmonsprint6(arg){
	arg=arg.sort();
	var result='';
	for (var i = 0; i < arg.length; i++) {
		console.log(arg[i]);
		//Do something
		//<a href="//dex.pokemonshowdown.com/pokemon/cofagrigus" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="Cofagrigus" style="vertical-align:-7px;margin:-2px" />Cofagrigus</a>
		var name=arg[i];
		var word='<a href="//dex.pokemonshowdown.com/pokemon/'+ name+'" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="'+name+'" style="vertical-align:-7px;margin:-2px" />'+name+'</a>,';
		result=result+word;


	}
	result=result.substring(0,result.length-1);
	result=result;
	return result;
};
 function draftmonsprint4(arg,nrshown,by,room){
		//arg=arg.sort();
	 	var result="suggestions:";
	 	if(toId(by)!=toId(room)){
			result='!htmlbox <div  style=\'color: black; border: 2px solid red; background-color: rgb(204, 255, 204); padding: 4px;\'>';
		}

		for (var i = 0; i < nrshown; i++) {
				console.log(arg[i]);
		//Do something
				//<a href="//dex.pokemonshowdown.com/pokemon/cofagrigus" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="Cofagrigus" style="vertical-align:-7px;margin:-2px" />Cofagrigus</a>
			var name=arg[i]["name"];
					var credits=arg[i]["credits"];
			if(toId(by)==toId(room)){
				
				var word=name+" ("+credits+" erekredieten), ";
					result=result+word;
					
			}
			else{
				var word='<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draft '+name +'" style="background-color: rgb(204, 255, 204) ">';
				word=word+'<a href="//dex.pokemonshowdown.com/pokemon/'+ name+'" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="'+name+'" style="vertical-align:-7px;margin:-2px" />'+name+'</a>';
				word=word+'</button>';
				result=result+word;
			}
				
				
			}
			result=result.substring(0,result.length-1);
			result=result + "</div>";
		return result;
	};
function draftmonsprint5(arg,color){
	arg=arg.sort();
	//color = global.draftvalues.typingcolors[typing];


	var result='';
	for (var i = 0; i < arg.length; i++) {
		console.log("here "+arg[i]);
		var color2 = "rgb(0,0,0)";
		if(global.draftvalues.mondata[arg[i]]["Typing1"]!=undefined){
			color = global.draftvalues.typingcolors[global.draftvalues.mondata[arg[i]]["Typing1"]];
		}
		if(global.draftvalues.mondata[arg[i]]["Typing 2"]!=undefined){
			color2 = global.draftvalues.typingcolors[global.draftvalues.mondata[arg[i]]["Typing 2"]];
		}
		//Do something
		//<a href="//dex.pokemonshowdown.com/pokemon/cofagrigus" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="Cofagrigus" style="vertical-align:-7px;margin:-2px" />Cofagrigus</a>
		var name=arg[i];
		var word="";
		if(global.draftvalues.mondata[arg[i]]["Typing 2"]==undefined){
			word ='<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draft '+name +'" style="background-color:'+color +'; font-size: 10pt; font-weight: bold;">';
		}
		else{
			word ='<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draft '+name +'" style="background-color:'+color +'; font-size: 10pt; font-weight: bold;">';
		}
		word=word+'<a href="//dex.pokemonshowdown.com/pokemon/'+ name+'" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="'+name+'" style="vertical-align:-7px;margin:-2px" />'+name+'</a>';
		word=word+'</button>';
		result=result+word;


	}
	result=result.substring(0,result.length-1);
	result=result;
	return result;
};

function printPosTypes(){
	var arg=global.draftvalues.availableTypes.sort();
	var result='';
	for (var i = 0; i < arg.length; i++) {
		console.log("here "+arg[i]);
		var color = global.draftvalues.typingcolors[arg[i]];
		//Do something
		//<a href="//dex.pokemonshowdown.com/pokemon/cofagrigus" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="Cofagrigus" style="vertical-align:-7px;margin:-2px" />Cofagrigus</a>
		var name=arg[i];
		var word='<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draft '+ name +'" style="background-color:'+color +'">';
		word=word+'<psicon type="'+name+'" style="vertical-align:-7px;margin:-2px" />';
		word=word+'</button>';
		result=result+word;


	}
	result=result.substring(0,result.length-1);
	return result;
};

	 function pickmultimons(arg,number,list){
		 removedraftedspecies(arg,list);
		var result=[];
		 console.log(arg);
		 console.log(number);
		//console.log(r);
	 	for(var i=0;i<number;i++){
			var r=arg.length;
			var x=Math.round(Math.random()*r);
			if (x==r){
				x--;
			}
			console.log(x);
			console.log(r);
			result.push(arg[x]);
			arg.splice(x,1);
	 	}
		 console.log(result);
	 	return result;
	 }
 function draftmonsprint(arg){
		arg=arg.sort();
		var result='';
			for (var i = 0; i < arg.length; i++) {
				console.log(arg[i]);
		//Do something
				
					result=result+","+arg[i];
				
				
			}
			result=result.substring(1,result.length);
		return '!code ' +result;
	};

async  function saveTeamsToCloud(){
	
	const uri =	"mongodb+srv://kingbaruk:H2MWiHQgN46qrUu@cluster0.9vx1c.mongodb.net/test?retryWrites=true&w=majority";
	console.log(uri);
	console.log("test");
	
	const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
	await client.connect();
	try {
		let quotes = await findOneListingByName(client,"pokemon")
		console.log(quotes);
		quotes["pokemon"]=global.draftvalues.users;
		quotes["cache"]=global.draftvalues;
		await updateListingByName(client,"pokemon" ,quotes);
	
	} catch (e) {

    		console.error(e);

	}
		
	finally{
		await client.close();
	}
		
};
function calculateMonScore(arg,by){
};
function generateMonsList(monlist,room){
	var resultlist=[];
	var stopped=false;
	var i=1;
	var list=global.draftvalues.turnorder;

		resultlist.push.apply(resultlist,pickmultimons(monlist["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"],6,list));

		console.log(i);

		console.log(resultlist);

	console.log(resultlist);
	return resultlist;
}
function startNewTier(room,by,elem){
	//load mons of the new tierlist
	//reshuffle list of users
	//if last tier end draft
	global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
	//saveTeamsToCloud();
	var draftmons=global.draftvalues.todraftmons[toId(room)];
	global.draftvalues.currenttier[toId(room)]=global.draftvalues.currenttier[toId(room)]+1;
	console.log("draftlenght"+draftmons["length"]+ " current tier " +global.draftvalues.currenttier[toId(room)]);
	if(global.draftvalues.currenttier[toId(room)]>draftmons["length"]){
		global.draftvalues.pointdrafting=true;
		global.draftvalues.pointpicks=0;
		if(draftmons["freepicks"]<=global.draftvalues.pointpicks){
			global.draftvalues.draftstarted=false;
			global.draftvalues.users[toId(room)]=[];
			return elem.reply('The draft over is good luck and have fun ');
		}
	}
	//elem.reply('new tier started');
	 global.draftvalues.picknr[toId(global.draftvalues.draftroom)]=0;
	var list=global.draftvalues.turnorder[toId(room)]
		
		list=shuffle(list);
		
	var result='';
		for (var i = 0; i < list.length; i++) {
		
    //Do something
			
				result=result+","+list[i];
			
			
		}
		result=result.substring(1,result.length);
		global.draftvalues.draftstarted=true;
		
		global.draftvalues.nextdrafter=0;
		elem.reply('draft order is '+result);
	
		if(global.draftvalues.packdrafting){
		console.log(global.draftvalues.todraftmons);
		
			var newlist=pickmultimons(draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"],6,list);
			global.draftvalues.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				elem.reply(draftmonsprint(newlist));
		
			}else{
			 elem.reply(draftmonsprint2(newlist));
		
			}
		return elem.reply(' Choose next mon '+list[0]);
		}
	else{
		if(!global.draftvalues.pointdrafting){
			global.draftvalues.possiblepicks=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"];
		//global.draftvalues.todraftmons=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"];
		if(toId(by)==toId(room)){
				elem.reply(draftmonsprint(draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"]));
		
			}else{
				elem.reply(draftmonsprint2(draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"]));
		
			}
			return elem.reply(' the next drafter is '+list[0]);
		}
		else{
			global.draftvalues.possiblepicks=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"];
		//global.draftvalues.todraftmons=draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"];
		if(toId(by)==toId(room)){
				//elem.reply(draftmonsprint(draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"]));
		
			}else{
				//elem.reply(draftmonsprint2(draftmons["tierlist"]["Tier"+global.draftvalues.currenttier[toId(room)]]["pokemon"]));
		
			}
			return elem.reply(' the next drafter is '+list[0]+ " ("+global.draftvalues.users[list[0]]["erekredieten"]+"Erekredieten left)");
		}
		
	}
};
function calculatescore(room,monname,name){
	var arg=""
	
	arg=arg.toLowerCase();
		var args = arg.split(",");
		
		
		var tierrecommend=false;
		var pointrecommend=false;
		var maxpoints=0;
		var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
		var filtertypings=[];
		var posfilterroles=["entryhazards","hazardremoval","itemremover","pivot","cleric","pivot","scarf","physicalsweeper","specialsweeper","physicalbulkyattacker","specialbulkyattacker","physicalwall","specialwall","physicalsetup","specialsetup","status","priority","speedcontrol","sun","rain","hail","sand"];
		var filterroles=[];
		
		var x=0;
		while(x<args.length){
			var argx=args[x];
			if(posfilterroles.includes(toId(argx))){
				filterroles.push(toId(argx));
			}
			var draftsshown=3;
			if(argx.includes("tier")){
				argx=jsUcfirst(argx);
				tierrecommend=true;
				var tier=argx;
			}
			argx=jsUcfirst(argx);
			if(postypings.includes(argx)){
				filtertypings.push(argx);   
			}
			if(!Number.isNaN(parseInt(argx))){
				if(parseInt(argx)<40){
					draftsshown=parseInt(argx);
				}
				else{
					maxpoints=parseInt(argx);
					pointrecommend=true;
				}
			}
			x++;
		}
		
		var draftmons=[];
		if(toId(name)==toId(room)){
			draftmons=global.draftvalues.todraftmons[Object.keys(global.draftvalues.todraftmons)[0]];
		}
		else{
			draftmons=global.draftvalues.todraftmons[toId(room)];
		}
		//console.log(toId();
		//var name=toId(by);
		var best={};
		var listsix=[];
		var i=1;
		
		
		
		
		
		var typings=[];
	var totalhazards=0.0;
	var totalremovers=0.0;
	var totalclerics=0.0;
	var totalpivots=0.0;
	var totalscarfs=0.0;
	var totalitemremover=0.0;
	var totalphysicals=0.0;
	var totalspecials=0.0;
	var totalphysicalb=0.0;
	var totalspecialb=0.0;
	var totalphysicalw=0.0;
	var totalspecialw=0.0;
	var totalphysicalup=0.0;
	var totalspecialup=0.0;
	var totalspeedup=0.0;
	var totalprio=0.0;
	var totalstatus=0.0;
	var totalscreen=0.0;
	var hassun=false;
	var hasrain=false;
	var hashail=false;
	var hassand=false;
	var monschosen=global.draftvalues.users[name]["draftedmons"];
	var i=0;
	while(i<monschosen.length){
		var currentmon=monschosen[i];
		var currentmon=monschosen[i];
		if(!(currentmon in global.draftvalues.mondata)){
			i++;
			continue;
		}
		if(!typings.includes(global.draftvalues.mondata[currentmon]["Typing1"])){
			typings.push(global.draftvalues.mondata[currentmon]["Typing1"]);
		}
		if(global.draftvalues.mondata[currentmon]["Typing 2"]!=undefined){
			
			if(!typings.includes(global.draftvalues.mondata[currentmon]["Typing 2"])){
				typings.push(global.draftvalues.mondata[currentmon]["Typing 2"]);
			}
		}
		totalhazards=totalhazards+(currentmon["entryhazards"]||0);
		totalremovers=totalremovers+(currentmon["hazardremoval"]||0);
		totalitemremover=totalitemremover+(currentmon["itemremover"]||0);
		totalpivots=totalpivots+(currentmon["pivot"]||0);
		totalclerics=totalclerics+(currentmon["cleric"]||0);
		totalscarfs=totalscarfs+(currentmon["scarf"]||0);
		totalphysicals=totalphysicals+(currentmon["physicalsweeper"]||0);
		totalspecials=totalspecials+(currentmon["specialsweeper"]||0);
		totalphysicalb=totalphysicalb+(currentmon["physicalbulkyattacker"]||0);
		totalspecialb=totalspecialb+(currentmon["specialbulkyattacker"]||0);
		totalphysicalw=totalphysicalw+(currentmon["physicalwall"]||0);
		totalspecialw=totalspecialw+(currentmon["specialwall"]||0);
		totalphysicalup=totalphysicalup+(currentmon["physicalsetup"]||0);
		totalspecialup=totalspecialup+(currentmon["specialsetup"]||0);
		totalspeedup=totalspeedup+(currentmon["speedcontrol"]||0);
		totalprio=totalprio+(currentmon["priority"]||0);
		totalstatus=totalstatus+(currentmon["status"]||0);
		totalscreen=totalscreen+(currentmon["screens"]||0);
		if(currentmon["sun"]==6){
			hassun=false;
		}
		if((currentmon["rain"]||0)==6){
			hasrain=false;
		}
		if((currentmon["hail"]||0)==6){
			 hashail=false;
		}
		if((currentmon["sand"]||0)==6){
			 hassand=false;
		}
		i++;
	
				
	}
		var g =1;
		
			console.log("g"+g);
			var possiblepic=[];
			
				possiblepic=monname;
				g=100;
			
			
				
			 
			
				//console.log("j"+j);
				//console.log(possiblepic["length"]);
				//var monname=possiblepic[j];
				var t=0.0;
				console.log(monname);
				if(typings.includes(global.draftvalues.mondata[monname]["Typing1"])){
					if(global.draftvalues.mondata[monname]["Typing 2"]!=undefined){
						
							if(typings.includes(global.draftvalues.mondata[monname]["Typing 2"])){

							}
							else{
								t=t+5;
							}
						
						
					}
				}
				else{
					console.log(global.draftvalues.mondata[monname]["Typing 2"]);
					if(global.draftvalues.mondata[monname]["Typing 2"]!=undefined){
						if(typings.includes(global.draftvalues.mondata[monname]["Typing 2"])){
								t=t+5;
						}
						else{
								t=t+20;
						}
					}
					else{
						t=t+15;
					}
				}
				console.log("beforeentry"+t);
				if(totalhazards<5){
					t=t+(global.draftvalues.mondata[monname]["entryhazards"]||0);
				 }
				console.log("postentry"+t);
				if(totalremovers<5){
					t=t+(global.draftvalues.mondata[monname]["hazardremoval"]||0);
				 }
				if(totalitemremover<5){
					t=t+(global.draftvalues.mondata[monname]["itemremover"]||0);
				}
				if((global.draftvalues.mondata[monname]["pivot"]||0)>0){
					
					t=t+(global.draftvalues.mondata[monname]["pivot"]||0)+totalpivots*.1;
				}
				if(totalclerics<5){
					t=t+(global.draftvalues.mondata[monname]["cleric"]||0);
				}
				if(totalscarfs<5){
					t=t+(global.draftvalues.mondata[monname]["scarf"]||0);
				}
				var physicalt=0.0;
				var specialt=0.0;
				
				if(totalphysicals>5){
					var divider=totalphysicals/5+.5;
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsweeper"]||0)/divider;
				}
				else{
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsweeper"]||0);
				}
				
				if(totalphysicalb>5){
					var divider=totalphysicalb/5+.5;
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalbulkyattacker"]||0)/divider;
				}
				else{
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalbulkyattacker"]||0);
				}
				console.log("beforesetup"+t);
				if(totalphysicalup>5){
					var divider=totalphysicalup/5+.5;
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsetup"]||0)/divider;
				}
				else{
					physicalt=physicalt+(global.draftvalues.mondata[monname]["physicalsetup"]||0);
				}
				console.log("aftersetup"+t);
				if(totalspecials>5){
					var divider=totalspecials/5+.5;
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsweeper"]||0)/divider;
				}
				else{
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsweeper"]||0);
				}
				if(totalspecialb>5){
					var divider=totalspecialb/5+.5;
					specialt=specialt+(global.draftvalues.mondata[monname]["specialbulkyattacker"]||0)/divider;
				}
				else{
					specialt=specialt+(global.draftvalues.mondata[monname]["specialbulkyattacker"]||0);
				}
				if(totalspecialup>5){
					var divider=totalspecialup/5+.5;
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsetup"]||0)/divider;
				}
				else{
					specialt=specialt+(global.draftvalues.mondata[monname]["specialsetup"]||0);
				}
				
					
				
				var totalphysical=totalphysicalup+totalphysicals+totalphysicalb;
				var totalspecial=totalspecialup+totalspecials+totalspecialb;
				
				if(totalphysical+8<totalspecial){
					specialt=specialt/2;
				}
				if(totalspecial+8<totalphysical){
					physicalt=physicalt/2;
				}
			
				t=t+physicalt+specialt;
				
				if(totalphysicalw>5){
					var divider=totalphysicalw/5+.5;
					t=t+(global.draftvalues.mondata[monname]["physicalwall"]||0)/divider;
				}
				else{
					t=t+(global.draftvalues.mondata[monname]["physicalwall"]||0);
				}
				if(totalspecialw>5){
					var divider=totalspecialw/5+.5;
					t=t+(global.draftvalues.mondata[monname]["specialwall"]||0)/divider;
				}
				else{
					t=t+(global.draftvalues.mondata[monname]["specialwall"]||0);
				}
				console.log("zfterwall"+t);
				t=t+(global.draftvalues.mondata[monname]["speedcontrol"]||0);
				if(totalprio>5){
					var divider=totalprio/5+.5;
					t=t+(global.draftvalues.mondata[monname]["priority"]||0)/divider;
				}
				else{
					t=t+(global.draftvalues.mondata[monname]["priority"]||0);
				}
				if(totalstatus<8){
					t=t+(global.draftvalues.mondata[monname]["status"]||0);
				}
				if(totalscreen<8){
					t=t+(global.draftvalues.mondata[monname]["screens"]||0);
				}
				if((global.draftvalues.mondata[monname]["sun"]||0)==6){
					t=t+3;
				}
				else{
					if(hassun){
						t=t+(global.draftvalues.mondata[monname]["sun"]||0);
					}
				}
				if((global.draftvalues.mondata[monname]["rain"]||0)==6){
					t=t+3;
				}
				else{
					if(hasrain){
						t=t+(global.draftvalues.mondata[monname]["rain"]||0);
					}
				}
				if((global.draftvalues.mondata[monname]["hail"]||0)==6){
					t=t+3;
				}
				else{
					if(hashail){
						t=t+(global.draftvalues.mondata[monname]["hail"]||0);
					}
				}
				if((global.draftvalues.mondata[monname]["sand"]||0)==6){
					t=t+3;
				}
				else{
					if(hassand){
						t=t+(global.draftvalues.mondata[monname]["sand"]||0);
					}
				}
				console.log(t);
				if(filtertypings.length>0){
					if(filtertypings.includes(global.draftvalues.mondata[monname]["Typing 2"])||filtertypings.includes(global.draftvalues.mondata[monname]["Typing1"])){
						
					}
					else{
						t=t*0;
					}
					
				}if(filterroles.length>0){
					var r=0;
					while(r<filterroles.length){
						if((global.draftvalues.mondata[monname][filterroles[r]]||0)==0){
							t=t*0;
						}
						r++;
					}
					
					
				}
				
	
	
	return t;
};
function pmlists(monlists, room, vart)
{
	console.log(global.draftvalues.turnorder);
	console.log(monlists +"hi");
	var directionword = "down";
	if(global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]){
		directionword = "up"
	}
	var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
	var toreply= "!htmlbox Tier"+ global.draftvalues.currenttier[toId(room)]+ " draftdirection: "+directionword+ " picksleft:" +val;
	console.log(toreply);
	for(let i=0; i<global.draftvalues.turnorder.length; i++){
		var word = "<div  style='color: black; border: 2px solid "

		if(i==1){
			word = word + "red; background-color: rgb(255, 204, 204); padding: 4px;'>";
			word = word+"<p><b>"+ global.draftvalues.turnorder[i]+"</b>";
			word = word+"<p>"+draftmonsprint5(monlists[i],"rgb(255, 204, 204)")+"</p></p></div>";
		}
		else{
			if(i==2){
				word = word + "blue; background-color: rgb(153, 204, 255); padding: 4px;'>";
				word = word+"<p><b>"+ global.draftvalues.turnorder[i]+"</b>";
				word = word+"<p>"+draftmonsprint5(monlists[i],"rgb(153, 204, 255)")+"</p></p></div>";
			}
			else{
				if(i==3){
					word = word + "green; background-color: rgb(153, 255, 153); padding: 4px;'>";
					word = word+"<p><b>"+ global.draftvalues.turnorder[i]+"</b>";
					word = word+"<p>"+draftmonsprint5(monlists[i],"rgb(153, 255, 153)")+"</p></p></div>";
				}else{
					word = word + "purple; background-color: rgb(204, 204, 255); padding: 4px;'>";
					word = word+"<p><b>"+ global.draftvalues.turnorder[i]+"</b>";
					word = word+"<p>"+draftmonsprint5(monlists[i], "rgb(204, 204, 255)")+"</p></p></div>";
				}
			}
		}


		toreply = toreply+word;
	}
	 vart.send(global.draftvalues.draftroom,"!code "+toreply );
	return vart.send(global.draftvalues.draftroom,toreply);
};
function array_moveDown(arr) {
	var newarr=[];
	var i=1;
	while(i < arr.length){
		newarr.push(arr[i-1]);
		i++
	}
	newarr.push(arr);
	return newarr;
};
function jsUcfirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};

function weaknessTable(name)
{
	var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
	var monschosen=global.draftvalues.users[name]["draftedmons"];
	var i=0;
	var toreturn = {"Grass":0,"Fire":0,"Water":0,"Ice":0,"Bug":0,"Normal":0,"Flying":0,"Poison":0,"Psychic":0,"Ghost":0,"Fighting":0,"Rock":0,"Ground":0,"Electric":0,"Dragon":0,"Fairy":0,"Dark":0,"Steel":0};
	while(i<monschosen.length) {
		var weaknessForMon = weaknessForPokemon(monschosen[i]);
		var j=0;
		while(j<postypings.length) {
			toreturn[postypings[j]] = toreturn[postypings[j]]+ weaknessForMon[postypings[j]];
			j++;
		}
		i++;
	}
	return toreturn;
};
function endbid(arg)
{
	if(arg != global.nominatedmon && ! global.draftvalues.typedrafting){
		return;
	}
	if(arg != global.nominatedType && global.draftvalues.typedrafting){
		return;
	}
	console.log("nextdrafter " + global.draftvalues.nextdrafter);
	var name = global.currentHighestBidder;
	var list=global.draftvalues.turnorder;
	global.passedusers = [];
	global.draftvalues.users[name]["erekredieten"] = global.draftvalues.users[name]["erekredieten"]-currentscore;
	if(global.draftvalues.typedrafting){
		var list=global.draftvalues.typeturnorder;
		global.draftvalues.typeturnorder.remove(name);
		global.draftvalues.availableTypes.remove(nominatedType);
		global.draftvalues.nextdrafter = global.draftvalues.nextdrafter + 1;
		global.draftvalues.users[name]["TerralyzeType"] = nominatedType;
		if(global.draftvalues.typeturnorder.length == 0){
			global.draftvalues.typedrafting=false;
			//saveTeamsToCloud();
			global.draftvalues.nextdrafter = 0;
		}
		else{
			if(global.draftvalues.nextdrafter>global.draftvalues.typeturnorder.length-1){
				global.draftvalues.nextdrafter = 0;
			}
			//this.reply("use ?draftable tier(x) to watch the corresponding tier. Or use the search or recommend function for a pick");
			var username = list[global.draftvalues.nextdrafter];
			var newlist = global.draftvalues.users[username]["draftedmons"];
			var val= global.draftvalues.tierPicks - global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
			var word = '!htmlbox  <div><h1>' + username +'</h1><div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';
			var index=1;
			word=word+"<div>";

			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier1" style="background-color: rgb(204, 255, 204)">Show List</button>';
			index++;

			word=word+"</div>";
			word=word+"<div>";
			word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

			index2++;

			word=word+"</div>";
			word=word+"</div>";
			//console.log(word);
			//this.send(global.draftvalues.draftroom, word);
			var typeword = "!htmlbox  <div><h1>"+ username +"</h1>" + printPosTypes() + "</div>"
			//console.log("types " + typeword);
			//this.reply(typeword);
			//return reply(' the next drafter is '+list[0]);
			typeword = name +" paid "+global.currentscore+ " erekredieten for "+ global.nominatedType +".( Erekredieten "+global.draftvalues.users[name]["erekredieten"] +")\n"+typeword;
			return typeword;
		}
	}
	else{
		global.draftvalues.users[name]["totaldraftscore"]=global.draftvalues.users[name]["totaldraftscore"]+calculatescore(global.draftvalues.draftroom,nominatedmon,name);
		global.draftvalues.users[name]["draftedmons"].push(nominatedmon);
		saveTeamsToCloud();
		global.auctioning = false;

		global.draftvalues.nextdrafter = global.draftvalues.nextdrafter + 1;
		var username=list[global.draftvalues.nextdrafter];
		var picksleft = global.draftvalues.nrofpicks - global.draftvalues.users[name]["draftedmons"].length;
		console.log("pickslef " + global.draftvalues.turnorder);
		if(picksleft<1){
			global.draftvalues.turnorder.remove(name);
			console.log("turnorder " + global.draftvalues.turnorder);
			console.log("nextdrafter " + global.draftvalues.nextdrafter);
			username=list[global.draftvalues.nextdrafter];
			if(list.length == 0){
				global.draftvalues.users[toId(global.draftvalues.draftroom)]=[];
				//saveTeamsToCloud();
				global.draftvalues.draftstarted=false;
				return name +" paid "+ global.currentscore+ " erekredieten for "+ global.nominatedmon +".( Erekredieten "+global.draftvalues.users[name]["erekredieten"] +") \n" + 'The draft over is good luck and have fun ';
			}
		}
		if(global.draftvalues.nextdrafter > global.draftvalues.turnorder.length - 1){
			saveTeamsToCloud();
			console.log("next drafter in biglist "+global.draftvalues.nextdrafter);
			global.draftvalues.nextdrafter=0;
			console.log("nextdrafter " + global.draftvalues.nextdrafter);
			username=list[global.draftvalues.nextdrafter];
			if(global.draftvalues.currentStartScore>0){
				global.draftvalues.currentStartScore = global.draftvalues.currentStartScore - 10;
			}
			//global.draftvalues.draftdirectionup[toId(global.draftvalues.draftroom)]=true;
			//console.log("order changed");
			global.draftvalues.picknr[toId(global.draftvalues.draftroom)]= global.draftvalues.picknr[toId(global.draftvalues.draftroom)]+1;
			console.log("picknr is"+ global.draftvalues.picknr[toId(global.draftvalues.draftroom)]);
		}
	}


	var list=global.draftvalues.turnorder;
	username=list[global.draftvalues.nextdrafter];
	console.log("next drafter "+global.draftvalues.nextdrafter + username);
	var newlist=global.draftvalues.users[username]["draftedmons"];
	var picksleft = global.draftvalues.nrofpicks - newlist.length;
	var val= global.draftvalues.tierPicks- global.draftvalues.picknr[toId(global.draftvalues.draftroom)];
	var type = global.draftvalues.users[username]["TerralyzeType"];
	var insert ="";
	if(type != undefined){
		insert = '<div style="color: black; border: 2px solid silver; background-color: rgb(234, 245, 234); padding: 4px;"> Terastalyze type: <psicon type="'+type+'" style="vertical-align:-2px;margin: 0px" /></div>';
	}

	var word = '!htmlbox  <div><h1>' + username+ '</h1>'+insert+'<div>'+ draftmonsprint6(newlist) +'</div><h2>tierhelper </h2><div> Erekredieten: '+global.draftvalues.users[username]["erekredieten"]+' tieredpicks: '+global.draftvalues.users[username]["tieredpicks"]+ " picksleft: " + val +'</div> ';var index=1;
	word=word+"<div>";
	while (index<2){
		word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draftable Tier1" style="background-color: rgb(204, 255, 204)">show list</button>';
		index++;
	}
	word=word+"</div>";
	word=word+"<div>";
	word = word + '<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?recommend" style="background-color: rgb(204, 204, 255)">recommend </button>';

	var index2=1;

	word=word+"</div>";
	word=word+"</div>";
	console.log(word);
	return name +" paid "+global.draftvalues.currentscore+ " erekredieten for "+ global.nominatedmon +".( Erekredieten "+global.draftvalues.users[name]["erekredieten"] +") \n" +word;

	//return this.send(global.draftvalues.draftroom, name +" drafted "+arg+", the next drafter is "+username+ " picks left: " + picksleft);
};
function weaknessForPokemon(monname)
{
	var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];

	var toreturn = {"Grass":0,"Fire":0,"Water":0,"Ice":0,"Bug":0,"Normal":0,"Flying":0,"Poison":0,"Psychic":0,"Ghost":0,"Fighting":0,"Rock":0,"Ground":0,"Electric":0,"Dragon":0,"Fairy":0,"Dark":0,"Steel":0};
	var i=0;
	while(i<postypings.length) {
		var weaknessToType = 0;
		if(monname in  global.draftvalues.mondata){
			weaknessToType += global.draftvalues.weaknesssheet[postypings[i]][global.draftvalues.mondata[monname]["Typing1"]];
			if(global.draftvalues.mondata[monname]["Typing 2"]!=""){
				weaknessToType += global.draftvalues.weaknesssheet[postypings[i]][global.draftvalues.mondata[monname]["Typing 2"]];
			}

		}

		 toreturn[postypings[i]]= weaknessToType;
		 i++;
	}
	return toreturn;
};
