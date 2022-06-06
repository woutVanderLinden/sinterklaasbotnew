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
	global.draftdirectionup[toId(global.draftroom)]= !global.draftdirectionup[toId(global.draftroom)];
	global.nrdrafted=0;
	global.monslists=[];
	 global.picknr[toId(global.draftroom)]=0;
	if(0 == global.currenttier[toId(room)]){
		global.monslists=[];
		global.draftstarted=false;
		return replier.send(global.draftroom,"the draft is over")
	}
	global.tierPicks=global.todraftmons[toId(room)]["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"];
	console.log("ended "+ global.currenttier[toId(room)]);

	var list=global.turnorder;
	if(global.currenttier[toId(room)])
	for (var i = 0; i < list.length; i++) {
		global.drafted[i]=false;
		global.monslists.push(generateMonsList(global.todraftmons[toId(room)],room));
		console.log(global.monslists);
		/*pm them the list we can do this here*/
	}


	/*give everyone a monlist*/
	 replier.send(global.draftroom,"sending drafts");
	pmlists(global.monslists, room, replier);
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
		global.draftdirectionup[toId(global.draftroom)]=true;
		global.currenttier[toId(room)]=global.maxtier;
		//global.todraftmons[toId(room)]=student;
		giftdrafting=true;
		global.draftstarted=true;
		 global.picknr[toId(global.draftroom)]=0;

		global.drafted=[];
		startNewGiftTier(this, room);
		console.log(global.users[toId(by)]["draftedmons"]);
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
		global.currenttier[toId(room)]=0;
		global.todraftmons[toId(room)]=student;
		
		packdrafting=true;
		
		global.draftstarted=true;
		 global.picknr[toId(global.draftroom)]=0;
		global.nextdrafter=0;
		//this.reply('draft order is '+result);
		console.log(draftstarted);
		console.log(global.todraftmons);
		let rawdata2 = fs.readFileSync('draftedmons.json');
		let student2 = JSON.parse(rawdata2);
		if(global.draftedmons={}){
			global.draftedmons=student2;
		}
		var draftmons=global.todraftmons[toId(room)];
		global.draftdirectionup[toId(global.draftroom)]=true;
		var list=global.users[toId(room)];
		var newlist=pickmultimons(draftmons["tierlist"][global.currenttier[toId(room)]]["pokemon"],6,list);
		global.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
	var list=global.users[toId(room)];
		return this.reply('use ?draft {pokemonname} to draft your mons, Choose next mon '+list[0]);
	},
	
	
	
	forcejoin:  function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		if(arg==""){
			return this.reply("no player mentioned")
		}
		if(global.users[toId(room)]==undefined){
			global.users[toId(room)]=[];
		}
		if(global.users[toId(room)].includes(arg)){
			return this.reply(arg+ " already joined the draft")
		}
		else{
			var newuser={};
			newuser["erekredieten"]=global.todraftmons[toId(global.draftroom)]["Points"];
			newuser["draftedmons"]=[];
			newuser["tieredpicks"]=global.todraftmons[toId(room)]["TierPicks"];
			newuser["totaldraftscore"]=0;
			global.users[toId(arg)]=newuser;
			global.turnorder[toId(room)].push(toId(arg));
			console.log(global.users[toId(room)]);
			
			//global.users[toId(room)].push(arg);
			//global.users.push(toId(by));
			return this.reply(arg+ " joined the draft")
		}
	},
	kick:function (arg, by, room, cmd){
		if (!this.isRanked('admin')) return false;
		if(global.users[toId(room)]==undefined){
			global.users[toId(room)]=[];
		}
		if(global.users[toId(room)].includes(arg)){
			global.users[toId(room)]=removeItemOnce(global.users[toId(room)],arg);
		}
		return this.reply("kicked "+arg );
	},
	joindraft: async function (arg, by, room, cmd){

		console.log(global.users);
		var bool = JSON.stringify(global.users) === "{}";
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
				global.users=quotes["pokemon"];


				//return this.reply(draftmonsprint2(list));
			} catch (e) {
				console.error(e);
			}	
			finally{
				await client.close();
			}
		}
	
		if(global.draftstarted==true){
			return this.send(global.draftroom,"draft already started");
		}
		else{

		}


		let rawdata = fs.readFileSync('DraftTest3.json');
		let student = JSON.parse(rawdata);
		console.log(student);


		global.todraftmons[toId(global.draftroom)]=student;
		console.log('drafter added');

		global.maxtier=student["length"];
		console.log(global.users[toId(global.draftroom)]);
		if(global.turnorder==undefined){
			global.turnorder=[];
		}
		if(global.turnorder.includes(toId(by))){
			return this.send(global.draftroom,toId(by)+ " already joined the draft")
		}
		else{

			var newuser={};
			newuser["erekredieten"]=global.todraftmons[toId(global.draftroom)]["Points"];
			newuser["draftedmons"]=[];
			newuser["tieredpicks"]=global.todraftmons[toId(global.draftroom)]["TierPicks"];
			newuser["totaldraftscore"]=0;
			global.users[toId(by)]=newuser;
			global.turnorder.push(toId(by));
			console.log(global.users[toId(by)]);
			return this.send(global.draftroom,toId(by)+ " joined the draft")
		}
	},
	seedraft: 'seedrafters',
	seedrafters: function(arg, by, room, cmd){
		console.log(global.users);
		console.log(global.turnorder[toId(room)]);
		var list=global.turnorder[toId(room)];
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
		global.users[name]["erekredieten"]=global.users[name]["erekredieten"]-parseInt( args[1]);
					
		this.reply(toId(by) +" took "+args[1]+ " erekredieten from "+args[0]); 
		
	},
	taketierpicks: function (	arg, by, room, cmd){
	if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [tierpicktoremove]");
			var name=toId(args[0]);
		global.users[name]["tieredpicks"]=removeItemOnce(global.users[name]["tieredpicks"], parseInt(args[1]));
					
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
				var creds=global.users[toId(by)]["erekredieten"];
			 this.reply(toId(by) +" has " +creds+" erekredieten left."+" and tieredpicks:"+global.users[toId(by)]["tieredpicks"]);
		}
		else{
				var creds=global.users[toId(arg)]["erekredieten"];
			 this.reply(arg +" has "+ creds+" erekredieten left"+" and tieredpicks:"+global.users[toId(arg)]["tieredpicks"]);
		}
	
			
	} catch (e) {
    		console.error(e);
	}	
	finally{
		await client.close();
	}
	},
	viewdraft: async function (arg, by, room, cmd){
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
			return this.reply(draftmonsprint(list));
		}else{
			return this.reply(draftmonsprint2(list));
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
		if(giftdrafting){
			pmlists(global.monslists,room, this);
			return;
		}
		var list=global.turnorder;
		var val= global.tierPicks- global.picknr[toId(global.draftroom)];
		var toreply= "!htmlbox Tier"+ arg + "drafter "+ list[global.nextdrafter] + " picksleft:" +val;
		if(arg==""){
			
		var draftmons=global.todraftmons[toId(room)];
		if(toId(by)==toId(room)){
				return this.reply(toreply+"<div  style='color: black; border: 2px solid red; background-color: rgb(255, 204, 204); padding: 4px;'>"+draftmonsprint5(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"],"rgb(255, 204, 204)")+ "</div>");
		
			}else{
				return  this.reply(toreply+"<div  style='color: black; border: 2px solid red; background-color: rgb(255, 204, 204); padding: 4px;'>"+draftmonsprint5(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"],"rgb(255, 204, 204)")+ "</div>");
		
			}
		}
		else{
			arg=toId(arg);
			//const str = 'abc efg';
			const arg2 = arg.charAt(0).toUpperCase() + arg.slice(1);
			var draftmons=global.todraftmons[toId(room)];
			console.log(arg2);
			if(toId(by)==toId(room)){
				return  this.reply(toreply+"<div  style='color: black; border: 2px solid red; background-color: rgb(255, 204, 204); padding: 4px;'>"+draftmonsprint5(draftmons["tierlist"][arg2]["pokemon"],"rgb(255, 204, 204)")+ "</div>");
		
			}else{
				return  this.reply(toreply+"<div  style='color: black; border: 2px solid red; background-color: rgb(255, 204, 204); padding: 4px;'>"+draftmonsprint5(draftmons["tierlist"][arg2]["pokemon"],"rgb(255, 204, 204)")+ "</div>");
		
			}
		
		}
	},
	startdraft: function (arg, by, room, cmd){
		
		if (!this.isRanked('admin')) return false;
		if(global.draftstarted==true){
			return this.reply("draft already started");
		}
		
	/*
		let rawdata = fs.readFileSync('DraftTest.json');
		let student = JSON.parse(rawdata);
		console.log(student);
		global.currenttier[toId(room)]=1;
		pointdrafting=true;
		global.todraftmons[toId(room)]=student;
		global.maxtier=student["length"];
		°/
	 */
		/*then load the participant list*/
		global.pointdrafting=true;
		global.tierPicks = todraftmons[toId(room)]["freepicks"];
		var list=global.turnorder;
		giftdrafting=false;
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
		global.draftstarted=true;
		 global.picknr[toId(global.draftroom)] = 0;

		global.nextdrafter=0;
		global.draftstarted=true
		this.reply('draft order is '+result);
		console.log(draftstarted);
		console.log(global.todraftmons);
		let rawdata2 = fs.readFileSync('draftedmons.json');
		let student2 = JSON.parse(rawdata2);

		//let rawdata3 = fs.readFileSync('convertcsv.json');
		//global.mondata = JSON.parse(rawdata3);
		//global.draftedmons=quotes;
		//if(global.draftedmons={});
		//}
		var draftmons=global.todraftmons[toId(room)];
		global.draftdirectionup[toId(global.draftroom)]=true;
		var tiername="Tier"+global.currenttier[toId(room)];
		console.log(tiername);
		global.possiblepicks=draftmons["tierlist"];
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][tiername]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][tiername]["pokemon"]));
		
			}

		 */
		this.reply("use ?draftable tier(x) to watch the corresponding tier. Or use the search or recommend function for a pick")
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
		if(!global.draftstarted){
				return this.reply('draft did not start yet');
	
		}
		var list=global.users[toId(room)];
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
		var list=global.turnorder[toId(room)];
        if(giftdrafting){

            var index= global.turnorder.indexOf(name);
            if(global.drafted[index]==true){
                return this.reply('please, wait until everyone is finished');

            }
            var draftlist=global.monslists[index];
            var args=arg.split("-");
            arg='';
            for (var i = 0; i < args.length; i++) {
                if(args[i]=="a"){
                    args[i]="alola";
                }

                if(args[i]=="g"){
                    args[i]="galar";
                }
                args[i]=jsUcfirst(args[i]);
                arg=arg+'-'+jsUcfirst(args[i]);
            }
            arg=arg.substring(1,arg.length);
            var args2=arg.split(" ");
            arg='';
            for (var i = 0; i < args2.length; i++) {
                args2[i]=jsUcfirst(args2[i]);
                arg=arg+' '+jsUcfirst(args2[i]);
            }
            arg=arg.substring(1,arg.length);

            if(!pointdrafting){
                var draftmons=global.todraftmons[toId(room)];
                if(global.monslists[index].includes(arg)||(global.monslists[index].includes('Silvally')&&args[0]=='Silvally')){
                    global.users[name]["draftedmons"].push(arg);
                    removeItemOnce(global.monslists[index],arg);
                    global.drafted[index]=true;
                    console.log(global.monslists[index]);
                    saveTeamsToCloud();
                    this.reply('drafted '+arg);
                }
                else{
                    return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
                }
            }
            var alltrue=true;
            for(var j=0;j<global.drafted.length;j++){
                if(!global.drafted[j]){
                    alltrue=false;
                }
            }
            if(alltrue) {
                global.picknr[toId(global.draftroom)]++;
                if(global.picknr[toId(global.draftroom)]>=global.tierPicks){
                    global.currenttier[toId(room)]--;
                    console.log("started new tier");
                    startNewGiftTier(this, room);
                }
                else{
                    if(global.draftdirectionup[toId(global.draftroom)]){

						global.monslists.push(global.monslists.shift());
                    }
                    else{
						global.monslists.push(global.monslists.shift());
						global.monslists.push(global.monslists.shift());
						global.monslists.push(global.monslists.shift());

					}

                    for (var i = 0; i < global.turnorder.length; i++) {
                        global.drafted[i]=false;
                    }
                    console.log("secondlist "+global.monslists);
                    pmlists(global.monslists,room, this);
                }
            }
            return;
            /* now we still have to redeploy the draft and go on but only if everyone drafted*/
        }

		if(list[global.nextdrafter]!=name){
				return this.reply('it is not your turn');
	
		}
		
		
		console.log(global.users);
		if(global.users[name]["draftedmons"]==undefined){
			global.users[name]["draftedmons"]=[];
		}
		console.log("pointdrafting "+pointdrafting);
		if(!pointdrafting){
			var draftmons=global.todraftmons[toId(room)];
			if(global.possiblepicks.includes(arg)||(global.possiblepicks.includes('Silvally')&&args[0]=='Silvally')){
				global.users[name]["draftedmons"].push(arg);
				draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"],arg);

			}
			else{
					return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
		} 
		else{
			var draftmons=global.todraftmons[toId(room)];
			var i=1;
			while(i<=draftmons["length"]){
				var possiblepic=draftmons["tierlist"]["Tier"+i]["pokemon"];
				if(possiblepic.includes(arg)||(possiblepic.includes('Silvally')&&args[0]=='Silvally')){
					if(global.users[name]["tieredpicks"].includes(i)){
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						global.users[name]["tieredpicks"]=removeItemOnce(global.users[name]["tieredpicks"],i);
						this.reply( name +" used a tierpick to draft a tier "+i+" "+arg+ "( erekredieten. "+global.users[name]["erekredieten"]+" tierpicks "+global.users[name]["tieredpicks"]+ " )");
					
					}
					else{
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						var pointscost=draftmons["tierlist"]["Tier"+i]["points"];
						var currentscore=global.users[name]["erekredieten"];
						var picksleft=draftmons["freepicks"]- global.picknr[toId(global.draftroom)]-1-global.users[name]["tieredpicks"].length;
						console.log("freepicks "+draftmons["freepicks"]+" picknr: "+ global.picknr[toId(global.draftroom)]+" pickleft"+picksleft);
						if(picksleft*40>currentscore-pointscost){
							return this.reply("please make sure you have at least "+picksleft*40+ "Erekredieten left" );
						}
						global.users[name]["erekredieten"]=global.users[name]["erekredieten"]-draftmons["tierlist"]["Tier"+i]["points"];
					
						this.reply( name +" paid "+draftmons["tierlist"]["Tier"+i]["points"]+ " erekredieten.( Erekredieten "+global.users[name]["erekredieten"]+" tieredpicks:"+global.users[name]["tieredpicks"]+ ")");
					
					}
					
					global.users[name]["draftedmons"].push(arg);
					i=100;
				}
				i++;
			}
			if(i!=101){
				return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
			
					
		}
		let data = JSON.stringify(global.draftedmons);
		
		fs.writeFileSync('draftedmons.json', data);
		if(!packdrafting){
			if(global.draftdirectionup[toId(global.draftroom)]){
				global.nextdrafter=global.nextdrafter+1;
				if(global.nextdrafter>=list.length){
					saveTeamsToCloud();
					global.nextdrafter=global.nextdrafter-1;
					global.draftdirectionup[toId(global.draftroom)]=false;
					console.log("order changed  "+global.nextdrafter);
					 global.picknr[toId(global.draftroom)]= global.picknr[toId(global.draftroom)]+1;
					if(pointdrafting&& global.picknr[toId(global.draftroom)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.users[toId(room)]=[];
						
						return this.reply('The draft over is good luck and have fun ');
					}
					if(!pointdrafting){

						if( global.picknr[toId(global.draftroom)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.nextdrafter=global.nextdrafter-1;
				if(global.nextdrafter<0){
					saveTeamsToCloud();
					global.nextdrafter=0;
					global.draftdirectionup[toId(global.draftroom)]=true;
					console.log("order changed");
					 global.picknr[toId(global.draftroom)]= global.picknr[toId(global.draftroom)]+1;
					if(pointdrafting&& global.picknr[toId(global.draftroom)]>=draftmons["freepicks"]){
						global.users[toId(room)]=[];
						//saveTeamsToCloud();
						return this.reply('The draft over is good luck and have fun ');
					}
					console.log("picknr is"+ global.picknr[toId(global.draftroom)]);
					if(!pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]);
						if( global.picknr[toId(global.draftroom)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			}
		
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][global.currenttier]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][global.currenttier]["pokemon"]]));
		
			}

*///pick a new six mons to draft
			var username=list[global.nextdrafter];
			if(pointdrafting){
				return this.reply(toId(global.draftroom), name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.users[username]["erekredieten"]+" tieredpicks:"+global.users[username]["tieredpicks"]+" )");
			}
			else{

				return this.reply( name +" drafted "+arg+", the next drafter is "+username);
			}
	//var list=global.users[toId(room)];
		 }
		else{
		var newlist=pickmultimons(draftmons["tierlist"][global.currenttier[toId(room)]]["pokemon"],6,list);
			global.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
		return this.reply(toId(global.draftroom),' Choose next mon '+list[0]);
		}
	},
	forcepickaltmon:  function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [montopick]");
		if(!global.draftstarted){
				return this.reply('draft did not start yet');
	
		}
			//var list=global.users[toId(room)];
		var list=global.turnorder[toId(room)]
		var name=toId(args[0]);
		if(global.draftedmons[name]==undefined){
			global.draftedmons[name]=[];
		}
		args[1]=jsUcfirst(args[1]);
		var draftmons=global.todraftmons[toId(room)];
			
					global.users[name]["draftedmons"].push(args[1]);
			//global.users[name]["draftedmons"].push(args[1]);
		//	draftmons["tierlist"][global.currenttier[toId(room)]]["pokemon"]=removeItemOnce(draftmons["tierlist"][global.currenttier[toId(room)]]["pokemon"],args[1]);
		
		
		if(!packdrafting){
			if(global.draftdirectionup[toId(global.draftroom)]){
				global.nextdrafter=global.nextdrafter+1;
				if(global.nextdrafter>=list.length){
					saveTeamsToCloud();
					global.nextdrafter=global.nextdrafter-1;
					global.draftdirectionup[toId(global.draftroom)]=false;
					console.log("order changed  "+global.nextdrafter);
					 global.picknr[toId(global.draftroom)]= global.picknr[toId(global.draftroom)]+1;
					if(pointdrafting&& global.picknr[toId(global.draftroom)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.users[toId(room)]=[];
						
						return this.reply('The draft over is good luck and have fun ');
					}
					if(!pointdrafting){

						if( global.picknr[toId(global.draftroom)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.nextdrafter=global.nextdrafter-1;
				if(global.nextdrafter<0){
					saveTeamsToCloud();
					global.nextdrafter=0;
					global.draftdirectionup[toId(global.draftroom)]=true;
					console.log("order changed");
					 global.picknr[toId(global.draftroom)]= global.picknr[toId(global.draftroom)]+1;
					if(pointdrafting&& global.picknr[toId(global.draftroom)]>=draftmons["freepicks"]){
						global.users[toId(room)]=[];
						//saveTeamsToCloud();
						return this.reply('The draft over is good luck and have fun ');
					}
					console.log("picknr is"+ global.picknr[toId(global.draftroom)]);
					if(!pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]);
						if( global.picknr[toId(global.draftroom)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			}
		
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][global.currenttier]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][global.currenttier]["pokemon"]]));
		
			}

*///pick a new six mons to draft
			var username=list[global.nextdrafter];
			if(pointdrafting){
				return this.reply( name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.users[username]["erekredieten"]+" tieredpicks:"+global.users[username]["tieredpicks"]+" )");
			}
			else{

				return this.reply( name +" drafted "+arg+", the next drafter is "+username);
			}
	//var list=global.users[toId(room)];
		 }
		else{
		var newlist=pickmultimons(draftmons["tierlist"][global.currenttier[toId(room)]]["pokemon"],6,list);
			global.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
			return this.reply(' Choose next mon '+list[0]);
		}
		return this.reply( name +' forcibly drafted alternative mon not on the list '+args[1]+ ', the next drafter is '+list[global.nextdrafter]);
	
	},
	
	showmonscore:  function (arg, by, room, cmd) {
		arg=jsUcfirst(toId(arg));
		return this.reply(arg +" score is "+calculatescore(room,arg,toId(by)));
	},
	pickmon: 'draft',
	
	
	draft:  function (arg, by, room, cmd) {
				console.log(draftstarted);
				var name=toId(by);
		if(!global.turnorder.includes(name)){
			return this.reply("you're not in the draft " + name);
		}
				if(giftdrafting){

					var index= global.turnorder.indexOf(name);
					if(global.drafted[index]==true){
						return this.send(global.draftroom, 'please, wait until everyone is finished '+ name);

					}
					var draftlist=global.monslists[index];
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

					if(!pointdrafting){
						var draftmons=global.todraftmons[toId(global.draftroom)];
						if(global.monslists[index].includes(arg)||(global.monslists[index].includes('Silvally')&&args[0]=='Silvally')){
							global.users[name]["draftedmons"].push(arg);
							removeItemOnce(global.monslists[index],arg);
							global.drafted[index]=true;
							console.log(global.monslists[index]);
							saveTeamsToCloud();
							this.send(global.draftroom, name + 'drafted '+arg);
						}
						else{
							return this.send(global.draftroom, arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
						}
					}
					var alltrue=true;
					for(var j=0;j<global.drafted.length;j++){
						if(!global.drafted[j]){
							alltrue=false;
						}
					}
					if(alltrue) {
						global.picknr[toId(global.draftroom)]++;
						if(global.picknr[toId(global.draftroom)]>=global.tierPicks){
							global.currenttier[toId(global.draftroom)]--;
							console.log("started new tier");
							startNewGiftTier(this, global.draftroom);
						}
						else{
							if(global.draftdirectionup[toId(global.draftroom)]){

								global.monslists.push(global.monslists.shift());
							}
							else{
								global.monslists.push(global.monslists.shift());
								global.monslists.push(global.monslists.shift());
								global.monslists.push(global.monslists.shift());

							}
//
							for (var i = 0; i < global.turnorder.length; i++) {
								global.drafted[i]=false;
							}
							console.log("secondlist "+global.monslists);
							pmlists(global.monslists,global.draftroom, this);
							console.log(global.users[toId(by)]["draftedmons"]);
						}
					}
					return;
					/* now we still have to redeploy the draft and go on but only if everyone drafted*/
				}
		if(!global.draftstarted){

				return this.reply('draft did not start yet');
	
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
					if(args[i]!="o") {
						args[i] = jsUcfirst(args[i]);
						arg = arg + '-' + jsUcfirst(args[i]);
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
			console.log(arg);
			var list=global.turnorder;

			console.log("drafter" + list[global.nextdrafter]);
		if(list[global.nextdrafter]!=toId(by)){
				return this.send(global.draftroom,'it is not your turn');
	
		}
		
		var name=toId(by);
		console.log(global.users);
		if(global.users[name]["draftedmons"]==undefined){
			global.users[name]["draftedmons"]=[];
		}
		console.log("pointdrafting "+pointdrafting);
		if(!pointdrafting){
			var draftmons=global.todraftmons[toId(room)];
			if(global.possiblepicks.includes(arg)||(global.possiblepicks.includes('Silvally')&&args[0]=='Silvally')){
				global.users[name]["draftedmons"].push(arg);
				draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"],arg);

			}
			else{
					return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
		} 
		else{
			var draftmons=global.todraftmons[toId(global.draftroom)];
			var i=1;
			console.log(draftmons);
			while(i<=draftmons["length"]){
				var possiblepic=draftmons["tierlist"]["Tier"+i]["pokemon"];
				if(possiblepic.includes(arg)){
					if(global.users[name]["tieredpicks"].includes(i)){
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						global.users[name]["tieredpicks"]=removeItemOnce(global.users[name]["tieredpicks"],i);
						this.send(global.draftroom, name +" used a tierpick to draft a tier "+i+" "+arg+ " (erekredieten. "+global.users[name]["erekredieten"] +"tierpicks "+global.users[name]["tieredpicks"]+ " )");
						global.users[name]["totaldraftscore"]=global.users[name]["totaldraftscore"]+calculatescore(room,arg,name);
					}
					else{
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						var pointscost=draftmons["tierlist"]["Tier"+i]["points"];
						var currentscore=global.users[name]["erekredieten"];
						var picksleft=draftmons["freepicks"]-global.picknr[toId(global.draftroom)]-1-global.users[name]["tieredpicks"].length -1;
						console.log("freepicks "+draftmons["freepicks"]+" picknr: "+global.picknr[toId(global.draftroom)]+" pickleft "+picksleft);
						if(picksleft*40>currentscore-pointscost){
							return this.reply("please make sure you have at least "+picksleft*40+ " Erekredieten left" );
						}
						global.users[name]["erekredieten"]=global.users[name]["erekredieten"]-draftmons["tierlist"]["Tier"+i]["points"];

						this.send(global.draftroom, name +" paid "+draftmons["tierlist"]["Tier"+i]["points"]+ " erekredieten for "+ arg +".( Erekredieten "+global.users[name]["erekredieten"]+" tieredpicks:"+global.users[name]["tieredpicks"]+ ")");
						global.users[name]["totaldraftscore"]=global.users[name]["totaldraftscore"]+calculatescore(room,arg,name);
					}
					
					global.users[name]["draftedmons"].push(arg);
					i=100;
				}
				i++;
			}
			if(i!=101){
				return this.reply(arg +' is no longer available.'+ name+' pick a different mon or check your spelling. ' );
			}
			
					
		}
		let data = JSON.stringify(global.draftedmons);
		
		fs.writeFileSync('draftedmons.json', data);
		if(!packdrafting){
			if(global.draftdirectionup[toId(global.draftroom)]){
				global.nextdrafter=global.nextdrafter+1;
				if(global.nextdrafter>=list.length){
					saveTeamsToCloud();
					global.nextdrafter=global.nextdrafter-1;
					global.draftdirectionup[toId(global.draftroom)]=false;
					console.log("order changed  "+global.nextdrafter);
					 global.picknr[toId(global.draftroom)]= global.picknr[toId(global.draftroom)]+1;
					if(pointdrafting&& global.picknr[toId(global.draftroom)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.users[toId(room)]=[];
						
						return this.send(toId(global.draftroom),'The draft over is good luck and have fun ');
					}
					if(!pointdrafting){

						if( global.picknr[toId(global.draftroom)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.send(toId(global.draftroom), name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.nextdrafter=global.nextdrafter-1;
				if(global.nextdrafter<0){
					saveTeamsToCloud();
					global.nextdrafter=0;
					global.draftdirectionup[toId(global.draftroom)]=true;
					console.log("order changed");
					global.picknr[toId(global.draftroom)]= global.picknr[toId(global.draftroom)]+1;
					if(pointdrafting&& global.picknr[toId(global.draftroom)]>=draftmons["freepicks"]){
						global.users[toId(room)]=[];
						//saveTeamsToCloud();
						return this.send(toId(global.draftroom),'The draft over is good luck and have fun ');
					}
					console.log("picknr is"+ global.picknr[toId(global.draftroom)]);
					if(!pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]);
						if( global.picknr[toId(global.draftroom)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.send( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			}
		
		/*
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][global.currenttier]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][global.currenttier]["pokemon"]]));
		
			}

*///pick a new six mons to draft
			var username=list[global.nextdrafter];
			if(pointdrafting){
				return this.send(global.draftroom, name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.users[username]["erekredieten"]+" tieredpicks:"+global.users[username]["tieredpicks"]+" )");
			}
			else{

				return this.send(global.draftroom, name +" drafted "+arg+", the next drafter is "+username);
			}
	//var list=global.users[toId(room)];
		 }
		else{
		var newlist=pickmultimons(draftmons["tierlist"][global.currenttier[toId(room)]]["pokemon"],6,list);
			global.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(newlist));
		
			}else{
				this.reply(draftmonsprint2(newlist));
		
			}
		return this.send(global.draftroom,' Choose next mon '+list[0]);
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
		this.reply('/invite kingbaruk,'+'groupchat-sinterklaas-'+arg);
		return this.reply('/makegroupchat '+arg);
	
	},
	creategiftdraft:function (arg, by, room, cmd) {
		global.draftroom= room;
		console.log(global.draftroom);
		this.reply("!htmlbox <p> hi </p>");
		this.send(global.draftroom, '!htmlbox  <h1>Giftdraft</h1> <p>Press this button or ?joindraft to join </p> <button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?joindraft"> joindraft </button>' );

	},

	createdraft:function (arg, by, room, cmd) {
		global.draftroom= room;
		console.log(global.draftroom);
		this.reply("!htmlbox <p> hi </p>");
		this.send(global.draftroom, '!htmlbox  <h1>normal draft</h1> <p>Press this button or ?joindraft to join </p> <button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?joindraft"> joindraft </button>' );

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
			draftmons=global.todraftmons[Object.keys(global.todraftmons)[0]];
		}
		else{
			draftmons=global.todraftmons[toId(room)];
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
					if(filtertypings.includes(global.mondata[monname]["Typing 2"])||filtertypings.includes(global.mondata[monname]["Typing1"])){

					}
					else{
						t=t*0;
					}

				}if(filterroles.length>0){
					var r=0;

					while(r<filterroles.length){
						if((global.mondata[monname][filterroles[r]]||0)==0){
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
		//global.users[name]["erekredieten"]
		//mondata
	},

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
				word= word+"<td>"+postypings[i*3+j]+ ": " + weaktable[postypings[i*3+j]] + +"</td>";
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
		var userlist=global.turnorder[toId(room)];
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
			var draftsshown=3;
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
			draftmons=global.todraftmons[Object.keys(global.todraftmons)[0]];
		}
		else{
			draftmons=global.todraftmons[toId(room)];
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
	var monschosen=global.users[name]["draftedmons"];
	var i=0;
	while(i<monschosen.length){
		var currentmon=monschosen[i];
		if(!typings.includes(global.mondata[currentmon]["Typing1"])){
			typings.push(global.mondata[currentmon]["Typing1"]);
		}
		if(global.mondata[currentmon]["Typing 2"]!=undefined){
			
			if(!typings.includes(global.mondata[currentmon]["Typing 2"])){
				typings.push(global.mondata[currentmon]["Typing 2"]);
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
				if(typings.includes(global.mondata[monname]["Typing1"])){
					if(global.mondata[monname]["Typing 2"]!=undefined){
						
							if(typings.includes(global.mondata[monname]["Typing 2"])){

							}
							else{
								t=t+5;
							}
						
						
					}
				}
				else{
					console.log(global.mondata[monname]["Typing 2"]);
					if(global.mondata[monname]["Typing 2"]!=undefined){
						if(typings.includes(global.mondata[monname]["Typing 2"])){
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
					t=t+(global.mondata[monname]["entryhazards"]||0);
				 }
				console.log("postentry"+t);
				if(totalremovers<5){
					t=t+(global.mondata[monname]["hazardremoval"]||0);
				 }
				if(totalitemremover<5){
					t=t+(global.mondata[monname]["itemremover"]||0);
				}
				if((global.mondata[monname]["pivot"]||0)>0){
					
					t=t+(global.mondata[monname]["pivot"]||0);
				}
				if(totalclerics<5){
					t=t+(global.mondata[monname]["cleric"]||0);
				}
				if(totalscarfs<5){
					t=t+(global.mondata[monname]["scarf"]||0);
				}
				var physicalt=0.0;
				var specialt=0.0;
				
				if(totalphysicals>5){
					var divider=totalphysicals/5+.5;
					physicalt=physicalt+(global.mondata[monname]["physicalsweeper"]||0)/divider;	
				}
				else{
					physicalt=physicalt+(global.mondata[monname]["physicalsweeper"]||0);
				}
				
				if(totalphysicalb>5){
					var divider=totalphysicalb/5+.5;
					physicalt=physicalt+(global.mondata[monname]["physicalbulkyattacker"]||0)/divider;	
				}
				else{
					physicalt=physicalt+(global.mondata[monname]["physicalbulkyattacker"]||0);
				}
				console.log("beforesetup"+t);
				if(totalphysicalup>5){
					var divider=totalphysicalup/5+.5;
					physicalt=physicalt+(global.mondata[monname]["physicalsetup"]||0)/divider;	
				}
				else{
					physicalt=physicalt+(global.mondata[monname]["physicalsetup"]||0);
				}
				console.log("aftersetup"+t);
				if(totalspecials>5){
					var divider=totalspecials/5+.5;
					specialt=specialt+(global.mondata[monname]["specialsweeper"]||0)/divider;	
				}
				else{
					specialt=specialt+(global.mondata[monname]["specialsweeper"]||0);
				}
				if(totalspecialb>5){
					var divider=totalspecialb/5+.5;
					specialt=specialt+(global.mondata[monname]["specialbulkyattacker"]||0)/divider;	
				}
				else{
					specialt=specialt+(global.mondata[monname]["specialbulkyattacker"]||0);
				}
				if(totalspecialup>5){
					var divider=totalspecialup/5+.5;
					specialt=specialt+(global.mondata[monname]["specialsetup"]||0)/divider;	
				}
				else{
					specialt=specialt+(global.mondata[monname]["specialsetup"]||0);
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
					t=t+(global.mondata[monname]["physicalwall"]||0)/divider;	
				}
				else{
					t=t+(global.mondata[monname]["physicalwall"]||0);
				}
				if(totalspecialw>5){
					var divider=totalspecialw/5+.5;
					t=t+(global.mondata[monname]["specialwall"]||0)/divider;	
				}
				else{
					t=t+(global.mondata[monname]["specialwall"]||0);
				}
				console.log("zfterwall"+t);
				t=t+(global.mondata[monname]["speedcontrol"]||0);
				if(totalprio>5){
					var divider=totalprio/5+.5;
					t=t+(global.mondata[monname]["priority"]||0)/divider;	
				}
				else{
					t=t+(global.mondata[monname]["priority"]||0);
				}
				if(totalstatus<8){
					t=t+(global.mondata[monname]["status"]||0);
				}
				if(totalscreen<8){
					t=t+(global.mondata[monname]["screens"]||0);
				}
				if((global.mondata[monname]["sun"]||0)==6){
					t=t+3;
				}
				else{
					if(hassun){
						t=t+(global.mondata[monname]["sun"]||0);
					}
				}
				if((global.mondata[monname]["rain"]||0)==6){
					t=t+3;
				}
				else{
					if(hasrain){
						t=t+(global.mondata[monname]["rain"]||0);
					}
				}
				if((global.mondata[monname]["hail"]||0)==6){
					t=t+3;
				}
				else{
					if(hashail){
						t=t+(global.mondata[monname]["hail"]||0);
					}
				}
				if((global.mondata[monname]["sand"]||0)==6){
					t=t+3;
				}
				else{
					if(hassand){
						t=t+(global.mondata[monname]["sand"]||0);
					}
				}
				console.log(t);
				if(filtertypings.length>0){
					if(filtertypings.includes(global.mondata[monname]["Typing 2"])||filtertypings.includes(global.mondata[monname]["Typing1"])){
						
					}
					else{
						t=t*0;
					}
					
				}if(filterroles.length>0){
					var r=0;
					while(r<filterroles.length){
						if((global.mondata[monname][filterroles[r]]||0)==0){
							t=t*0;
						}
						r++;
					}
					
					
				}
				t=99-t;
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
		this.reply(draftmonsprint4(newlistsix,draftsshown,by,room));
		//global.users[name]["erekredieten"]
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
	//var list=global.users[toId(room)];
	if(list.length === 0){
		return;
	}
	var name=toId(list[0]);

	var listtoremove=global.draftedmons[name];
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
 function draftmonsprint2(arg){
		arg=arg.sort();
		var result='!htmlbox ';
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
	var result='';
	for (var i = 0; i < arg.length; i++) {
		console.log("here "+arg[i]);
		//Do something
		//<a href="//dex.pokemonshowdown.com/pokemon/cofagrigus" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="Cofagrigus" style="vertical-align:-7px;margin:-2px" />Cofagrigus</a>
		var name=arg[i];
		var word='<button name="send" value="/msgroom nederlands, /botmsg sinterklaas, ?draft '+name +'" style="background-color:'+color +'">';
		word=word+'<a href="//dex.pokemonshowdown.com/pokemon/'+ name+'" target="_blank" class="subtle" style="white-space:nowrap"><psicon pokemon="'+name+'" style="vertical-align:-7px;margin:-2px" />'+name+'</a>';
		word=word+'</button>';
		result=result+word;


	}
	result=result.substring(0,result.length-1);
	result=result;
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
		quotes["pokemon"]=global.users;
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
	var list=global.turnorder;

		resultlist.push.apply(resultlist,pickmultimons(monlist["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"],6,list));

		console.log(i);

		console.log(resultlist);

	console.log(resultlist);
	return resultlist;
}
function startNewTier(room,by,elem){
	//load mons of the new tierlist
	//reshuffle list of users
	//if last tier end draft
	global.draftdirectionup[toId(global.draftroom)]=true;
	//saveTeamsToCloud();
	var draftmons=global.todraftmons[toId(room)];
	global.currenttier[toId(room)]=global.currenttier[toId(room)]+1;
	console.log("draftlenght"+draftmons["length"]+ " current tier " +global.currenttier[toId(room)]);
	if(global.currenttier[toId(room)]>draftmons["length"]){
		global.pointdrafting=true;
		global.pointpicks=0;
		if(draftmons["freepicks"]<=global.pointpicks){
			
			global.users[toId(room)]=[];
			return elem.reply('The draft over is good luck and have fun ');
		}
	}
	//elem.reply('new tier started');
	 global.picknr[toId(global.draftroom)]=0;
	var list=global.turnorder[toId(room)]
		
		list=shuffle(list);
		
	var result='';
		for (var i = 0; i < list.length; i++) {
		
    //Do something
			
				result=result+","+list[i];
			
			
		}
		result=result.substring(1,result.length);
		global.draftstarted=true;
		
		global.nextdrafter=0;
		elem.reply('draft order is '+result);
	
		if(packdrafting){
		console.log(global.todraftmons);
		
			var newlist=pickmultimons(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"],6,list);
			global.possiblepicks=newlist;
		if(toId(by)==toId(room)){
				elem.reply(draftmonsprint(newlist));
		
			}else{
			 elem.reply(draftmonsprint2(newlist));
		
			}
		return elem.reply(' Choose next mon '+list[0]);
		}
	else{
		if(!pointdrafting){
			global.possiblepicks=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"];
		//global.todraftmons=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"];
		if(toId(by)==toId(room)){
				elem.reply(draftmonsprint(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]));
		
			}else{
				elem.reply(draftmonsprint2(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]));
		
			}
			return elem.reply(' the next drafter is '+list[0]);
		}
		else{
			global.possiblepicks=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"];
		//global.todraftmons=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"];
		if(toId(by)==toId(room)){
				//elem.reply(draftmonsprint(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]));
		
			}else{
				//elem.reply(draftmonsprint2(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]));
		
			}
			return elem.reply(' the next drafter is '+list[0]+ " ("+global.users[list[0]]["erekredieten"]+"Erekredieten left)");
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
			draftmons=global.todraftmons[Object.keys(global.todraftmons)[0]];
		}
		else{
			draftmons=global.todraftmons[toId(room)];
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
	var monschosen=global.users[name]["draftedmons"];
	var i=0;
	while(i<monschosen.length){
		var currentmon=monschosen[i];
		if(!typings.includes(mondata[currentmon]["Typing1"])){
			typings.push(mondata[currentmon]["Typing1"]);
		}
		if(mondata[currentmon]["Typing 2"]!=undefined){
			
			if(!typings.includes(mondata[currentmon]["Typing 2"])){
				typings.push(mondata[currentmon]["Typing 2"]);
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
				if(typings.includes(global.mondata[monname]["Typing1"])){
					if(global.mondata[monname]["Typing 2"]!=undefined){
						
							if(typings.includes(global.mondata[monname]["Typing 2"])){

							}
							else{
								t=t+5;
							}
						
						
					}
				}
				else{
					console.log(global.mondata[monname]["Typing 2"]);
					if(global.mondata[monname]["Typing 2"]!=undefined){
						if(typings.includes(global.mondata[monname]["Typing 2"])){
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
					t=t+(global.mondata[monname]["entryhazards"]||0);
				 }
				console.log("postentry"+t);
				if(totalremovers<5){
					t=t+(global.mondata[monname]["hazardremoval"]||0);
				 }
				if(totalitemremover<5){
					t=t+(global.mondata[monname]["itemremover"]||0);
				}
				if((global.mondata[monname]["pivot"]||0)>0){
					
					t=t+(global.mondata[monname]["pivot"]||0)+totalpivots*.1;
				}
				if(totalclerics<5){
					t=t+(global.mondata[monname]["cleric"]||0);
				}
				if(totalscarfs<5){
					t=t+(global.mondata[monname]["scarf"]||0);
				}
				var physicalt=0.0;
				var specialt=0.0;
				
				if(totalphysicals>5){
					var divider=totalphysicals/5+.5;
					physicalt=physicalt+(global.mondata[monname]["physicalsweeper"]||0)/divider;	
				}
				else{
					physicalt=physicalt+(global.mondata[monname]["physicalsweeper"]||0);
				}
				
				if(totalphysicalb>5){
					var divider=totalphysicalb/5+.5;
					physicalt=physicalt+(global.mondata[monname]["physicalbulkyattacker"]||0)/divider;	
				}
				else{
					physicalt=physicalt+(global.mondata[monname]["physicalbulkyattacker"]||0);
				}
				console.log("beforesetup"+t);
				if(totalphysicalup>5){
					var divider=totalphysicalup/5+.5;
					physicalt=physicalt+(global.mondata[monname]["physicalsetup"]||0)/divider;	
				}
				else{
					physicalt=physicalt+(global.mondata[monname]["physicalsetup"]||0);
				}
				console.log("aftersetup"+t);
				if(totalspecials>5){
					var divider=totalspecials/5+.5;
					specialt=specialt+(global.mondata[monname]["specialsweeper"]||0)/divider;	
				}
				else{
					specialt=specialt+(global.mondata[monname]["specialsweeper"]||0);
				}
				if(totalspecialb>5){
					var divider=totalspecialb/5+.5;
					specialt=specialt+(global.mondata[monname]["specialbulkyattacker"]||0)/divider;	
				}
				else{
					specialt=specialt+(global.mondata[monname]["specialbulkyattacker"]||0);
				}
				if(totalspecialup>5){
					var divider=totalspecialup/5+.5;
					specialt=specialt+(global.mondata[monname]["specialsetup"]||0)/divider;	
				}
				else{
					specialt=specialt+(global.mondata[monname]["specialsetup"]||0);
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
					t=t+(global.mondata[monname]["physicalwall"]||0)/divider;	
				}
				else{
					t=t+(global.mondata[monname]["physicalwall"]||0);
				}
				if(totalspecialw>5){
					var divider=totalspecialw/5+.5;
					t=t+(global.mondata[monname]["specialwall"]||0)/divider;	
				}
				else{
					t=t+(global.mondata[monname]["specialwall"]||0);
				}
				console.log("zfterwall"+t);
				t=t+(global.mondata[monname]["speedcontrol"]||0);
				if(totalprio>5){
					var divider=totalprio/5+.5;
					t=t+(global.mondata[monname]["priority"]||0)/divider;	
				}
				else{
					t=t+(global.mondata[monname]["priority"]||0);
				}
				if(totalstatus<8){
					t=t+(global.mondata[monname]["status"]||0);
				}
				if(totalscreen<8){
					t=t+(global.mondata[monname]["screens"]||0);
				}
				if((global.mondata[monname]["sun"]||0)==6){
					t=t+3;
				}
				else{
					if(hassun){
						t=t+(global.mondata[monname]["sun"]||0);
					}
				}
				if((global.mondata[monname]["rain"]||0)==6){
					t=t+3;
				}
				else{
					if(hasrain){
						t=t+(global.mondata[monname]["rain"]||0);
					}
				}
				if((global.mondata[monname]["hail"]||0)==6){
					t=t+3;
				}
				else{
					if(hashail){
						t=t+(global.mondata[monname]["hail"]||0);
					}
				}
				if((global.mondata[monname]["sand"]||0)==6){
					t=t+3;
				}
				else{
					if(hassand){
						t=t+(global.mondata[monname]["sand"]||0);
					}
				}
				console.log(t);
				if(filtertypings.length>0){
					if(filtertypings.includes(global.mondata[monname]["Typing 2"])||filtertypings.includes(global.mondata[monname]["Typing1"])){
						
					}
					else{
						t=t*0;
					}
					
				}if(filterroles.length>0){
					var r=0;
					while(r<filterroles.length){
						if((global.mondata[monname][filterroles[r]]||0)==0){
							t=t*0;
						}
						r++;
					}
					
					
				}
				
	
	
	return t;
};
function pmlists(monlists, room, vart)
{
	console.log(global.turnorder);
	console.log(monlists +"hi");
	var directionword = "down";
	if(global.draftdirectionup[toId(global.draftroom)]){
		directionword = "up"
	}
	var val= global.tierPicks- global.picknr[toId(global.draftroom)];
	var toreply= "!htmlbox Tier"+ global.currenttier[toId(room)]+ " draftdirection: "+directionword+ " picksleft:" +val;
	console.log(toreply);
	for(let i=0; i<global.turnorder.length; i++){
		var word = "<div  style='color: black; border: 2px solid "

		if(i==1){
			word = word + "red; background-color: rgb(255, 204, 204); padding: 4px;'>";
			word = word+"<p><b>"+ global.turnorder[i]+"</b>";
			word = word+"<p>"+draftmonsprint5(monlists[i],"rgb(255, 204, 204)")+"</p></p></div>";
		}
		else{
			if(i==2){
				word = word + "blue; background-color: rgb(153, 204, 255); padding: 4px;'>";
				word = word+"<p><b>"+ global.turnorder[i]+"</b>";
				word = word+"<p>"+draftmonsprint5(monlists[i],"rgb(153, 204, 255)")+"</p></p></div>";
			}
			else{
				if(i==3){
					word = word + "green; background-color: rgb(153, 255, 153); padding: 4px;'>";
					word = word+"<p><b>"+ global.turnorder[i]+"</b>";
					word = word+"<p>"+draftmonsprint5(monlists[i],"rgb(153, 255, 153)")+"</p></p></div>";
				}else{
					word = word + "purple; background-color: rgb(204, 204, 255); padding: 4px;'>";
					word = word+"<p><b>"+ global.turnorder[i]+"</b>";
					word = word+"<p>"+draftmonsprint5(monlists[i], "rgb(204, 204, 255)")+"</p></p></div>";
				}
			}
		}


		toreply = toreply+word;
	}
	 vart.send(global.draftroom,"!code "+toreply );
	return vart.send(global.draftroom,toreply);
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
	var monschosen=global.users[name]["draftedmons"];
	var i=0;
	var toreturn = {"Grass":0,"Fire":0,"Water":0,"Ice":0,"Bug":0,"Normal":0,"Flying":0,"Poison":0,"Psychic":0,"Ghost":0,"Fighting":0,"Rock":0,"Ground":0,"Electric":0,"Dragon":0,"Fairy":0,"Dark":0,"Steel":0};
	while(i<monschosen.length) {
		var weaknessForMon = weaknessForPokemon(monschosen[i], global);
		var j=0;
		while(j<postypings.length) {
			toreturn[postypings[i]] = toreturn[postypings[i]]+ weaknessForMon[postypings[i]];
			j++;
		}
	}
	return toreturn;
};
function weaknessForPokemon(monname)
{
	var postypings=["Grass","Fire","Water","Ice","Bug","Normal","Flying","Poison","Psychic","Ghost","Fighting","Rock","Ground","Electric","Dragon","Fairy","Dark","Steel"];
	var i=0;
	var toreturn = {"Grass":0,"Fire":0,"Water":0,"Ice":0,"Bug":0,"Normal":0,"Flying":0,"Poison":0,"Psychic":0,"Ghost":0,"Fighting":0,"Rock":0,"Ground":0,"Electric":0,"Dragon":0,"Fairy":0,"Dark":0,"Steel":0};
	while(i<postypings.length) {
		var weaknessToType = 0;

		 weaknessToType = global.weaknesssheet[postypings[i]][global.mondata[monname]["Typing 1"]];
		 if(!global.mondata[monname]["Typing 2"]===""){
			 weaknessToType += global.weaknesssheet[postypings[i]][global.mondata[monname]["Typing 2"]];
		 }
		console.log(weaknessToType);
		 toreturn[postypings[i]]= weaknessToType;
		 i++;
	}
	return toreturn;
};