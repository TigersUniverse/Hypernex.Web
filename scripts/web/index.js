import * as HypernexAPI from '../HypernexAPI.js'
import * as storage from '../storage.js'
import * as datetools from '../datetools.js'
import * as webtools from '../webtools.js'

// Elements
let LoginCard = document.getElementById("login-card")
let SignupCard = document.getElementById("signup-card")
let ResetPasswordCard = document.getElementById("reset-password-card")
let StatusCard = document.getElementById("status-card")

let LoginButton = document.getElementById("login-button")
let SignupButton = document.getElementById("signup-button")
let ResetPasswordButton = document.getElementById("send-password-reset")
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
let SignupRules = document.getElementById("signup-rules")
const CorrectEmoji = '✅'
const WrongEmoji = '❌'

let PasswordResetEmail = document.getElementById("password-reset-email-input")

let LoginToExistingAccount = document.getElementById("login-existing-account")
let CreateAnAccount = document.getElementById("create-account")
let ForgetPassword = document.getElementById("forget-password")
let LoginFromForgetPassword = document.getElementById("login-from-password-reset")

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

ForgetPassword.addEventListener("click", () => {
    LoginCard.hidden = true
    ResetPasswordCard.hidden = false
})

LoginFromForgetPassword.addEventListener("click", () => {
    LoginCard.hidden = false
    ResetPasswordCard.hidden = true
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
            StatusTitle.textContent = "You have been Warned"
            StatusBeginDate.textContent = "Date Warned: " + datetools.dateToString(datetools.fromUnix(result.WarnStatus.TimeWarned))
            StatusEndDate.textContent = ""
            StatusReason.textContent = "Warn Reason: " + result.WarnStatus.WarnReason
            StatusDescription.textContent = "Warn Description: " + result.WarnStatus.WarnDescription
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
            StatusTitle.textContent = "You have been Banned"
            StatusBeginDate.textContent = "Date Banned: " + datetools.dateToString(datetools.fromUnix(result.BanStatus.BanBegin))
            StatusEndDate.textContent = "Length of Ban: " + datetools.dateToString(datetools.fromUnix(result.BanStatus.BanEnd))
            StatusReason.textContent = "Ban Reason: " + result.BanStatus.BanReason
            StatusDescription.textContent = "Ban Description: " + result.BanStatus.BanDescription
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
                    HypernexAPI.Users.getUserFromUsername(LoginUsername.value, token.content).then(user => {
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

let isResettingPassword = false
ResetPasswordButton.addEventListener("click", () => {
    if (!isResettingPassword) {
        isResettingPassword = true
        HypernexAPI.Users.requestPasswordReset(PasswordResetEmail.value).then(r => {
            if (r)
                window.sendSweetAlert({
                    icon: 'success',
                    title: "Sent Password Reset!",
                    text: "Check your email for instructions!"
                })
            else {
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to send Password Reset!"
                })
                isResettingPassword = false
            }
        }).catch(err => {
            console.log(err)
            window.sendSweetAlert({
                icon: 'error',
                title: "Failed to send Password Reset!"
            })
            isResettingPassword = false
        })
    }
})

// Init

//HypernexAPI.setDebug(true)

//LoginCard.hidden = true
SignupCard.hidden = true
StatusCard.hidden = true
Login2FA.hidden = true
if(webtools.getCachedUser() !== undefined)
    window.location = "dashboard"
else
    HypernexAPI.Users.isInviteCodeRequired().then(r => {
        if(r === null){
            SignupInviteCode.hidden = true
            return
        }
        SignupInviteCode.hidden = !r;
    })

const ACCEPTABLE_CHARACTERS_IN_USERNAME = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F",
    "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
    "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "_"]

const isUpperCase = (string) => /^[A-Z]*$/.test(string)
const isLowerCase = (string) => /^[a-z]*$/.test(string)
const isNumber = (string) => /^\d+$/.test(string)

function verifySignupInformation(){
    let j = 0
    for (let i = 0; i < SignupRules.children.length; i+=3){
        let child = SignupRules.children[i]
        let symbol
        switch (j) {
            case 0:
                symbol = SignupUsername.value.length >= 3 ? CorrectEmoji : WrongEmoji
                break
            case 1:
                symbol = SignupUsername.value.length <= 20 ? CorrectEmoji : WrongEmoji
                break
            case 2:
                let ub2 = true
                for(let ub2i = 0; ub2i < SignupUsername.value.length; ub2i++){
                    let char = SignupUsername.value[ub2i]
                    let f = false
                    for(let ac = 0; ac < ACCEPTABLE_CHARACTERS_IN_USERNAME.length; ac++){
                        if(ACCEPTABLE_CHARACTERS_IN_USERNAME[ac] === char)
                            f = true
                    }
                    if(!f)
                        ub2 = false
                }
                symbol = ub2 ? CorrectEmoji : WrongEmoji
                break
            case 3:
                let cc = 0
                for(let u3i = 0; u3i < SignupUsername.value.length; u3i++){
                    let char = SignupUsername.value[u3i]
                    if(char === "_")
                        cc++
                }
                symbol = cc <= 1 ? CorrectEmoji : WrongEmoji
                break
            case 4:
                symbol = SignupPassword.value.length >= 8 ? CorrectEmoji : WrongEmoji
                break
            case 5:
                let p5 = false
                for(let p5i = 0; p5i < SignupPassword.value.length; p5i++){
                    let char = SignupPassword.value[p5i]
                    if(isUpperCase(char)){
                        p5 = true
                        break
                    }
                }
                symbol = p5 ? CorrectEmoji : WrongEmoji
                break
            case 6:
                let p6 = false
                for(let p6i = 0; p6i < SignupPassword.value.length; p6i++){
                    let char = SignupPassword.value[p6i]
                    if(isLowerCase(char)){
                        p6 = true
                        break
                    }
                }
                symbol = p6 ? CorrectEmoji : WrongEmoji
                break
            case 7:
                let p7 = false
                for(let p7i = 0; p7i < SignupPassword.value.length; p7i++){
                    let char = SignupPassword.value[p7i]
                    if(isNumber(char)){
                        p7 = true
                        break
                    }
                }
                symbol = p7 ? CorrectEmoji : WrongEmoji
                break
            case 8:
                let p8 = false
                for(let p8i = 0; p8i < SignupPassword.value.length; p8i++){
                    let char = SignupPassword.value[p8i]
                    if(!isLowerCase(char) && !isUpperCase(char) && !isNumber(char)){
                        p8 = true
                        break
                    }
                }
                symbol = p8 ? CorrectEmoji : WrongEmoji
                break
            case 9:
                symbol = window.isEmail(SignupEmail.value) ? CorrectEmoji : WrongEmoji
                break
        }
        if(symbol !== undefined)
            child.textContent = symbol + ' '
        j++
    }
}

SignupUsername.addEventListener("input", verifySignupInformation)
SignupEmail.addEventListener("input", verifySignupInformation)
SignupPassword.addEventListener("input", verifySignupInformation)