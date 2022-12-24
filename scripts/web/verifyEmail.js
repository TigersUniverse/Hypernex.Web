import * as HypernexAPI from './../HypernexAPI.js'
import * as webtools from './../webtools.js'

let params = new URLSearchParams(window.location.search)
let userid = params.get("userid")
let code = params.get("code")

console.log(userid)
console.log(code)

document.addEventListener("DOMContentLoaded", () => {
    webtools.setThemeOnPage(undefined, s => document.querySelectorAll("." + s))
})

if(userid === null || code === null){
    window.sendSweetAlert({
        icon: 'error',
        title: "Failed to get required URL Parameters!"
    }).then(() => window.location = "/")
}
else
    webtools.checkLocalUserCache().then(r => {
        if(r !== undefined){
            let token = r.token
            HypernexAPI.Users.verifyEmailToken(userid, token.content, code).then(rr => {
                if(rr){
                    window.location = "dashboard"
                }
                else
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Verify Email!"
                    }).then(() => window.location = "/")
            }).catch(err => {
                console.log(err)
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Verify Email!"
                }).then(() => window.location = "/")
            })
        }
        else
            window.location = "/"
    })