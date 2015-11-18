var db = {
	
	openDB: function() {
		var usersDb = window.openDatabase("users", "1.0", "Users table", 1024*1000);
		usersDb.transaction(function(transaction) {
			transaction.executeSql("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), paswword VARCHAR(100), status VARCHAR(100))");
		});
		return usersDb;
	},

	insertUser: function(name, email, password) {
		var usersDb = db.openDB();
		usersDb.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO users (id, name, email, paswword,status) VALUES (null, ?, ?, ?, "local")', [name, email, password], function(transaction, results) {
				db.synchronizeRemote();
			}, function(e) {
		    	console.log("some error inserting data");
		});
	    });
	},

	sendRemote: function(json,id){
		xhr = new XMLHttpRequest();
		var url = "http://193.51.249.205/testRest/cot.php";
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function () { 
		    	if (xhr.readyState == 4 && xhr.status == 200) {
				var json = JSON.parse(xhr.responseText);
		       		console.log(json.status + ", " + json.msg  + " updating id "+id);
				// update results status as "synchronized"
				if(json.status)	{
					db.updateUser(id); 
				}		
		    	}
		}
		xhr.send(json);
	},

	synchronizeUsers: function() {
	    var usersDb = db.openDB();
	    usersDb.transaction(function(transaction) {
		transaction.executeSql('SELECT id, name, email, paswword FROM users where status<>"synchronized"', [], function(transaction, results) {
			console.log("select users: "+results.rows.length);
			for(i=0; i<results.rows.length;i++){
				// parse results in JSON
		    		var item = JSON.stringify(results.rows.item(i));			
				console.log("select user json: "+item);
				// send results
				db.sendRemote(item,results.rows.item(i).id);			
			}
		}, function(e) {
		    console.log("some error getting questions");
		});
	    });
	},

	updateUser: function(id) {
	    var usersDb = db.openDB();
	    usersDb.transaction(function(transaction) {
		transaction.executeSql('UPDATE users set status="synchronized" where id=?', [id], function(transaction, results) {
		    console.log("update users status to synchronized ok");
		    return 1;
		}, function(e) {
		    console.log("some error updating data");
		});
	    });
	},



	synchronizeRemote: function(){
	 	if(navigator.onLine){
			return db.synchronizeUsers();
		} else {
			console.log("Offline keeping local data");
		}
	 }

}

