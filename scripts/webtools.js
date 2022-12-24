import * as HypernexAPI from './HypernexAPI.js'
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
                HypernexAPI.Users.getUserFromUserId(user.Id, token.content).then(u => {
                    if(u){
                        storage.setValue("currentUser", JSON.stringify(u))
                        exec({userdata: u, token: token})
                    }
                    else
                        exec({userdata: user, token: token})
                }).catch(err => {
                    console.log("Failed to get latest user for reason " + err)
                    exec({userdata: user, token: token})
                })
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
    if(themeId === 0)
        return "dark"
    if(themeId === 1)
        return "light"
    if(themeId === 2)
        return "pink"
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
    if(themeInt >= 0 && themeInt <= 2)
        return themeInt
    else
        return resetTheme()
}

function setTheme(themeId){
    if(themeId >= 0 && themeId <= 2){
        storage.setValue("theme", themeId)
    }
}

let firstLoad = true

export function setThemeOnPage(theme, getElementsByClassName){
    let t = Number(getTheme())
    let otn = getThemeNameByThemeId(t)
    if(otn === undefined)
        return
    if(firstLoad){
        otn = "dark"
        firstLoad = false
    }
    if(theme === undefined)
        theme = t
    let tn = getThemeNameByThemeId(theme)
    if(tn === undefined)
        return
    setTheme(theme)
    let themeElements = getElementsByClassName(otn + "-theme")
    let secondaryElements = getElementsByClassName(otn + "-theme-secondary")
    let textElements = getElementsByClassName(otn + "-text")
    let boxshadowElements = getElementsByClassName(otn + "-box-shadow")
    console.log(otn)
    for(let i = 0; i < themeElements.length; i++){
        let themeElement = themeElements[i]
        themeElement.classList.remove(otn + "-theme")
        themeElement.classList.add(tn + "-theme")
    }
    for(let i = 0; i < secondaryElements.length; i++){
        let themeElement = secondaryElements[i]
        themeElement.classList.remove(otn + "-theme-secondary")
        themeElement.classList.add(tn + "-theme-secondary")
    }
    for(let i = 0; i < textElements.length; i++){
        let themeElement = textElements[i]
        themeElement.classList.remove(otn + "-text")
        themeElement.classList.add(tn + "-text")
    }
    for(let i = 0; i < boxshadowElements.length; i++){
        let themeElement = boxshadowElements[i]
        themeElement.classList.remove(otn + "-box-shadow")
        themeElement.classList.add(tn + "-box-shadow")
    }
}

export const Themes = {
    Dark: 0,
    Light: 1,
    Pink: 2
}