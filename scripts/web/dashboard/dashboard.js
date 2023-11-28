import * as HypernexAPI from '../../HypernexAPI.js'
import * as webtools from '../../webtools.js'
import {
    default as user,
    viewProfile,
    getColorFromStatus,
    getTextFromStatus,
    getTextForPronouns,
    getShortenedText
} from './user.js'
import { default as world, viewWorld } from './worlds.js'
import { default as avatar, viewAvatar } from './avatars.js'
import { default as search } from './search.js'

let User
let World
let Avatar

let localUser
let localToken

const FriendsList = document.getElementById("friends-list")
const FriendRequestsList = document.getElementById("friend-requests-list")
const ShowOfflineFriendsCheckbox = document.getElementById("friends-show-offline")

const Tabs = {
    Home: document.getElementById("home-tab"),
    Profile: document.getElementById("profile-tab"),
    Worlds: document.getElementById("world-tab"),
    Avatars: document.getElementById("avatar-tab"),
    Search: document.getElementById("search-tab"),
    Settings: document.getElementById("settings-tab")
}

const TabButtons = {
    HomeButton: document.getElementById("home-tab-button"),
    ProfileButton: document.getElementById("profile-tab-button"),
    WorldsButton: document.getElementById("world-tab-button"),
    AvatarsButton: document.getElementById("avatar-tab-button"),
    SearchButton: document.getElementById("search-tab-button"),
    SettingsButton: document.getElementById("settings-tab-button")
}

const TabContents = {
    Profile: {
        AddFriendButton: document.getElementById("profile-add-friend"),
        RemoveFriendButton: document.getElementById("profile-remove-friend"),
        BlockButton: document.getElementById("profile-block"),
        UnblockButton: document.getElementById("profile-unblock"),
        FollowButton: document.getElementById("profile-follow"),
        UnfollowButton: document.getElementById("profile-unfollow"),
        EditProfile: document.getElementById("profile-edit"),
        EditProfileCardContent: document.getElementById("edit-profile-popup").children[0],
        EditPronounsCardContent: document.getElementById("set-pronoun-popup").children[0]
    },
    Settings: {
        EmailVerificationButton: document.getElementById("verify-email-button"),
        Enter2FAWizard: document.getElementById("enter-2fa-wizard"),
        Remove2FAButton: document.getElementById("remove-2fa"),
        TwoFAWizard: document.getElementById("qrcode-popup"),
        TwoFAWizardInput: document.getElementById("verify-2fa-code"),
        TwoFAUrl: document.getElementById("qrcode-url")
    }
}

const HomeFriendsListLeftButton = document.getElementById("friends-nav-left")
const HomeFriendsListRightButton = document.getElementById("friends-nav-right")
const HomeFriendRequestsListLeftButton = document.getElementById("friend-requests-nav-left")
const HomeFriendRequestsListRightButton = document.getElementById("friend-requests-nav-right")

const Notices = {
    Info: 0,
    Warning: 1,
    Error: 2
}

let didSendEmailVerification = false
let didChangeEmail = false
let didResetPassword = false
let isEnabling2FA = false
let isRemoving2FA = false

let qrcode

function renderPage(userdata, token){
    localUser = userdata
    localToken = token
    document.getElementById("hiusn").innerHTML = getRandomGreetingPhrase(userdata.Username)
    document.getElementById("signoutButton").addEventListener("click", () => HypernexAPI.Users.logout(localUser.Id, localToken.content).then(r => {
        if(r)
            window.location.reload()
        else
            window.sendSweetAlert({
                icon: 'error',
                title: "Failed to Signout!"
            })
    }))
    setupDownloads()
    setupFriends()
    setupSettingsTab(userdata, token)
    User = user(userdata, token, TabButtons.ProfileButton, TabContents)
    World = world(userdata, token, TabButtons.WorldsButton)
    Avatar = avatar(userdata, token, TabButtons.AvatarsButton)
    search(userdata, token, u => {
        viewProfile(u)
        showTab(TabButtons.ProfileButton, Tabs.Profile)
    }, (w, c) => {
        viewWorld(w, c)
        showTab(TabButtons.WorldsButton, Tabs.Worlds)
    }, (a, c) => {
        viewAvatar(a, c)
        showTab(TabButtons.AvatarsButton, Tabs.Avatars)
    })
    setupTabButtonEvents()
    checkParameters()
}

