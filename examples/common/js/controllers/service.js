NanoController.create({
    init: function() {
        this.action('e404', this.action404, {containerSelector:'#main'});
    },
    action404: function() {
        return this.view('e404', {title:'Error'});
    }
});
