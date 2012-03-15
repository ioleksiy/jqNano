NanoController.create({
    init: function() {
        this.modulePrefix = 'dash';
        this.action('index', this.actionIndex, {containerSelector:'#main'});
        this.template('index', '<h1>Hello!</h1><button class="btn btn-primary" nano-action="">Back</button>');
    },
    actionIndex: function() {
        return this.view('index');
    }
});
