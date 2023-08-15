import * as HypernexAPI from '../../HypernexAPI.js'
import * as pronountools from '../../pronountools.js'
import * as webtools from '../../webtools.js'

let localUser
let localToken

let targetProfileUser

let editBio

const ALLOWED_MEDIA_TYPES = ["jpg", "jpeg", "gif", "png", "mp4"]

const FriendsList = document.getElementById("friends-list")
const FriendRequestsList = document.getElementById("friend-requests-list")
const ShowOfflineFriendsCheckbox = document.getElementById("friends-show-offline")

const Tabs = {
    Home: document.getElementById("home-tab"),
    Profile: document.getElementById("profile-tab"),
    Settings: document.getElementById("settings-tab")
}

const TabButtons = {
    HomeButton: document.getElementById("home-tab-button"),
    ProfileButton: document.getElementById("profile-tab-button"),
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

const SHORTENED_TEXT_LIMIT = 35

const Notices = {
    Info: 0,
    Warning: 1,
    Error: 2
}

let isSendingFriendRequestUserId = false
let isViewingProfile = false

let didSendEmailVerification = false
let didChangeEmail = false
let didResetPassword = false
let isEnabling2FA = false
let isRemoving2FA = false

let qrcode

let isSendingFriendRequest = false
let isRemovingFriend = false
let isBlockingUser = false
let isUnblockingUser = false
let isFollowUser = false
let isUnfollowUser = false

let bioApplyButtonClicked = false
let uploadedBanner
let uploadedPfp

function renderPage(userdata, token){
    localUser = userdata
    localToken = token
    targetProfileUser = localUser
    editBio = userdata.Bio
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
    setupTabButtonEvents()
    setupDownloads()
    setupFriends()
    registerProfileButtonEvents()
    setupPronounEditor()
    setupEditProfile()
    setupSettingsTab(userdata, token)
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
                    console.log(childNode)
                    childNode.hidden = true
                    hiddenCount++
                }
            }
        }
    }
    let h = fCount - 1 === hiddenCount
    console.log(fCount - 1 + " " + hiddenCount)
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
    TabButtons.ProfileButton.addEventListener("click", () => {
        targetProfileUser = localUser
        viewSelectedProfile()
        showTab(TabButtons.ProfileButton, Tabs.Profile)
    })
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
    document.getElementById("view-profile").addEventListener("click", () => {
        if(!isViewingProfile){
            isViewingProfile = true
            HypernexAPI.Users.getUserFromUsername(document.getElementById("profile-to-view").value).then(user => {
                if(user){
                    targetProfileUser = user
                    viewSelectedProfile()
                    showTab(TabButtons.ProfileButton, Tabs.Profile)
                }
                else {
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Find User!"
                    })
                    isViewingProfile = false
                }
            }).catch(err => {
                console.log(err)
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Find User!"
                })
                isViewingProfile = false
            })
        }
    })
}

function renderProfile(user){
    let bio = user.Bio
    let profileTab = document.getElementById("profile-tab")
    let banner = profileTab.children[0].children[0]
    let pfp = profileTab.children[0].children[1]
    let statusIcon = profileTab.children[0].children[2]
    let username = profileTab.children[1].children[0]
    let username2 = profileTab.children[1].children[1]
    let pronounCard = profileTab.children[1].children[2]
    let status = profileTab.children[2]
    let description = profileTab.children[3]
    if(bio.BannerURL !== undefined && bio.BannerURL !== "")
        banner.src = bio.BannerURL
    else
        banner.src = "media/defaultbanner.jpg"
    if(bio.PfpURL !== undefined && bio.PfpURL !== "")
        pfp.src = bio.PfpURL
    else
        pfp.src = "media/defaultpfp.jpg"
    statusIcon.style.backgroundColor = getColorFromStatus(bio.Status)
    if(bio.DisplayName !== undefined && bio.DisplayName !== ""){
        username.innerHTML = bio.DisplayName
        username2.innerHTML = "@" + user.Username
        username2.hidden = false
    }
    else{
        username.innerHTML = "@" + user.Username
        username2.hidden = true
    }
    if(bio.Pronouns !== undefined){
        pronounCard.innerHTML = getTextForPronouns(bio.Pronouns)
        pronounCard.hidden = false
    }
    else
        pronounCard.hidden = true
    if(bio.StatusText !== undefined && bio.StatusText !== "")
        status.innerHTML = bio.StatusText
    else
        status.innerHTML = getTextFromStatus(bio.Status)
    description.innerHTML = bio.Description
}

