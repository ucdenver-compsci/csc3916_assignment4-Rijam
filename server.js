/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/Reviews')
    .get((req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "GET Review";
        res.json(o);
    })
    .post(authJwtController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "Review created!";
        res.json(o);
    })
    .delete(authJwtController.isAuthenticated, (req, res) => {
        // HTTP DELETE Method
        // Requires JWT authentication.
        // Returns a JSON object with status, message, headers, query, and env.
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "Review deleted";
        res.json(o);
    })
    .all((req, res) => {
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    });

router.route('/movies')
    .get((req, res) => {
        //var o = getJSONObjectForMovieRequirement(req);
        //Movie.find({ title:  }).select('name username password').exec(function(err, user))
        var movie = new Movie();
            movie.title = req.body.title;
    
            movie.findOne({ title: movie.title }).exec(function(err, outMovie) {
                if (err) {
                    return res.json(err);
                }
    
                res.json({success: true, msg: 'GET movie\n' + outMovie})
            });
        res.json(o);
    })
    .post((req, res) => {
        /*var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie saved";
        res.json(o);*/

        if (!req.body.title || !req.body.genre || !req.body.actors) {
            res.json({success: false, msg: 'Please include the title, genre, and actors.'})
        } else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;
            movie.releaseDate = req.body.releaseDate != null ? req.body.releaseDate : null;
    
            movie.save(function(err){
                if (err) {
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'A movie with that name already exists.'});
                    else
                        return res.json(err);
                }
    
                res.json({success: true, msg: 'Movie saved'})
            });
        }
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        // HTTP PUT Method
        // Requires JWT authentication.
        // Returns a JSON object with status, message, headers, query, and env.
        /*var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie updated";
        res.json(o);*/
        if (!req.body.title || !req.body.genre || !req.body.actors) {
            res.json({success: false, msg: 'Please include the title, genre, and actors.'})
        } else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;
            movie.releaseDate = req.body.releaseDate;
    
            movie.set(function(err){
                if (err) {
                    return res.json(err);
                }
    
                res.json({success: true, msg: 'Movie updated'})
            });
        }
    })
    .delete(authJwtController.isAuthenticated, (req, res) => {
        // HTTP DELETE Method
        // Requires JWT authentication.
        // Returns a JSON object with status, message, headers, query, and env.
        /*var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie deleted";
        res.json(o);*/

        var movie = new Movie();
            movie.title = req.body.title;
    
            movie.findOne({ title: movie.title }).exec(function(err, outMovie) {
                if (err) {
                    return res.json(err);
                }
                
                outMovie.delete(function(err) {
                    if (err) {
                        return res.json(err);
                    }
                    res.json({success: true, msg: 'Movie deleted\n' + outMovie.title})
                });
            });
        res.json(o);
    })
    .all((req, res) => {
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    });

router.route('/movies/:id')
    .get((req, res) => {
        Movie.find(function(err, movies) {
            if (err) {
                res.status(401).send({ message: 'Movie not found' });
            }
            else {
                res.json(movies);
            }
        })
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


