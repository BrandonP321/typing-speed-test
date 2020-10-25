const db = require('../../models');
const bcrypt = require('bcrypt')
const session = require('express-session')

module.exports = function(router) {
    // route to log in user
    router.post('/login', function(req, res) {
        // get user info from
        const { email, username, password } = req.body

        // look for user in db
        db.User.findOne({
            where: {email: email}
        }).then(function(dbUser) {
            // if user does not exist in db
            if (!dbUser) {
                // destroy any existing session
                req.session.destroy();
                // send status(401)
                return res.status(401).send('Incorrect email or password').end()
            // if user found, compare password given with stored password after decrypting password
            } else if (bcrypt.compareSync(password, dbUser.password)) {
                // create session for user
                req.session.user = {
                    id: dbUser.id,
                    email: dbUser.email,
                    username: dbUser.username
                }
                // send status 200
                res.status(200).end();
            // assuming passwords don't match
            } else {
                // destroy any existing session
                req.session.destroy();
                // 401 status
                return res.status(401).send('Incorrect email or password').end();
            }
        })
    });

    // route to create a new account
    router.post('/account/create', function(req, res) {
        // get user info
        const { email, password, username } = req.body
        console.log(req.body)
        // check if user with same email already exists
        db.User.findOne({
            where: { email: email }
        }).then(function(dbUser) {
            // if user with same email already exists
            if (dbUser) {
                // destory any existing session
                req.session.destroy();
                // status 403
                return res.status(403).send('Email taken').end();
            } else {
                // if no user exists create record for user in db
                db.User.create({
                    email: email,
                    username: username,
                    password: password
                }).then(function(newUser) {
                    // if all goes well, create session for new user and redirect to home page
                    req.session.user = {
                        id: newUser.dataValues.id,
                        email: newUser.dataValues.email,
                        username: newUser.dataValues.username,
                    }
                    // status 200
                    res.status(200).end();
                })
            }
        })
    });
};