function viewSelectedProfile() {
    if (targetProfileUser === undefined)
        targetProfileUser = localUser
    let isLocalUser = targetProfileUser.Id === localUser.Id
    TabContents.Profile.EditProfile.hidden = !isLocalUser
    if (isLocalUser) {
        TabContents.Profile.AddFriendButton.hidden = true
        TabContents.Profile.RemoveFriendButton.hidden = true
        TabContents.Profile.BlockButton.hidden = true
        TabContents.Profile.UnblockButton.hidden = true
        TabContents.Profile.FollowButton.hidden = true
        TabContents.Profile.UnfollowButton.hidden = true
    } else {
        let isFriends = localUser.Friends.includes(targetProfileUser.Id)
        let sentFriendRequest = localUser.OutgoingFriendRequests.includes(targetProfileUser.Id)
        let isBlocked = localUser.BlockedUsers.includes(targetProfileUser.Id)
        let isFollowing = localUser.Following.includes(targetProfileUser.Id)
        TabContents.Profile.AddFriendButton.hidden = isFriends || sentFriendRequest
        TabContents.Profile.RemoveFriendButton.hidden = !isFriends
        TabContents.Profile.BlockButton.hidden = isBlocked
        TabContents.Profile.UnblockButton.hidden = !isBlocked
        TabContents.Profile.FollowButton.hidden = isFollowing
        TabContents.Profile.UnfollowButton.hidden = !isFollowing
    }
    if (isLocalUser)
        renderProfile(localUser)
    else {
        renderProfile(targetProfileUser)
    }
    isSendingFriendRequest = false
    isRemovingFriend = false
    isBlockingUser = false
    isUnblockingUser = false
    isFollowUser = false
    isUnfollowUser = false
}

function registerProfileButtonEvents(){
    TabContents.Profile.AddFriendButton.addEventListener("click", () => {
        if(!isSendingFriendRequest){
            isSendingFriendRequest = true
            HypernexAPI.Users.sendFriendRequest(localUser.Id, localToken.content, targetProfileUser.Id).then(r => {
                if(r){
                    TabContents.Profile.AddFriendButton.hidden = true
                    TabContents.Profile.RemoveFriendButton.hidden = false
                    isRemovingFriend = false
                }
                else{
                    isSendingFriendRequest = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Send Friend Request!"
                    })
                }
            }).catch(err => {
                isSendingFriendRequest = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Send Friend Request!"
                })
                console.log(err)
            })
        }
    })
    TabContents.Profile.RemoveFriendButton.addEventListener("click", () => {
        if(!isRemovingFriend){
            isRemovingFriend = true
            HypernexAPI.Users.removeFriend(localUser.Id, localToken.content, targetProfileUser.Id).then(r => {
                if(r){
                    TabContents.Profile.RemoveFriendButton.hidden = true
                    TabContents.Profile.AddFriendButton.hidden = false
                    isSendingFriendRequest = false
                }
                else{
                    isRemovingFriend = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Remove Friend!"
                    })
                }
            }).catch(err => {
                isRemovingFriend = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Remove Friend!"
                })
                console.log(err)
            })
        }
    })
    TabContents.Profile.BlockButton.addEventListener("click", () => {
        if(!isBlockingUser){
            isBlockingUser = true
            HypernexAPI.Users.blockUser(localUser.Id, localToken.content, targetProfileUser.Id).then(r => {
                if(r){
                    TabContents.Profile.BlockButton.hidden = true
                    TabContents.Profile.UnblockButton.hidden = true
                    isUnblockingUser = false
                }
                else{
                    isBlockingUser = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Block User!"
                    })
                }
            }).catch(err => {
                isBlockingUser = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Block User!"
                })
                console.log(err)
            })
        }
    })
    TabContents.Profile.UnblockButton.addEventListener("click", () => {
        if(!isUnblockingUser){
            isUnblockingUser = true
            HypernexAPI.Users.unblockUser(localUser.Id, localToken.content, targetProfileUser.Id).then(r => {
                if(r){
                    TabContents.Profile.UnblockButton.hidden = true
                    TabContents.Profile.BlockButton.hidden = false
                    isBlockingUser = false
                }
                else{
                    isUnblockingUser = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Unblock User!"
                    })
                }
            }).catch(err => {
                isUnblockingUser = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Unblock User!"
                })
                console.log(err)
            })
        }
    })
    TabContents.Profile.FollowButton.addEventListener("click", () => {
        if(!isFollowUser){
            isFollowUser = true
            HypernexAPI.Users.followUser(localUser.Id, localToken.content, targetProfileUser.Id).then(r => {
                if(r){
                    TabContents.Profile.FollowButton.hidden = true
                    TabContents.Profile.UnfollowButton.hidden = false
                    isUnfollowUser = false
                }
                else{
                    isFollowUser = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Block User!"
                    })
                }
            }).catch(err => {
                isFollowUser = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Block User!"
                })
                console.log(err)
            })
        }
    })
    TabContents.Profile.UnfollowButton.addEventListener("click", () => {
        if(!isUnfollowUser){
            isUnfollowUser = true
            HypernexAPI.Users.unfollowUser(localUser.Id, localToken.content, targetProfileUser.Id).then(r => {
                if(r){
                    TabContents.Profile.UnfollowButton.hidden = true
                    TabContents.Profile.FollowButton.hidden = false
                    isFollowUser = false
                }
                else{
                    isUnfollowUser = false
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to Unblock User!"
                    })
                }
            }).catch(err => {
                isUnfollowUser = false
                window.sendSweetAlert({
                    icon: 'error',
                    title: "Failed to Unblock User!"
                })
                console.log(err)
            })
        }
    })
}

