import * as HypernexAPI from './HypernexAPI'
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