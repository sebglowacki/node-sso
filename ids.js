var express = require('express')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com', token: '1234567890' }
    ,
    { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com', token: '0987654321' }
];

function findByToken(token, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.token === token) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

passport.use(new LocalStrategy(
    function (username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // Find the user by username.  If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message.  Otherwise, return the
            // authenticated `user`.
            findByUsername(username, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Unknown user ' + username });
                }
                if (user.password != password) {
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, user);
            })
        });
    }
));

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(passport.initialize());
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.post('/login',
    passport.authenticate('local', { session: false }),
    function (req, res) {
        res.json({ token: req.user.token });
    });

app.post('/token/callback',
    function (req, res) {
//        console.log(req.body);

        findByToken(req.body.token, function (err, user) {
            if (err) {
                res.send(503);
            }
            if (!user) {
                res.send(404);
            }
            res.json({ username: user.username, email: user.email });
        })

    });

app.listen(3000);