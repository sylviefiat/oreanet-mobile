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

/* global app management */
var app = {
    changeState: function(id,toState) {
        let oldState = toState === "on" ? "off":"";
        let newState = toState === "on" ? "":"off";
        if(document.getElementById(id+oldState)){
            document.getElementById(id+oldState).id = id+newState;
        }
    },
    switchOnline: function(isOnline){
        if(isOnline){
            //On affiche le formulaire
            app.changeState("content","on");
            //Changement de menu
            app.changeState("lien-site-menu","on");
            // Réinitialisation de l'adresse picker
            app.addressPicker();
            // fermeture des messages d'infos
            app.closeMsg();
            //Passage de l'indicateur à l'état "en ligne"
            online=document.getElementById("onlinelist");
            online.innerText = " En ligne";
            online.className = "ui-button-icon-right fa fa-signal ui-widget ui-button-inherit ui-controlgroup-item ui-button ui-shadow ui-corner-all online";
            // Affichage du bouton pour sauvgarder le formulaire
            if($('#btn-save').length){  
                $('#btn-save').show();
            }
            online.removeAttribute("disabled");
        } else {
            //On affiche le formulaire
            app.changeState("content","on");
            //Changement de menu
            app.changeState("lien-site-menu","off");
            //Affichage du message 
            app.updateMsg("L'application est actuellement hors ligne, certaines fonctionnalités ne seront pas disponibles et les données pourront être envoyées à la prochaine connexion.");
            //Passage de l'indicateur à l'état "hors ligne"
            online=document.getElementById("onlinelist");
            online.innerText = " Hors ligne";
            online.className = "ui-button-icon-right fa fa-signal ui-widget ui-button-inherit ui-controlgroup-item ui-button ui-shadow ui-corner-all";
            online.setAttribute("disabled","disabled");
        }
    },    
    // Turn app to online mode
    turnOnline: function(){  
        app.switchOnline(1);
    },
    // Turn app to offline mode
    turnOffline: function(){
        app.switchOnline(0);
    },
    datepickerDefaut: function(){
        $.datepicker.setDefaults({
            dateFormat: 'yy-mm-dd'
        });
    },
    setNotificationsList: function(hasElements,nbElements) {
        if(hasElements){
            $("#notEmptyListMenu").show();
            $("#notEmptyListMenu").html(nbElements);
            $("#notEmptyListItem").show();
            $("#notEmptyListItem").html(nbElements);
        } else {
            $("#notEmptyListMenu").hide();
            $("#notEmptyListItem").hide();
        }
    },
    // Application Constructor
    initialize: function() {        
        this.bindEvents();
        // set default dateformat
        app.datepickerDefaut();
        //On enlève offline
        app.switchOnline(1);
        // supprime tout message afficher (si il y en a)
        app.closeMsg();
        //On vérifie l’existence d'une liste - si oui on redirige vers la liste
        setTimeout(function(){db.listCOTexist();},500);
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                app.switchOnline(0);
            },
            // si on EST connecté
            function(){
                //Si on est sur la page index.html et on est online alors
                if(app.getUrlVars()["id"] == null){
                    app.switchOnline(1);
                }else {
                    app.changeState("content","on");
                }
            }
        );
        //dev mobile en ouvrant directement index.html
        //setTimeout(function(){app.onDeviceReady();},500);
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
        bool = $(invalid).length == 0;
        document.getElementById("btn-send").className = "fa fa-paper-plane ui-widget ui-button ui-controlgroup-item "+(bool?"valid":"invalid");
        // si c'est un formulaire existant qu'on reprend alors on affiche les champs a completer        
        if(bool){
            app.closeMsg();
            $(elems).removeClass("error");
        } else {
            if(idform!="" && idform!=null){
                app.updateMsg("Voici votre formulaire à finaliser. Il vous reste "+ $(invalid).length +" champ(s) à remplir." +  " <a href='#' onclick='return app.cancel()'>Retour à la liste</a>");
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
                    // enleve le splashscreen et affiche le formulaire
                    app.open();
                }
                // supprime tout message afficher (si il y en a)
                app.closeMsg();
                // passer en status hors ligne
                //app.turnOffline();
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
            // supprime tout message affiché (si il y en a)
            app.closeMsg();
            // démarrer le plugin addressPicker
            app.addressPicker();
            // ajouter un listener sur le formulaire
            app.addSubmitForm();
            // ajouter un "validateur" de formulaire
            app.validForm();
            $('input:required').change(app.checkStatus);
            //test liste existe ajout du retour a la liste
            db.listExistNewForm();

            }, 0);
        }
        //sinon on modifie un formulaire existant
        else {
            setTimeout(function(){
            var id = app.getUrlVars()["id"];
            //console.log("<<<<<formulaire existant>>>>");
            // remplir avec ces données le formulaire
            db.reditCOTForm(id);
            // démarrer le plugin addressPicker
            if(app.getUrlVars()["lat"] !="" && app.getUrlVars()["lng"] !=""){
                var lat = app.getUrlVars()["lat"];
                var lng = app.getUrlVars()["lng"];
                //console.log(lat);
                app.addressPickerRedit(lat, lng);
            }
            else {
                app.addressPicker();
            }
            // ajouter un listener sur le formulaire avec l'id de celui-ci
            app.addSubmitExistForm(id);
            // ajouter un "validateur" de formulaire
            app.validForm();

            $('input:required').change(app.checkStatus);
                
            //test liste existe ajout du retour a la liste
            db.listExistNewForm();
            }, 0);
        }
    },

    //on récupére l'id du formulaire à ouvrir
    getFormID: function(id){
        window.location.href="./index.html?id="+id;
    },

    //on récupére l'id du formulaire à ouvrir
    getFormLatLng: function(id){
        db.recupLatLng(id);
    },

    //on retourne l'id du formulaire encours
    getID: function(){
        return app.getUrlVars()["id"];
    },

    //on remplit le formulaire chargé avec ces données
    reditForm: function(name,tel,email,datetime,location,localisation,region,country,latitude,longitude,number,culled,timed_swim,distance_swim,other_chbx,range,method,remarks){
        document.getElementById('observer_name').value = name;
        document.getElementById('observer_tel').value = tel;
        document.getElementById('observer_email').value = email;
        document.getElementById('observation_datetime').value = datetime;
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
            document.getElementById("label_depth_range0").className = "ui-button ui-corner-all ui-button-inherit ui-button-icon-left ui-first-child ui-checkbox-on";
        } 

        if(range.indexOf("medium") != -1){
            //console.log("medium");
            document.getElementById("depth_range1").checked = true;
            document.getElementById("label_depth_range1").className = "ui-button ui-corner-all ui-button-inherit ui-button-icon-left ui-first-child ui-checkbox-on";
        }

        if(range.indexOf("deep") != -1){
            //console.log("deep");
            document.getElementById("depth_range2").checked = true;
            document.getElementById("label_depth_range2").className = "ui-button ui-corner-all ui-button-inherit ui-button-icon-left ui-first-child ui-checkbox-on";
        }

        if(method.indexOf("snorkelling") != -1){
            //console.log("snorkelling");
            document.getElementById("observation_method0").checked = true;
            document.getElementById("label_observation_method0").className = "ui-button ui-corner-all ui-button-inherit ui-button-icon-left ui-first-child ui-checkbox-on";
        }

        if (method.indexOf("scuba diving") != -1){
            //console.log("scuba diving");
            document.getElementById("observation_method1").checked = true;
            document.getElementById("label_observation_method1").className = "ui-button ui-corner-all ui-button-inherit ui-button-icon-left ui-first-child ui-checkbox-on";
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

    // Remove splascreen
    open: function(){
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
        window.scrollTo(0, 0);
        app.changeState("deviceready","on");
        document.querySelector('.listening').className = 'event ready';
        var parentElement = document.getElementById("deviceready");
        parentElement.style.visibility = "visible";                
        var listeningElement = parentElement.querySelector('.onsend');
        if(listeningElement != null){
            listeningElement.className='event sending row vertical-align';
        }
    },
    // set closing screen
    close: function(wasSent){
        window.scrollTo(0, 0);
        //test online ou offline
        if(!wasSent){
                window.location.href="./list.html";
                //document.getElementById("lien-site-web").id = "lien-site-web-off";                
                alert("Votre formulaire n'a pas pu être envoyé, vous pourrez l'envoyer lors de votre prochaine connexion à internet.");
        } else {
            //on affiche le lien retour a la liste si elle exist
            db.listExistCLOSE();
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
        }
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
        $("#observation_localisation" ).addressPickerWithOL({});    
    },

    addressPickerRedit: function(lat, long){  
        mapLat=parseFloat(lat) ? parseFloat(lat):default_latitude;
        mapLong=parseFloat(long) ? parseFloat(long):default_longitude;
        $("#observation_localisation" ).addressPickerWithOL(
        {
            mapOptions: {
                zoom: 7,
                center: [mapLat, mapLong],
                scrollwheel: true,
                mapTypeId: "Bing"
            },
            geocoderOptions: {
                language: "fr"
            },
            marker: [mapLat, mapLong]
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
                        observation_datetime: {
                            required: true,
                            date: true
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
                        observation_datetime: {
                            required: true,
                            date: true
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

    insertCOT: function(id, save) {
         db.insertCOT($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_datetime').val(),
                $('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
                $('#observation_pays').val(),$('#observation_latitude').val(),$('#observation_longitude').val(),
                $('#observation_number').val(),$('#observation_culled').val(),
                $('#counting_method_timed_swim').val(), $('#counting_method_distance_swim').val(),$('#counting_method_other').val(),
                $('#depth_range0').prop('checked')?$('#depth_range0').val():"",
                $('#depth_range1').prop('checked')?$('#depth_range1').val():"",
                $('#depth_range2').prop('checked')?$('#depth_range2').val():"",
                $('#observation_method0').prop('checked')?$('#observation_method0').val():"",
                $('#observation_method1').prop('checked')?$('#observation_method1').val():"",
                $('#remarks').val(), id, save); 
    },

    updateCOT: function(id,save){
        db.updateFormCot($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_datetime').val(),
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
    },

    //On utilise la fonction sql pour enregistrer les données
    addSubmitForm: function(){
        var save = "false";
        $('#form-cot_admin').submit(function() {
            app.insertCOT(app.getDateTime(), save);       
            return false;
        });    
    },

    //on utilise la fonction sql pour modifier les données
    addSubmitExistForm: function(id){
        var save = "false";
        $('#form-cot_admin').submit(function() {
            app.updateCOT(id,save);
            return false;
        }); 
    },

    saveForm: function(){
        var save = "true";
        event.preventDefault();
        if(app.getID()==""){
            app.insertCOT(app.getDateTime(), save);
        }
        else {
            app.updateCOT(app.getID(),save);
        }
        setTimeout(function(){app.cancel();},1000);
    },

    submitForm: function(){
        if($("#form-cot_admin").valid()){
            app.sending();
            if(app.getID()==""){
                app.insertCOT(app.getDateTime(), "false");
            }
            else {
                app.updateCOT(app.getID(),"false");
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
            document.getElementById("counting_method_timed_swim").focus();
            document.getElementById("counting_method_timed_swim").removeAttribute('readonly');
        }
    },

    enable_distance_swim: function(status) {
        if(!status){
            document.getElementById("counting_method_distance_swim").value = "";
            document.getElementById("counting_method_distance_swim").setAttribute('readonly','readonly');
        } else {
            document.getElementById("counting_method_distance_swim").focus();
            document.getElementById("counting_method_distance_swim").removeAttribute('readonly');
        }
    },

    enable_other: function(status) {
        if(!status){
            document.getElementById("counting_method_other").value = "";
            document.getElementById("counting_method_other").setAttribute('readonly','readonly');
        } else {
            document.getElementById("counting_method_other").focus();
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
        // l'url du service rest est dans le fichier conf.js
        xhr.open("GET",url_oreanet,true);
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
