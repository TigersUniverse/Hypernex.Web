export { viewWorld }
import * as HypernexAPI from '../../HypernexAPI.js'

const PopularResultsPerPage = 3

const WorldsHome = document.getElementById("worlds-home")
const WorldsView = document.getElementById("worlds-view")

const MyWorldsList = document.getElementById("my-worlds-list")
const MyWorldsListLeftButton = document.getElementById("my-worlds-nav-left")
const MyWorldsListRightButton = document.getElementById("my-worlds-nav-right")
const PopularWorldsList = document.getElementById("popular-worlds-list")
const PopularWorldsListLeftButton = document.getElementById("popular-worlds-nav-left")
const PopularWorldsListRightButton = document.getElementById("popular-worlds-nav-right")
const PopularityTypeDropdown = document.getElementById("world-popularity-type")

const WorldBanner = document.getElementById("world-banner")
const LeftWorldIcon = document.getElementById("left-world-icon")
const RightWorldIcon = document.getElementById("right-world-icon")
const WorldName = document.getElementById("world-name")
const WorldDescription = document.getElementById("world-description")
const WorldCreator = document.getElementById("world-creator")
const CreateInstanceButton = document.getElementById("create-instance")
const DeleteWorld = document.getElementById("delete-world")

let localId
let targetWorld
let targetCreator
let lastIconIndex = 0
let isDeleting = false

let currentPopularityPage = 0
let workingPopularity = 0

export default function main(localUser, token, tabButton) {
    localId = localUser.Id
    tabButton.addEventListener("click", () => {
        WorldsView.hidden = true
        WorldsHome.hidden = false
    })
    if(localUser.Worlds.length <= 0){
        MyWorldsListLeftButton.hidden = true
        MyWorldsListRightButton.hidden = true
    }
    else {
        MyWorldsListLeftButton.addEventListener("click", () => MyWorldsList.scrollLeft -= 400)
        MyWorldsListRightButton.addEventListener("click", () => MyWorldsList.scrollLeft += 400)
    }
    for (let i = 0; i < localUser.Worlds.length; i++){
        let worldId = localUser.Worlds[i]
        HypernexAPI.Worlds.Get(worldId).then(worldMeta => {
            if(worldMeta === undefined)
                return
            createWorldCard(worldMeta, localUser)
        }).catch(_ => {})
    }
    LeftWorldIcon.addEventListener("click", () => {
        if(targetWorld === undefined || targetWorld.IconURLs === undefined || targetWorld.IconURLs.length <= 0)
            return
        lastIconIndex--
        if(lastIconIndex < 0)
            lastIconIndex = targetWorld.IconURLs.length - 1
        refreshIconUrl()
    })
    RightWorldIcon.addEventListener("click", () => {
        if(targetWorld === undefined || targetWorld.IconURLs === undefined || targetWorld.IconURLs.length <= 0)
            return
        lastIconIndex++
        if(lastIconIndex >= targetWorld.IconURLs.length)
            lastIconIndex = 0
        refreshIconUrl()
    })
    CreateInstanceButton.addEventListener("click", () => window.location = "hypernex://" + targetWorld.Id)
    DeleteWorld.addEventListener("click", () => {
        if(isDeleting || targetWorld.OwnerId !== localUser.Id)
            return
        isDeleting = true
        HypernexAPI.Worlds.Delete(localUser.Id, token.content, targetWorld.Id).then(() => {
            window.sendSweetAlert({
                icon: 'success',
                title: "Deleted World!"
            }).then(() => {
                isDeleting = false
                window.location.reload()
            })
        }).catch(() => {
            window.sendSweetAlert({
                icon: 'error',
                title: "Failed to Delete World!"
            })
            isDeleting = false
        })
    })
    PopularWorldsListLeftButton.addEventListener("click", () => {
        if(workingPopularity < PopularResultsPerPage)
            return
        currentPopularityPage--
        if(currentPopularityPage < 0)
            currentPopularityPage = 0
        handlePageChange()
    })
    PopularWorldsListRightButton.addEventListener("click", () => {
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
    document.getElementById("permalink-world").addEventListener("click", () => {
        let _url = new URL(window.location)
        let u = _url.protocol + "//" + _url.host + "/dashboard?id=" + targetWorld.Id
        navigator.clipboard.writeText(u)
    })
    return this
}

const viewWorld = function (world, creator) {
    targetWorld = world
    targetCreator = creator
    viewSelectedWorld()
}

function viewSelectedWorld(){
    lastIconIndex = 0
    WorldsHome.hidden = true
    WorldName.innerHTML = targetWorld.Name
    WorldDescription.innerHTML = targetWorld.Description
    if(targetWorld.IconURLs === undefined || targetWorld.IconURLs.length <= 0){
        if(targetWorld.ThumbnailURL === undefined || targetWorld.ThumbnailURL === "")
            WorldBanner.src = "media/defaultbanner.jpg"
        else
            WorldBanner.src = targetWorld.ThumbnailURL
    }
    else
        refreshIconUrl()
    let username
    if(targetCreator.Bio.DisplayName !== undefined)
        username = targetCreator.Bio.DisplayName + " (@" + targetCreator.Username + ")"
    else
        username = targetCreator.Username
    WorldCreator.innerHTML = "Created By: " + username
    DeleteWorld.hidden = targetCreator.Id !== localId
    WorldsView.hidden = false
}

function refreshIconUrl(){
    let iconUrl = targetWorld.IconURLs[lastIconIndex]
    if(iconUrl === undefined)
        return
    WorldBanner.src = iconUrl
}

function createWorldCard(world, creator, overrideNode){
    let t = document.getElementById("example-world-card")
    let worldCard = t.cloneNode(true)
    let bannerImg = worldCard.children[0]
    let worldNameText = worldCard.children[1].children[0].children[0]
    let worldCreatorText = worldCard.children[1].children[1]
    if(world.ThumbnailURL !== undefined && world.ThumbnailURL !== "")
        bannerImg.src = world.ThumbnailURL
    worldNameText.innerHTML = world.Name
    let username
    if(creator.Bio.DisplayName !== undefined)
        username = creator.Bio.DisplayName + " (@" + creator.Username + ")"
    else
        username = creator.Username
    worldCreatorText.innerHTML = "Created By: " + username
    worldCard.hidden = false
    worldCard.id = ""
    worldCard.addEventListener("click", () => {
        targetWorld = world
        targetCreator = creator
        viewSelectedWorld()
    })
    if(overrideNode === undefined)
        t.parentNode.appendChild(worldCard)
    else
        overrideNode.appendChild(worldCard)
    return worldCard
}

function popularityPromise(popularityObject){
    return new Promise((exec, reject) => {
        HypernexAPI.Worlds.Get(popularityObject.Id).then(wr => {
            if(wr === undefined) {
                reject()
                return
            }
            HypernexAPI.Users.getUserFromUserId(wr.OwnerId).then(ur => {
                if(ur === undefined) {
                    reject()
                    return
                }
                createWorldCard(wr, ur, PopularWorldsList)
                exec()
            }).catch(err => reject(err))
        }).catch(err => reject(err))
    })
}

function handlePageChange(){
    let cCache = [];
    for(let i = 1; i < PopularWorldsList.children.length; i++){
        let child = PopularWorldsList.children[i]
        cCache.push(child)
    }
    for(let i in cCache) cCache[i].remove()
    HypernexAPI.Popularity.GetWorlds(HypernexAPI.Popularity.PopularityType[PopularityTypeDropdown.value], PopularResultsPerPage, currentPopularityPage).then(async r => {
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