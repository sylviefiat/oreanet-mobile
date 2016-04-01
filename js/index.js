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
	/*DEV  setTimeout(function(){app.receivedEvent('deviceready');},2000);*/
	
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
	setTimeout(function(){
            app.open();
	    app.closeMsg();
	    app.isOnline(function(){
	    	app.turnOffline();
		console.log("offline on received event");
	    },function(){
	    	app.addressPicker();
		db.synchronizeRemote();
		console.log("online on received event");
	    });
	    app.addSubmitForm();
	    app.validForm();
	}, 2000);		
    },
    // Turn app to online mode
    turnOnline: function(){
    	app.addressPicker();
	app.reloadForm();
	db.synchronizeRemote("online");
    },
    // Turn app to offline mode
    turnOffline: function(){
    	app.updateMsg("L'application est actuellement hors ligne, certaines fonctionnalités ne seront pas disponibles et les données seront envoyées à la prochaine connexion.");
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
    // ser closing screen
    close: function(){
    	window.scrollTo(0, 0);
    	var parentElement = document.getElementById("deviceready");
	parentElement.style.visibility = "visible";
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

    validForm: function(){
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
    },

    addSubmitForm: function(){
    	$('#form-cot_admin').submit(function() {
		console.log("form submit");
		db.insertCOT($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(),$('#observation_date').val(),
			$('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
			$('#observation_country').val(),$('#observation_country_code').val(),$('#observation_latitude').val(),$('#observation_longitude').val(),
			$('#observation_number').val(),$('#observation_culled').val(),$('#observation_state').val(),$('#counting_method_timed_swim').val(),
			$('#counting_method_distance_swim').val(),$('#counting_method_other').val(),
			$('#depth_range0').prop('checked')?$('#depth_range0').val():"",
			$('#depth_range1').prop('checked')?$('#depth_range1').val():"",
			$('#depth_range2').prop('checked')?$('#depth_range2').val():"",
			$('#observation_method0').prop('checked')?$('#observation_method0').val():"",
			$('#observation_method1').prop('checked')?$('#observation_method1').val():"",
			$('#remarks').val(),$('#localisation').val(),$('#admin_validation').val());				
		return false;
	});	
    },

    submitForm: function(){
    	if($("#form-cot_admin" ).valid()){
	    $("#form-cot_admin" ).submit();
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
	xhr.open("GET","http://193.51.249.49:83/restcotnc/cot.php",true);
    	xhr.send();
    }
    
};


