var lang = {
	
    loadLocalizedString: function(langParam/*optional*/) {
        var language = window.navigator.language, l; 
        console.log('loadLocalizedString with Navigator Language: ' + language);
        if (!langParam) {
            //Try to guess the best suited language
            if(language) {
                 l = language.substring(0,2); 
            } else {
                lang = 'fr';
            }
            if($.inArray(l, this.SUPPORTED_LANGUAGE) <= -1) {
                l = 'fr';//If the language is not available : english by default
            }
        } else {
            l = langParam;
        }
       console.log('language: ' + l);
       this.loadString('lib/string-'+l+'.js');
	//this.updateLanguage();
    },
    
    SUPPORTED_LANGUAGE : ["en", "fr"],

    loadString:function(fileName) {
        try {
            $.ajaxSetup({async: false});
	    var scriptUrl = "scripts/dynamicScript.js";
	    var head = document.getElementsByTagName("head")[0];
	    script = document.createElement('script');
	    script.type = 'text/javascript';
	    script.src = fileName;
	    script.onload = function (){
    		lang.updateLanguage();
	    };
	    script.onerror = function(e) { alert("failed: " + JSON.stringify(e)); };
	    head.appendChild(script);
            //$.getScript(fileName);//We don't use the async callback, because we need the translation in the next method
            $.ajaxSetup({async: true});

        } catch (e) {
            console.error('Error while loading : ' + fileName);
        }

    },

    updateLanguage: function(){
	// Get all HTML elements that have a resource key.
	var resElms = document.querySelectorAll('[data-res]');
	for (var n = 0; n < resElms.length; n++) {
	    var resEl = resElms[n];
	    // Get the resource key from the element.
	    var resKey = resEl.getAttribute('data-res');
	    if (resKey) {
		// Get all the resources that start with the key.
		for (var key in lang.STR) {
		    if (key.indexOf(resKey) == 0) {
		        var resValue = lang.STR[key];
		        if (key.indexOf('.') == -1) {
		            // No dot notation in resource key,
		            // assign the resource value to the element's
		            // innerHTML.
		            resEl.innerHTML = resValue;
		        }
		        else {
		            // Dot notation in resource key, assign the
		            // resource value to the element's property
		            // whose name corresponds to the substring
		            // after the dot.
		            var attrKey = key.substring(key.indexOf('.') + 1);
		            resEl[attrKey] = resValue;
		        }
		    }
		}
	    }
	}
    }
}
