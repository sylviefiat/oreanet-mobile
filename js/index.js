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

        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                //on est sur la page index.html et offline alors
                //On affiche le splashscreen 1
                document.getElementById("devicereadyoff").id = "deviceready";
             },
            // si on EST connecté
            function(){
                //Si on est sur la page index.html et on est online alors
                if(app.getUrlVars()["id"] == null){
                    //On affiche online
                    document.getElementById("offline").style.display = "none";

                    //On affiche le splashscreen 1
                    document.getElementById("devicereadyoff").id = "deviceready";
                    //On verfie l'existance d'une liste
                    setTimeout(function(){ db.listCOTexist();},2000);

                }
                //Sinon si on est sur la page index.html?id= alors
                else if(app.getUrlVars()["id"] == ""){
                    //On affiche online
                    document.getElementById("offline").style.display = "none";
                    // supprime tout message afficher (si il y en a)
                    app.closeMsg();
                }
                //Sinon si on est sur la page index.html?id=X alors
                else {
                    //On affiche online
                    document.getElementById("offline").style.display = "none";
                    //On affiche bouton retour
                    document.getElementById("nav-bot").id = "nav-bot-on";
                }
        });

        //dev mobile
	    //setTimeout(function(){app.receivedEvent('deviceready');},0);
	
    },

    //Initialisation list.html
    initializeList: function() {
        //On affiche online
        document.getElementById("offline").style.display = "none"; 
        document.getElementById("online").id = "onlinelist"; 
        
        var parentElement = document.getElementById("contentlist");
        var listeningElement = parentElement.querySelector('.cot_admin_list');
        
        //afficher la list
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

            console.log("<<<<<formulaire non existant>>>>");

            // enleve le splashscreen et affiche le formulaire
            app.open();
            // supprime tout message afficher (si il y en a)
            app.closeMsg();
            // passer en status hors ligne
            app.turnOffline();
            // ajouter un listener sur le formulaire
            app.addSubmitForm();
            // ajouter un "validateur" de formulaire
            app.validForm();

            }, 2000);

        }
        //sinon si l'ID dans url est egal a "" alors c'est un nouveau formulaire dans index.html?id=
        else if(app.getUrlVars()["id"] == "") {
            setTimeout(function(){

            console.log("<<<<<formulaire non existant>>>>");

            // démarrer le plugin addressPicker
            app.addressPicker();
            // ajouter un listener sur le formulaire
            app.addSubmitForm();
            // ajouter un "validateur" de formulaire
            app.validForm();

            }, 0);
        }
        //sinon on modifie un formulaire existant
        else {
            setTimeout(function(){

            console.log("<<<<<formulaire existant>>>>");
            //message pour le formulaire séléctionné
            app.updateMsg("Voici votre formulaire à finaliser. Il vous reste "+ $("#form-cot_admin" ).validate().numberOfInvalids() +" champ(s) à remplir.");

            // démarrer le plugin addressPicker
            app.addressPicker();
            // remplir avec ces données le formulaire
            db.reditCOTForm(app.getUrlVars()["id"]);
            console.log("new index ==== "+ app.getUrlVars()["id"]);

            // ajouter un listener sur le formulaire avec l'id de celui-ci
            app.addSubmitExistForm(app.getUrlVars()["id"]);

            // ajouter un "validateur" de formulaire
            app.validForm();

            }, 0);

        }
    
	
    },

    //on recuper l'id du formulaire à ouvrir
    getFormID: function(id){
        window.location.href="./index.html?id="+id;
    },

    //on remplit le formulaire chargé avec ces données
    reditForm: function(name,tel,email,date,location,localisation,region,country,latitude,longitude,number,culled,timed_swim,distance_swim,other_chbx,range,method,remarks){

                    document.getElementById('observer_name').value = name;
                    document.getElementById('observer_tel').value = tel;
                    document.getElementById('observer_email').value = email;
                    document.getElementById('observation_date').value = date;
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
    	app.updateMsg("L'application est actuellement hors ligne, certaines fonctionnalités ne seront pas disponibles et les données seront envoyées à la prochaine connexion.");
    },
    // Remove splascreen
    open: function(){

    	var parentElement = document.getElementById("deviceready");
        var listeningElement = parentElement.querySelector('.listening');
        console.log("Avant " + listeningElement.className);
    	if(listeningElement != null){
                listeningElement.className='event connecting row vertical-align';
        	    listeningElement.addEventListener("transitionend",  function(e) {
    	    	listeningElement.className='event ready';
                console.log("Après " + listeningElement.className);
    	    	parentElement.style.visibility = "hidden";
    	    },false);
    	}
        //On affiche offline
        document.getElementById("online").style.display = "none";
        //On enleve les champs Select/Regi/Pays/Lat/Long
        document.getElementById("offlineForm").style.display = "none";
    },
   // Sending form wait splashscreen
    sending: function(){
    	window.scrollTo(0, 0);
        if(navigator.onLine == true) {
            document.getElementById("devicereadyoff").id = "deviceready";
        }
    	var parentElement = document.getElementById("deviceready");
	       parentElement.style.visibility = "visible";
        var listeningElement = parentElement.querySelector('.onsend');
	if(listeningElement != null){
            listeningElement.className='event sending row vertical-align';    	    
	}
    },
    // ser closing screen
    close: function(){
    	window.scrollTo(0, 0);
        if(navigator.onLine == true) {
            document.getElementById("devicereadyoff").id = "deviceready";
        }
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
	window.location.reload();
	//app.open();
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

        //si on est online alors les champs son Name/Email/Date/Localisation/Lat/Long
        if(navigator.onLine == true){
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
                    observation_date: {
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
        //Sinon on est offline et les champs sont Name/Email/Date/Location
        else{
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
                    observation_date: {
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
        }
    },

    //On utilise la fonction sql pour enregistrer les données
    addSubmitForm: function(){
    	$('#form-cot_admin').submit(function() {
		console.log("form submit");
		db.insertCOT($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(),$('#observation_date').val(),
			$('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
			$('#observation_pays').val(),$('#observation_latitude').val(),$('#observation_longitude').val(),
			$('#observation_number').val(),$('#observation_culled').val(),$('#counting_method_timed_swim').val(),
			$('#counting_method_distance_swim').val(),$('#counting_method_other').val(),
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
        db.updateFormCot($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), 
            $('#observation_date').val(), $('#observation_location').val(), 
            $('#observation_localisation').val(), $('#observation_region').val(), $('#observation_pays').val(), 
            $('#observation_latitude').val(), $('#observation_longitude').val(),
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
        if(navigator.online != true){
            window.setTimeout("app.close()", 800);
        }
        
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

        datetime = jour + "/" + mois + "/" + date.getFullYear() + " à " + heure +":"+ minute;
        return datetime;
    },

    cancel: function(){
        window.location.href="./list.html";
    }
};


