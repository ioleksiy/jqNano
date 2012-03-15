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