function getValueOfRadioName(name, d){
    try{
        return document.querySelector("input[type='radio'][name=" +name +"]:checked").value
    }
    catch (e) {
        return d
    }
}

function setupPronounEditor(){
    TabContents.Profile.EditPronounsCardContent.children[0].addEventListener("click", () => TabContents.Profile.EditPronounsCardContent.parentNode.hidden = true)
    let applyButton = TabContents.Profile.EditPronounsCardContent.children[82]
    applyButton.addEventListener("click", () => {
        let selectedNominative = Number(getValueOfRadioName("nominative", "-1"))
        let selectedAccusative = Number(getValueOfRadioName("accusative", "-1"))
        let selectedReflexive = Number(getValueOfRadioName("reflexive", "-1"))
        let selectedIndependent = Number(getValueOfRadioName("independent", "-1"))
        let selectedDependent = Number(getValueOfRadioName("dependent", "-1"))
        let displayThree = TabContents.Profile.EditPronounsCardContent.children[80].children[0].checked
        editBio.Pronouns = {
            nominativeId: selectedNominative,
            accusativeId: selectedAccusative,
            reflexiveId: selectedReflexive,
            independentId: selectedIndependent,
            dependentId: selectedDependent,
            DisplayThree: displayThree
        }
        TabContents.Profile.EditPronounsCardContent.parentNode.hidden = true
    })
}

function validMediaFile(filename){
    let arr = filename.split('.')
    let type = arr[arr.length - 1].toLowerCase()
    return ALLOWED_MEDIA_TYPES.indexOf(type) >= 0
}

function getStatusFromRadios(invisibleRadio, onlineRadio, absentRadio, partyRadio, dndRadio){
    if(invisibleRadio.checked)
        return HypernexAPI.Users.Status.Offline
    if(onlineRadio.checked)
        return HypernexAPI.Users.Status.Online
    if(absentRadio.checked)
        return HypernexAPI.Users.Status.Absent
    if(partyRadio.checked)
        return HypernexAPI.Users.Status.Party
    if(dndRadio.checked)
        return HypernexAPI.Users.Status.DoNotDisturb
    return HypernexAPI.Users.Status.Online
}

