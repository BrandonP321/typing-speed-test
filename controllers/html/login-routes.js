const db = require('../../models');
const path = require('path')

module.exports = function(router) {
    // route for login page
    router.get('/login', function(req, res) {
        res.sendFile(path.join(__dirname, '../../public/login.html'))
    });

    // route to view session data
    router.get('/sessiondata', function(req, res) {
        res.json(req.session)
    });
};