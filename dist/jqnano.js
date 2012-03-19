/*!
 * jQuery Nano MVC mini framework - v0.3 - 15/03/2012
 * http://www.jqnano.com/
 *
 * Copyright (c) 2012 Oleksii Glib
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 *
 * Components included with MIT license:
 *  - jQuery HashChange (http://benalman.com/projects/jquery-hashchange-plugin/)
 *  - Simple JavaScript Inheritance (http://ejohn.org/blog/simple-javascript-inheritance/)
 */
(function($,window,undefined){
    '$:nomunge'; // Used by YUI compressor.

    // Reused string.
    var str_hashchange = 'hashchange',

        // Method / object references.
        doc = document,
        fake_onhashchange,
        special = $.event.special,

        // Does the browser support window.onhashchange? Note that IE8 running in
        // IE7 compatibility mode reports true for 'onhashchange' in window, even
        // though the event isn't supported, so also test document.documentMode.
        doc_mode = doc.documentMode,
        supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );

    // Get location.hash (or what you'd expect location.hash to be) sans any
    // leading #. Thanks for making this necessary, Firefox!
    function get_fragment( url ) {
        url = url || location.href;
        return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
    };

    // Method: jQuery.fn.hashchange
    //
    // Bind a handler to the window.onhashchange event or trigger all bound
    // window.onhashchange event handlers. This behavior is consistent with
    // jQuery's built-in event handlers.
    //
    // Usage:
    //
    // > jQuery(window).hashchange( [ handler ] );
    //
    // Arguments:
    //
    //  handler - (Function) Optional handler to be bound to the hashchange
    //    event. This is a "shortcut" for the more verbose form:
    //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
    //    all bound window.onhashchange event handlers will be triggered. This
    //    is a shortcut for the more verbose
    //    jQuery(window).trigger( 'hashchange' ). These forms are described in
    //    the <hashchange event> section.
    //
    // Returns:
    //
    //  (jQuery) The initial jQuery collection of elements.

    // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
    // $(elem).hashchange() for triggering, like jQuery does for built-in events.
    $.fn[ str_hashchange ] = function( fn ) {
        return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
    };

    // Property: jQuery.fn.hashchange.delay
    //
    // The numeric interval (in milliseconds) at which the <hashchange event>
    // polling loop executes. Defaults to 50.

    // Property: jQuery.fn.hashchange.domain
    //
    // If you're setting document.domain in your JavaScript, and you want hash
    // history to work in IE6/7, not only must this property be set, but you must
    // also set document.domain BEFORE jQuery is loaded into the page. This
    // property is only applicable if you are supporting IE6/7 (or IE8 operating
    // in "IE7 compatibility" mode).
    //
    // In addition, the <jQuery.fn.hashchange.src> property must be set to the
    // path of the included "document-domain.html" file, which can be renamed or
    // modified if necessary (note that the document.domain specified must be the
    // same in both your main JavaScript as well as in this file).
    //
    // Usage:
    //
    // jQuery.fn.hashchange.domain = document.domain;

    // Property: jQuery.fn.hashchange.src
    //
    // If, for some reason, you need to specify an Iframe src file (for example,
    // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
    // do so using this property. Note that when using this property, history
    // won't be recorded in IE6/7 until the Iframe src file loads. This property
    // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
    // compatibility" mode).
    //
    // Usage:
    //
    // jQuery.fn.hashchange.src = 'path/to/file.html';

    $.fn[ str_hashchange ].delay = 50;
    /*
     $.fn[ str_hashchange ].domain = null;
     $.fn[ str_hashchange ].src = null;
     */

    // Event: hashchange event
    //
    // Fired when location.hash changes. In browsers that support it, the native
    // HTML5 window.onhashchange event is used, otherwise a polling loop is
    // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
    // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
    // compatibility" mode), a hidden Iframe is created to allow the back button
    // and hash-based history to work.
    //
    // Usage as described in <jQuery.fn.hashchange>:
    //
    // > // Bind an event handler.
    // > jQuery(window).hashchange( function(e) {
    // >   var hash = location.hash;
    // >   ...
    // > });
    // >
    // > // Manually trigger the event handler.
    // > jQuery(window).hashchange();
    //
    // A more verbose usage that allows for event namespacing:
    //
    // > // Bind an event handler.
    // > jQuery(window).bind( 'hashchange', function(e) {
    // >   var hash = location.hash;
    // >   ...
    // > });
    // >
    // > // Manually trigger the event handler.
    // > jQuery(window).trigger( 'hashchange' );
    //
    // Additional Notes:
    //
    // * The polling loop and Iframe are not created until at least one handler
    //   is actually bound to the 'hashchange' event.
    // * If you need the bound handler(s) to execute immediately, in cases where
    //   a location.hash exists on page load, via bookmark or page refresh for
    //   example, use jQuery(window).hashchange() or the more verbose
    //   jQuery(window).trigger( 'hashchange' ).
    // * The event can be bound before DOM ready, but since it won't be usable
    //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
    //   to bind it inside a DOM ready handler.

    // Override existing $.event.special.hashchange methods (allowing this plugin
    // to be defined after jQuery BBQ in BBQ's source code).
    special[ str_hashchange ] = $.extend( special[ str_hashchange ], {

        // Called only when the first 'hashchange' event is bound to window.
        setup: function() {
            // If window.onhashchange is supported natively, there's nothing to do..
            if ( supports_onhashchange ) { return false; }

            // Otherwise, we need to create our own. And we don't want to call this
            // until the user binds to the event, just in case they never do, since it
            // will create a polling loop and possibly even a hidden Iframe.
            $( fake_onhashchange.start );
        },

        // Called only when the last 'hashchange' event is unbound from window.
        teardown: function() {
            // If window.onhashchange is supported natively, there's nothing to do..
            if ( supports_onhashchange ) { return false; }

            // Otherwise, we need to stop ours (if possible).
            $( fake_onhashchange.stop );
        }

    });

    // fake_onhashchange does all the work of triggering the window.onhashchange
    // event for browsers that don't natively support it, including creating a
    // polling loop to watch for hash changes and in IE 6/7 creating a hidden
    // Iframe to enable back and forward.
    fake_onhashchange = (function(){
        var self = {},
            timeout_id,

            // Remember the initial hash so it doesn't get triggered immediately.
            last_hash = get_fragment(),

            fn_retval = function(val){ return val; },
            history_set = fn_retval,
            history_get = fn_retval;

        // Start the polling loop.
        self.start = function() {
            timeout_id || poll();
        };

        // Stop the polling loop.
        self.stop = function() {
            timeout_id && clearTimeout( timeout_id );
            timeout_id = undefined;
        };

        // This polling loop checks every $.fn.hashchange.delay milliseconds to see
        // if location.hash has changed, and triggers the 'hashchange' event on
        // window when necessary.
        function poll() {
            var hash = get_fragment(),
                history_hash = history_get( last_hash );

            if ( hash !== last_hash ) {
                history_set( last_hash = hash, history_hash );

                $(window).trigger( str_hashchange );

            } else if ( history_hash !== last_hash ) {
                location.href = location.href.replace( /#.*/, '' ) + history_hash;
            }

            timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
        };

        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
        // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        $.browser.msie && !supports_onhashchange && (function(){
            // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
            // when running in "IE7 compatibility" mode.

            var iframe,
                iframe_src;

            // When the event is bound and polling starts in IE 6/7, create a hidden
            // Iframe for history handling.
            self.start = function(){
                if ( !iframe ) {
                    iframe_src = $.fn[ str_hashchange ].src;
                    iframe_src = iframe_src && iframe_src + get_fragment();

                    // Create hidden Iframe. Attempt to make Iframe as hidden as possible
                    // by using techniques from http://www.paciellogroup.com/blog/?p=604.
                    iframe = $('<iframe tabindex="-1" title="empty"/>').hide()

                        // When Iframe has completely loaded, initialize the history and
                        // start polling.
                        .one( 'load', function(){
                            iframe_src || history_set( get_fragment() );
                            poll();
                        })

                        // Load Iframe src if specified, otherwise nothing.
                        .attr( 'src', iframe_src || 'javascript:0' )

                        // Append Iframe after the end of the body to prevent unnecessary
                        // initial page scrolling (yes, this works).
                        .insertAfter( 'body' )[0].contentWindow;

                    // Whenever `document.title` changes, update the Iframe's title to
                    // prettify the back/next history menu entries. Since IE sometimes
                    // errors with "Unspecified error" the very first time this is set
                    // (yes, very useful) wrap this with a try/catch block.
                    doc.onpropertychange = function(){
                        try {
                            if ( event.propertyName === 'title' ) {
                                iframe.document.title = doc.title;
                            }
                        } catch(e) {}
                    };

                }
            };

            // Override the "stop" method since an IE6/7 Iframe was created. Even
            // if there are no longer any bound event handlers, the polling loop
            // is still necessary for back/next to work at all!
            self.stop = fn_retval;

            // Get history by looking at the hidden Iframe's location.hash.
            history_get = function() {
                return get_fragment( iframe.location.href );
            };

            // Set a new history item by opening and then closing the Iframe
            // document, *then* setting its location.hash. If document.domain has
            // been set, update that as well.
            history_set = function( hash, history_hash ) {
                var iframe_doc = iframe.document,
                    domain = $.fn[ str_hashchange ].domain;

                if ( hash !== history_hash ) {
                    // Update Iframe with any initial `document.title` that might be set.
                    iframe_doc.title = doc.title;

                    // Opening the Iframe's document after it has been closed is what
                    // actually adds a history entry.
                    iframe_doc.open();

                    // Set document.domain for the Iframe document as well, if necessary.
                    domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );

                    iframe_doc.close();

                    // Update the Iframe's hash, for great justice.
                    iframe.location.hash = hash;
                }
            };

        })();
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

        return self;
    })();

})($,this);
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.create = function(prop, returnClass) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;
        Class.prototype.create = _super.create;

        // And make this class extendable
        Class.create = arguments.callee;

        if (returnClass != null && returnClass != undefined && returnClass == true) {
            return Class;
        } else {
            var instance = new Class();
            if (typeof(instance.autoRegister) != 'undefined')
                instance.autoRegister();
            return instance;
        }
    };
})();
var NanoResult = Class.create({
    type: null,

    helpCallback: function (context, cb) {
        if (cb == null || cb == undefined) return;
        try {
            if (typeof cb == 'string')
                context[cb]();
            else
                cb.apply(context);
        } catch(e) {
            console.log(e);
        }
    },

    helpSetHtml: function(selector, data) {
        ((selector == null || selector == undefined) ? $('body') : $(selector)).html(data);
    },

    execute: function() {
        if (this.type == null) return;
        var selector = this.cData.action.options.containerSelector;
        var context = this.cData.action.module;
        var me = this;
        switch(this.type) {
            case 'template':
                var tplParams = this.options.params;
                me.cData.kernel.templates.load(this.options.code, function(code,data){
                    if (data == null) {
                        $.mvcLog('No template for ' + me.options.code);
                    } else {
                        me.helpSetHtml(selector, data(tplParams));
                        me.helpCallback(context, me.options.callback);
                    }
                });
                break;
            case 'string':
                var str = this.options.data;
                me.helpSetHtml(selector, str);
                me.helpCallback(context, this.options.callback);
                break;
            default:
                break;
        }
    }
}, true);
var NanoController = Class.create({
    modulePrefix:null,
    actions: new Array(),

    autoRegister: function () {
        jqNanoControllerManager.register(this);
    },

    action: function (name, callback, options) {
        var item = {
            module: this,
            name: name,
            callback: callback,
            options: $.extend(
                {
                    containerSelector:null // container element, where to return action result
                },options
            )
        };
        this.actions.push(item);
    },
    getAction:function (fullName) {
        var nameStart = this.modulePrefix == null ? '' : this.modulePrefix + '/';
        for(var i=0;i<this.actions.length;i++) {
            if ((nameStart + this.actions[i].name) == fullName) {
                return this.actions[i];
            }
        }
        return null;
    },
    getTemplateFullCode: function (code) {
        return (this.modulePrefix == null ? '' : this.modulePrefix + '/')+code;
    },
    template: function (code, content) {
        jqNanoControllerManager.templates.add(this.getTemplateFullCode(code), content);
    },
    templateFromUri: function (code, contentUri) {
        var data = (contentUri != null && contentUri != undefined) ? contentUri : code + '.tpl';
        jqNanoControllerManager.templates.addFromUri(this.getTemplateFullCode(code), data);
    },
    templateFromElement: function (code, contentElementId) {
        var data = (contentElementId != null && contentElementId != undefined) ? contentElementId : code.replace('/','-');
        jqNanoControllerManager.templates.addFromElement(this.getTemplateFullCode(code), data);
    },
    view: function (code, params, loadCallBack) {
        return NanoResult.create({type:'template', cData:this.cData, options: {code:this.getTemplateFullCode(code), params:params, callback:loadCallBack}});
    },
    string: function (data, loadCallBack) {
        return NanoResult.create({type:'string', cData:this.cData, options: {data:data, callback:loadCallBack}});
    }
}, true);
var NanoTemplateEngine = Class.create({
    templates: new Array(),
    compiler: null,

    init: function(kernel) {
        this.cm = kernel;
    },

    add: function(code, content) {
        var tpl = this.get(code);
        var isNew = false;
        if (tpl == null) {
            isNew = true;
            tpl = {code:code};
        }
        tpl.content = content;
        if (isNew) this.templates.push(tpl);
    },
    addFromUri: function(code, contentUri) {
        var tpl = this.get(code);
        var isNew = false;
        if (tpl == null) {
            isNew = true;
            tpl = {code:code};
        }
        tpl.contentUri = contentUri;
        if (isNew) this.templates.push(tpl);
    },
    addFromElement: function(code, contentElementId) {
        var tpl = this.get(code);
        var isNew = false;
        if (tpl == null) {
            isNew = true;
            tpl = {code:code};
        }
        tpl.contentId = contentElementId;
        if (isNew) this.templates.push(tpl);
    },
    load: function(code, callback, tag) {
        var tpl = this.get(code);
        if (tpl == null) {
            callback(code, null, tag);
            return;
        }
        if (tpl.hasOwnProperty('compiled') && tpl.compiled != null) {
            callback(code, tpl.compiled, tag);
            return;
        }
        if (!tpl.hasOwnProperty('content')) {
            if (tpl.hasOwnProperty('contentUri')) {
                var me = this;
                this.downloadHtml(
                    tpl.contentUri,
                    function(data){
                        tpl.content = data;
                        tpl.compiled = me.compile(tpl.content);
                        callback(code, tpl.compiled, tag);
                    },
                    function(){
                        callback(code, null, tag);
                    }
                );
                return;
            } else if (tpl.hasOwnProperty('contentId')) {
                tpl.content = $('#'+tpl.contentId).html();
                tpl.compiled = this.compile(tpl.content);
                callback(code, tpl.compiled, tag);
                return;
            }
        } else {
            tpl.compiled = this.compile(tpl.content);
            callback(code, tpl.compiled, tag);
            return;
        }
        callback(code, null, tag);
    },
    downloadHtml: function(uri, callback, callbackError) {
        $.ajax({
            url: uri,
            success: function(data){
                callback(data);
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.mvcLog("Error downloading template `"+uri+"`");
                $.mvcLog(errorThrown);
                callbackError();
            },
            dataType: 'html'
        });
    },
    getCompiler: function() {
        if (this.compiler == null) {
            var tc = this.cm.options.templateCompiler;
            if (tc == null) {
                this.compiler = function(content) {return function(params){return content}};
            } else {
                this.compiler = tc;
            }
        }
        return this.compiler;
    },
    compile: function(content) {
        return this.getCompiler()(content);
    },
    get: function(code) {
        for(var i=0;i<this.templates.length;i++) {
            if (this.templates[i].code == code) {
                return this.templates[i];
            }
        }
        return null;
    }
}, true);
var jqNanoControllerManager = ( function() {
    var me = new Object();
    me.modules = new Array();
    me.options = { isDebug: false, defaultRoute: 'default', error404: null, templateCompiler:null };
    me.lastRun = null;
    me.initialized = false;
    me.templates = new NanoTemplateEngine(me);

    me.getAction = function (fullName) {
        for(var i=0;i<this.modules.length;i++) {
            var action = this.modules[i].getAction(fullName);
            if (action != null) return action;
        }
        return null;
    }
    me.parseHash = function (hash) {
        var o = {action:'', params:null};
        if (hash == null || hash == undefined || (typeof hash) != 'string') return o;
        var parts = hash.split('?', 2);
        o.action = parts[0];
        if (parts.length == 2) {
            parts = parts[1].split('&');
            for(var i=0;i<parts.length;i++) {
                var part = parts[i].split('=',2);
                if (part.length != 2) continue;
                if (o.params == null) o.params = new Object();
                o.params[part[0]] = part[1];
            }
        }
        return o;
    }

    me.run = function (fullName) {
        if (fullName.length == 0) {
            fullName = me.options.defaultRoute;
        }
        if (this.lastRun == fullName) return;
        var d = this.parseHash(fullName);
        var a = this.getAction(d.action);
        if (a == null && this.options.error404 != null) {
            d = this.parseHash(this.options.error404)
            a = this.getAction(d.action)
        }
        if (a == null) return null;
        this.lastRun = fullName;
        $.mvcLog('Launching '+fullName);
        var context = $.extend({
            cData: {
                action: a,
                kernel: me
            }
        }, a.module);
        var result = null;
        try {
            result = a.callback.apply(context, d.params);
            if (result != null && result instanceof NanoResult) {
                result.execute.apply(result);
            }
            if (fullName != me.options.defaultRoute)
                window.location.hash = fullName;
            else
                window.location.hash = '';
        } catch(e) { $.mvcLog(e); }
        return result;
    }
    me.register = function (controller) {
        if (controller instanceof NanoController)
            this.modules.push(controller);
    }
    me.onHashChange = function() {
        var hash = location.hash;
        if (hash != null && hash != undefined & (typeof hash) == 'string' && hash.length > 2) {
            me.run(hash.substr(1));
        } else {
            me.run(me.options.defaultRoute);
        }
    }
    me.initialize = function () {
        if (this.initialized) return;
        this.initialized = true;

        this.bindLive();

        try {
            $(window).hashchange(me.onHashChange);
            $(window).hashchange();
        } catch(e) {
            me.onHashChange();
        }
    }
    me.bindLive = function() {
        $('[nano-action]').live("click", function() {
            var action = $(this).attr('nano-action');
            me.run(action);
            return false;
        });
        $('script[nano-template]').each(function(index, e) {
            var e = $(e);
            var templateName = e.attr('nano-template');
            me.templates.add(templateName, e.html());
        });
    }
    me.log = function (message) {
        if (me.options.isDebug == true) {
            console.log(message);
        }
    }

    return me;
})();
$.extend($, {
    mvcLog: jqNanoControllerManager.log,
    nanoMvc: function(options) {
        if (options != null && options != undefined && options.prototype instanceof NanoController) {
            jqNanoControllerManager.register(new options());
            return jqNanoControllerManager;
        }
        jqNanoControllerManager.options = $.extend(jqNanoControllerManager.options, options);
        jqNanoControllerManager.options.base = window.location;
        this.mvcLog('Mvc Initialized');
        jqNanoControllerManager.initialize();
        return jqNanoControllerManager;
    }
});
