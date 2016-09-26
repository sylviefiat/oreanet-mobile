
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

	dropDB: function() {
		var cotsDb = window.openDatabase("cot_admin", "1.0", "COT table", 1024*1000);
		cotsDb.transaction(function(transaction) {
		    transaction.executeSql(sql.DROP, [], function(transaction, results) {
			console.log("database supprimer");
			
		    }, function(transaction, error) {
		    	    console.log("erro creating db: "+error.message);
		    });
		});
		return 0;
	},

	insertCOT: function(observer_name, observer_tel, observer_email, observation_date, observation_location, 
				observation_localisation, observation_region, observation_country, 
				observation_latitude, observation_longitude, observation_number, observation_culled, 
				counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
				depth_range0, depth_range1, depth_range2, observation_method0, observation_method1, remarks, date_enregistrement) {
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
				observation_localisation, observation_region, observation_country, 
				observation_latitude, observation_longitude, observation_number, observation_culled, 
				counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
				depth_range, observation_method, 
				remarks, date_enregistrement], 
				function(transaction, results) {
					
					//test online ou offline
			        app.isOnline(
			            // si on N'EST PAS connecté alors
			            function(){
			            	app.updateMsg("Vous pourrez envoyer votre formulaire lors de votre prochaine connexion à internet");
			            },
			            // si on EST connecté
			            function(){
			            	db.getidFormInsertCOT(observer_name, observer_tel, observer_email, observation_date, observation_location, 
																observation_localisation, observation_region, observation_country, 
																observation_latitude, observation_longitude, observation_number, observation_culled, 
																counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
																depth_range, observation_method, 
																remarks, date_enregistrement);
			            }
			        );

				}, function(e) {
		    			return 0;
				}
			);
	    });
	},

	//récupère l'id du nouveau formulaire a envoyé
	getidFormInsertCOT: function(observer_name, observer_tel, observer_email, observation_date, observation_location, 
				observation_localisation, observation_region, observation_country, 
				observation_latitude, observation_longitude, observation_number, observation_culled, 
				counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
				depth_range, observation_method, 
				remarks, date_enregistrement) {
		var cotsDb = db.openDB();

		cotsDb.transaction(function(transaction) {
			transaction.executeSql(sql.SELECTidINSERT, [observer_name, observer_tel, observer_email, observation_date, observation_location, 
					observation_localisation, observation_region, observation_country, 
					observation_latitude, observation_longitude, observation_number, observation_culled, 
					counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
					depth_range, observation_method, 
					remarks, date_enregistrement],
			 function(transaction, results) {
				for (i = 0; i < results.rows.length; i++){ 
					
					var idform = results.rows.item(i).id;
					console.log("Id ======"+ idform);
					return db.synchronizeCOTs("form", idform);
				}
			}, function(transaction, error) {		    
		    console.log("some error updating data "+error.message);
			});
	    });
	},

	/*synchronizeRemote: function(from,id){
	 	if(navigator.onLine){
			return db.synchronizeCOTs(from, id);
		}
		app.updateMsg("Vous pourrez envoyer votre formulaire lors de votre prochaine connexion à internet");
	 },*/

	synchronizeCOTs: function(from, id) {
		console.log("C good id=="+id+" et from==="+from)
	    var cotsDb = db.openDB();
	    cotsDb.transaction(function(transaction) {
		transaction.executeSql(sql.SELECT, [id], function(transaction, results) {
			console.log("select cots: "+results.rows.length);
			for(i=0; i<results.rows.length;i++){
				// parse results in JSON
		    		var item = JSON.stringify(results.rows.item(i));
				// send results
				db.sendRemote(item,results.rows.item(i).id,from);			
			}
		}, function(e) {
		    console.log("some error getting questions");
		});
	    });
	},

	sendRemote: function(json,id,from){
		xhr = new XMLHttpRequest();
		//var url = "http://oreanet-rest.ird.nc/restcotnc/cot.php";
		var url = "http://rest-oreanet.ird.nc/restcotnc/cot.php";
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function () { 
		    	if (xhr.readyState == 4 && xhr.status == 200) {
				var json = JSON.parse(xhr.responseText);
				// update results status as "synchronized"
				db.updateCOT(id);
				if(json.status)	{
				    if(from == "form"){
					app.close();
				    } 
				} else {
					app.updateMsg("Une erreur est survenue lors de l'envoi du formulaire, merci de bien vouloir réessayer.");
				}		
		    	}
		}
		try {
        	    xhr.send(json);
    		} catch(z) {
        	    alert("Network failure");
        	    return;
    		}		
	},

	updateCOT: function(id) {
	    var cotsDb = db.openDB();
	    cotsDb.transaction(function(transaction) {
		transaction.executeSql(sql.REMOVE, [id], function(transaction, results) {
		    console.log("update COTs status to synchronized ok");		    
		}, function(transaction, error) {		    
		    console.log("some error updating data "+error.message);
		});
	    });
	},

	deleteCOT: function() {
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

	//On vérifie si des formulaires existe si oui on redirige ver le lien la list.html
	listCOTexist: function(){

	var cotsDb = db.openDB();
        cotsDb.transaction(function(transaction) {
        transaction.executeSql(sql.SELECTexistLIST, [], function(transaction, results) {
            console.log("Nombre de formulaire(s) existant "+ results.rows.length);
            if (results.rows.length != 0){
            	app.cancel();
            }
            else{
            	app.getFormID('');
            }
    
        }, function(transaction,error) {		    
		    console.log("some error updating data: "+error.message);
		    return 0;
		});
    });
    },

    //On vérifie si list existe
    listExist: function(){

	var cotsDb = db.openDB();
        cotsDb.transaction(function(transaction) {
        transaction.executeSql(sql.SELECTexistLIST, [], function(transaction, results) {
            console.log("Liste exist "+results.rows.length);
            if(results.rows.length !=0){
            	 //On affiche bouton retour
                document.getElementById("btn-cancel").id = "btn-cancel-on";
            
                //test les champs valid
                var myVar = setInterval(function(){
                    console.log("validation");
                    if($("#form-cot_admin" ).valid()){
                        //message pour le formulaire sélectionné
                        app.updateMsg("Voici votre formulaire à finaliser. Il vous reste "+ $("#form-cot_admin" ).validate().numberOfInvalids() +" champ(s) à remplir. <a href='#' onclick='return app.cancel()'>Retour à la liste</a>");
                        if(document.getElementById("btn-send") != null){
                            document.getElementById("btn-send").id = "btn-send-valid";
                        }
                    } 
                    else {
                        //message pour le formulaire sélectionné
                        app.updateMsg("Voici votre formulaire à finaliser. Il vous reste "+ $("#form-cot_admin" ).validate().numberOfInvalids() +" champ(s) à remplir. <a href='#' onclick='return app.cancel()'>Retour à la liste</a>");
                        if(document.getElementById("btn-send-valid") != null){
                            document.getElementById("btn-send-valid").id = "btn-send";
                        }
                    }
                }, 1000);
            }
            else {
                //test les champs valid
                var myVar = setInterval(function(){
                    console.log("validation");
                    if($("#form-cot_admin" ).valid()){
                        //message pour le formulaire sélectionné
                        app.updateMsg("Il vous reste "+ $("#form-cot_admin" ).validate().numberOfInvalids() +" champ(s) à remplir.");
                        if(document.getElementById("btn-send") != null){
                            document.getElementById("btn-send").id = "btn-send-valid";
                        }
                    } 
                    else {
                        //message pour le formulaire sélectionné
                        app.updateMsg("Il vous reste "+ $("#form-cot_admin" ).validate().numberOfInvalids() +" champ(s) à remplir.");
                        if(document.getElementById("btn-send-valid") != null){
                            document.getElementById("btn-send-valid").id = "btn-send";
                        }
                    }
                }, 1000);
            }
    
        }, function(transaction,error) {		    
		    console.log("some error updating data: "+error.message);
		    return 0;
		});
    });
    },

    //Affichage de la liste
	listCOT: function(){

	var parentElement = document.getElementById("contentlist");
    var listeningElement = parentElement.querySelector('.cot_admin_list');

	var cotsDb = db.openDB();
        cotsDb.transaction(function(transaction) {
        transaction.executeSql(sql.SELECTCOTLIST, [], function(transaction, results) {
            console.log("Nombre de formulaire(s) a consulter "+ results.rows.length);

        	app.updateMsg("Il vous reste " + results.rows.length + " formulaire(s) à finaliser. Merci de nous aider à protéger les récifs de Nouvelle-Calédonie.");

            for (i = 0; i < results.rows.length; i++){ 
          		//on remplit le tableau
                  listbdd = "<tr><td data-th='Créé le'>" + results.rows.item(i).date_enregistrement + "</td><td data-th='Date'>" + results.rows.item(i).observation_date + "</td><td data-th='Nbr acanthasters'>" + results.rows.item(i).observation_number + "</td><td data-th='Lieu'>" + results.rows.item(i).observation_location + "</td><td data-th='Supprimer'><button type=button href=# onclick='return app.supprForm("+results.rows.item(i).id+")' class='btn fa fa-trash-o fa-lg'></button></td>" + "</td><td data-th='Finaliser'><button type=button href=# onclick='return app.getFormID("+results.rows.item(i).id+")' class='btn fa fa-pencil btn-success'> Finaliser</button></td>" + "</tr>";
                    parentElement.querySelector('.cot_list_forms').innerHTML +=  listbdd;
                    
               }
    
        }, function(transaction,error) {		    
		    console.log("some error updating data: "+error.message);
		    return 0;
		});
    });
    },

    //On récupère l'id d'un formulaire pour charger ses données
    reditCOTForm: function(id){

        var cotsDb = db.openDB();
        cotsDb.transaction(function(transaction) {
        transaction.executeSql(sql.SELECTreditCOTForm, [id], function(transaction, results) {
            console.log("resultat "+ results.rows.length);

              for (i = 0; i < results.rows.length; i++){

              	app.reditForm(
                    results.rows.item(i).observer_name,
                    results.rows.item(i).observer_tel,
                    results.rows.item(i).observer_email,
                    results.rows.item(i).observation_date,
                    results.rows.item(i).observation_location,
                    results.rows.item(i).observation_localisation,
                    results.rows.item(i).observation_region,
                    results.rows.item(i).observation_country,
                    results.rows.item(i).observation_latitude,
                    results.rows.item(i).observation_longitude,
                    results.rows.item(i).observation_number,
                    results.rows.item(i).observation_culled,
                    results.rows.item(i).counting_method_timed_swim,
                    results.rows.item(i).counting_method_distance_swim,
                    results.rows.item(i).counting_method_other,
					results.rows.item(i).depth_range,
                    results.rows.item(i).observation_method,
                    results.rows.item(i).remarks);
                }
        }, null);
        });
    },

    //On modifier un tuple déjà existant grâce a son id
    updateFormCot: function(observer_name, observer_tel, observer_email, 
			    			observation_date, observation_location, 
							observation_localisation, observation_region, observation_country, 
							observation_latitude, observation_longitude, 
							observation_number, observation_culled, 
							counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
							depth_range0, depth_range1, depth_range2, 
							observation_method0, observation_method1, 
							remarks, id) {
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
			transaction.executeSql(sql.UPDATEFORM, 
				[	observer_name, observer_tel, observer_email, 
					observation_date, observation_location, 
					observation_localisation, observation_region, observation_country, 
					observation_latitude, observation_longitude, 
					observation_number, observation_culled, 
					counting_method_timed_swim, counting_method_distance_swim, counting_method_other, 
					depth_range, observation_method, 
					remarks, id], 
				function(transaction, results) {
					return db.synchronizeCOTs("form", id);	
				}, function(e) {
		    			return 0;
				}
			);
	    });
	}
}

