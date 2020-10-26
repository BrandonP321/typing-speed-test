const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const db = require('./models');


const PORT = process.env.PORT || 8080;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public/'));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 15 * 60 * 1000
    }
}));


app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


// routes
require('./controllers/html/login-html-routes')(app);
require('./controllers/html/speed-html-routes')(app);
require('./controllers/html/home-page-routes')(app);
require('./controllers/api/authentication-api-routes')(app);


// socket rouets to be moved later
var users = [];
var connections = [];

io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log('Connected: ' + connections.length + ' sockets connected')

    socket.on('send message', function(data) {
        io.sockets.emit('new message', data)
    })

    // disconnect
    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: ' + connections.length + ' sockets disconnected')
    })
})


db.sequelize.sync({ force: false }).then(function() {
    server.listen(PORT, function() {
        console.log('App listening on PORT: ' + PORT);
    });
});