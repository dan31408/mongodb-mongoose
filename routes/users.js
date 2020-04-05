const express = require('express');
const User = require('../models/user');
const passport = require('passport'); 
const cors = require('cors');

const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {

User.find()
.then(users => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
})
.catch(err => next(err));
})

//Signup 

router.post('/signup', cors.corsWithOptions, (req, res) => {
    User.register(new User({username: req.body.username}),
    req.body.password, (err, user) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
        } else {
            if (req.body.firstname) {
                user.firstname = req.body.firstname;
            }
            if (req.body.lastname) {
                user.lastname = req.body.lastname;
            }
            user.save(err => { //saves user's first and last names from req body to the database
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                    return;
                }
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                });
            });
        }
    });
});

//Login

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id}); // token issued. user id passed as paylod
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

//Logout
router.get('/logout', cors.corsWithOptions, (req, res, next) => {
    if (req.session) {
      req.session.destroy(); // deleting the session file on server side
      res.clearCookie('session-id'); // clearing the cookie with session id stored on client side 
      res.redirect('/'); //localhost/3000/
    } else {
      const err = new Error('You are not logged in!');
      err.status = 403;
      return next(err);
    }
});

module.exports = router;