function getRandomGreetingPhrase(username) {
    const greetings = ["Howdy", "Hello", "Greetings", "Welcome", "G'day", "Hey", "Howdy-do", "Shalom"]
    let i = Math.floor(Math.random() * greetings.length)
    return greetings[i] + ", " + username + "!"
}

function sortOfflineFriends(friends){
    let totalfriends = []
    let onlinefriends = []
    let offlinefriends = []
    for(let i = 0; i < friends.length; i++){
        let friend = friends[i]
        if(friend.Bio.Status !== HypernexAPI.Users.Status.Offline)
            onlinefriends.push(friend)
        else
            offlinefriends.push(friend)
    }
    for(let i = 0; i < onlinefriends.length; i++){
        let friend = onlinefriends[i]
        totalfriends.push(friend)
    }
    for(let i = 0; i < offlinefriends.length; i++){
        let friend = offlinefriends[i]
        totalfriends.push(friend)
    }
    return{
        TotalFriends: totalfriends,
        OnlineFriends: onlinefriends,
        OfflineFriends: offlinefriends
    }
}

function toggleOfflineFriends(value){
    let fCount = FriendsList.children.length
    let hiddenCount = 0
    for(let i = 0; i < fCount; i++){
        let childNode = FriendsList.children[i]
        if(childNode.id === ""){
            if(value)
                childNode.hidden = false
            else{
                let statusIcon = childNode.children[1].children[1]
                if(statusIcon.style.backgroundColor === "gray"){
                    childNode.hidden = true
                    hiddenCount++
                }
            }
        }
    }
    let h = fCount - 1 === hiddenCount
    HomeFriendsListLeftButton.hidden = h
    HomeFriendsListRightButton.hidden = h
}

