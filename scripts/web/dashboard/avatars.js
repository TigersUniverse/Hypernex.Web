export { viewAvatar }
import * as HypernexAPI from '../../HypernexAPI.js'

const PopularResultsPerPage = 3

const AvatarsHome = document.getElementById("avatars-home")
const AvatarsView = document.getElementById("avatars-view")

const MyAvatarsList = document.getElementById("my-avatars-list")
const MyAvatarsListLeftButton = document.getElementById("my-avatars-nav-left")
const MyAvatarsListRightButton = document.getElementById("my-avatars-nav-right")
const PopularAvatarsList = document.getElementById("popular-avatars-list")
const PopularAvatarsListLeftButton = document.getElementById("popular-avatars-nav-left")
const PopularAvatarsListRightButton = document.getElementById("popular-avatars-nav-right")
const PopularityTypeDropdown = document.getElementById("avatar-popularity-type")

const AvatarBanner = document.getElementById("avatar-banner")
const AvatarName = document.getElementById("avatar-name")
const AvatarDescription = document.getElementById("avatar-description")
const AvatarCreator = document.getElementById("avatar-creator")
const EquipAvatarButton = document.getElementById("equip-avatar")
const DeleteAvatar = document.getElementById("delete-avatar")

let localId
let targetAvatar
let targetCreator
let isDeleting = false

let currentPopularityPage = 0
let workingPopularity = 0

export default function main(localUser, token, tabButton) {
    localId = localUser.Id
    tabButton.addEventListener("click", () => {
        AvatarsView.hidden = true
        AvatarsHome.hidden = false
    })
    if(localUser.Avatars.length <= 0){
        MyAvatarsListLeftButton.hidden = true
        MyAvatarsListRightButton.hidden = true
    }
    else {
        MyAvatarsListLeftButton.addEventListener("click", () => MyAvatarsList.scrollLeft -= 400)
        MyAvatarsListRightButton.addEventListener("click", () => MyAvatarsList.scrollLeft += 400)
    }
    for (let i = 0; i < localUser.Avatars.length; i++){
        let avatarId = localUser.Avatars[i]
        HypernexAPI.Avatars.Get(avatarId).then(avatarMeta => {
            if(avatarMeta === undefined)
                return
            createAvatarCard(avatarMeta, localUser)
        }).catch(_ => {})
    }
    EquipAvatarButton.addEventListener("click", () => window.location = "hypernex://" + targetAvatar.Id)
    DeleteAvatar.addEventListener("click", () => {
        if(isDeleting || targetAvatar.OwnerId !== localUser.Id)
            return
        isDeleting = true
        HypernexAPI.Avatars.Delete(localUser.Id, token.content, targetAvatar.Id).then(() => {
            window.sendSweetAlert({
                icon: 'success',
                title: "Deleted Avatar!"
            }).then(() => {
                isDeleting = false
                window.location.reload()
            })
        }).catch(() => {
            window.sendSweetAlert({
                icon: 'error',
                title: "Failed to Delete Avatar!"
            })
            isDeleting = false
        })
    })
    PopularAvatarsListLeftButton.addEventListener("click", () => {
        if(workingPopularity < PopularResultsPerPage)
            return
        currentPopularityPage--
        if(currentPopularityPage < 0)
            currentPopularityPage = 0
        handlePageChange()
    })
    PopularAvatarsListRightButton.addEventListener("click", () => {
        if(workingPopularity < PopularResultsPerPage)
            return
        currentPopularityPage++
        handlePageChange()
    })
    PopularityTypeDropdown.addEventListener("change", () => {
        if(workingPopularity < PopularResultsPerPage)
            return
        handlePageChange()
    })
    handlePageChange()
    document.getElementById("permalink-avatar").addEventListener("click", () => {
        let _url = new URL(window.location)
        let u = _url.protocol + "//" + _url.host + "/dashboard?id=" + targetAvatar.Id
        navigator.clipboard.writeText(u)
    })
    return this
}

const viewAvatar = function (avatar, creator) {
    targetAvatar = avatar
    targetCreator = creator
    viewSelectedAvatar()
}

function viewSelectedAvatar(){
    AvatarsHome.hidden = true
    AvatarName.innerHTML = targetAvatar.Name
    AvatarDescription.innerHTML = targetAvatar.Description
    if(targetAvatar.ImageURL === undefined || targetAvatar.ImageURL === "")
        AvatarBanner.src = "media/defaultbanner.jpg"
    else
        AvatarBanner.src = targetAvatar.ImageURL
    let username
    if(targetCreator.Bio.DisplayName !== undefined)
        username = targetCreator.Bio.DisplayName + " (@" + targetCreator.Username + ")"
    else
        username = targetCreator.Username
    AvatarCreator.innerHTML = "Created By: " + username
    DeleteAvatar.hidden = targetCreator.Id !== localId
    AvatarsView.hidden = false
}

function createAvatarCard(avatar, creator, overrideNode){
    let t = document.getElementById("example-avatar-card")
    let avatarCard = t.cloneNode(true)
    let bannerImg = avatarCard.children[0]
    let avatarNameText = avatarCard.children[1].children[0].children[0]
    let avatarCreatorText = avatarCard.children[1].children[1]
    if(avatar.ImageURL !== undefined && avatar.ImageURL !== "")
        bannerImg.src = avatar.ImageURL
    avatarNameText.innerHTML = avatar.Name
    let username
    if(creator.Bio.DisplayName !== undefined)
        username = creator.Bio.DisplayName + " (@" + creator.Username + ")"
    else
        username = creator.Username
    avatarCreatorText.innerHTML = "Created By: " + username
    avatarCard.hidden = false
    avatarCard.id = ""
    avatarCard.addEventListener("click", () => {
        targetAvatar = avatar
        targetCreator = creator
        viewSelectedAvatar()
    })
    if(overrideNode === undefined)
        t.parentNode.appendChild(avatarCard)
    else
        overrideNode.appendChild(avatarCard)
    return avatarCard
}

function popularityPromise(popularityObject){
    return new Promise((exec, reject) => {
        HypernexAPI.Avatars.Get(popularityObject.Id).then(ar => {
            if(ar === undefined) {
                reject()
                return
            }
            HypernexAPI.Users.getUserFromUserId(ar.OwnerId).then(ur => {
                if(ur === undefined) {
                    reject()
                    return
                }
                createAvatarCard(ar, ur, PopularAvatarsList)
                exec()
            }).catch(err => reject(err))
        }).catch(err => reject(err))
    })
}

function handlePageChange(){
    let cCache = [];
    for(let i = 1; i < PopularAvatarsList.children.length; i++){
        let child = PopularAvatarsList.children[i]
        cCache.push(child)
    }
    for(let i in cCache) cCache[i].remove()
    HypernexAPI.Popularity.GetAvatars(HypernexAPI.Popularity.PopularityType[PopularityTypeDropdown.value], PopularResultsPerPage, currentPopularityPage).then(async r => {
        if (r === undefined || !r) {
            workingPopularity = PopularResultsPerPage
            return
        }
        for (let i = 0; i < r.Popularity.length; i++) {
            await popularityPromise(r.Popularity[i]).catch(() => {});
            workingPopularity++
        }
    }).catch(() => workingPopularity = PopularResultsPerPage)
}