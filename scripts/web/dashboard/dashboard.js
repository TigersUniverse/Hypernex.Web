import * as webtools from '../../webtools.js'
import * as HypernexAPI from '../../HypernexAPI.js'

const FriendsList = document.getElementById("friends-list")
const FriendRequestsList = document.getElementById("friend-requests-list")
const ShowOfflineFriendsCheckbox = document.getElementById("friends-show-offline")

const Tabs = {
    Home: document.getElementById("home-tab"),
    Settings: document.getElementById("settings-tab")
}

const TabButtons = {
    HomeButton: document.getElementById("home-tab-button"),
    SettingsButton: document.getElementById("settings-tab-button")
}

const TabContents = {
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

const SHORTENED_TEXT_LIMIT = 35

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
    document.getElementById("hiusn").innerHTML = getRandomGreetingPhrase(userdata.Username)
    if(!userdata.isEmailVerified){
        createDashboardNotice(Notices.Info, "Email not Verified!", "Please verify your email! It will protect your account from loss and theft! You can navigate to the Settings panel to set this up.")
        TabContents.Settings.EmailVerificationButton.addEventListener("click", () => {
            if(!didSendEmailVerification){
                didSendEmailVerification = true
                HypernexAPI.Users.sendVerificationEmail(userdata.Id, token.content).then(r => {
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
    HomeFriendsListLeftButton.addEventListener("click", () => FriendsList.scrollLeft -= 400)
    HomeFriendsListRightButton.addEventListener("click", () => FriendsList.scrollLeft += 400)
    let f = sortOfflineFriends(userdata.Friends).TotalFriends
    for(let i = 0; i < f.length; i++){
        let friend = f[i]
        HypernexAPI.Users.getUserFromUserId(friend).then(user => {
            if(user !== undefined){
                createFriendCard(user)
            }
        })
    }
    toggleOfflineFriends(ShowOfflineFriendsCheckbox.checked)
    ShowOfflineFriendsCheckbox.addEventListener("click", () => toggleOfflineFriends(ShowOfflineFriendsCheckbox.checked))
    document.getElementById("friends-label").innerHTML = "Friends (" + f.length + ")"
    if(f.length <= 0){
        HomeFriendsListLeftButton.hidden = true
        HomeFriendsListRightButton.hidden = true
        ShowOfflineFriendsCheckbox.parentNode.hidden = true
    }
    HomeFriendRequestsListLeftButton.addEventListener("click", () => FriendRequestsList.scrollLeft -= 400)
    HomeFriendRequestsListRightButton.addEventListener("click", () => FriendRequestsList.scrollLeft += 400)
    let fr = userdata.FriendRequests
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
    setupTabButtonEvents()
    setupSettingsTab(userdata, token)
}

renderPage({
    Username: "TheLegend27",
    FriendRequests: [],
    Friends: [],
    isEmailVerified: true
}, {content: "1234"})

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
    for(let i = 0; i < FriendsList.children.length; i++){
        let childNode = FriendsList.children[i]
        if(childNode.id === ""){
            if(value)
                childNode.hidden = false
            else{
                let statusIcon = childNode.children[1].children[1]
                if(statusIcon.style.backgroundColor === "gray"){
                    console.log(childNode)
                    childNode.hidden = true
                }
            }
        }
    }
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

function getShortenedText(text){
    let t = ""
    let i = 0
    for(i = 0; i < text.length; i++){
        if(i < SHORTENED_TEXT_LIMIT)
            t += text[i]
    }
    if(i >= SHORTENED_TEXT_LIMIT)
        t += "..."
    return t
}

function createFriendCard(user){
    let t = document.getElementById("example-friend-card")
    let friendCard = t.cloneNode(true)
    let bannerImg = friendCard.children[0]
    let pfpImg = friendCard.children[1].children[0]
    let statusIcon = friendCard.children[1].children[1]
    let usernameText = friendCard.children[1].children[2]
    let statusText = friendCard.children[1].children[3]
    let bio = user.Bio
    if(bio.BannerURL === undefined || bio.BannerURL === "")
        bio.BannerURL = "media/defaultbanner.jpg"
    bannerImg.src = bio.BannerURL
    if(bio.PfpURL === undefined || bio.PfpURL === "")
        bio.PfpURL = "media/defaultpfp.jpg"
    pfpImg.src = bio.PfpURL
    switch (bio.Status) {
        case HypernexAPI.Users.Status.Online:
            statusIcon.style.backgroundColor = "rgb(44, 224, 44)"
            statusText.innerHTML = "Online"
            break
        case HypernexAPI.Users.Status.Absent:
            statusIcon.style.backgroundColor = "rgb(255,187,15)"
            statusText.innerHTML = "Absent"
            break
        case HypernexAPI.Users.Status.Party:
            statusIcon.style.backgroundColor = "rgb(41,185,255)"
            statusText.innerHTML = "Party"
            break
        case HypernexAPI.Users.Status.DoNotDisturb:
            statusIcon.style.backgroundColor = "rgb(224,44,44)"
            statusText.innerHTML = "Do Not Disturb"
            break
        default:
            statusIcon.style.backgroundColor = "gray"
            statusText.innerHTML = "Offline"
            break
    }
    if(bio.DisplayName !== undefined && bio.DisplayName !== "")
        usernameText.innerHTML = bio.DisplayName
    else
        usernameText.innerHTML = "@" + user.Username
    if(bio.StatusText !== undefined && bio.StatusText !== "" && bio.Status !== HypernexAPI.Users.Status.Offline)
        statusText.innerHTML = getShortenedText(bio.StatusText)
    friendCard.hidden = false
    friendCard.id = ""
    t.parentNode.appendChild(friendCard)
}

function createFriendRequestCard(user){
    let t = document.getElementById("example-friend-request-card")
    let friendCard = t.cloneNode(true)
    let bannerImg = friendCard.children[0]
    let pfpImg = friendCard.children[1].children[0]
    let statusIcon = friendCard.children[1].children[1]
    let usernameText = friendCard.children[1].children[2]
    let statusText = friendCard.children[1].children[3]
    let acceptButton = friendCard.children[2]
    let denyButton = friendCard.children[3]
    let bio = user.Bio
    if(bio.BannerURL === undefined || bio.BannerURL === "")
        bio.BannerURL = "media/defaultbanner.jpg"
    bannerImg.src = bio.BannerURL
    if(bio.PfpURL === undefined || bio.PfpURL === "")
        bio.PfpURL = "media/defaultpfp.jpg"
    pfpImg.src = bio.PfpURL
    switch (bio.Status) {
        case HypernexAPI.Users.Status.Online:
            statusIcon.style.backgroundColor = "rgb(44, 224, 44)"
            statusText.innerHTML = "Online"
            break
        case HypernexAPI.Users.Status.Absent:
            statusIcon.style.backgroundColor = "rgb(255,187,15)"
            statusText.innerHTML = "Absent"
            break
        case HypernexAPI.Users.Status.Party:
            statusIcon.style.backgroundColor = "rgb(41,185,255)"
            statusText.innerHTML = "Party"
            break
        case HypernexAPI.Users.Status.DoNotDisturb:
            statusIcon.style.backgroundColor = "rgb(224,44,44)"
            statusText.innerHTML = "Do Not Disturb"
            break
        default:
            statusIcon.style.backgroundColor = "gray"
            statusText.innerHTML = "Offline"
            break
    }
    if(bio.DisplayName !== undefined && bio.DisplayName !== "")
        usernameText.innerHTML = bio.DisplayName
    else
        usernameText.innerHTML = "@" + user.Username
    if(bio.StatusText !== undefined && bio.StatusText !== "" && bio.Status !== HypernexAPI.Users.Status.Offline)
        statusText.innerHTML = getShortenedText(bio.StatusText)
    friendCard.hidden = false
    friendCard.id = ""
    t.parentNode.appendChild(friendCard)
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
    TabButtons.SettingsButton.addEventListener("click", () => showTab(TabButtons.SettingsButton, Tabs.Settings))
}

function setupSettingsTab(userdata, token){
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
        TabContents.Settings.TwoFAWizardInput.hidden = true
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

/*
webtools.checkLocalUserCache().then(r => {
    if(r !== undefined){
        let userdata = r.userdata
        let token = r.token
    }
    else
        window.location = "index.html"
})
 */