function createDashboardNotice(type, heading, description){
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

function showTab(tabButton, tabToShow){
    for(let key of Object.keys(TabButtons)){
        let value = TabButtons[key]
        value.classList.remove("selected-tab")
    }
    for(let key of Object.keys(Tabs)){
        let value = Tabs[key]
        value.hidden = true
    }
    tabButton.classList.add("selected-tab")
    tabToShow.hidden = false
}

function setupTabButtonEvents(){
    TabButtons.HomeButton.addEventListener("click", () => showTab(TabButtons.HomeButton, Tabs.Home))
    TabButtons.ProfileButton.addEventListener("click", () => showTab(TabButtons.ProfileButton, Tabs.Profile))
    TabButtons.WorldsButton.addEventListener("click", () => showTab(TabButtons.WorldsButton, Tabs.Worlds))
    TabButtons.AvatarsButton.addEventListener("click", () => showTab(TabButtons.AvatarsButton, Tabs.Avatars))
    TabButtons.SearchButton.addEventListener("click", () => showTab(TabButtons.SearchButton, Tabs.Search))
    TabButtons.SettingsButton.addEventListener("click", () => showTab(TabButtons.SettingsButton, Tabs.Settings))
}

function onDownloadedFileFromPOST(r){
    window.downloadBinary(r.Buffer, r.FileName)
}

function initDownloadButton(button, name, artifact, display){
    if(display === undefined)
        display = name
    HypernexAPI.File.GetVersions(name).then(r => {
        if(r.Versions.length <= 0)
            return;
        let latest = r.Versions[0]
        button.innerHTML = "Download " + display + " (" + latest + ")"
    })
    button.addEventListener("click", () => {
        HypernexAPI.File.GetVersions(name).then(versions => {
            if(versions.Versions.length <= 0)
                return;
            let latestVersion = versions.Versions[0]
            HypernexAPI.File.AuthForBuilds().then(authRequired => {
                if(authRequired)
                    HypernexAPI.File.GetBuild(name, latestVersion, artifact, webtools.getCachedUser().Id, webtools.getCachedToken().content).then(onDownloadedFileFromPOST).catch()
                else
                    HypernexAPI.File.GetBuild(name, latestVersion, artifact).then(onDownloadedFileFromPOST).catch()
            })
        })
    })
}

function setupDownloads(){
    initDownloadButton(document.getElementById("download-hypernex.launcher"), "Hypernex.Launcher", 0)
    initDownloadButton(document.getElementById("download-hypernex.unity"), "Hypernex.Unity", 0, "Hypernex.Unity for Windows")
    initDownloadButton(document.getElementById("download-hypernex.unity-android"), "Hypernex.Unity", 1, "Hypernex.Unity for Android")
    initDownloadButton(document.getElementById("download-hypernex.cck"), "Hypernex.CCK", 0)
    HypernexAPI.Info.UnityVersion().then(unityVersion => {
        let b = document.getElementById("download-unity")
        b.addEventListener("click", () => window.location = "unityhub://" + unityVersion)
        b.innerHTML = "Download Unity " + unityVersion + " in Unity Hub"
    })
    HypernexAPI.Info.AllowAnyGameServer().then(r => document.getElementById("gameservertokeninfo").hidden = !r).catch()
    initDownloadButton(document.getElementById("download-hypernex.networking.server"), "Hypernex.Networking.Server", 0, "Hypernex.Networking.Server for Linux")
}

function setupFriends(){
    HomeFriendsListLeftButton.addEventListener("click", () => FriendsList.scrollLeft -= 400)
    HomeFriendsListRightButton.addEventListener("click", () => FriendsList.scrollLeft += 400)
    //let f = sortOfflineFriends(localUser.Friends).TotalFriends
    let f = localUser.Friends
    for(let i = 0; i < f.length; i++){
        let friend = f[i]
        HypernexAPI.Users.getUserFromUserId(friend).then(user => {
            if(user !== undefined){
                let fc = createFriendCard(user)
                toggleOfflineFriends(ShowOfflineFriendsCheckbox.checked)
            }
        })
    }
    toggleOfflineFriends(ShowOfflineFriendsCheckbox.checked)
    ShowOfflineFriendsCheckbox.addEventListener("click", () => toggleOfflineFriends(ShowOfflineFriendsCheckbox.checked))
    document.getElementById("friends-label").innerHTML = "Friends (" + f.length + ")"
    HomeFriendRequestsListLeftButton.addEventListener("click", () => FriendRequestsList.scrollLeft -= 400)
    HomeFriendRequestsListRightButton.addEventListener("click", () => FriendRequestsList.scrollLeft += 400)
    let fr = localUser.FriendRequests
    for(let i = 0; i < fr.length; i++){
        let friendRequest = fr[i]
        HypernexAPI.Users.getUserFromUserId(friendRequest).then(user => {
            if(user !== undefined){
                createFriendRequestCard(user)
            }
        })
    }
    document.getElementById("friend-requests-label").innerHTML = "Friend Requests (" + fr.length + ")"
    if(fr.length <= 0){
        HomeFriendRequestsListLeftButton.hidden = true
        HomeFriendRequestsListRightButton.hidden = true
    }
}

function emailCheck(){
    if(!localUser.isEmailVerified){
        createDashboardNotice(Notices.Info, "Email not Verified!", "Please verify your email! It will protect your account from loss and theft! You can navigate to the Settings panel to set this up.")
        TabContents.Settings.EmailVerificationButton.addEventListener("click", () => {
            if(!didSendEmailVerification){
                didSendEmailVerification = true
                HypernexAPI.Users.sendVerificationEmail(localUser.Id, localToken.content).then(r => {
                    if(r)
                        window.sendSweetAlert({
                            icon: 'success',
                            title: "Sent Verification Email!",
                            text: "Please follow the link from the email in your inbox to verify your email"
                        })
                    else {
                        didSendEmailVerification = false
                        window.sendSweetAlert({
                            icon: 'error',
                            title: "Could not send Verification Email!"
                        })
                    }
                }).catch(err => {
                    didSendEmailVerification = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Could not send Verification Email!"
                    })
                    console.log(err)
                })
            }
        })
    }
    else{
        document.getElementById("email-verification-status").innerHTML = "Email Verification Status: Verified"
        document.getElementById("verify-email-button").hidden = true
    }
}

