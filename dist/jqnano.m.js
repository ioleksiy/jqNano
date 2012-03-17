/*!
 * jQuery Nano MVC mini framework Mobile - v0.3 - 15/03/2012
 * http://www.jqnano.com/
 *
 * Copyright (c) 2012 Oleksii Glib
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 *
 * Components included with MIT license:
 *  - Simple JavaScript Inheritance (http://ejohn.org/blog/simple-javascript-inheritance/)
 */
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
            instance.autoRegister();
            return instance;
        }
    };
})();
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
        return {type:'template', options: {code:this.getTemplateFullCode(code), params:params, callback:loadCallBack}};
    },
    string: function (data, loadCallBack) {
        return {type:'string', options: {data:data, callback:loadCallBack}};
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
    me.helpCallback = function (context, cb) {
        if (cb == null || cb == undefined) return;
        try {
            if (typeof cb == 'string')
                context[cb]();
            else
                cb.apply(context);
        } catch(e) {
            console.log(e);
        }
    }
    me.helpSetHtml = function(selector, data) {
        ((selector == null || selector == undefined) ? $('body') : $(selector)).html(data);
    }
    me.processResult = function (selector, context, viewOptions) {
        switch(viewOptions.type) {
            case 'template':
                var tplParams = viewOptions.options.params;
                this.templates.load(viewOptions.options.code, function(code,data){
                    if (data == null) {
                        $.mvcLog('No template for ' + viewOptions.options.code);
                    } else {
                        me.helpSetHtml(selector, data(tplParams));
                        me.helpCallback(context, viewOptions.options.callback);
                    }
                });
                break;
            case 'string':
                var str = viewOptions.options.data;
                me.helpSetHtml(selector, str);
                me.helpCallback(context, viewOptions.options.callback);
                break;
            default:
                break;
        }
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
        var result = null;
        try {
            result = a.callback.apply(a.module, d.params);
            if (result != null) {
                this.processResult(a.options.containerSelector, a.module, result);
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
