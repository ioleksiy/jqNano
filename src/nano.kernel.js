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
    me.processResult = function (selectedElements, context, viewOptions) {
        switch(viewOptions.type) {
            case 'template':
                var tplParams = viewOptions.options.params;
                this.templates.load(viewOptions.options.code, function(code,data){
                    if (data == null) {
                        $.mvcLog('No template for ' + viewOptions.options.code);
                    } else {
                        selectedElements.html(data(tplParams));
                        var cb = viewOptions.options.callback;
                        if (cb != null && cb != undefined) {
                            try {
                                if (typeof cb == 'string')
                                    context[cb]();
                                else
                                    cb();
                            } catch(e) {
                                console.log(e);
                            }
                        }
                    }
                });
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
            if (result != null && a.options.containerSelector != null) {
                this.processResult($(a.options.containerSelector), a.module, result);
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