function setupSettingsTab(userdata, token){
    emailCheck()
    document.getElementById("change-email").addEventListener("click", () => {
        if(!didChangeEmail){
            didChangeEmail = true
            HypernexAPI.Users.changeEmail(userdata.Id, token.content, document.getElementById("new-email").value).then(r => {
                if(r)
                    window.sendSweetAlert({
                        icon: 'success',
                        title: "Changed Email!",
                        text: "Don't forget to verify your new email!"
                    })
                else{
                    didChangeEmail = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to change email!"
                    })
                }
            }).catch(err => {
                didChangeEmail = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to change email!"
                })
                console.log(err)
            })
        }
    })
    document.getElementById("set-password").addEventListener("click", () => {
        let p1 = document.getElementById("new-password").value
        let p2 = document.getElementById("confirm-new-password").value
        if((p1 === p2) && !didResetPassword){
            didResetPassword = true
            HypernexAPI.Users.resetPasswordWithUserToken(userdata.Id, token.content, p1).then(r => {
                if(r)
                    window.sendSweetAlert({
                        icon: 'success',
                        title: "Password Reset",
                        text: "You should now be signed out"
                    }).then(() => window.location.reload())
                else{
                    didResetPassword = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Reset Password!"
                    })
                }
            }).catch(err => {
                didResetPassword = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Reset Password!"
                })
                console.log(err)
            })
        }
    })
    if(userdata.is2FAVerified){
        document.getElementById("2fa-status-text").innerHTML = "2FA Status: Enabled"
        TabContents.Settings.Enter2FAWizard.hidden = true
    }
    else
        TabContents.Settings.Remove2FAButton.hidden = true
    qrcode = new QRCode(document.getElementById("qrcode"), {
        width: 128,
        height: 128
    })
    TabContents.Settings.Enter2FAWizard.addEventListener("click", () => {
        if(!isEnabling2FA){
            isEnabling2FA = true
            TabContents.Settings.TwoFAWizardInput.value = ""
            HypernexAPI.Users.enable2fa(userdata.Id, token.content).then(url => {
                if(url){
                    qrcode.makeCode(url)
                    TabContents.Settings.TwoFAUrl.innerHTML = url
                    TabContents.Settings.TwoFAUrl.href = url
                    TabContents.Settings.TwoFAWizard.hidden = false
                }
                else{
                    isEnabling2FA = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Enable 2FA!"
                    })
                }
            }).catch(err => {
                isEnabling2FA = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Enable 2FA!"
                })
                console.log(err)
            })
        }
    })
    // Close button for 2FA Wizard
    TabContents.Settings.TwoFAWizard.children[0].children[0].addEventListener("click", () => {
        isEnabling2FA = false
        TabContents.Settings.TwoFAWizard.hidden = true
    })
    document.getElementById("enable-2fa-from-wizard").addEventListener("click", () => {
        if(isEnabling2FA){
            HypernexAPI.Users.verify2fa(userdata.Id, token.content, TabContents.Settings.TwoFAWizardInput.value).then(r => {
                if(r){
                    window.sendSweetAlert({
                        icon: 'success',
                        title: "2FA Enabled!"
                    }).then(() => {
                        isEnabling2FA = false
                        TabContents.Settings.TwoFAWizardInput.hidden = true
                        window.location.reload()
                    })
                }
                else
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Verify 2FA Code!",
                        text: "Is your code correct?"
                    })
            }).catch(err => {
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Verify 2FA Code!"
                })
                console.log(err)
            })
        }
    })
    TabContents.Settings.Remove2FAButton.addEventListener("click", () => {
        if(!isRemoving2FA){
            isRemoving2FA = true
            window.sendSweetAlert({
                icon: 'question',
                title: "Are you sure you want to remove 2FA?",
                text: "2FA Keeps your account safer by adding an extra layer of security!",
                confirmButtonText: 'Yes',
                denyButtonText: 'No',
                showDenyButton: true
            }).then(r => {
                if(r.isConfirmed){
                    HypernexAPI.Users.remove2fa(userdata.Id, token.content).then(rr => {
                        if(rr)
                            window.sendSweetAlert({
                                icon: 'success',
                                title: "Removed 2FA!"
                            }).then(() => window.location.reload())
                        else{
                            isRemoving2FA = false
                            window.sendSweetAlert({
                                icon: 'error',
                                title: "Failed to Remove 2FA!"
                            })
                        }
                    }).catch(err => {
                        isRemoving2FA = false
                        window.sendSweetAlert({
                            icon: 'error',
                            title: "Failed to Remove 2FA!"
                        })
                        console.log(err)
                    })
                }
            })
        }
    })
}

