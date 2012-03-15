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
