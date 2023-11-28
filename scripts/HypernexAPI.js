import * as xhrtools from './xhrtools.js'

const _url = new URL(window.location)
export const BASE_URL = _url.protocol + "//" + _url.host + '/'
const API_VERSION = "v1"

export function getAPIEndpoint(){
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

export const Info = {
    AllowAnyGameServer: function () {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "allowAnyGameServer").then(r => {
                let json = handleRes(r)
                if(json.success)
                    exec(json.result.allowAnyGameServer)
                else
                    reject(new Error("Failed to get AllowAnyGameServer"))
            }).catch(err => reject(err))
        })
    },
    UnityVersion: function () {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "unityVersion").then(r => {
                let json = handleRes(r)
                if(json.success)
                    exec(json.result.UnityVersion)
                else
                    reject(new Error("Failed to get UnityVersion"))
            }).catch(err => reject(err))
        })
    }
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
                xhrtools.GET(getAPIEndpoint() + "isInviteCodeRequired").then(r => {
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
            xhrtools.GET(getAPIEndpoint() + "doesUserExist?userid=" + userid).then(r => {
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
    getUserFromUserId: function (userid, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "getUser", req).then(r => {
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
    },
    getUserFromUsername: function (username, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                username: username,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "getUser", req).then(r => {
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
    enable2fa: function (userid, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "enable2fa", req).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.otpauth_url)
                else
                    exec(false)
            }).catch(err => {
                reject(err)
            })
        })
    },
    verify2fa: function (userid, tokenContent, code) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                code: code
            }
            xhrtools.POST(getAPIEndpoint() + "verify2fa", req).then(r => {
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
    remove2fa: function (userid, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent
            }
            xhrtools.POST(getAPIEndpoint() + "remove2fa", req).then(r => {
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
    resetPasswordWithUserToken: function (userid, tokenContent, newPassword) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
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

export const Worlds = {
    Get: function (worldid) {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "meta/world/" + worldid).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.Meta)
                else
                    exec(undefined)
            }).catch(err => reject(err))
        })
    },
    Delete: function (userid, tokenContent, worldid) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                worldid: worldid
            }
            xhrtools.POST(getAPIEndpoint() + "remove/world", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => reject(err))
        })
    }
}

export const Avatars = {
    Get: function (avatarid) {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "meta/avatar/" + avatarid).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.Meta)
                else
                    exec(undefined)
            }).catch(err => reject(err))
        })
    },
    Delete: function (userid, tokenContent, avatarid) {
        return new Promise((exec, reject) => {
            let req = {
                userid: userid,
                tokenContent: tokenContent,
                avatarid: avatarid
            }
            xhrtools.POST(getAPIEndpoint() + "remove/avatar", req).then(r => {
                let json = handleRes(r)
                if(json)
                    exec(json.success)
                else
                    exec(false)
            }).catch(err => reject(err))
        })
    }
}

export const Search = {
    User: function (username, itemsPerPage = 50, pageNumber = 0) {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "search/user/" + username + '/' + itemsPerPage + '/' + pageNumber).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.Candidates)
                else
                    exec(undefined)
            }).catch(err => reject(err))
        })
    },
    Avatar: function (searchtype, query, itemsPerPage = 50, pageNumber = 0) {
        return new Promise((exec, reject) => {
            if(searchtype === "tag")
                searchtype = "tag"
            else
                searchtype = "search"
            xhrtools.GET(getAPIEndpoint() + searchtype + "/avatar/" + query + '/' + itemsPerPage + '/' + pageNumber).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.Candidates)
                else
                    exec(undefined)
            }).catch(err => reject(err))
        })
    },
    World: function (searchtype, query, itemsPerPage = 50, pageNumber = 0) {
        return new Promise((exec, reject) => {
            if(searchtype === "tag")
                searchtype = "tag"
            else
                searchtype = "search"
            xhrtools.GET(getAPIEndpoint() + searchtype + "/world/" + query + '/' + itemsPerPage + '/' + pageNumber).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.Candidates)
                else
                    exec(undefined)
            }).catch(err => reject(err))
        })
    }
}

export const File = {
    // Grab file from <input type="file">
    Upload: function (userid, tokenContent, file) {
        return new Promise((exec, reject) => {
            let formData = new FormData()
            formData.append('userid', userid)
            formData.append('tokenContent', tokenContent)
            formData.append('file', file, file.name)
            xhrtools.POSTfile(getAPIEndpoint() + "upload", formData).then(r => {
                let json = handleRes(r)
                if(json && json.success)
                    exec(json.result.UploadData)
                else
                    exec(false)
            }).catch(err => reject(err))
        })
    },
    // TODO: Will change on server over time
    GetFile: function (userid, fileid) {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + userid + "/" + fileid, undefined, "arraybuffer").then(r => {
                if(r)
                    exec(r)
                else
                    reject(new Error("Failed to download file"))
            }).catch(err => reject(err))
        })
    },
    AuthForBuilds: function () {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "authForBuilds").then(r => {
                if(r) {
                    let json = handleRes(r)
                    if(json && json.success)
                        exec(json.result.authForBuilds)
                    else
                        reject(new Error("Failed to AuthFotBuilds"))
                }
                else
                    reject(new Error("Failed to AuthFotBuilds"))
            }).catch(err => reject(err))
        })
    },
    GetVersions: function (name) {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "getVersions/" + name).then(r => {
                if(r) {
                    let json = handleRes(r)
                    if(json && json.success)
                        exec(json.result)
                    else
                        reject(new Error("Failed to GetVersions for " + name))
                }
                else
                    reject(new Error("Failed to GetVersions for " + name))
            }).catch(err => reject(err))
        })
    },
    GetBuild: function (name, version, artifact, userid, tokenContent) {
        return new Promise((exec, reject) => {
            let req = {
                buildArtifact: artifact,
                userid: userid,
                tokenContent: tokenContent
            }
            xhrtools.POSTGetFile(getAPIEndpoint() + "getBuild/" + name + "/" + version, req).then(r => {
                exec(r)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

export const Popularity = {
    PopularityType: {
        "Hourly": 0,
        "Daily": 1,
        "Weekly": 2,
        "Monthly": 3,
        "Yearly": 4
    },
    GetWorlds: function (popularityType = 0, itemsPerPage = 50, page = 0) {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "popularity/world/" + popularityType + '/' + itemsPerPage + '/' + page).then(r => {
                if(r) {
                    let json = handleRes(r)
                    if(json && json.success)
                        exec(json.result)
                    else
                        reject(new Error("Failed to GetWorlds Popularity"))
                }
                else
                    reject(new Error("Failed to GetWorlds Popularity"))
            }).catch(err => reject(err))
        })
    },
    GetAvatars: function (popularityType = 0, itemsPerPage = 50, page = 0) {
        return new Promise((exec, reject) => {
            xhrtools.GET(getAPIEndpoint() + "popularity/avatar/" + popularityType + '/' + itemsPerPage + '/' + page).then(r => {
                if(r) {
                    let json = handleRes(r)
                    if(json && json.success)
                        exec(json.result)
                    else
                        reject(new Error("Failed to GetWorlds Popularity"))
                }
                else
                    reject(new Error("Failed to GetWorlds Popularity"))
            }).catch(err => reject(err))
        })
    }
}