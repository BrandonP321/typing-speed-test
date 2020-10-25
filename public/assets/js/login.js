// element references
const errorText = $('.formErrorText')

// login form elements
const loginForm = $('.loginForm')
const loginHeading = $('.loginHeading')
const emailInput = $('#emailInput')
const passwordInput = $('#passwordInput')
const newAccountDisplayBtn = $('.switchToNewAccountBtn')

// create account form elements
const newAccountForm = $('.createAccountForm')
const newAccountHeading = $('.newAccountHeading')
const newUsernameInput = $('#newUsernameInput')
const newEmailInput = $('#newUsernameInput')
const newPasswordInput = $('#newPassword')
const newPasswordReEnter = $('#newPasswordReEnter')
const loginDisplayBtn = $('.switchToLoginBtn')


// tells user if new password and re entered password match and returns appropriate boolean
function checkPasswordMatch() {
    // if passwords match and re entered password has some value
    if (newPasswordInput.val() === newPasswordReEnter.val() && $('#newPasswordReEnter').val()) {
        // change text that passwords match
        $('.passwordMatchingText').text('Good to go!')
        return true
    } else {
        // if passwords don't match, let user know
        $('.passwordMatchingText').text("Passwords must match")
        return false
    }
}

// listener when user submits login form
loginForm.on('submit', function(event) {
    // prevent defautl action of reloading page
    event.preventDefault();

    // retrieve values from inputs for username and password
    const email = emailInput.val();
    const password = passwordInput.val();

    // make ajax call to login user
    $.ajax({
        type: 'POST',
        url: '/login',
        data: {
            email: email,
            password: password
        },
        statusCode: {
            401: function(response) {
                // incorrect email or password
                errorText.text('Incorrect email of password')
            },
            500: function(response) {
                
            }
        }
    }).done(function(response) {
        // should have redirected to home page
    })
});

newAccountForm.on('submit', function(event) {
    // prevent default page reload
    event.preventDefault();

    // TODO: put restrictions on password/username
    
    // make request to create a new user
    $.ajax({
        url: "/account/create",
        method: "POST",
        data: {
            email: newEmailInput.val(),
            username: newUsernameInput.val(),
            password: newPasswordReEnter.val()
        },
        statusCode: {
            403: function() {
                // user with same email already exists
                alert('Email taken')
            }
        }
    }).done(function(response) {
        // should be redirected to home page
    })
})

$('#newPasswordReEnter').on('keyup', function() {
    checkPasswordMatch();
})

// when user clicks button to go to login form
loginDisplayBtn.on('click', function() {
    // hide elements of new account form
    newAccountHeading.css('display', 'none')
    newAccountForm.css('display', 'none')
    $(this).css('display', 'none')

    // show elements of login form
    loginForm.css('display', 'block')
    loginHeading.css('display', 'block')
    newAccountDisplayBtn.css('display', 'inline')

    // clear error text
    $('.formErrorText').empty();
})

// when user clicks button to go to new account form
newAccountDisplayBtn.on('click', function() {
    // hide elements of new account form
    loginForm.css('display', 'none')
    loginHeading.css('display', 'none')
    $(this).css('display', 'none')

    // show elements of login form
    newAccountForm.css('display', 'block')
    newAccountHeading.css('display', 'block')
    loginDisplayBtn.css('display', 'inline')

    // clear error text
    $('.formErrorText').empty();
})
