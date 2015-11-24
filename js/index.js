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
    	this.updateMsg("un petit message pour vous dire que tout va bien");
        this.bindEvents();
	setTimeout(function(){
    	    //app.onDeviceReady();
	}, 2000);
		
	lang.loadLocalizedString();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        listeningElement.setAttribute('style', 'display:none;');

        console.log('Received Event: ' + id);
	app.addressPicker();
	db.synchronizeRemote();
	app.addSubmitForm();
			
    },

    clearForm: function() {
        $("#form-cot_admin").trigger('reset');
	window.location.reload();
    },

    updateMsg: function(msg) {
        document.getElementById("msg").innerHtml = msg;

    },    

    addressPicker: function(){	
	$( "#observation_localisation" ).addressPickerByGiro(
	    {
		distanceWidget: true
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
    	$( "#form-cot_admin" ).submit();
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
    
};


