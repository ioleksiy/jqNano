NanoController.create({
    init: function() {
        this.action('default', this.actionIndex, {containerSelector:'#main'});
        this.templateFromUri('index', 'templates/login.html');
    },
    actionIndex: function() {
        return this.view('index', {title:'Login Form'}, function(){
            $('#input01').val('test');
            $('a.close').click(function(){
                $(this).parent().hide();
            });
        });
    }
});