function setupEditProfile(){
    TabContents.Profile.EditProfileCardContent.children[0].addEventListener("click", () => {
        TabContents.Profile.EditProfileCardContent.parentNode.hidden = true
        bioApplyButtonClicked = false
    })
    let bannerPreview = TabContents.Profile.EditProfileCardContent.children[4]
    let bannerInput = TabContents.Profile.EditProfileCardContent.children[5].children[0]
    let pfpPreview = TabContents.Profile.EditProfileCardContent.children[9]
    let pfpInput = TabContents.Profile.EditProfileCardContent.children[10].children[0]
    let displaynameInput = TabContents.Profile.EditProfileCardContent.children[14].children[0]
    let invisibleRadio = TabContents.Profile.EditProfileCardContent.children[18].children[0]
    let onlineRadio = TabContents.Profile.EditProfileCardContent.children[19].children[0]
    let absentRadio = TabContents.Profile.EditProfileCardContent.children[20].children[0]
    let partyRadio = TabContents.Profile.EditProfileCardContent.children[21].children[0]
    let dndRadio = TabContents.Profile.EditProfileCardContent.children[22].children[0]
    let statustextInput = TabContents.Profile.EditProfileCardContent.children[26].children[0]
    let setpronounButton = TabContents.Profile.EditProfileCardContent.children[28]
    let removepronounButton = TabContents.Profile.EditProfileCardContent.children[29]
    let descriptionInput = TabContents.Profile.EditProfileCardContent.children[33].children[0]
    let applyButton = TabContents.Profile.EditProfileCardContent.children[35]
    TabContents.Profile.EditProfile.addEventListener("click", () => {
        editBio = localUser.Bio
        displaynameInput.value = editBio.DisplayName
        statustextInput.value = editBio.StatusText
        descriptionInput.value = editBio.Description
        editBio.Pronouns = undefined
        TabContents.Profile.EditProfileCardContent.parentNode.hidden = false
    })
    if(editBio.PfpURL !== undefined && editBio.PfpURL !== "")
        pfpPreview.src = editBio.PfpURL
    if(editBio.BannerURL !== undefined && editBio.BannerURL !== "")
        bannerPreview.src = editBio.BannerURL
    bannerInput.onchange = e => {
        let file = e.target.files[0]
        uploadedBanner = e.target.files[0]
        if(validMediaFile(file.name)){
            let r = new FileReader()
            r.readAsDataURL(file)
            r.onload = readerEvent => bannerPreview.src = readerEvent.target.result
        }
        else{
            uploadedBanner = undefined
            bannerInput.value = ""
            bannerPreview.src = "media/defaultbanner.jpg"
            window.sendSweetAlert({
                icon: 'error',
                title: "Invalid File Type!"
            })
        }
    }
    pfpInput.onchange = e => {
        let file = e.target.files[0]
        uploadedPfp = e.target.files[0]
        if(validMediaFile(file.name)){
            let r = new FileReader()
            r.readAsDataURL(file)
            r.onload = readerEvent => pfpPreview.src = readerEvent.target.result
        }
        else{
            uploadedPfp = undefined
            pfpInput.value = ""
            pfpPreview.src = "media/defaultpfp.jpg"
            window.sendSweetAlert({
                icon: 'error',
                title: "Invalid File Type!"
            })
        }
    }
    setpronounButton.addEventListener("click", () => TabContents.Profile.EditPronounsCardContent.parentNode.hidden = false)
    removepronounButton.addEventListener("click", () => editBio.Pronouns = "remove")
    applyButton.addEventListener("click", () => {
        if(!bioApplyButtonClicked){
            bioApplyButtonClicked = true
            let status = getStatusFromRadios(invisibleRadio, onlineRadio, absentRadio, partyRadio, dndRadio)
            if(uploadedBanner !== undefined && uploadedPfp !== undefined){
                //banner
                HypernexAPI.File.Upload(localUser.Id, localToken.content, uploadedBanner).then(b => {
                    if(b){
                        editBio.BannerURL = HypernexAPI.getAPIEndpoint() + "file/" + b.UserId + "/" + b.FileId
                        HypernexAPI.File.Upload(localUser.Id, localToken.content, uploadedPfp).then(p => {
                            if(p){
                                editBio.PfpURL = HypernexAPI.getAPIEndpoint() + "file/" + p.UserId + "/" + p.FileId
                                applyNoPromisesToEditBio(displaynameInput.value, status, statustextInput.value, descriptionInput.value, editBio.Pronouns)
                            }else{
                                window.sendSweetAlert({
                                    icon: 'error',
                                    title: "Failed to upload banner"
                                })
                                bioApplyButtonClicked = false
                            }
                        }).catch(err => {
                            window.sendSweetAlert({
                                icon: 'error',
                                title: "Failed to upload banner"
                            })
                            bioApplyButtonClicked = false
                            console.log(err)
                        })
                    }
                }).catch(err => {
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to upload banner"
                    })
                    bioApplyButtonClicked = false
                    console.log(err)
                })
            }
            else if(uploadedBanner !== undefined){
                HypernexAPI.File.Upload(localUser.Id, localToken.content, uploadedBanner).then(b => {
                    console.log(b)
                    if(b){
                        editBio.BannerURL = HypernexAPI.getAPIEndpoint() + "file/" + b.UserId + "/" + b.FileId
                        applyNoPromisesToEditBio(displaynameInput.value, status, statustextInput.value, descriptionInput.value, editBio.Pronouns)
                    }
                    else{
                        window.sendSweetAlert({
                            icon: 'error',
                            title: "Failed to upload banner"
                        })
                        bioApplyButtonClicked = false
                    }
                }).catch(err => {
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to upload banner"
                    })
                    bioApplyButtonClicked = false
                    console.log(err)
                })
            }
            else if(uploadedPfp !== undefined){
                HypernexAPI.File.Upload(localUser.Id, localToken.content, uploadedPfp).then(p => {
                    if(p){
                        editBio.PfpURL = HypernexAPI.getAPIEndpoint() + "file/" + p.UserId + "/" + p.FileId
                        applyNoPromisesToEditBio(displaynameInput.value, status, statustextInput.value, descriptionInput.value, editBio.Pronouns)
                    }
                    else{
                        window.sendSweetAlert({
                            icon: 'error',
                            title: "Failed to upload banner"
                        })
                        bioApplyButtonClicked = false
                    }
                }).catch(err => {
                    window.sendSweetAlert({
                        icon: 'error',
                        title: "Failed to upload banner"
                    })
                    bioApplyButtonClicked = false
                    console.log(err)
                })
            }
            else
                applyNoPromisesToEditBio(displaynameInput.value, status, statustextInput.value, descriptionInput.value, editBio.Pronouns)
        }
    })
}

