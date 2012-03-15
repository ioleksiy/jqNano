NanoController.create({
    init: function() {
        this.modulePrefix = 'dash';
        this.action('index', this.actionIndex, {containerSelector:'#main'});
        this.templateFromElement('index', 'tplDashboard');
    },
    actionIndex: function() {
        return this.view('index');
    }
});