function createFriendCard(user){
    let t = document.getElementById("example-friend-card")
    let friendCard = t.cloneNode(true)
    let bannerImg = friendCard.children[0]
    let pfpImg = friendCard.children[1].children[0]
    let statusIcon = friendCard.children[1].children[1]
    let usernameText = friendCard.children[1].children[2].children[0]
    let pronounText = friendCard.children[1].children[2].children[1]
    let statusText = friendCard.children[1].children[3]
    let bio = user.Bio
    if(bio.BannerURL === undefined || bio.BannerURL === "")
        bio.BannerURL = "media/defaultbanner.jpg"
    bannerImg.src = bio.BannerURL
    if(bio.PfpURL === undefined || bio.PfpURL === "")
        bio.PfpURL = "media/defaultpfp.jpg"
    pfpImg.src = bio.PfpURL
    statusIcon.style.backgroundColor = getColorFromStatus(bio.Status)
    statusText.innerHTML = getTextFromStatus(bio.Status)
    if(bio.DisplayName !== undefined && bio.DisplayName !== "")
        usernameText.innerHTML = bio.DisplayName
    else
        usernameText.innerHTML = "@" + user.Username
    if(bio.StatusText !== undefined && bio.StatusText !== "" && bio.Status !== HypernexAPI.Users.Status.Offline)
        statusText.innerHTML = getShortenedText(bio.StatusText)
    if(bio.Pronouns !== undefined){
        pronounText.innerHTML = getTextForPronouns(bio.Pronouns)
        pronounText.hidden = false
    }
    friendCard.hidden = false
    friendCard.id = ""
    friendCard.addEventListener("click", () => {
        viewProfile(user)
        showTab(TabButtons.ProfileButton, Tabs.Profile)
    })
    t.parentNode.appendChild(friendCard)
    return friendCard
}

