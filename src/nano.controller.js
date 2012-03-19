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
