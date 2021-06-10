	
global.fs = require('fs');
	var XLSX=require('xlsx');
	var data="test.xlsx";
		
			 var workbook = XLSX.readFile(data);
			var sheetame=workbook.SheetNames;
			var json_object=XLSX.utils.sheet_to_json(workbook.Sheets[sheetame[0]])
			//console.log(json_object);
			var resultobj={};
			for (i = 0; i < json_object.length; i++) { 
				var obiject=json_object[i];
				
				//console.log(obiject["name"]);
				
				
				
				resultobj[obiject["name"]]=obiject;
			}
			
			fs.writeFileSync('resulttable.json',  JSON.stringify(resultobj));