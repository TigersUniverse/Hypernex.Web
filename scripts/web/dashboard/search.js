import * as HypernexAPI from '../../HypernexAPI.js'
import { getShortenedText, getTextFromStatus } from "./user.js";

const SearchInput = document.getElementById("search-term")
const SearchByDropdown = document.getElementById("search-by")
const SearchTypeDropdown = document.getElementById("search-type")
const SearchButton = document.getElementById("search-button")
const PreviousPageButton = document.getElementById("search-previous-button")
const NextPageButton = document.getElementById("search-next-button")
const SearchList = document.getElementById("search-list")

let page = 0
let lastSearchTerm
let viewUser
let viewWorld
let viewAvatar

let isSearching = false
let hasSearchedOnce = false

export default function main(localUser, token, vu, vw, va){
    viewUser = vu
    viewWorld = vw
    viewAvatar = va
    SearchButton.addEventListener("click", () => {
        if(isSearching)
            return
        for(let i = 1; i < SearchList.children.length; i++){
            let child = SearchList.children[i]
            child.remove()
        }
        handleSearch()
    })
    PreviousPageButton.addEventListener("click", () => {
        if(!hasSearchedOnce || isSearching)
            return
        page--
        if(page < 0) {
            page = 0
            return
        }
        handleSearch(lastSearchTerm)
    })
    NextPageButton.addEventListener("click", () => {
        if(!hasSearchedOnce || isSearching)
            return
        page++
        handleSearch(lastSearchTerm)
    })
}

function handleSearch(overrideInput){
    hasSearchedOnce = true
    isSearching = true
    let cCache = [];
    for(let i = 1; i < SearchList.children.length; i++){
        let child = SearchList.children[i]
        cCache.push(child)
    }
    for(let i in cCache) cCache[i].remove()
    let searchBy = SearchByDropdown.value
    let searchType = SearchTypeDropdown.value
    if(overrideInput !== undefined)
        SearchInput.value = overrideInput
    else
        page = 0
    switch (searchType) {
        case "user":
            HypernexAPI.Search.User(SearchInput.value, 50, page).then(searchCallback).catch(() => isSearching = false)
            break
        case "avatar":
            HypernexAPI.Search.Avatar(searchBy, SearchInput.value, 50, page).then(searchCallback).catch(() => isSearching = false)
            break
        case "world":
            HypernexAPI.Search.World(searchBy, SearchInput.value, 50, page).then(searchCallback).catch(() => isSearching = false)
            break
        default:
            isSearching = false
            break
    }
    lastSearchTerm = SearchInput.value
}

function searchCallback(candidates){
    for(let i = 0; i < candidates.length; i++){
        let id = candidates[i]
        let s = id.split('_')[0]
        switch (s.toLowerCase()){
            case "user":
                HypernexAPI.Users.getUserFromUserId(id).then(user => createUserSearchCard(user)).catch(() => {})
                break
            case "avatar":
                HypernexAPI.Avatars.Get(id).then(a => HypernexAPI.Users.getUserFromUserId(a.OwnerId).then(u => createAvatarSearchCard(a, u)).catch(() => {})).catch(() => {})
                break
            case "world":
                HypernexAPI.Worlds.Get(id).then(w => HypernexAPI.Users.getUserFromUserId(w.OwnerId).then(u => createWorldSearchCard(w, u)).catch(() => {})).catch(() => {})
                break
        }
    }
    isSearching = false
}

function createWorldSearchCard(world, creator){
    let t = document.getElementById("example-search-card")
    let searchCard = t.cloneNode(true)
    let bannerImg = searchCard.children[0]
    let worldNameText = searchCard.children[1]
    let worldCreatorText = searchCard.children[3]
    if(world.ThumbnailURL === undefined || world.ThumbnailURL === "")
        bannerImg.src = "media/defaultbanner.jpg"
    else
        bannerImg.src = world.ThumbnailURL
    worldNameText.innerHTML = world.Name
    let username
    if(creator.Bio.DisplayName !== undefined || creator.Bio.DisplayName !== "")
        username = creator.Bio.DisplayName + " (@" + creator.Username + ")"
    else
        username = creator.Username
    worldCreatorText.innerHTML = "Created By: " + username
    searchCard.hidden = false
    searchCard.id = ""
    searchCard.addEventListener("click", () => viewWorld(world, creator))
    t.parentNode.appendChild(searchCard)
    return searchCard
}

function createAvatarSearchCard(avatar, creator){
    let t = document.getElementById("example-search-card")
    let avatarCard = t.cloneNode(true)
    let bannerImg = avatarCard.children[0]
    let avatarNameText = avatarCard.children[1]
    let avatarCreatorText = avatarCard.children[3]
    if(avatar.ImageURL === undefined || avatar.ImageURL === "")
        bannerImg.src = "media/defaultbanner.jpg"
    else
        bannerImg.src = avatar.ImageURL
    avatarNameText.innerHTML = avatar.Name
    let username
    if(creator.Bio.DisplayName !== undefined || creator.Bio.DisplayName !== "")
        username = creator.Bio.DisplayName + " (@" + creator.Username + ")"
    else
        username = creator.Username
    avatarCreatorText.innerHTML = "Created By: " + username
    avatarCard.hidden = false
    avatarCard.id = ""
    avatarCard.addEventListener("click", () => viewAvatar(avatar, creator))
    t.parentNode.appendChild(avatarCard)
    return avatarCard
}

function createUserSearchCard(user){
    let t = document.getElementById("example-search-card")
    let friendCard = t.cloneNode(true)
    let bannerImg = friendCard.children[0]
    let usernameText = friendCard.children[1]
    let statusText = friendCard.children[3]
    let bio = user.Bio
    if(bio.BannerURL === undefined || bio.BannerURL === "")
        bio.BannerURL = "media/defaultbanner.jpg"
    bannerImg.src = bio.BannerURL
    statusText.innerHTML = getTextFromStatus(bio.Status)
    if(bio.DisplayName !== undefined && bio.DisplayName !== "")
        usernameText.innerHTML = bio.DisplayName
    else
        usernameText.innerHTML = "@" + user.Username
    if(bio.StatusText !== undefined && bio.StatusText !== "" && bio.Status !== HypernexAPI.Users.Status.Offline)
        statusText.innerHTML = getShortenedText(bio.StatusText)
    friendCard.hidden = false
    friendCard.id = ""
    friendCard.addEventListener("click", () => viewUser(user))
    t.parentNode.appendChild(friendCard)
    return friendCard
}