// Module dependencies.
var express = require ('express'),
    port = process.env.PORT || 2345,
    routes = require ('./routes.js');

var app = module.exports = express ();

// Configuration
app.configure (function (){
  app.use (express.favicon(__dirname + '/public/favicon.ico')); 
  app.set ('views', __dirname + '/views');
  app.set ('view engine', 'jade');
  app.use (express.bodyParser ());
  app.use (express.methodOverride ());
  app.use (app.router);
  app.use (express.static (__dirname + '/public'));
});

// Routes
app.get ('/', routes.index);
app.get ('/listen', routes.listen);
app.get ('/send', routes.send);

// Startup
app.listen (port);
console.log ("Express server listening on port %d in %s mode", port, app.settings.env);
