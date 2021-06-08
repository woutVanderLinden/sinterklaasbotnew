/*
	Admin Commands
*/

const {MongoClient} = require('mongodb');
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
		
		global.draftstarted[toId(room)]=true;
		global.picknr[toId(room)]=0;
		global.nextdrafter[toId(room)]=0;
		//this.reply('draft order is '+result);
		console.log(draftstarted);
		console.log(global.todraftmons);
		let rawdata2 = fs.readFileSync('draftedmons.json');
		let student2 = JSON.parse(rawdata2);
		if(global.draftedmons={}){
			global.draftedmons=student2;
		}
		var draftmons=global.todraftmons[toId(room)];
		global.draftdirectionup[toId(room)]=true;
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
			newuser["erekredieten"]=500;
			newuser["draftedmons"]=[];
			newuser["tieredpicks"]=global.todraftmons[toId(room)]["TierPicks"];
			global.users[toId(by)]=newuser;
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
	joindraft: function (arg, by, room, cmd){
			let rawdata = fs.readFileSync('DraftTest.json');
		let student = JSON.parse(rawdata);
		console.log(student);
	
	
		global.todraftmons[toId(room)]=student;
		console.log('drafter added');
		console.log(global.users);
		console.log(global.users[toId(room)]);
		if(global.turnorder[toId(room)]==undefined){
			global.turnorder[toId(room)]=[];
		}
		if(global.turnorder[toId(room)].includes(toId(by))){
			return this.reply(toId(by)+ " already joined the draft")
		}
		else{
			var newuser={};
			newuser["erekredieten"]=500;
			newuser["draftedmons"]=[];
			newuser["tieredpicks"]=global.todraftmons[toId(room)]["TierPicks"];
			global.users[toId(by)]=newuser;
			global.turnorder[toId(room)].push(toId(by));
			console.log(global.users[toId(room)]);
			return this.reply(toId(by)+ " joined the draft")
		}
	},
	seedraft: 'seedrafters',
	seedrafters: function(arg, by, room, cmd){
		console.log(global.users);
		console.log(global.users[toId(room)]);
		var list=global.users[toId(room)].keys;
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
		name=toId(args[0]);
		global.users[name]["erekredieten"]=global.users[name]["erekredieten"]-parseInt( args[1]);
					
		this.reply(toId(by) +" took "+args[1]+ " erekredieten from "+args[0]); 
		
	},
	taketierpicks: function (	arg, by, room, cmd){
	if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [tierpicktoremove]");
			name=toId(args[0]);
		global.users[name]["tieredpicks"]=removeItemOnce(global.users[name]["tieredpicks"], args[1]);
					
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
				var creds=quotes["pokemon"][toId(by)]["erekredieten"];
			 this.reply(toId(by) +" has " +creds+" erekredieten left."+" and tieredpicks:"+global.users[toId(by)]["erekredieten"]);
		}
		else{
				var creds=quotes["pokemon"][toId(arg)]["erekredieten"];
			 this.reply(arg +" has "+ creds+" erekredieten left"+" and tieredpicks:"+global.users[toId(arg)]["erekredieten"]);
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
	
			return this.reply(draftmonsprint2(list));
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
	viewdraft2: function (arg, by, room, cmd){
		
		
		let rawdata = fs.readFileSync('draftedmons.json');
		let student = JSON.parse(rawdata);
		if(arg==''){
			if(toId(by)==toId(room)){
				
				return this.reply(draftmonsprint3(student[toId(by)]));
		
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
				return this.reply(draftmonsprint3(student[arg]["drafted"]));
			
			}else{
				return this.reply(draftmonsprint2(student[arg]["drafted"]));
			
			}
		}
	},
	draftable:'drafttable',
	drafttable: function (arg, by, room, cmd){
		if(arg==""){
			
		var draftmons=global.todraftmons[toId(room)];
		if(toId(by)==toId(room)){
				return this.reply(draftmonsprint(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]));
		
			}else{
				return this.reply(draftmonsprint2(draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["pokemon"]));
		
			}
		}
		else{
			arg=toId(arg);
			//const str = 'abc efg';
			const arg2 = arg.charAt(0).toUpperCase() + arg.slice(1);
			
			var draftmons=global.todraftmons[toId(room)];
			console.log(arg2);
			if(toId(by)==toId(room)){
				return this.reply(draftmonsprint(draftmons["tierlist"][arg2]["pokemon"]));
		
			}else{
				return this.reply(draftmonsprint2(draftmons["tierlist"][arg2]["pokemon"]));
		
			}
		
		}
	},
	startdraft: function (arg, by, room, cmd){
		
		if (!this.isRanked('admin')) return false;
		/*first load in the draft file list*/
		//lets try that now
		console.log('started reading file');
		let rawdata = fs.readFileSync('DraftTest.json');
		let student = JSON.parse(rawdata);
		console.log(student);
		global.currenttier[toId(room)]=1;
		pointdrafting=true;
		global.todraftmons[toId(room)]=student;
		
		/*then load the participant list*/
		var list=global.turnorder[toId(room)];
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
		global.draftstarted[toId(room)]=true;
		global.picknr[toId(room)]=0;
		global.nextdrafter[toId(room)]=0;
		this.reply('draft order is '+result);
		console.log(draftstarted);
		console.log(global.todraftmons);
		let rawdata2 = fs.readFileSync('draftedmons.json');
		let student2 = JSON.parse(rawdata2);
		if(global.draftedmons={}){
			global.draftedmons=student2;
		}
		var draftmons=global.todraftmons[toId(room)];
		global.draftdirectionup[toId(room)]=true;
		var tiername="Tier"+global.currenttier[toId(room)];
		console.log(tiername);
		global.possiblepicks=draftmons["tierlist"][tiername]["pokemon"];
		if(toId(by)==toId(room)){
				this.reply(draftmonsprint(draftmons["tierlist"][tiername]["pokemon"]));
		
			}else{
				this.reply(draftmonsprint2(draftmons["tierlist"][tiername]["pokemon"]));
		
			}
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
		if(!global.draftstarted[toId(room)]){
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
		if(list[global.nextdrafter[toId(room)]]!=name){
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
						
						global.users[name]["tieredpicks"]=removeItemOnce(global.users[name]["tieredpicks"],i);
						this.reply( name +" used a tierpick to draft a tier "+i+" "+arg+ " erekredieten. (tierpicks "+global.users[name]["tieredpicks"]+ " )");
					
					}
					else{
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						var pointscost=draftmons["tierlist"]["Tier"+i]["points"];
						var currentscore=global.users[name]["erekredieten"];
						var picksleft=draftmons["freepicks"]-global.picknr[toId(room)]-1-global.users[name]["tieredpicks"].length;
						console.log("freepicks "+draftmons["freepicks"]+" picknr: "+global.picknr[toId(room)]+" pickleft"+picksleft);
						if(picksleft*40>currentscore-pointscost){
							return this.reply("please make sure you have at least "+picksleft*40+ "Erekredieten left" );
						}
						global.users[name]["erekredieten"]=global.users[name]["erekredieten"]-draftmons["tierlist"]["Tier"+i]["points"];
					
						this.reply( name +" paid "+draftmons["tierlist"]["Tier"+i]["points"]+ " erekredieten.( Erekredieten "+global.users[name]["erekredieten"]+" tieredpicks:"+global.users[name]["erekredieten"]+ ")");
					
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
			if(global.draftdirectionup[toId(room)]){
				global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]+1;
				if(global.nextdrafter[toId(room)]>=list.length){
					saveTeamsToCloud();
					global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]-1;
					global.draftdirectionup[toId(room)]=false;
					console.log("order changed  "+global.nextdrafter[toId(room)]);
					global.picknr[toId(room)]=global.picknr[toId(room)]+1;
					if(pointdrafting&&global.picknr[toId(room)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.users[toId(room)]=[];
						
						return this.reply('The draft over is good luck and have fun ');
					}
					if(!pointdrafting){

						if(global.picknr[toId(room)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]-1;
				if(global.nextdrafter[toId(room)]<0){
					saveTeamsToCloud();
					global.nextdrafter[toId(room)]=0;
					global.draftdirectionup[toId(room)]=true;
					console.log("order changed");
					global.picknr[toId(room)]=global.picknr[toId(room)]+1;
					if(pointdrafting&&global.picknr[toId(room)]>=draftmons["freepicks"]){
						global.users[toId(room)]=[];
						//saveTeamsToCloud();
						return this.reply('The draft over is good luck and have fun ');
					}
					console.log("picknr is"+global.picknr[toId(room)]);
					if(!pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]);
						if(global.picknr[toId(room)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
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
			var username=list[global.nextdrafter[toId(room)]];
			if(pointdrafting){
				return this.reply( name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.users[username]["erekredieten"]+" tieredpicks:"+global.users[username]["erekredieten"]+" )");
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
	},
	forcepickaltmon:  function (arg, by, room, cmd) {
		if (!this.isRanked('admin')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.reply("Usage: " + this.cmdToken + cmd + " [user], [montopick]");
		if(!global.draftstarted[toId(room)]){
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
			if(global.draftdirectionup[toId(room)]){
				global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]+1;
				if(global.nextdrafter[toId(room)]>=list.length){
					saveTeamsToCloud();
					global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]-1;
					global.draftdirectionup[toId(room)]=false;
					console.log("order changed  "+global.nextdrafter[toId(room)]);
					global.picknr[toId(room)]=global.picknr[toId(room)]+1;
					if(pointdrafting&&global.picknr[toId(room)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.users[toId(room)]=[];
						
						return this.reply('The draft over is good luck and have fun ');
					}
					if(!pointdrafting){

						if(global.picknr[toId(room)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]-1;
				if(global.nextdrafter[toId(room)]<0){
					saveTeamsToCloud();
					global.nextdrafter[toId(room)]=0;
					global.draftdirectionup[toId(room)]=true;
					console.log("order changed");
					global.picknr[toId(room)]=global.picknr[toId(room)]+1;
					if(pointdrafting&&global.picknr[toId(room)]>=draftmons["freepicks"]){
						global.users[toId(room)]=[];
						//saveTeamsToCloud();
						return this.reply('The draft over is good luck and have fun ');
					}
					console.log("picknr is"+global.picknr[toId(room)]);
					if(!pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]);
						if(global.picknr[toId(room)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
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
			var username=list[global.nextdrafter[toId(room)]];
			if(pointdrafting){
				return this.reply( name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.users[username]["erekredieten"]+" tieredpicks:"+global.users[username]["erekredieten"]+" )");
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
		return this.reply( name +' forcibly drafted alternative mon not on the list '+args[1]+ ', the next drafter is '+list[global.nextdrafter[toId(room)]]);
	
	},
	
	pickmon: 'draft',
	
	
	draft:  function (arg, by, room, cmd) {
				console.log(draftstarted[toId(room)]);
		if(!global.draftstarted[toId(room)]){
				return this.reply('draft did not start yet');
	
		}
			var args=arg.split("-");
			arg='';
			for (var i = 0; i < args.length; i++) {
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
			console.log(arg);
			var list=global.turnorder[toId(room)]
		if(list[global.nextdrafter[toId(room)]]!=toId(by)){
				return this.reply('it is not your turn');
	
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
			var draftmons=global.todraftmons[toId(room)];
			var i=1;
			while(i<=draftmons["length"]){
				var possiblepic=draftmons["tierlist"]["Tier"+i]["pokemon"];
				if(possiblepic.includes(arg)||(possiblepic.includes('Silvally')&&args[0]=='Silvally')){
					if(global.users[name]["tieredpicks"].includes(i)){
						
						global.users[name]["tieredpicks"]=removeItemOnce(global.users[name]["tieredpicks"],i);
						this.reply( name +" used a tierpick to draft a tier "+i+" "+arg+ " erekredieten. (tierpicks "+global.users[name]["tieredpicks"]+ " )");
					
					}
					else{
						draftmons["tierlist"]["Tier"+i]["pokemon"]=removeItemOnce(draftmons["tierlist"]["Tier"+i]["pokemon"],arg);
						var pointscost=draftmons["tierlist"]["Tier"+i]["points"];
						var currentscore=global.users[name]["erekredieten"];
						var picksleft=draftmons["freepicks"]-global.picknr[toId(room)]-1-global.users[name]["tieredpicks"].length;
						console.log("freepicks "+draftmons["freepicks"]+" picknr: "+global.picknr[toId(room)]+" pickleft"+picksleft);
						if(picksleft*40>currentscore-pointscost){
							return this.reply("please make sure you have at least "+picksleft*40+ "Erekredieten left" );
						}
						global.users[name]["erekredieten"]=global.users[name]["erekredieten"]-draftmons["tierlist"]["Tier"+i]["points"];
					
						this.reply( name +" paid "+draftmons["tierlist"]["Tier"+i]["points"]+ " erekredieten.( Erekredieten "+global.users[name]["erekredieten"]+" tieredpicks:"+global.users[username]["erekredieten"]+ ")");
					
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
			if(global.draftdirectionup[toId(room)]){
				global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]+1;
				if(global.nextdrafter[toId(room)]>=list.length){
					saveTeamsToCloud();
					global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]-1;
					global.draftdirectionup[toId(room)]=false;
					console.log("order changed  "+global.nextdrafter[toId(room)]);
					global.picknr[toId(room)]=global.picknr[toId(room)]+1;
					if(pointdrafting&&global.picknr[toId(room)]>=draftmons["freepicks"]){
						saveTeamsToCloud();
						global.users[toId(room)]=[];
						
						return this.reply('The draft over is good luck and have fun ');
					}
					if(!pointdrafting){

						if(global.picknr[toId(room)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
							this.reply( name +' drafted '+arg);
							return startNewTier(room,by,this)
						}
					}
				}
			
			
			}

			else{
				global.nextdrafter[toId(room)]=global.nextdrafter[toId(room)]-1;
				if(global.nextdrafter[toId(room)]<0){
					saveTeamsToCloud();
					global.nextdrafter[toId(room)]=0;
					global.draftdirectionup[toId(room)]=true;
					console.log("order changed");
					global.picknr[toId(room)]=global.picknr[toId(room)]+1;
					if(pointdrafting&&global.picknr[toId(room)]>=draftmons["freepicks"]){
						global.users[toId(room)]=[];
						//saveTeamsToCloud();
						return this.reply('The draft over is good luck and have fun ');
					}
					console.log("picknr is"+global.picknr[toId(room)]);
					if(!pointdrafting){

						console.log("picknr is"+draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]);
						if(global.picknr[toId(room)]>=draftmons["tierlist"]["Tier"+global.currenttier[toId(room)]]["picks"]){
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
			var username=list[global.nextdrafter[toId(room)]];
			if(pointdrafting){
				return this.reply( name +" drafted "+arg+", the next drafter is "+username+ " (Erekredieten:"+global.users[username]["erekredieten"]+" tieredpicks:"+global.users[username]["erekredieten"]+" )");
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
	 function pickmultimons(arg,number,list){
		 removedraftedspecies(arg,list);
		var result=[];
		
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
		return 'draft ' +result;
	};
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
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
function startNewTier(room,by,elem){
	//load mons of the new tierlist
	//reshuffle list of users
	//if last tier end draft
	global.draftdirectionup[toId(room)]=true;
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
	global.picknr[toId(room)]=0;
	var list=global.turnorder[toId(room)]
		
		list=shuffle(list);
		
	var result='';
		for (var i = 0; i < list.length; i++) {
		
    //Do something
			
				result=result+","+list[i];
			
			
		}
		result=result.substring(1,result.length);
		global.draftstarted[toId(room)]=true;
		
		global.nextdrafter[toId(room)]=0;
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
function jsUcfirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};
