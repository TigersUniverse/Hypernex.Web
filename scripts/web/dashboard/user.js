export { viewProfile, getColorFromStatus, getTextFromStatus, getTextForPronouns, getShortenedText }

import * as HypernexAPI from '../../HypernexAPI.js'
import * as pronountools from '../../pronountools.js'

const ALLOWED_MEDIA_TYPES = ["jpg", "jpeg", "gif", "png", "mp4"]
const SHORTENED_TEXT_LIMIT = 35

let localUser
let localToken
let targetProfileUser
let editBio
let tabContents

let isSendingFriendRequestUserId = false
let isSendingFriendRequest = false
let isRemovingFriend = false
let isBlockingUser = false
let isUnblockingUser = false
let isFollowUser = false
let isUnfollowUser = false

let bioApplyButtonClicked = false
let uploadedBanner
let uploadedPfp

export default function main(lu, token, tabButton, TabContents){
    localUser = lu
    localToken = token
    tabContents = TabContents
    tabButton.addEventListener("click", () => {
        targetProfileUser = localUser
        viewSelectedProfile(TabContents)
    })
    targetProfileUser = localUser
    editBio = localUser.Bio
    registerProfileButtonEvents(TabContents)
    setupPronounEditor(TabContents)
    setupEditProfile(lu, TabContents)
    document.getElementById("permalink-profile").addEventListener("click", () => {
        let _url = new URL(window.location)
        let u = _url.protocol + "//" + _url.host + "/dashboard?id=" + targetProfileUser.Id
        navigator.clipboard.writeText(u)
    })
}

const viewProfile = function (user){
    targetProfileUser = user
    viewSelectedProfile(tabContents)
}

const getColorFromStatus = function (status){
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

const getTextFromStatus = function (status){
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

const getShortenedText = function (text){
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

const getTextForPronouns = function (pronouns){
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

function viewSelectedProfile(TabContents) {
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

function registerProfileButtonEvents(TabContents){
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

function setupPronounEditor(TabContents){
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

function getValueOfRadioName(name, d){
    try{
        return document.querySelector("input[type='radio'][name=" +name +"]:checked").value
    }
    catch (e) {
        return d
    }
}

function setupEditProfile(localUser, TabContents){
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