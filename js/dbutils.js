

function openDB() {
	var usersDb = window.openDatabase("users", "1.0", "Users table", 1024*1000);
	usersDb.transaction(function(transaction) {
		transaction.executeSql("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), paswword VARCHAR(100), status VARCHAR(100))");
	});
	return usersDb;
};

function insertUser(name, email, password) {
    var usersDb = openDB();
    usersDb.transaction(function(transaction) {
        transaction.executeSql('INSERT INTO users (id, name, email, paswword,status) VALUES (null, ?, ?, ?, "local")', [name, email, password], function(transaction, results) {
		// synchronize
		synchronizeRemote();
        }, function(e) {
            console.log("some error inserting data");
        });
    });
};

function sendRemote(json,id){
	xhr = new XMLHttpRequest();
	var url = "http://vcot/testRest/cot.php";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
	    	if (xhr.readyState == 4 && xhr.status == 200) {
			var json = JSON.parse(xhr.responseText);
	       		console.log(json.status + ", " + json.msg  + " updating id "+id);
			// update results status as "synchronized"
			if(json.status)	{
				updateUser(id); 
			}		
	    	}
	}
	xhr.send(json);
}

function synchronizeUsers() {
    var usersDb = openDB();
    // get all users
    usersDb.transaction(function(transaction) {
        transaction.executeSql('SELECT id, name, email, paswword FROM users where status<>"synchronized"', [], function(transaction, results) {
        	console.log("select users: "+results.rows.length);
        	for(i=0; i<results.rows.length;i++){
			// parse results in JSON
	    		var item = JSON.stringify(results.rows.item(i));			
			console.log("select user json: "+item);
			// send results
			sendRemote(item,results.rows.item(i).id);			
		}
        }, function(e) {
            console.log("some error getting questions");
        });
    });
};

function updateUser(id) {
    var usersDb = openDB();
    usersDb.transaction(function(transaction) {
        transaction.executeSql('UPDATE users set status="synchronized" where id=?', [id], function(transaction, results) {
            console.log("update users status to synchronized ok");
            return 1;
        }, function(e) {
            console.log("some error updating data");
        });
    });
};



function synchronizeRemote(){
 	if(navigator.onLine){
		return synchronizeUsers();
	} else {
		console.log("Offline keeping local data");
	}
 }



