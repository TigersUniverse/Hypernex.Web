/*import * as HypernexAPI from './HypernexAPI'*/
import * as storage from './storage.js'

function removeCache(){
    try{storage.deleteKey("currentToken")}catch(e){}
    try{storage.deleteKey("currentUser")}catch(e){}
}

export function checkLocalUserCache() {
    return new Promise(exec => {
        let tokenString = storage.getValue("currentToken")
        let userString = storage.getValue("currentUser")
        if(!userString || !tokenString){
            removeCache()
            exec(undefined)
            return
        }
        let token = JSON.parse(tokenString)
        let user = JSON.parse(userString)
        HypernexAPI.Users.isUserIdValidToken(user.Id, token.content).then(r => {
            if(r)
                exec({userdata: user, token: token})
            else{
                removeCache()
                exec(undefined)
            }
        })
    })
}

export function getCachedUser() {
    let userString = storage.getValue("currentUser")
    if(!userString){
        removeCache()
        return undefined
    }
    return JSON.parse(userString)
}

export function getCachedToken() {
    let tokenString = storage.getValue("currentToken")
    if(!tokenString){
        removeCache()
        return undefined
    }
    return JSON.parse(tokenString)
}

function getThemeNameByThemeId(themeId) {
    switch (themeId) {
        case 0:
            return "Dark"
        case 1:
            return "Light"
    }
    return undefined
}

function resetTheme(){
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    let themeInt
    if (darkThemeMq.matches) {
        themeInt = Themes.Dark
    }
    else {
        themeInt = Themes.Light
    }
    storage.setValue("theme", themeInt)
    return themeInt
}

export function getTheme(){
    let themeInt = storage.getValue("theme")
    if(!themeInt)
        themeInt = resetTheme()
    if(themeInt >= 0 && themeInt <= 1)
        return themeInt
    else
        return resetTheme()
}

export function setThemeOnPage(theme){
    let otn = getThemeNameByThemeId(getTheme())
    if(otn === undefined)
        return
    let tn = getThemeNameByThemeId(theme)

}

export function createDashboardNotice(type, heading, description){
    let id
    switch (type){
        case Notices.Info:
            id = "infoBubble"
            break
        case Notices.Warning:
            id = "warningBubble"
            break
        case Notices.Error:
            id = "errorBubble"
            break
        default:
            return
    }
    let bubble = document.getElementById(id).cloneNode(true)
    bubble.children[1].children[0].innerHTML = heading
    bubble.children[1].children[2].innerHTML = description
    bubble.hidden = false
    document.body.insertBefore(bubble, document.body.children[0])
    bubble.after(document.createElement("p"))
    return bubble
}

export const Themes = {
    Dark: 0,
    Light: 1,
    Pink: 2
}

export const Notices = {
    Info: 0,
    Warning: 1,
    Error: 2
}