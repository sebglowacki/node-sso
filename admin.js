var express = require('express')
    , passport = require('passport')
    , util = require('util')
    , BearerStrategy = require('passport-http-bearer').Strategy;

var Client = require('node-rest-client').Client;
client = new Client();
client.registerMethod("validateToken", "http://localhost:3000/token/callback", "POST");

// Use the BearerStrategy within Passport.
//   Strategies in Passport require a `validate` function, which accept
//   credentials (in this case, a token), and invoke a callback with a user
//   object.
passport.use(new BearerStrategy({
    },
    function (token, done) {
        // asynchronous validation, for effect...
        process.nextTick(function () {

            args = {
                headers: {'content-type': 'application/json'},
                data: {'token': token}
            };

            client.methods.validateToken(args, function (data, response) {
                // parsed response body as js object
                console.log(data);
                console.log(response.statusCode);
                if (response.statusCode == 200) {
                    var user = JSON.parse(data);
                    return done(null, user);

                } else {
                    return done(null);
                }

            });

        });
    }
));

var app = express();
// configure Express
app.configure(function () {
    app.use(express.logger());
    // Initialize Passport!  Note: no need to use session middleware when each
    // request carries authentication credentials, as is the case with HTTP
    // Bearer.
    app.use(passport.initialize());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});


app.get('/',
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        res.json({ username: req.user.username, email: req.user.email });
    });

app.listen(3001);