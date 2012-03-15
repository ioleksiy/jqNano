NanoController.create({
    init: function() {
        this.action('e404', this.action404, {containerSelector:'#main'});
        this.template('index404', '<h1>404</h1><button class="btn btn-primary" nano-action="">To Main Page</button>');
    },
    action404: function() {
        return this.view('index404');
    }
});
