const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const axios = require('axios')
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
    
    // request from client to create a new user
    socket.on('new user', function(data) {
        // if username already exists in users array
        if (users.includes(data)) {
            // emit message that user is taken
            socket.emit('user taken')
        } else {
            console.log('user created')
            // otherwise add new user to users and emit message to login user
            users.push(data)
            console.log(data)
            // send message just to client creating the user that user is created
            socket.emit('user created', {
                newUser: data,
                users: users
            })
            // send a message to all connected users that a new user has been added
            io.sockets.emit('user added', users)
        }
    })

    // when user wants to start countdown
    socket.on('start countdown', function(data) {
        // tell all connected clients to begin countdown
        io.sockets.emit('begin countdown')
    })

    // when user wants to get new text
    socket.on('get new text', function(movie) {
        // remove spaces from movie
        movie = movie.split(' ').join('+')
        console.log(movie)
        // make axios request to get a movie plot
        axios.get("https://www.omdbapi.com/?plot=short&t=" + movie + "&apikey=9d2e2747").then(res => {
            // if no movie found
            if (res.data.Response === 'False') {
                // send message to user that movie could not be found
                socket.emit('movie not found')
            } else {
                // if movie is found, send message to all connected users
                io.sockets.emit('new movie', res.data.Plot)
            }
        })
    })


    // when user wants to cancel countdown
    socket.on('stop countdown', function(data) {
        // tell all connected clients to cancel countdown
        io.sockets.emit('cancel countdown')
    })

    // when user leaves site
    socket.on('left page', function(user) {
        // remove user from users arra
        users.splice(users.indexOf(user), 1)
        // tell all connected clients that a user has left
        io.sockets.emit('user left', users)
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