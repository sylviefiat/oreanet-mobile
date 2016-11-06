/*!
 * jQuery Address Picker ByGiro v0.0.6
 *
 * Copyright 2015, G. Tomaselli
 * Licensed under the MIT license.
 *
 */

 
// compatibility for jQuery / jqLite
var bg = bg || false;
if(!bg){
	if(typeof jQuery != 'undefined'){
		bg = jQuery;
	} else if(typeof angular != 'undefined'){
		bg = angular.element;
		bg.extend = angular.extend;
	}
}

;(function ($) {
    "use strict";
    var methods;

	var timer = {};
	function delay (callback, ms, type){
		clearTimeout (timer[type]);
		timer[type] = setTimeout(callback, ms);
	}
	
	function updateElements(data){			
		var that = this, data = data || this.addressMapping[this.$element.val()],$sel;
		if(!data) return;
		
		for ( var i in this.settings.boundElements) {
			if(!$(i)) return true;
			var dataProp = this.settings.boundElements[i];
			$sel = $(i);
			
			var newValue = '';
			if(typeof dataProp == 'function'){
				newValue = dataProp.call(that,data);
			} else if(data.cleanData && data.cleanData[dataProp]) {
				newValue = data.cleanData[dataProp];
			}
			
			var listCount = $sel.length;
			for ( var i = 0; i < listCount; i ++){
				var method = 'val',
				it = $sel.eq(i);
				if(!it.is('input, select, textarea')){
					method = 'text';					
				};
				it[method](newValue);				
			}			
		}

		that.$element.triggerHandler('selected.addressPickerByGiro', data);		
	}
	
	function createMarker(){
		var that = this, mapOptions = $.extend({}, that.settings.mapOptions);
		mapOptions.center = new google.maps.LatLng(mapOptions.center[0], mapOptions.center[1]);
		
		var markerOptions = {
			position: mapOptions.center,
			draggable: true,
			raiseOnDrag: true,
			map: that.gmap,
			labelContent: that.settings.text.you_are_here,
			labelAnchor: new google.maps.Point(0, 0),
			labelClass: that.settings.markerLabelClass,
			labelStyle: {
				opacity: 1
			}
		};
		
		// marker
		if (that.settings.markerType == 'styled' && typeof StyledMarker == "function"){
			// styled marker
			var styleIcon = new StyledIcon(StyledIconTypes.BUBBLE,{color:"#51A351",fore:'#ffffff',text:that.settings.text.you_are_here});
			markerOptions.styleIcon = styleIcon;				
			that.gmarker = new StyledMarker(markerOptions);				
		} else if (that.settings.markerType == 'labeled' && typeof MarkerWithLabel == "function"){
			// labeled marker
			that.gmarker = new MarkerWithLabel(markerOptions);
		} else {
			// default marker
			that.gmarker = new google.maps.Marker(markerOptions);
		}				
		
		// event triggered when marker is dragged and dropped
		google.maps.event.addListener(that.gmarker, "dragend", function () {
			that.geocodeLookup(that.gmarker.getPosition(), false, "latLng", true);
		});
		// event triggered when map is clicked
		google.maps.event.addListener(that.gmap, "click", function (event) {
			that.gmarker.setPosition(event.latLng);
			that.geocodeLookup(event.latLng, false, "latLng", true);
		});		
		
		this.gmarker.setVisible(false);
	}
	
	function createCircle(){		
		var that = this,radius,
		mapOptions = $.extend({}, that.settings.mapOptions);
		
		mapOptions.center = new google.maps.LatLng(mapOptions.center[0], mapOptions.center[1]);
		
		if(radius){
			radius = radius * 1000; // Km -> m
		}
		
		radius = radius || that.settings.distanceWidgetRadius;
		var circle =  new google.maps.Circle({
			center: mapOptions.center,
			radius: radius, // Km
			strokeColor: "#005DE0",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#005DE0",
			fillOpacity: 0.25,
			map: that.gmap
		}),
		handleMouseEnter = function ( event ) {
			circle.setEditable( true );
		},
		handleMouseLeave = function ( event ) {
			circle.setEditable( false );
		};
				
		that.gcircle = circle;
		that.gcircle.setVisible(false);	
		
		google.maps.event.addListener(that.gcircle, 'radius_changed', function(){
			that.updater();
		});
		google.maps.event.addListener( that.gcircle, 'mouseover', handleMouseEnter );
		google.maps.event.addListener( that.gcircle, 'mouseout' , handleMouseLeave );
		
		// bind circle to marker dragging
		that.gcircle.bindTo('center', that.gmarker, 'position');
	}	
	
    methods = {
        init: function ($element, options) {
            var that = this;
            that.$element = $element;
            that.settings = $.extend({}, {
                map: false,
                mapId: false,
				mapWidth: '100%',
				mapHeight: '300px',
                mapOptions: {
                    zoom: 7,
                    center: [-21.5, 165.5],
                    scrollwheel: true,
		    zoomGesturesEnabled: true,
		    scrollGesturesEnabled: true,
                    mapTypeId: "hybrid"
                },
				makerType: false, /* labeled, styled */
				distanceWidget: true,
				distanceWidgetRadius: 300,  /* meters */
                appendToAddressString: '',
                geocoderOptions: {
					language: "fr"
                },
                typeaheadOptions: {
                    source: that.source,
                    updater: that.updater,
                    matcher: function(){return true;}
                },
                boundElements: {
                    '.country': 'country',
                    '.region': 'region',
                    '.latitude': 'latitude',
                    '.longitude': 'longitude',
                    '.formatted_address': 'formatted_address'
                },
				
				// internationalization
				text: {
					you_are_here: "Vous êtes ici",
				},
				map_rendered: false,
            }, options);
			
			for(var key in that.settings.typeaheadOptions){
				var method = that.settings.typeaheadOptions[key];
                if (typeof method == 'function') {
                    that.settings.typeaheadOptions[key] = method.bind(that);
                }				
			}

            // hash to store geocoder results keyed by address
            that.addressMapping = {};
            that.currentItem = '';
            that.geocoder = new google.maps.Geocoder();

            that.initMap.apply(that, undefined);

			if(typeof that.$element.typeahead == 'function'){
				that.$element
					.attr('autocomplete', 'off')
					.typeahead(that.settings.typeaheadOptions);
			}

				
			// load current address if any - using latLng
			if(that.$element.val() != ''){				
				$lat = $(".latitude");
				$lng = $(".longitude");
				if($lat != null && $lng != null){
					that.geocodeLookup($lat.val()+","+$lng.val(), false, 'latLng', true);
				} else {
					that.geocodeLookup(that.$element.val(), false, '', true);
				}
			}
        },
        initMap: function () {
			var that = this,
			$mapContainer;
            if (!that.settings.mapId && !(that.settings.map instanceof google.maps.Map)){
                // create map and hide it
				that.settings.mapId = (new Date).getTime() + Math.floor((Math.random() * 9999999) + 1);
				$mapContainer = $('<div style="margin: 5px 0; width: '+ that.settings.mapWidth +'; height: '+ that.settings.mapHeight +';" id="'+ that.settings.mapId +'"></div>');
				that.$element.after($mapContainer);
            } else {
				$mapContainer = $(that.settings.mapId);
			}
			
            if (that.map_rendered == true) {
                that.resizeMap();
                return;
            }
			
            var mapOptions = $.extend({}, that.settings.mapOptions),
                baseQueryParts, markerOptions;

			if(!(this.settings.map instanceof google.maps.Map)){
				mapOptions.center = new google.maps.LatLng(mapOptions.center[0], mapOptions.center[1]);
				this.gmap = new google.maps.Map($mapContainer[0], mapOptions);
			} else {
				this.gmap = this.settings.map;
			}
			
			// create marker
			createMarker.call(this);

			// create circle
			if (this.settings.distanceWidget){
				createCircle.call(this);
			}
			
			that.map_rendered = true;
        },
        source: function (query, process) {
            var labels, that = this;
			
			var sourceFunction = function(resolve, reject){				
				delay(function(){
					that.geocodeLookup(query, function (geocoderResults){
						that.addressMapping = {};
						labels = [];
						
						var listCount = geocoderResults.length;
						for ( var i = 0; (i < listCount && i<9); i ++){ // limit to max 9 suggestions
							var element = geocoderResults[i];
							that.addressMapping[element.formatted_address] = element;
							labels.push(element.formatted_address);							
						}

						if(typeof resolve == 'function') resolve(labels);
						if(typeof process == 'function'){
							return process(labels);
						}
					});
				}, 250, 'source');
			};
			
			if(window.Promise){
				return new Promise(sourceFunction);
			} else {
				sourceFunction();
			}
			
        },
        updater: function (item,query) {
            var that = this, item = item || that.$element.val();
	    var data = this.addressMapping[item] || {};
   	    var propertiesMap,cleanData = {};
	    if (typeof query != "string") {
	        if(query.lat != null && query.lng != null){
	    	    data.geometry.location = query;	    
		}
	    } 
	    var latLng = data.geometry.location;	    
	    //var latLng = query;	    

            if (!data) {
                return;
            }
			
			// cleanData
			propertiesMap = {
				'country': {
					'long_name': 'country',
					'short_name': 'country_code'
				},
				'administrative_area_level_1': {
					'long_name': 'region',
					'short_name': 'region_code'
				},
				'administrative_area_level_2': {
					'long_name': 'county',
					'short_name': 'county_code'
				},
				'locality': {
					'long_name': 'city'
				},
				'sublocality': {
					'long_name': 'city_district'
				},
				'postal_code': {
					'long_name': 'zip'
				},
				'route': {
					'long_name': 'street'
				},
				'street_number': {
					'long_name': 'street_number'
				}
			};		

			if(data.address_components){
				for(var a=0;a<data.address_components.length;a++){
					var adr = data.address_components[a];
					for(var p in propertiesMap){
						if(adr.types.indexOf(p) >= 0){
							for(var pp in propertiesMap[p]){
								if(typeof adr[pp] != 'undefined'){
									cleanData[propertiesMap[p][pp]] = adr[pp];
								}								
							}
						}
					}
				}
			}
			cleanData.latitude = Number(latLng.lat().toFixed(8));
			cleanData.longitude = Number(latLng.lng().toFixed(8));
			cleanData.formatted_address = data.formatted_address;

            if (that.gmarker) {
                that.gmarker.setPosition(data.geometry.location);
                that.gmarker.setVisible(true);

            }
			
			if(that.gcircle){
				that.gcircle.setCenter(data.geometry.location);
				that.gcircle.setVisible(true);

				cleanData.radius = Math.round(that.gcircle.getRadius()) / 1000;
			}

			if(that.gcircle){				
				that.gmap.fitBounds(that.gcircle.getBounds());
			} else {
				that.gmap.fitBounds(data.geometry.viewport);
			}

			data.cleanData = cleanData;
			updateElements.call(that,data);

            return item;
        },
        currentAddress: function () {
            return this.addressMapping[this.$element.val()] || {};
        },
        geocodeLookup: function (query, callback, type, updateUi) {
			updateUi = updateUi || false;
			type = type || '';
			var that=this,request = $.extend({},that.settings.geocoderOptions);
			if(type == 'latLng'){
				if (typeof query == "string") {
					query = query.split(",");
					query = new google.maps.LatLng(query[0], query[1]);
				}
				request.latLng = query;
			} else {
				request.address = query + that.settings.appendToAddressString;
			}
			
            this.geocoder.geocode(request, function (geocoderResults, status) {
                if(status !== google.maps.GeocoderStatus.OK) return;
				
				if (typeof callback == 'function') {
                    callback.call(that, geocoderResults);
                }

		
				
		if(updateUi){
		    var i;
		    if(geocoderResults[0].types[0] == "route" && geocoderResults[1] != null){
		    	i=1;
		    } else {
		    	i=0;
		    }
		    var address = geocoderResults[i].formatted_address;
		    that.$element.val(address).change();
		    that.addressMapping[address] = geocoderResults[i];
		    that.updater(address,query);
		}
            });
        },
        resizeMap: function (latitude, longitude) {
			var that = this;
			delay(function(){
            var lastCenter, map_cont = that.mapContainer ? $(that.mapContainer) : $("#" + that.mapId).parent();
			
			if(!map_cont.length) return;
			
            var parent_map_cont = map_cont.parent(),
            h = parent_map_cont.height();
            w = parent_map_cont.width();
			
            map_cont.css("height", h);
            map_cont.css("width", w);
            if (typeof latitude != "undefined" && typeof longitude != "undefined") {
					lastCenter = new google.maps.LatLng(latitude, longitude);
				} else {
					lastCenter = that.gmap.getCenter();
            }
				
            google.maps.event.trigger(that.gmap, "resize");
            that.gmap.setCenter(lastCenter);
			},300,'resize');			
        },
		setRadius: function(radius){ // in km
			var that = this;
			if(!that.gcircle) return;
			
			that.gcircle.setRadius(radius *1000);
			that.gmap.fitBounds(that.gcircle.getBounds());
		}
    };

    var main = function (method) {
        var addressPickerByGiro = this.data('addressPickerByGiro');
        if (addressPickerByGiro) {
            if (typeof method === 'string' && addressPickerByGiro[method]) {
                return addressPickerByGiro[method].apply(addressPickerByGiro, Array.prototype.slice.call(arguments, 1));
            }
            return //console.log('Method ' +  method + ' does not exist on jQuery.addressPickerByGiro');
        } else {
            if (!method || typeof method === 'object') {
				
				var listCount = this.length;
				for ( var i = 0; i < listCount; i ++) {
					var $this = $(this[i]), addressPickerByGiro;
                    addressPickerByGiro = $.extend({}, methods);
                    addressPickerByGiro.init($this, method);
                    $this.data('addressPickerByGiro', addressPickerByGiro);
				};

				return this;
            }
            return //console.log('jQuery.addressPickerByGiro is not instantiated. Please call $("selector").addressPickerByGiro({options})');
        }
    };

	// plugin integration
	if($.fn){
		$.fn.addressPickerByGiro = main;
	} else {
		$.prototype.addressPickerByGiro = main;
	}
}(bg));
