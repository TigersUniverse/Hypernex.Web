import * as HypernexAPI from './../HypernexAPI.js'
import * as webtools from "../webtools.js";

let params = new URLSearchParams(window.location.search)
let userid = params.get("userid")
let code = params.get("code")

console.log(userid)
console.log(code)

let ResetPasswordInput = document.getElementById("password")
let ResetConfirmPasswordInput = document.getElementById("confirmpassword")
let ResetPasswordButton = document.getElementById("password-reset")

document.addEventListener("DOMContentLoaded", () => {
    webtools.setThemeOnPage(undefined, s => document.querySelectorAll("." + s))
})

if(userid === null || code === null){
    window.sendSweetAlert({
        icon: 'error',
        title: "Failed to get required URL Parameters!"
    }).then(() => window.location = "/")
}

let isResettingPassword = false
ResetPasswordButton.addEventListener("click", () => {
    if(ResetPasswordInput.value !== ResetConfirmPasswordInput.value){
        window.sendSweetAlert({
            icon: 'error',
            title: "Passwords do not Match!"
        })
        return
    }
    if(!isResettingPassword){
        isResettingPassword = true
        HypernexAPI.Users.resetPassword(userid, code, ResetConfirmPasswordInput.value).then(r => {
            if(r){
                window.sendSweetAlert({
                    icon: 'success',
                    title: "Password Reset!"
                }).then(() => window.location = "/")
            }else{
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Reset Password!"
                })
                isResettingPassword = false
            }
        }).catch(err => {
            console.log(err)
            window.sendSweetAlert({
                icon: 'error',
                title: "Failed to Reset Password!"
            })
            isResettingPassword = false
        })
    }
})