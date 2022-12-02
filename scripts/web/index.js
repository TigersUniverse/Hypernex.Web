import * as HypernexAPI from '../HypernexAPI.js'
import * as storage from '../storage.js'
import * as datetools from '../datetools.js'

// Elements
let LoginCard = document.getElementById("login-card")
let SignupCard = document.getElementById("signup-card")
let StatusCard = document.getElementById("status-card")

let LoginButton = document.getElementById("login-button")
let SignupButton = document.getElementById("signup-button")
let StatusConfirmButton = document.getElementById("status-confirm-button")

let LoginUsername = document.getElementById("username-input")
let LoginPassword = document.getElementById("password-input")
let Login2FA = document.getElementById("2fa-input")

let SignupUsername = document.getElementById("signup-username-input")
let SignupEmail = document.getElementById("signup-email-input")
let SignupPassword = document.getElementById("signup-password-input")
let SignupInviteCode = document.getElementById("signup-invitecode-input")
let Signup13Check = document.getElementById("signup-13-check")
let SignupToSCheck = document.getElementById("signup-tos-check")

let LoginToExistingAccount = document.getElementById("login-existing-account")
let CreateAnAccount = document.getElementById("create-account")

let StatusTitle = document.getElementById("status-title")
let StatusBeginDate = document.getElementById("status-begin-date")
let StatusEndDate = document.getElementById("status-end-date")
let StatusReason = document.getElementById("status-reason")
let StatusDescription = document.getElementById("status-description")

// Events

LoginToExistingAccount.addEventListener("click", () => {
    SignupCard.hidden = true
    LoginCard.hidden = false
})

CreateAnAccount.addEventListener("click", () => {
    LoginCard.hidden = true
    SignupCard.hidden = false
})

function handleLoginResult(result){
    switch(result.LoginResult){
        case HypernexAPI.Users.LoginResult.Incorrect:
            window.sendSweetAlert({
                icon: 'error',
                title: 'Incorrect Login'
            })
            return false
        case HypernexAPI.Users.LoginResult.Missing2FA:
            Login2FA.hidden = false
            return false
        case HypernexAPI.Users.LoginResult.Warned:
            LoginCard.hidden = false
            StatusTitle.innerHTML = "You have been Warned"
            StatusBeginDate.innerHTML = "Date Warned: " + datetools.dateToString(datetools.fromUnix(result.WarnStatus.TimeWarned))
            StatusEndDate.innerHTML = ""
            StatusReason.innerHTML = "Warn Reason: " + result.WarnStatus.WarnReason
            StatusDescription.innerHTML = "Warn Description: " + result.WarnStatus.WarnDescription
            StatusConfirmButton.addEventListener("click", () => {
                let token = result.token
                HypernexAPI.Users.getUserFromUsername(LoginUsername.value, token).then(user => {
                    if(user){
                        storage.setValue("currentToken", JSON.stringify(token))
                        storage.setValue("currentUser", JSON.stringify(user))
                        window.location = "/dashboard.html"
                    }
                    else{
                        window.sendSweetAlert({
                            icon: 'error',
                            title: 'Failed to Get Account Data'
                        })
                        isLoggingIn = false
                    }
                }).catch(err => {
                    window.sendSweetAlert({
                        icon: 'error',
                        title: 'Failed to Get Account Data'
                    })
                    console.error(err)
                    isLoggingIn = false
                })
            })
            StatusCard.hidden = false
            return false
        case HypernexAPI.Users.LoginResult.Banned:
            LoginCard.hidden = false
            StatusTitle.innerHTML = "You have been Banned"
            StatusBeginDate.innerHTML = "Date Banned: " + datetools.dateToString(datetools.fromUnix(result.BanStatus.BanBegin))
            StatusEndDate.innerHTML = "Length of Ban: " + datetools.dateToString(datetools.fromUnix(result.BanStatus.BanEnd))
            StatusReason.innerHTML = "Ban Reason: " + result.BanStatus.BanReason
            StatusDescription.innerHTML = "Ban Description: " + result.BanStatus.BanDescription
            StatusConfirmButton.hidden = true
            StatusCard.hidden = false
            return false
        case HypernexAPI.Users.LoginResult.Correct:
            return true
    }
}

let isLoggingIn = false
LoginButton.addEventListener("click", () => {
    if(!isLoggingIn){
        isLoggingIn = true
        HypernexAPI.Users.login(LoginUsername.value, LoginPassword.value, Login2FA.value).then(result => {
            if(result){
                if(handleLoginResult(result)){
                    let token = result.token
                    HypernexAPI.Users.getUserFromUsername(LoginUsername.value, token).then(user => {
                        if(user){
                            storage.setValue("currentToken", JSON.stringify(token))
                            storage.setValue("currentUser", JSON.stringify(user))
                            window.location = "/dashboard.html"
                        }
                        else{
                            window.sendSweetAlert({
                                icon: 'error',
                                title: 'Failed to Get Account Data'
                            })
                            isLoggingIn = false
                        }
                    }).catch(err => {
                        window.sendSweetAlert({
                            icon: 'error',
                            title: 'Failed to Get Account Data'
                        })
                        console.error(err)
                        isLoggingIn = false
                    })
                }
                else
                    isLoggingIn = false
            }
            else{
                window.sendSweetAlert({
                    icon: 'error',
                    title: 'Failed to Login'
                })
                isLoggingIn = false
            }
        }).catch(err => {
            window.sendSweetAlert({
                icon: 'error',
                title: 'Failed to Login'
            })
            console.error(err)
            isLoggingIn = false
        })
    }
})

let isCreatingAccount = false
SignupButton.addEventListener("click", () => {
    if(!isCreatingAccount){
        isCreatingAccount = true
        if(!Signup13Check.checked){
            window.sendSweetAlert({
                icon: 'error',
                title: 'Incomplete Form',
                text: 'You must agree that you are over 13 years old to continue'
            })
            isCreatingAccount = false
            return
        }
        if(!SignupToSCheck.checked){
            window.sendSweetAlert({
                icon: 'error',
                title: 'Incomplete Form',
                text: 'You must agree to the Terms of Service and Privacy Policy to continue'
            })
            isCreatingAccount = false
            return
        }
        HypernexAPI.Users.createUser(SignupUsername.value, SignupPassword.value, SignupEmail.value, SignupInviteCode.value).then(user => {
            storage.setValue("currentToken", JSON.stringify(user.AccountTokens[0]))
            storage.setValue("currentUser", JSON.stringify(user))
            window.location = "dashboard.html"
        }).catch(err => {
            window.sendSweetAlert({
                icon: 'error',
                title: 'Failed to Create an Account'
            })
            console.error(err)
            isCreatingAccount = false
        })
    }
})

// Init

HypernexAPI.setDebug(true)

//LoginCard.hidden = true
SignupCard.hidden = true
StatusCard.hidden = true
Login2FA.hidden = true
HypernexAPI.Users.isInviteCodeRequired().then(r => {
    if(r === null){
        SignupInviteCode.hidden = true
        return
    }
    SignupInviteCode.hidden = !r;
})
