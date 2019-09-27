/*!
 * jQuery Address Picker With OpenLayers 3
 * Inspireed by jQuery Address Picker ByGiro v0.0.6
 *
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
    var methods, map, vectorSource, iconStyle, pointInteraction,dynamicPinLayer, exist = false;

    var timer = {};
    function delay (callback, ms, type){
        clearTimeout (timer[type]);
        timer[type] = setTimeout(callback, ms);
    }
    
    function updateElements(data,query){   
        var that = this;
        if(!data) return;
        for ( var i in this.settings.boundElements) {
            if(!$(i)) return true;
            var dataProp = this.settings.boundElements[i];
            var $sel = $(i);
            
            var newValue = '';
            if(typeof dataProp == 'function'){
                newValue = dataProp.call(that,data);
            } else if(typeof dataProp == 'string') {
                newValue = dataProp.split('.').reduce(function(a,v){ return a[v] }, data);
                if(!newValue){
                    newValue=query[dataProp];
                }
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

        that.$element.triggerHandler('selected.addressPickerWithOL', data);
    } 
    function createMarker(coordinate){
            var that = this;
            if(that.vectorSource.getFeatures().length >= 1){
              that.vectorSource.clear();
            }
            that.map.removeInteraction(that.pointInteraction);
            var feature = new ol.Feature(
              new ol.geom.Point(coordinate)
            );
            feature.setStyle(that.iconStyle);
            that.vectorSource.addFeature(feature);
            that.pointInteraction = new ol.interaction.Modify({
              features: new ol.Collection([feature])
            });
            feature.on('change',function(){
              var coord = ol.proj.toLonLat(this.getGeometry().getCoordinates()).map(function(val) {
                return val.toFixed(6);
              });
              that.geocodeLookup(coord[1]+","+coord[0], false, 'latLng', true);
            },feature);
            that.map.addInteraction(that.pointInteraction);    
    }      
    
    methods = {
        init: function ($element, options) {
            var that = this, $lat, $lng;
            that.$element = $element;
            that.settings = $.extend({}, {
                map: false,
                mapId: false,
                mapWidth: '100%',
                mapHeight: '500px',
                mapOptions: {
                    zoom: 7,
                    center: [-21.5, 165.5],
                    scrollwheel: true,
                    mapTypeId: "Bing"
                },
                makerType: false, /* labeled, styled */
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
                    '.country': 'components.state',
                    '.region': 'components.county',
                    '.latitude': '0',
                    '.longitude': '1',
                    '.formatted_address': 'formatted'
                },
                
                // internationalization
                text: {
                    you_are_here: "You are here",
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
            $lat = $(".latitude");
            $lng = $(".longitude");
            if($lat != null && $lat.val() !== '' && $lng != null && $lng.val() !== ''){
               that.geocodeLookup($lat.val()+","+$lng.val(), false, 'latLng', true);
            } else {
                that.geocodeLookup(that.$element.val(), false, '', true);
            }
            that.initMap.apply(that);
        },
        initMap: function () {
            var that = this,
            $mapContainer;
            that.settings.mapId = (new Date).getTime() + Math.floor((Math.random() * 9999999) + 1);
            $mapContainer = $('<div style="margin: 5px 0; width: '+ that.settings.mapWidth +'; height: '+ that.settings.mapHeight +';" id="map" class="map"></div>');
            that.$element.after($mapContainer);
                        
            var mapOptions = $.extend({}, that.settings.mapOptions),
                baseQueryParts, markerOptions;
            var coordinate = ol.proj.fromLonLat([mapOptions.center[1],mapOptions.center[0]]);
            that.map = new ol.Map({
                layers: [
                  new ol.layer.Tile({
                      source: new ol.source.BingMaps({
                        key: 'AiY3BBonUo3ah7DOGnW3raeuGcP84sw1ekzjCIYHYXRYOEWI73K5tcsGho2EdxEa',
                        imagerySet:'AerialWithLabels'
                      }),
                      title: 'Satellite base',
                      type: 'base',
                    })
                ],
                target: 'map',
                view: new ol.View({
                  center: [coordinate[0],coordinate[1]],
                  zoom: mapOptions.zoom
                })
              });
            that.iconStyle = new ol.style.Style({
                image: new ol.style.Icon(({
                  anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    size: [48, 48],
                    opacity: 1,
                    src: 'http://oreanet.ird.nc/images/map-icon-red.png'
                }))
            });
            that.vectorSource = new ol.source.Vector({
                features: []
            });
            that.dynamicPinLayer = new ol.layer.Vector({
                source: that.vectorSource
            });
            that.map.addLayer(that.dynamicPinLayer);
            that.map.on('click', function(e) {                
                that.map.getView().setCenter(e.coordinate);
                createMarker.call(that, e.coordinate);
                var coord = ol.proj.toLonLat(e.coordinate).map(function(val) {
                    return val.toFixed(6);
                });
              that.geocodeLookup(coord[1]+","+coord[0], false, 'latLng', true);
            });

            var $lat = $(".latitude");
            var $lng = $(".longitude");
            if($lat != null && $lat.val() !== '' && $lng != null && $lng.val() !== ''){
                var coord = ol.proj.fromLonLat([Number($lng.val()),Number($lat.val())]).map(value => {
                    return value;
                });
                createMarker.call(that, coord);
            }
            that.map_rendered = true;
        },
        
        source: function (query, process) {
            var labels, that = this;
            
            var sourceFunction = function(resolve, reject){             
                delay(function(){
                    that.geocodeLookup(query, function (geocoderResults){
                        that.addressMapping = {geocoderResults};
                        labels = [geocoderResults.city];                       

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
            updateElements.call(that,item,query);

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
                }
                request.latLng = query;
            } else {
                request.address = query + that.settings.appendToAddressString;
            }
            fetch('https://api.opencagedata.com/geocode/v1/json?q=' + query[0] + '+,' + query[1] + '&key=10cc98da95554cf59db6f0a7cce95e99').then(function(response) {
                return response.json();
            }).then(function(json) {
        json = json.results[0];
                if (typeof callback == 'function') {
                    callback.call(that, json);
                }
                if(updateUi){
                    that.updater(json,query);
                }
            })
        }       
    };

    var main = function (method) {
        var addressPickerWithOL = this.data('addressPickerWithOL');
        if (addressPickerWithOL) {
            if (typeof method === 'string' && addressPickerWithOL[method]) {
                return addressPickerWithOL[method].apply(addressPickerWithOL, Array.prototype.slice.call(arguments, 1));
            }
            return console.log('Method ' +  method + ' does not exist on jQuery.addressPickerWithOL');
        } else {
            if (!method || typeof method === 'object') {                
                var listCount = this.length;
                for ( var i = 0; i < listCount; i ++) {
                    var $this = $(this[i]), addressPickerWithOL;
                    addressPickerWithOL = $.extend({}, methods);
                    addressPickerWithOL.init($this, method);
                    $this.data('addressPickerWithOL', addressPickerWithOL);
                };

                return this;
            }
            return console.log('jQuery.addressPickerWithOL is not instantiated. Please call $("selector").addressPickerWithOL({options})');
        }
    };

    // plugin integration
    if($.fn){
        $.fn.addressPickerWithOL = main;
    } else {
        $.prototype.addressPickerWithOL = main;
    }
}(bg));
