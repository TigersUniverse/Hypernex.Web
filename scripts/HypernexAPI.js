import * as xhrtools from './xhrtools.js'

const BASE_URL = "http://localhost/"
const API_VERSION = "v1"

function getAPIEndpoint(){
    return BASE_URL + "api/" + API_VERSION + "/"
}

function handleRes(res){
    try{
        console.log(res.toString())
        return JSON.parse(res.toString())
    }catch (err) {
        console.error(err)
        return null
    }
}

let isDebug = false

export function setDebug(to) {
    isDebug = to
}

function getUserHandler(data){
    return new Promise((exec, reject) => {
        xhrtools.POST(getAPIEndpoint() + "getUser", data).then(r => {
            let json = handleRes(r)
            if(json){
                if(json.success){
                    exec(json.result.UserData)
                }
                else
                    reject(new Error("Server Failed to getUser"))
            }
            else
                reject(new Error("Failed to getUser"))
        }).catch(err => {
            reject(err)
        })
    })
}

export const Users = {
    login: function (username, password, twofacode) {
        return new Promise((exec, reject) => {
            let req = {
                username: username,
                password: password
            }
            if(twofacode)
                req.twofacode = twofacode
            xhrtools.POST(getAPIEndpoint() + "login", req).then(r => {
                let json = handleRes(r)
                if(json){
                    if(json.success){
                        exec(json.result)
                    }
                    else
                        reject(new Error("Server Failed to login"))
                }
                else
                    reject(new Error("Failed to login"))
            }).catch(err => {
                throw err
            })
        })
    },
    logout: function (userid, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "logout", req).then(r => {
                let json = handleRes(r)
                if(json){
                    exec(json.success)
                }
                else
                    reject(new Error("Failed to logout"))
            }).catch(err => {
                throw err
            })
        })
    },
    isInviteCodeRequired: function () {
        return new Promise(exec => {
            if(isDebug)
                exec(true)
            else
                xhrtools.POST(getAPIEndpoint() + "isInviteCodeRequired").then(r => {
                    let json = handleRes(r)
                    if(json)
                        exec(json.result.inviteCodeRequired)
                    else
                        exec(null)
                }).catch(err => exec(null))
        })
    },
    createUser: function(username, password, email, inviteCode) {
        return new Promise((exec, reject) => {
            let req = {
                username: username,
                password: password,
                email: email
            }
            if(inviteCode !== null)
                req.inviteCode = inviteCode
            xhrtools.POST(getAPIEndpoint() + "createUser", req).then(r => {
                let json = handleRes(r)
                if(json){
                    if(json.success){
                        exec(json.result.UserData)
                    }
                    else
                        reject(new Error("Server Failed to createAccount"))
                }
                else
                    reject(new Error("Failed to createAccount"))
            }).catch(err => {
                reject(err)
            })
        })
    },
    doesUserExist: function (userid) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid
            }
            xhrtools.POST(getAPIEndpoint() + "doesUserExist", req).then(r => {
                let json = handleRes(r)
                if(json){
                    if(json.success){
                        exec(json.result.doesUserExist)
                    }
                    else
                        reject(new Error("Server Failed to doesUserExist"))
                }
                else
                    reject(new Error("Failed to doesUserExist"))
            }).catch(err => {
                reject(err)
            })
        })
    },
    getUserFromUserId: function (userid, token) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid
            }
            if(token)
                req.tokenContent = token.content
            getUserHandler(req).then(userdata => exec(userdata)).catch(err => reject(err))
        })
    },
    getUserFromUsername: function (username, token) {
        return new Promise((exec, reject) => {
            let req = {
                username: username
            }
            if(token)
                req.tokenContent = token.content
            getUserHandler(req).then(userdata => exec(userdata)).catch(err => reject(err))
        })
    },
    isUsernameValidToken: function (username, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                username: username,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "isValidToken", req).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.isValidToken)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    isUserIdValidToken: function (userid, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "isValidToken", req).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.isValidToken)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    sendVerificationEmail: function (userid, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "sendVerificationEmail", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    verifyEmailToken: function (userid, tokenContent, emailToken) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                emailToken: emailToken
            }
            xhrtools.POST(getAPIEndpoint() + "verifyEmailToken", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    changeEmail: function (userid, tokenContent, newEmail) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                newEmail: newEmail
            }
            xhrtools.POST(getAPIEndpoint() + "changeEmail", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    requestPasswordReset: function (email) {
        return new Promise((exec, reject) => {
            let req = {
                email: email
            }
            xhrtools.POST(getAPIEndpoint() + "requestPasswordReset", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    resetPassword: function (userid, passwordResetContent, newPassword) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                passwordResetContent: passwordResetContent,
                newPassword: newPassword
            }
            xhrtools.POST(getAPIEndpoint() + "resetPassword", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    updateBio: function (userid, tokenContent, bio) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                bio: bio
            }
            xhrtools.POST(getAPIEndpoint() + "updateBio", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    blockUser: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "blockUser", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    unblockUser: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "unblockUser", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    followUser: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "followUser", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    unfollowUser: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "unfollowUser", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    sendFriendRequest: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "sendFriendRequest", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    acceptFriendRequest: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "acceptFriendRequest", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    declineFriendRequest: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "declineFriendRequest", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    removeFriend: function (userid, tokenContent, targetUserId) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                targetUserId: targetUserId
            }
            xhrtools.POST(getAPIEndpoint() + "removeFriend", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
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

export const File = {
    Upload: function (userid, fileLocation) {

    }
}