function applyNoPromisesToEditBio(displayname, status, statustext, description, pronouns){
    editBio.DisplayName = displayname
    editBio.Status = status
    editBio.StatusText = statustext
    editBio.Description = description
    editBio.Pronouns = pronouns
    HypernexAPI.Users.updateBio(localUser.Id, localToken.content, editBio).then(r => {
        if(r){
            window.sendSweetAlert({
                icon: 'success',
                title: "Updated Bio!"
            }).then(() => window.location.reload())
        }
        else{
            window.sendSweetAlert({
                icon: 'error',
                title: "Failed to Update Bio!"
            })
        }
    }).catch(err => {
        console.log(err)
        window.sendSweetAlert({
            icon: 'error',
            title: "Failed to Update Bio!"
        })
    })
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

function getColorFromStatus(status){
    switch (status) {
        case HypernexAPI.Users.Status.Online:
            return "rgb(44, 224, 44)"
        case HypernexAPI.Users.Status.Absent:
            return "rgb(255,187,15)"
        case HypernexAPI.Users.Status.Party:
            return "rgb(41,185,255)"
        case HypernexAPI.Users.Status.DoNotDisturb:
            return "rgb(224,44,44)"
        default:
            return "gray"
    }
}

function getTextFromStatus(status){
    switch (status) {
        case HypernexAPI.Users.Status.Online:
            return "Online"
        case HypernexAPI.Users.Status.Absent:
            return "Absent"
        case HypernexAPI.Users.Status.Party:
            return "Party"
        case HypernexAPI.Users.Status.DoNotDisturb:
            return "Do Not Disturb"
        default:
            return "Offline"
    }
}

function getTextForPronouns(pronouns){
    let text = ""
    for(let i = 0; i < pronouns.Display.length; i++){
        if(!pronouns.DisplayThree && i === 2){
            break
        }
        let c = pronouns.Display[i]
        let p
        switch (pronountools.getCaseById(c)) {
            case pronountools.Cases.NominativeCase:
                p = pronouns.NominativeCase
                break
            case pronountools.Cases.AccusativeCase:
                p = pronouns.AccusativeCase
                break
            case pronountools.Cases.ReflexivePronoun:
                p = pronouns.ReflexivePronoun
                break
            case pronountools.Cases.IndependentGenitiveCase:
                p = pronouns.IndependentGenitiveCase
                break
            case pronountools.Cases.DependentGenitiveCase:
                p = pronouns.DependentGenitiveCase
                break
        }
        text += p + "/"
    }
    text = text.substring(text.length - 1, 0)
    return text
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
        targetProfileUser = user
        viewSelectedProfile()
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