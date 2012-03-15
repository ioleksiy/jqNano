# jqNano.js -- a minimalist JavaScript MVC framework

jqNano.js is a minimalist framework for modern browsers with a desktop and mobile support.

The goal of the framework is allow developer to write as low amount of code as it is possible to support MVC design.

Same with simplicity of development, attention was payed to reduce the memory usage and performance increasement.

In general, the design of MVC inside this framework was decreased to View-Controller. This was made to simplify the
development process and another reason is that today a lot of projects are storing their data on server, and uses API
to access it and modify. That's why it is hard to make a standard of client-side storage of data for different types
of projects.

# Supported platforms

Framework should work on all platforms which are supported by jQuery (or Zepto.js if you are using mobile version).

If you will find out that the framework is not working somewhere, please, let me know about this.

# Installation

The latest example of usage can be found inside `examples` folder. Here I will describe only main steps.

## Preparation

Download and inject jQuery library or Zepto.js if you are developing for mobile. jqNano is working as a plugin to these
frameworks.

## jqNano setup

Now download the distibution version of jqNano, from `dist` folder or `files` section, and include it into html header
after jQuery include.

Than you have to initialize jqNano on document load:

``` js
$(document).ready(function(){
    $.nanoMvc({
        isDebug:true,
        error404:'e404',
        templateCompiler:function(content) {return Handlebars.compile(content);}
    });
});
```

The `$.nanoMvc` function has next parameters:

+ **isDebug** - boolean value to print debug information into Firebug console. Default value is *false*.
+ **error404** - string representatin of default action on handler not found error. Default value is *null*.
+ **templateCompiler** - callback for template compilation method of type `function (content) { }`. Default value is *null*, when template is simple html without processing.

## Action declaration

After previous step you will see nothing. That's why you should add new controllers with actions.

*Controller* - is a logical container for actions. It depends on you, how to devide controllers into actions. This
is an example of simple controller:

``` js
NanoController.create({
    // Nano Constructor
    init: function() {
        // Step 1
        this.modulePrefix = 'dashboard'; // this is used to indicate base path of action

        // Step 2
        this.action('index', this.actionIndex, {containerSelector:'#main'});

        // Step 3
        this.template('index', '<h1>Hello!</h1><button class="btn btn-primary" nano-action="">Back</button>');
    },

    // Sample action
    actionIndex: function() {
        return this.view('index');
    }
});
```

After processing this code, JS will automatically add new controller to jqNano router.

Now let's take a look into this sample. It contains two methods: init (the constructor alternative), actionIntex (the action itself).

The constructor steps are:

 1. We are determining prefix for all actions inside this controller, so our action on step 2 will will be called on `#dashboard/index`. If you will not specify it, the action will have no prefix and will be root like `#index`.
 2. Here a new action is registered with parameters: code of action, callback method to process action, options for action (described below).
 3. Here a new template is registered in the system with the name `index` and html content to display.

Sample action simply makes a call to generate a view result. This call is asynchronous because template could be remote, and should be downloaded and compiled.

### Options for action

Action can make some processing, same as can return an html result into some element of the page. Field
**containerSelector** can determine, which element(s) to update after action executed.

# Building

jqNano.js can be used as-is. However, for best efficiency, run the included build step that uses UglifyJS to minify jqNano.js and will give you an estimate on the compression that is achievable when jqNano.js is served Gzipped.

For this to work, you need Ruby and Rake installed.

First of all, check you have the uglifier gem installed typing

``` sh
$ gem install uglifier
```

Then build the minified file with

``` sh
$ rake
```

You'll see an output like:

```
Original version: 25.727k
Minified: 7.298k
Minified and gzipped: 2.155k, compression factor 9.469
```

The minified files are saved to `dist` folder.

# License

jqNano.js is is licensed under the terms of the MIT License, see the included MIT-LICENSE file.

# Thanks

+ jQuery HashChange (http://benalman.com/projects/jquery-hashchange-plugin/) - this jq plugin helps a lot to work with
  location hashes.
+ Simple JavaScript Inheritance (http://ejohn.org/blog/simple-javascript-inheritance/) - with this function code became
  cleaner and user-friendly.
+ Zepto.js (http://zeptojs.com/) - fantastic implementation of jQuery for mobile, same as code organisation and build
  scripts are awesome.
