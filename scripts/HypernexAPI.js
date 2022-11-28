import * as xhrtools from './xhrtools.js'

const BASE_URL = "http://localhost/"
const API_VERSION = "v1"

function getAPIEndpoint(){
    return BASE_URL + "api/" + API_VERSION + "/"
}

function handleRes(res){
    try{
        return JSON.parse(res.toString())
    }catch (err) {
        console.error(err)
        return null
    }
}

export const Users = {
    login: function (username, password, twofacode) {
        return new Promise(exec => {
            let req = {
                username: username,
                password: password
            }
            if(twofacode)
                req.twofacode = twofacode
            xhrtools.POST(getAPIEndpoint() + "login", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json)
                else
                    throw new Error("Failed to login")
            }).catch(err => throw err)
        })
    },
    createUser: function(username, password, email, inviteCode) {
        return new Promise(exec => {
            let req = {
                username: username,
                password: password,
                email: email
            }
            if(inviteCode !== null)
                req.inviteCode = inviteCode
            xhrtools.POST(getAPIEndpoint() + "createUser", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json)
                else
                    throw new Error("Failed to createAccount")
            }).catch(err => throw err)
        })
    },
    doesUserExist: function (userid) {
        return new Promise(exec => {
            let req = {
                userid: userid
            }
            xhrtools.POST(getAPIEndpoint() + "doesUserExist", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json)
                else
                    throw new Error("Failed to doesUserExist")
            }).catch(err => throw err)
        })
    },
    Rank: {
        Guest: 0,
        Incompleter: 1,
        Registered: 2,
        Verified: 3,
        Moderator: 4,
        Admin: 5,
        Owner: 6
    },
    Status: {
        Offline: 0,
        Online: 1,
        Absent: 2,
        Party: 3,
        DoNotDisturb: 4
    },
    LoginResult: {
        Incorrect: 0,
        Missing2FA: 1,
        Banned: 2,
        Warned: 3,
        Correct: 4
    }
}