
var db = {
	
	openDB: function() {
		var cotsDb = window.openDatabase("cot_admin", "1.0", "COT table", 1024*1000);
		cotsDb.transaction(function(transaction) {
		    transaction.executeSql(sql.CREATE, [], function(transaction, results) {
			console.log("checked cots database creation");
			
		    }, function(transaction, error) {
		    	    console.log("erro creating db: "+error.message);
		    });
		});
		return cotsDb;
	},

	insertCOT: function(observer_name, observer_tel, observer_email, observation_date, observation_location, 
				observation_localisation, observation_region, observation_country, observation_country_code, 
				observation_latitude, observation_longitude, observation_number, observation_culled, 
				observation_state, counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
				depth_range0, depth_range1, depth_range2, observation_method0, observation_method1, remarks, localisation, admin_validation) {
		var cotsDb = db.openDB();
		
		var depth_range = ( depth_range0.length > 0 ? depth_range0 : "")
					+((depth_range0.length > 0 && depth_range1.length > 0) ? ", " : ((depth_range0.length>0 && depth_range2.length > 0) ? ", " : ""))
					+(depth_range1.length>0?depth_range1:"")
					+(depth_range1.length>0 && depth_range2.length>0?", ":"")
					+(depth_range2.length>0?depth_range2:"");
		var observation_method = (observation_method0.length > 0 ? observation_method0 : "")
					+((observation_method0.length>0 && observation_method1.length) > 0 ? ", " : "")
					+(observation_method1.length>0?observation_method1:"");

		cotsDb.transaction(function(transaction) {
			transaction.executeSql(sql.INSERT, 
				[observer_name, observer_tel, observer_email, observation_date, observation_location, 
					observation_localisation, observation_region, observation_country, observation_country_code, 
					observation_latitude, observation_longitude, observation_number, observation_culled, observation_state, 
					counting_method_timed_swim, counting_method_distance_swim, counting_method_other, depth_range, observation_method, 
					remarks, localisation, admin_validation], 
				function(transaction, results) {
					console.log("id: "+results.insertId)
					//app.clearForm();
					db.synchronizeRemote();				
					return results.insertId;
				}, function(e) {
		    			return 0;
				}
			);
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
					db.updateCOT(id);					
				}		
		    	}
		}
		xhr.send(json);
	},

	synchronizeCOTs: function() {
	    var cotsDb = db.openDB();
	    cotsDb.transaction(function(transaction) {
		transaction.executeSql(sql.SELECT, [], function(transaction, results) {
			console.log("select cots: "+results.rows.length);
			for(i=0; i<results.rows.length;i++){
				// parse results in JSON
		    		var item = JSON.stringify(results.rows.item(i));			
				console.log("select cot json: "+item);
				// send results
				db.sendRemote(item,results.rows.item(i).id);			
			}
		}, function(e) {
		    console.log("some error getting questions");
		});
	    });
	},

	updateCOT: function(id) {
	    var cotsDb = db.openDB();
	    cotsDb.transaction(function(transaction) {
		transaction.executeSql(sql.UPDATE, [id], function(transaction, results) {
		    console.log("update COTs status to synchronized ok");
		    app.updateMsg(lang.STR["form_sent"]); 
		    app.close();
		    return 1;
		}, function(e) {		    
		    console.log("some error updating data");
		    return 0;
		});
	    });
	},

	deleteCOT: function(id) {
	    var cotsDb = db.openDB();
	    cotsDb.transaction(function(transaction) {
		transaction.executeSql(sql.DELETE, [], function(transaction, results) {
		    console.log("delete COTs ok");
		    return 1;
		}, function(transaction,error) {		    
		    console.log("some error updating data: "+error.message);
		    return 0;
		});
	    });
	},

	synchronizeRemote: function(insertId){
	 	if(navigator.onLine){
			return db.synchronizeCOTs();
		}
		app.updateMsg("Le formulaire sera envoyé à la prochaine connexion à internet");
	 }

}

