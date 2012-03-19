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
