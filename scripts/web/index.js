import * as HypernexAPI from '../HypernexAPI.js'

// Elements
let LoginCard = document.getElementById("login-card")
let SignupCard = document.getElementById("signup-card")
let LoginButton = document.getElementById("login-button")
let SignupButton = document.getElementById("signup-button")

let LoginUsername = document.getElementById("username-input")
let LoginPassword = document.getElementById("password-input")
let Login2FA = document.getElementById("2fa-input")

let SignupUsername = document.getElementById("signup-username-input")
let SignupEmail = document.getElementById("signup-email-input")
let SignupPassword = document.getElementById("signup-password-input")
let SignupInviteCode = document.getElementById("signup-invitecode-input")

let LoginToExistingAccount = document.getElementById("login-existing-account")
let CreateAnAccount = document.getElementById("create-account")

// Events

LoginToExistingAccount.addEventListener("click", () => {
    SignupCard.hidden = true
    LoginCard.hidden = false
})

CreateAnAccount.addEventListener("click", () => {
    LoginCard.hidden = true
    SignupCard.hidden = false
})

let isLoggingIn = false
LoginButton.addEventListener("click", () => {
    if(!isLoggingIn){
        isLoggingIn = true
        HypernexAPI.Users.login(LoginUsername.value, LoginPassword.value, Login2FA.value).then(userdata => {
            if(userdata){

            }
            isLoggingIn = false
        }).catch(err => {
            isLoggingIn = false
        })
    }
})

// Init

HypernexAPI.setDebug(true)

SignupCard.hidden = true
Login2FA.hidden = true
HypernexAPI.Users.isInviteCodeRequired().then(r => {
    if(r === null){
        SignupInviteCode.hidden = true
        return
    }
    SignupInviteCode.hidden = !r;
})
