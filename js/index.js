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
    switchOnline: function(isOnline){
        if(isOnline){
            online=document.getElementById("onlinelist");
            online.innerText = " En ligne";
            online.className = "ui-btn ui-btn-icon-right fa fa-signal online";
            online.removeAttribute("disabled");
        } else {
            online=document.getElementById("onlinelist");
            online.innerText = " Hors ligne";
            online.className = "ui-btn ui-btn-icon-right fa fa-signal";
            online.setAttribute("disabled","disabled");
        }
    },
    // Application Constructor
    initialize: function() {    	
        this.bindEvents();
        //On enlève offline
        app.switchOnline(1);
        // supprime tout message afficher (si il y en a)
        app.closeMsg();
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                //On remet le splascreen
                document.getElementById("devicereadyoff").id = "deviceready";
                //console.log("On remet le splascreen");
                //On est sur la page index.html et offline
                app.switchOnline(0);
                //On enlève le lien site dans le menu
                document.getElementById("lien-site-menu").id = "lien-site-menu-off";
                //On affiche le formulaire
                document.getElementById("contentoff").id = "content";
                //console.log("On affiche le formulaire");
             },
            // si on EST connecté
            function(){
                if($('#btn-save').length){  
                    $('#btn-save').show();
                }
                //Si on est sur la page index.html et on est online alors
                if(app.getUrlVars()["id"] == null){
                    app.switchOnline(1);
                    //on remet le splascreen
                    document.getElementById("devicereadyoff").id = "deviceready";
                    //console.log("On remet le splascreen");
                    //On vérifie l’existence d'une liste
                    setTimeout(function(){ db.listCOTexist();},500);
                    //On affiche le formulaire
                    document.getElementById("contentoff").id = "content";
                    //console.log("On affiche le formulaire");
                }else {
                    //On affiche le formulaire
                    document.getElementById("contentoff").id = "content";
                    //console.log("On affiche le formulaire");
                }
            }
        );

        //dev mobile
	    //setTimeout(function(){app.receivedEvent('deviceready');},0);
	
    },

    //Initialisation list.html
    initializeList: function() {
        //On affiche online
        app.switchOnline(1);

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
    // direct validation of the form 
    checkStatus: function(e){
        var idform = app.getUrlVars()["id"],
        elems = $('form').find('input:required'),
        invalid = $.grep(elems, function(n){
            return(!n.attributes['disabled'] && !n.validity.valid);
        }),
        bool = $(invalid).size() == 0;
        document.getElementById("btn-send").className = "fa fa-paper-plane ui-btn ui-last-child "+(bool?"valid":"invalid");
        // si c'est un formulaire existant qu'on reprend alors on affiche les champs a completer        
        if(bool){
            app.closeMsg();
            $(elems).removeClass("error");
        } else {
            if(idform!="" && idform!=null){
                app.updateMsg("Voici votre formulaire à finaliser. Il vous reste "+ $(invalid).size() +" champ(s) à remplir." +  " <a href='#' onclick='return app.cancel()'>Retour à la liste</a>");
            }
            $(invalid).addClass("error");
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
	    
        //si il n'y a pas de ID dans url  alors c'est un nouveau formulaire dans index.html
        if(app.getUrlVars()["id"] == null) {
            setTimeout(function(){

                //console.log("<<<<<formulaire non existant offline>>>>");

                if(document.getElementById("deviceready") != null){
                    
                    //On enleve les champs Select/Regi/Pays/Lat/Long
                    document.getElementById("offlineForm").style.display = "none";
                    // on met les input cachés en disabled
                    $('#offlineForm').find('input').attr("disabled", true);
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

                $('input:required').change(app.checkStatus);

            }, 2000);

        }
        //sinon si l'ID dans url est égal a "" alors c'est un nouveau formulaire dans index.html?id=
        else if(app.getUrlVars()["id"] == "") {
            setTimeout(function(){
            //console.log("<<<<<formulaire non existant online>>>>");

            // supprime tout message afficher (si il y en a)
            app.closeMsg();
            // démarrer le plugin addressPicker
            app.addressPicker();
            // ajouter un listener sur le formulaire
            app.addSubmitForm();
            // ajouter un "validateur" de formulaire
            app.validForm();

            $('input:required').change(app.checkStatus);

            //teste liste exist ajout du retour a la liste
            db.listExistNewForm();

            }, 0);
        }
        //sinon on modifie un formulaire existant
        else {
            setTimeout(function(){
            var id = app.getUrlVars()["id"];
            //console.log("<<<<<formulaire existant>>>>");
            // démarrer le plugin addressPicker
            app.addressPicker();
            // remplir avec ces données le formulaire
            db.reditCOTForm(id);
            // ajouter un listener sur le formulaire avec l'id de celui-ci
            app.addSubmitExistForm(id);
            // ajouter un "validateur" de formulaire
            app.validForm();

            $('input:required').change(app.checkStatus);
                
            //teste liste exist ajout du retour a la liste
            db.listExistNewForm();
            }, 0);
        }
    },

    //on récupére l'id du formulaire à ouvrir
    getFormID: function(id){
        window.location.href="./index.html?id="+id;
    },

    //on retourne l'id du formulaire encours
    getID: function(){
        return app.getUrlVars()["id"];
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
        if(range.indexOf("shallow") != -1){
            //console.log("shallow");
            document.getElementById("depth_range0").checked = true;
            document.getElementById("label_depth_range0").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        } 

        if(range.indexOf("medium") != -1){
            //console.log("medium");
            document.getElementById("depth_range1").checked = true;
            document.getElementById("label_depth_range1").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        if(range.indexOf("deep") != -1){
            //console.log("deep");
            document.getElementById("depth_range2").checked = true;
            document.getElementById("label_depth_range2").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        if(method.indexOf("snorkelling") != -1){
            //console.log("snorkelling");
            document.getElementById("observation_method0").checked = true;
            document.getElementById("label_observation_method0").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        if (method.indexOf("scuba diving") != -1){
            //console.log("scuba diving");
            document.getElementById("observation_method1").checked = true;
            document.getElementById("label_observation_method1").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        document.getElementById('remarks').value = remarks;


        // validate le formulaire pour afficher les champs non remplis
        app.checkStatus();
    },

    //supprime un formulaire avec son id
    supprForm: function(id){
        if (confirm("Voulez-vous supprimer ce formulaire ?")) {
           db.updateCOT(id);
           //console.log("element supprimer id="+id);
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
        online=document.getElementById("onlinelist");
        app.switchOnline(1);
        online.addClass = "online";
        app.reloadForm();
    },
    // Turn app to offline mode
    turnOffline: function(){
    	app.updateMsg("L'application est actuellement hors ligne, certaines fonctionnalités ne seront pas disponibles et les données pourront être envoyées à la prochaine connexion.");
        app.switchOnline(0);
    },
    // Remove splascreen
    open: function(){
        //console.log("OPEN");

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
        //console.log("SENDING");
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
        //console.log("CLOSE");

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

        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                $("#form-cot_admin").trigger('reset');
                window.location.href="./index.html";
            },
            // si on EST connecté
            function(){
                app.getFormID("");
            }
        );
        
    },

    updateMsg: function(msg) {
        document.getElementById("msg").innerHTML = msg;
	    document.getElementById("system-message-container").style.display = "block";
    },    

    showInfoMsg: function() {
        msg = "L'analyse de la présence des acanthasters nous permet de comprendre pour mieux agir. En nous signalant les acanthasters que vous rencontrez, vous nous aidez à protéger les récifs de Nouvelle-Calédonie.";
	    app.updateMsg(msg);
        $("#navbar").collapsible('collapse');
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
        var save = "false";
    	$('#form-cot_admin').submit(function() {
    		//console.log("form submit");
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
    			$('#remarks').val(), app.getDateTime(), save);			
    		return false;
	});	
    },

    //on utilise la fonction sql pour modifier les données
    addSubmitExistForm: function(id){
        var save = "false";
        $('#form-cot_admin').submit(function() {
            //console.log("form submit");
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
                $('#remarks').val(), id, save);          
            return false;
    }); 
    },

    saveForm: function(){
        var save = "true";
        app.validForm();
        event.preventDefault();
        if(app.getID()==""){
            console.log("allo insert id");
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
                $('#remarks').val(), app.getDateTime(), save);  
        }
        else {
            console.log("allo save finaliz");
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
                $('#remarks').val(), app.getID(), save);  
        }
        setTimeout(function(){app.cancel();},1000);
    },

    submitForm: function(){
    	if($("#form-cot_admin").valid()){
    	    app.sending();
            $("#form-cot_admin").submit();
        
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
            document.getElementById("counting_method_timed_swim").click(); 
        }
    },

    enable_distance_swim: function(status) {
        if(!status){
            document.getElementById("counting_method_distance_swim").value = "";
            document.getElementById("counting_method_distance_swim").setAttribute('readonly','readonly');
        } else {
            document.getElementById("counting_method_distance_swim").removeAttribute('readonly');
            document.getElementById("counting_method_distance_swim").click(); 
        }
    },

    enable_other: function(status) {
        if(!status){
            document.getElementById("counting_method_other").value = "";
            document.getElementById("counting_method_other").setAttribute('readonly','readonly');
        } else {
            document.getElementById("counting_method_other").removeAttribute('readonly');
            document.getElementById("counting_method_other").click(); 
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