var socket = io.connect();

const acceptableChars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", ".", "?", "!", "/", ",", "'", '"', ":", ";", 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '-', '_', '=', '+', ' ']
const autoText = 'This is some random ass text'
let numberOfMistakes = 0;
let hasStarted = false
let start;
let end;
let badText = ''
let goodText = ''
let isTypingBadText = false
let previousTextLength = 0;
const leaders = []
let lobby;
let hasLoggedIn = false

// calculate amount of words in text
const wordAmount = autoText.split(' ').length

// function to run when test has finished
function endTest() {
    // calculate elapsed time, wpm, accuracy, and score
    const elapsedTime = (end - start) / 1000
    const wpm = (60 * wordAmount) / elapsedTime
    const accuracy = (autoText.length - numberOfMistakes) / autoText.length * 100
    const score = wpm * accuracy / 100
    // display user's stats
    $('.userRecentSpeed').text(wpm.toFixed(0))
    $('.userRecentAccuracy').text(accuracy.toFixed(0))

    // create obj with user's score
    const userScore = {
        wpm: wpm.toFixed(0),
        accuracy: accuracy.toFixed(0),
        score: score.toFixed(0),
        username: 'some username'
    }

    // send user's obj back to server
    socket.emit('send message', userScore)
}

function addToLeaderboard(userObj) {
    // grab values from obj
    const { wpm, accuracy, score, username } = userObj;

    // push new object to leaders array
    leaders.push(userObj)

    // sort array with new obj
    leaders.sort((a, b) => {
        // grab scores from a and b objects
        const leaderA = a.score
        const leaderB = b.score
        // return difference to sort
        return leaderB - leaderA
    })

    // clear leaderboard before appending
    $('.leaders').empty();

    // iterate through leaders and display on page
    leaders.forEach(leader => {
        const li = $('<li>')
        const p = $('<p>')
        p.text(leader.username)
        const span = $('<span>')
        span.text(leader.score)
        p.append(span)
        li.append(p)
        $('.leaders').append(li)
    })
}

function displayUsers() {
    // make sure that users list is empty
    $('.users').empty();
    // iterate through lobby array of users
    lobby.forEach(user => {
        // create a new list item with the user's name as it's text
        const li = $('<li>')
        li.text(user)
        // append the list item to the page's lobby list
        $('.users').append(li)
    })
}

socket.on('new message', function (data) {
    console.log(data)
    // add received data to leaderboard
    addToLeaderboard(data)
})

// event listener when user presses a key
$('.userText').on('input', function (event) {
    // if timer has not started yet, record start time
    if (!hasStarted) {
        hasStarted = true
        start = Date.now();
    }

    // store index of current char
    const charIndex = $('.userText').val().length - 1

    // if enetered key is last in the paragraph, record end time
    if (charIndex === autoText.length - 1) {
        end = Date.now();
        // disable textarea
        $('.userText').prop('disabled', true)
        endTest()
    }

    // store entered char by indexing from text
    const userChar = $('.userText').val()[charIndex]
    const actualChar = autoText[charIndex]

    // if user has deleted a character
    if ($('.userText').val().length < previousTextLength) {
        console.log('delete')
        // check if user is deleting from correct text
        if (!isTypingBadText) {
            goodText = goodText.slice(0, goodText.length - 1)
            // change displayed correct text on page
            $('.correctText').text(goodText)
        } else {
            // if user is deleting incorrect text, cut off last character
            badText = badText.slice(0, badText.length - 1)
            // change displayed incorrect text on page
            $('.incorrectText').text(badText)
            // if there is now no bad text left, signal that user is now typing good text
            if (badText.length === 0) {
                isTypingBadText = false
            }
        }

        // if chars are the same
    } else if (userChar === actualChar && !isTypingBadText) {
        // append user char to good text
        goodText += userChar
        // push good text to correct text span on cloned div behind textarea
        $('.correctText').text(goodText)
    } else {
        // signal that user is currently typing incorrect text
        isTypingBadText = true
        // if not equal, increment number of mistakes
        numberOfMistakes += 1
        // append new bad char to bad text
        badText += userChar
        // push bad text to incorrect text span on cloned div behind textarea
        $('.incorrectText').text(badText)
    }

    // set length of current user text
    previousTextLength = $('.userText').val().length
})

$('.loginBtn').on('click', function (event) {
    // grab username entered by user
    const username = $('.usernameInput').val();

    // check if username is already taken
    socket.emit('new user', username)


})

// liten for user clicking 'return' to login
$('.usernameInput').on('keydown', function(event) {
    if (event.keyCode == 13) {
        // grab usrname entered by user
        const username = $('.usernameInput').val();

        // check if username is already taken
        socket.emit('new user', username)
    }
})

// server response that user has been created
socket.on('user created', function (data) {
    // store username in local storage
    localStorage.setItem('username', data.newUser)
    // hide login modal
    $('#loginModal').modal('hide')
    // set lobby array of users to all users from server
    lobby = data.users
    // display all users on page
    displayUsers();
})

// server response that username is taken
socket.on('user taken', function(data) {
    // change error text to tell user their username is already taken
    $('.errorText').text("Username already being used")
})

// when more people connect to socket on server
socket.on('user added', function(users) {
    // add the new user to the lobby array
    lobby = users
    // make sure new user is added to page
    displayUsers();
})

// when people leave the site
socket.on('user left', function(users) {
    // set lobby array of users to new users array
    lobby = users
    // display all users
    displayUsers();
})

// when users leaves site, send message to all connected users
window.onbeforeunload = function() {
    socket.emit('left page', localStorage.getItem('username'))
}

// beginCountdown();
// beginTest()
userLogin();
function beginCountdown() {
    let time = 5;
    $('.timer').text(time)

    let timeInterval = setInterval(function () {
        time -= 1
        $('.timer').text(time)
        if (time === 0) {
            clearInterval(timeInterval)
            beginTest()
        }
    }, 1000)
}

function beginTest() {
    $('.userText').prop('disabled', false)
    $('.userText').focus()
}

function userLogin() {
    $('#loginModal').modal('show')
    $('.usernameInput').focus();
}