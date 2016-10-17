/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* gloabl app management */
var app = {

    // Application Constructor
    initialize: function() {    	
        this.bindEvents();
        //On enlève offline
        document.getElementById("offline").style.display = "none";
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                //On remet le splascreen
                document.getElementById("devicereadyoff").id = "deviceready";
                console.log("On remet le splascreen");
                //On est sur la page index.html et offline
                //On enlève online 
                document.getElementById("online").style.display = "none";
                //On affiche offline
                document.getElementById("offline").style.display = "block";
                //On enlève le lien site dans le menu
                document.getElementById("lien-site-menu").id = "lien-site-menu-off";
                //On affiche le formulaire
                document.getElementById("contentoff").id = "content";
                console.log("On affiche le formulaire");
             },
            // si on EST connecté
            function(){
                //Si on est sur la page index.html et on est online alors
                if(app.getUrlVars()["id"] == null){
                    //on remet le splascreen
                    document.getElementById("devicereadyoff").id = "deviceready";
                    console.log("On remet le splascreen");
                    //On vérifie l’existence d'une liste
                    setTimeout(function(){ db.listCOTexist();},1000);
                    //On affiche le formulaire
                    document.getElementById("contentoff").id = "content";
                    console.log("On affiche le formulaire");
                }else {
                    //On affiche le formulaire
                    document.getElementById("contentoff").id = "content";
                    console.log("On affiche le formulaire");
                }
            }
        );

        //dev mobile
	    //setTimeout(function(){app.receivedEvent('deviceready');},0);
	
    },

    //Initialisation list.html
    initializeList: function() {
        //On affiche online
        document.getElementById("offline").style.display = "none";
        //On prend onlinelist css
        document.getElementById("online").id = "onlinelist";

        var parentElement = document.getElementById("contentlist");
        var listeningElement = parentElement.querySelector('.cot_admin_list');
        
        //afficher la liste
        db.listCOT();
    
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('online', this.onOnline, false);
        document.addEventListener('offline', this.onOffline, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // online Event Handler
    onOnline: function() {
        app.turnOnline();
    },
    // offline Event Handler
    onOffline: function() {
        app.turnOffline();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
	    
        //si il n'y a pas de ID dans url  alors c'est un nouveau formulaire dans index.html
        if(app.getUrlVars()["id"] == null) {
            setTimeout(function(){

                console.log("<<<<<formulaire non existant offline>>>>");

                if(document.getElementById("deviceready") != null){
                    
                    //On enleve les champs Select/Regi/Pays/Lat/Long
                    document.getElementById("offlineForm").style.display = "none";
                    // enlevé le splashscreen et affiche le formulaire
                    app.open();
                }
                // supprime tout message afficher (si il y en a)
                app.closeMsg();
                // passer en status hors ligne
                app.turnOffline();
                // ajouter un listener sur le formulaire
                app.addSubmitForm();
                // ajouter un "validateur" de formulaire
                app.validForm();

                //test les champs valid
                var myVar = setInterval(function(){
                    console.log("validation");
                    if($("#form-cot_admin" ).valid()){
                        if(document.getElementById("btn-send") != null){
                            document.getElementById("btn-send").id = "btn-send-valid";
                        }
                    } 
                    else {
                        if(document.getElementById("btn-send-valid") != null){
                            document.getElementById("btn-send-valid").id = "btn-send";
                        }
                    }
                }, 2000);

            }, 2000);

        }
        //sinon si l'ID dans url est égal a "" alors c'est un nouveau formulaire dans index.html?id=
        else if(app.getUrlVars()["id"] == "") {
            setTimeout(function(){
            
            console.log("<<<<<formulaire non existant online>>>>");

            // supprime tout message afficher (si il y en a)
            app.closeMsg();
            // démarrer le plugin addressPicker
            app.addressPicker();
            // ajouter un listener sur le formulaire
            app.addSubmitForm();
            // ajouter un "validateur" de formulaire
            app.validForm();

            //test les champs valid
            var myVar = setInterval(function(){
                console.log("validation");
                if($("#form-cot_admin" ).valid()){
                    if(document.getElementById("btn-send") != null){
                        document.getElementById("btn-send").id = "btn-send-valid";
                    }
                } 
                else {
                    if(document.getElementById("btn-send-valid") != null){
                        document.getElementById("btn-send-valid").id = "btn-send";
                    }
                }
            }, 1000);

            //teste liste exist ajout du retour a la liste
            db.listExistNewForm();

            }, 0);
        }
        //sinon on modifie un formulaire existant
        else {
            setTimeout(function(){

            console.log("<<<<<formulaire existant>>>>");

            //On affiche bouton retour
            document.getElementById("btn-cancel").id = "btn-cancel-on";
            // démarrer le plugin addressPicker
            app.addressPicker();
            // remplir avec ces données le formulaire
            db.reditCOTForm(app.getUrlVars()["id"]);
            console.log("new index ==== "+ app.getUrlVars()["id"]);
            // ajouter un listener sur le formulaire avec l'id de celui-ci
            app.addSubmitExistForm(app.getUrlVars()["id"]);
            // ajouter un "validateur" de formulaire
            app.validForm();

            //test les champs valid
            var myVar = setInterval(function(){
                console.log("validation");
                if($("#form-cot_admin" ).valid()){
                    //message pour le formulaire sélectionné
                    app.updateMsg("<a href='#' onclick='return app.cancel()'>Retour à la liste</a>");
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

            }, 0);
        }
    },

    //on récupére l'id du formulaire à ouvrir
    getFormID: function(id){
        window.location.href="./index.html?id="+id;
    },

    //on remplit le formulaire chargé avec ces données
    reditForm: function(name,tel,email,day,month,year,location,localisation,region,country,latitude,longitude,number,culled,timed_swim,distance_swim,other_chbx,range,method,remarks){

                    document.getElementById('observer_name').value = name;
                    document.getElementById('observer_tel').value = tel;
                    document.getElementById('observer_email').value = email;
                    document.getElementById('observation_day').value = day;
                    document.getElementById('observation_month').value = month;
                    document.getElementById('observation_year').value = year;
                    document.getElementById('observation_location').value = location;
                    document.getElementById('observation_localisation').value = localisation;
                    document.getElementById('observation_region').value = region;
                    document.getElementById('observation_pays').value = country;
                    document.getElementById('observation_latitude').value = latitude;
                    document.getElementById('observation_longitude').value = longitude;
                    document.getElementById('observation_number').value = number;
                    document.getElementById('observation_culled').value = culled;
                    document.getElementById('counting_method_timed_swim').value = timed_swim;
                    document.getElementById('counting_method_distance_swim').value = distance_swim;
                    document.getElementById('counting_method_other').value = other_chbx;
                    if(range.includes("shallow") == true){
                        console.log("shallow");
                        document.getElementById("depth_range0").checked = true;
                        document.getElementById("label_depth_range0").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
                    } 

                    if(range.includes("medium") == true){
                        console.log("medium");
                        document.getElementById("depth_range1").checked = true;
                        document.getElementById("label_depth_range1").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
                    }

                    if(range.includes("deep") == true){
                        console.log("deep");
                        document.getElementById("depth_range2").checked = true;
                        document.getElementById("label_depth_range2").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
                    }

                    if(method.includes("snorkelling") == true){
                        console.log("snorkelling");
                       document.getElementById("observation_method0").checked = true;
                       document.getElementById("label_observation_method0").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
                    }

                    if (method.includes("scuba diving") == true){
                        console.log("scuba diving");
                        document.getElementById("observation_method1").checked = true;
                        document.getElementById("label_observation_method1").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
                    }

                    document.getElementById('remarks').value = remarks;
    },

    //supprime un formulaire avec son id
    supprForm: function(id){
        if (confirm("Voulez-vous supprimer ce formulaire ?")) {
           db.updateCOT(id);
           console.log("element supprimer id="+id);
           window.setTimeout("window.location.reload()", 500);
       }
        
    },

    //permet de recupérer l'id dans l'url
    getUrlVars: function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
        });
        return vars;
    },

    // Turn app to online mode
    turnOnline: function(){
    	app.addressPicker();
	   app.reloadForm();
    },
    // Turn app to offline mode
    turnOffline: function(){
    	app.updateMsg("L'application est actuellement hors ligne, certaines fonctionnalités ne seront pas disponibles et les données pourront être envoyées à la prochaine connexion.");
    },
    // Remove splascreen
    open: function(){
        console.log("OPEN");

    	var parentElement = document.getElementById("deviceready");
        var listeningElement = parentElement.querySelector('.listening');
    	if(listeningElement != null){
                listeningElement.className='event connecting row vertical-align';
        	    listeningElement.addEventListener("transitionend",  function(e) {
    	    	listeningElement.className='event ready';
    	    	parentElement.style.visibility = "hidden";
    	    },false);
    	}
    },
   // Sending form wait splashscreen
    sending: function(){
        console.log("SENDING");
    	window.scrollTo(0, 0);
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                var parentElement = document.getElementById("deviceready");
                parentElement.style.visibility = "visible";
                var listeningElement = parentElement.querySelector('.onsend');
                if(listeningElement != null){
                    listeningElement.className='event sending row vertical-align';          
                }
            },
            // si on EST connecté
            function(){
                if(document.getElementById("devicereadyoff") != null){
                    document.getElementById("devicereadyoff").id = 'deviceready';
                }
                document.getElementById("deviceready").style.visibility = 'hidden';
                document.querySelector('.listening').className = 'event ready';
                var parentElement = document.getElementById("deviceready");
                parentElement.style.visibility = "visible";
                var listeningElement = parentElement.querySelector('.onsend');
                if(listeningElement != null){
                    listeningElement.className='event sending row vertical-align';          
                }
            }
        );
    },
    // ser closing screen
    close: function(){
        console.log("CLOSE");

    	window.scrollTo(0, 0);
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                document.getElementById("lien-site-web").id = "lien-site-web-off";
                
                document.getElementById("msg-fin-enregistre").innerHTML = "Votre formulaire à bien été enregistré et vous pourrez l'envoyer lors de votre prochaine connexion à internet.";
            },
            // si on EST connecté
            function(){
                //on affiche le lien retour a la liste si elle exist
                db.listExistCLOSE();
            }
        );

        var parentElement = document.getElementById("deviceready");
    	var listeningElement = parentElement.querySelector('.sending');
    	if(listeningElement != null){
                listeningElement.className='event sent row vertical-align';    	    
    	}
        var listeningElement = parentElement.querySelector('.onclose');
        listeningElement.className='event closing row vertical-align';
    	listeningElement.addEventListener("transitionend",  function(e) {
	    listeningElement.className='event closed row vertical-align';
	    },false);
    },

    // Reload form
    reloadForm: function() {
        $("#form-cot_admin").trigger('reset');
	    window.location.href="./index.html";
    },

    updateMsg: function(msg) {
        document.getElementById("msg").innerHTML = msg;
	   document.getElementById("system-message-container").style.display = "block";
    },    

    showInfoMsg: function() {
        msg = "L'analyse de la présence des acanthasters nous permet de comprendre pour mieux agir. En nous signalant les acanthasters que vous rencontrez, vous nous aidez à protéger les récifs de Nouvelle-Calédonie.";
	app.updateMsg(msg);
    }, 

    closeMsg: function() {
	document.getElementById("system-message-container").style.display = "none";
    }, 

    addressPicker: function(){	
	$("#observation_localisation" ).addressPickerByGiro(
	    {
		distanceWidget: true
	    });	
    },

    //On mes des champs obligatoire a saisir
    validForm: function(){
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors les champs sont Name/Email/Date/Location
            function(){
                $("#form-cot_admin").validate({
                rules: {
                observer_name: {
                        minlength: 2,
                        required: true
                    },
                    observer_email: {
                        required: true,
                        email: true
                    },
                    observation_year: {
                        required: true
                    },
                    observation_location: {
                        required: true
                    }
                    },
                    highlight: function(element, errorClass, validClass) {
                        $(element).addClass(errorClass).removeClass(validClass);
                    },
                    unhighlight: function(element, errorClass, validClass) {
                        $(element).removeClass(errorClass).addClass(validClass);
                    }
                });
            },
            // si on EST connecté alors les champs son Name/Email/Date/Localisation/Lat/Long
            function(){
                $("#form-cot_admin").validate({
                    rules: {
                    observer_name: {
                            minlength: 2,
                            required: true
                        },
                        observer_email: {
                            required: true,
                            email: true
                        },
                        observation_year: {
                            required: true
                        },
                    observation_localisation: {
                            required: true
                        },
                    observation_latitude: {
                            required: true
                        },
                    observation_longitude: {
                            required: true
                        }
                    },
                    highlight: function(element, errorClass, validClass) {
                        $(element).addClass(errorClass).removeClass(validClass);
                    },
                    unhighlight: function(element, errorClass, validClass) {
                        $(element).removeClass(errorClass).addClass(validClass);
                    }
                });
            }
        );
    },

    //On utilise la fonction sql pour enregistrer les données
    addSubmitForm: function(){
    	$('#form-cot_admin').submit(function() {
		console.log("form submit");
		db.insertCOT($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_day').val(), $('#observation_month').val(), $('#observation_year').val(),
			$('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
			$('#observation_pays').val(),$('#observation_latitude').val(),$('#observation_longitude').val(),
			$('#observation_number').val(),$('#observation_culled').val(),
            $('#counting_method_timed_swim').val(), $('#counting_method_distance_swim').val(),$('#counting_method_other').val(),
			$('#depth_range0').prop('checked')?$('#depth_range0').val():"",
			$('#depth_range1').prop('checked')?$('#depth_range1').val():"",
			$('#depth_range2').prop('checked')?$('#depth_range2').val():"",
			$('#observation_method0').prop('checked')?$('#observation_method0').val():"",
			$('#observation_method1').prop('checked')?$('#observation_method1').val():"",
			$('#remarks').val(), app.getDateTime());			
		return false;
	});	
    },

    //on utilise la fonction sql pour modifier les données
    addSubmitExistForm: function(id){
        $('#form-cot_admin').submit(function() {
        console.log("form submit");
        db.updateFormCot($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_day').val(), $('#observation_month').val(), $('#observation_year').val(),
            $('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
            $('#observation_pays').val(), $('#observation_latitude').val(), $('#observation_longitude').val(),
            $('#observation_number').val(), $('#observation_culled').val(), 
            $('#counting_method_timed_swim').val(), $('#counting_method_distance_swim').val(), $('#counting_method_other').val(),
            $('#depth_range0').prop('checked')?$('#depth_range0').val():"",
            $('#depth_range1').prop('checked')?$('#depth_range1').val():"",
            $('#depth_range2').prop('checked')?$('#depth_range2').val():"",
            $('#observation_method0').prop('checked')?$('#observation_method0').val():"",
            $('#observation_method1').prop('checked')?$('#observation_method1').val():"",
            $('#remarks').val(), id);          
        return false;
    }); 
    },

    submitForm: function(){
    	if($("#form-cot_admin" ).valid()){
    	    app.sending();
            $("#form-cot_admin" ).submit();
        
            //test online ou offline
            app.isOnline(
                // si on N'EST PAS connecté alors
                function(){
                    window.setTimeout("app.close()", 800);
                },
                // si on EST connecté
                function(){}
            );

    	} else {
    	    app.updateMsg("Votre formulaire contient "
          		        + $("#form-cot_admin" ).validate().numberOfInvalids()
          		        + "erreur(s), voir le détail ci-dessous.");
    	}
    },

    loadForm: function(){
    	document.getElementById("counting_method_timed_swim_chbx").checked = document.getElementById("counting_method_timed_swim").value.length>0?1:0;
        document.getElementById("counting_method_distance_swim_chbx").checked = document.getElementById("counting_method_distance_swim").value.length>0?1:0;
        document.getElementById("counting_method_other_chbx").checked = document.getElementById("counting_method_other").value.length>0?1:0;

        app.enable_timed_swim(document.getElementById("counting_method_timed_swim").value.length>0?true:false);
        app.enable_distance_swim(document.getElementById("counting_method_distance_swim").value.length>0?true:false);
        app.enable_other(document.getElementById("counting_method_other").value.length>0?true:false);
    },

    enable_timed_swim: function(status) {
        if(!status){
                document.getElementById("counting_method_timed_swim").value = "";
                document.getElementById("counting_method_timed_swim").setAttribute('readonly','readonly');
        } else {
                document.getElementById("counting_method_timed_swim").removeAttribute('readonly');
        }
    },

    enable_distance_swim: function(status) {
        if(!status){
                document.getElementById("counting_method_distance_swim").value = "";
                document.getElementById("counting_method_distance_swim").setAttribute('readonly','readonly');
        } else {
                document.getElementById("counting_method_distance_swim").removeAttribute('readonly');
        }
    },

    enable_other: function(status) {
        if(!status){
                document.getElementById("counting_method_other").value = "";
                document.getElementById("counting_method_other").setAttribute('readonly','readonly');
        } else {
                document.getElementById("counting_method_other").removeAttribute('readonly');
        }
    },

    isOnline: function(no,yes){
    	var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHttp');
    	xhr.onload = function(){
            if(yes instanceof Function){
            	yes();
            }
    	}
    	xhr.onerror = function(){
            if(no instanceof Function){
            	no();
            }
    	}
	xhr.open("GET","http://rest-oreanet.ird.nc/restcotnc/cot.php",true);
    	xhr.send();
    },
    
    //Fonction pour afficher la date correctement
    getDateTime: function(){
        var datetime = "";
        var date = new Date();

        var mois    = ('0'+(date.getMonth()+1)).slice(-2);
        var jour    = ('0'+date.getDate()   ).slice(-2);
        var heure   = ('0'+date.getHours()  ).slice(-2);
        var minute  = ('0'+date.getMinutes()).slice(-2);

        datetime = jour + "/" + mois + "/" + date.getFullYear() + "  " + heure +":"+ minute;
        return datetime;
    },

    cancel: function(){
        window.location.href="./list.html";
    }

};