function createFriendRequestCard(user){
    let t = document.getElementById("example-friend-request-card")
    let friendCard = t.cloneNode(true)
    let bannerImg = friendCard.children[0]
    let pfpImg = friendCard.children[1].children[0]
    let statusIcon = friendCard.children[1].children[1]
    let usernameText = friendCard.children[1].children[2].children[0]
    let pronounText = friendCard.children[1].children[2].children[1]
    let statusText = friendCard.children[1].children[3]
    let acceptButton = friendCard.children[2]
    let declineButton = friendCard.children[3]
    let bio = user.Bio
    if(bio.BannerURL === undefined || bio.BannerURL === "")
        bio.BannerURL = "media/defaultbanner.jpg"
    bannerImg.src = bio.BannerURL
    if(bio.PfpURL === undefined || bio.PfpURL === "")
        bio.PfpURL = "media/defaultpfp.jpg"
    pfpImg.src = bio.PfpURL
    statusIcon.style.backgroundColor = getColorFromStatus(bio.Status)
    statusText.innerHTML = getTextFromStatus(bio.Status)
    if(bio.DisplayName !== undefined && bio.DisplayName !== "")
        usernameText.innerHTML = bio.DisplayName
    else
        usernameText.innerHTML = "@" + user.Username
    if(bio.StatusText !== undefined && bio.StatusText !== "" && bio.Status !== HypernexAPI.Users.Status.Offline)
        statusText.innerHTML = getShortenedText(bio.StatusText)
    if(bio.Pronouns !== undefined){
        pronounText.innerHTML = getTextForPronouns(bio.Pronouns)
        pronounText.hidden = false
    }
    friendCard.hidden = false
    friendCard.id = ""
    let acceptButtonClicked = false
    acceptButton.addEventListener("click", () => {
        if(!acceptButtonClicked){
            acceptButtonClicked = true
            HypernexAPI.Users.acceptFriendRequest(localUser.Id, localToken.content, user.Id).then(r => {
                if(r){
                    friendCard.remove()
                }
                else{
                    window.sendSweetAlert({
                        icon: 'error',
                        title: 'Failed to accept Friend Request'
                    })
                    acceptButtonClicked = false
                }
            }).catch(err => {
                window.sendSweetAlert({
                    icon: 'error',
                    title: 'Failed to accept Friend Request'
                })
                console.log(err)
                acceptButtonClicked = false
            })
        }
    })
    let declineButtonClicked = false
    declineButton.addEventListener("click", () => {
        if(!declineButtonClicked){
            declineButtonClicked = true
            HypernexAPI.Users.declineFriendRequest(localUser.Id, localToken.content, user.Id).then(r => {
                if(r){
                    friendCard.remove()
                }
                else{
                    window.sendSweetAlert({
                        icon: 'error',
                        title: 'Failed to decline Friend Request'
                    })
                    declineButtonClicked = false
                }
            }).catch(err => {
                window.sendSweetAlert({
                    icon: 'error',
                    title: 'Failed to decline Friend Request'
                })
                console.log(err)
                declineButtonClicked = false
            })
        }
    })
    t.parentNode.appendChild(friendCard)
}

function checkParameters(){
    let params = new URL(window.location).searchParams
    for(const [key, value] of params){
        switch (key){
            case "id":
                let s = value.split('_')[0]
                switch (s){
                    case "user":
                        HypernexAPI.Users.getUserFromUserId(value).then(user => {
                            if(user === undefined)
                                return
                            viewProfile(user)
                            showTab(TabButtons.ProfileButton, Tabs.Profile)
                        })
                        break
                    case "avatar":
                        HypernexAPI.Avatars.Get(value).then(avatar => {
                            if(avatar === undefined)
                                return
                            HypernexAPI.Users.getUserFromUserId(avatar.OwnerId).then(user => {
                                if(user === undefined)
                                    return
                                viewAvatar(avatar, user)
                                showTab(TabButtons.AvatarsButton, Tabs.Avatars)
                            })
                        })
                        break
                    case "world":
                        HypernexAPI.Worlds.Get(value).then(world => {
                            if(world === undefined)
                                return
                            HypernexAPI.Users.getUserFromUserId(world.OwnerId).then(user => {
                                if(user === undefined)
                                    return
                                viewWorld(world, user)
                                showTab(TabButtons.WorldsButton, Tabs.Worlds)
                            })
                        })
                        break
                }
                break
        }
    }
    let _url = new URL(window.location)
    let u = _url.protocol + "//" + _url.host + _url.pathname
    history.pushState({}, null, u);
}

webtools.checkLocalUserCache().then(r => {
    if(r !== undefined){
        let userdata = r.userdata
        let token = r.token
        renderPage(userdata, token)
    }
    else
        window.location = "index.html"
})

document.addEventListener("DOMContentLoaded", () => {
    webtools.setThemeOnPage(undefined, s => document.querySelectorAll("." + s))
    document.getElementById("set-dark-theme").addEventListener("click", () => webtools.setThemeOnPage(webtools.Themes.Dark, s => document.querySelectorAll("." + s)))
    document.getElementById("set-light-theme").addEventListener("click", () => webtools.setThemeOnPage(webtools.Themes.Light, s => document.querySelectorAll("." + s)))
    document.getElementById("set-pink-theme").addEventListener("click", () => webtools.setThemeOnPage(webtools.Themes.Pink, s => document.querySelectorAll("." + s)))
})