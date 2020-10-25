const acceptableChars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", ".", "?", "!", "/", ",", "'", '"', ":", ";", 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '-', '_', '=', '+', ' ']
const autoText = 'This is some random ass text'
let numberOfMistakes = 0;
let hasStarted = false
let start;
let end;

// calculate amount of words in text
const wordAmount = autoText.split(' ').length

// function to run when test has finished
function endTest() {
    const elapsedTime = (end - start) / 1000
    const wpm = (60 * wordAmount) / elapsedTime
    const accuracy = (autoText.length - numberOfMistakes) / autoText.length * 100
    $('.userRecentSpeed').text(wpm.toFixed(0))
    $('.userRecentAccuracy').text(accuracy.toFixed(0))
}

// event listener when user presses a key
$('.userText').on('input', function(event) {
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

    // if chars are the same, return to break function
    if (userChar === actualChar) {
        return
    } else {
        // if not equal, increment number of mistakes
        numberOfMistakes += 1
    }
})

beginCountdown();

function beginCountdown() {
    let time = 5;
    $('.timer').text(time)

    let timeInterval = setInterval(function() {
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