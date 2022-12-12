import * as webtools from '../../webtools.js'
import * as HypernexAPI from '../../HypernexAPI.js'

const FriendsList = document.getElementById("friends-list")

function getRandomGreetingPhrase(username) {
    const greetings = ["Howdy", "Hello", "Greetings", "Welcome", "G'day", "Hey", "Howdy-do", "Shalom"]
    let i = Math.floor(Math.random() * greetings.length)
    return greetings[i] + ", " + username + "!"
}

function renderPage(userdata){
    document.getElementById("hiusn").innerHTML = getRandomGreetingPhrase(userdata.Username)
    document.getElementById("friends-nav-left").addEventListener("click", () => FriendsList.scrollLeft -= 100)
    document.getElementById("friends-nav-right").addEventListener("click", () => FriendsList.scrollLeft += 100)
}

renderPage({
    Username: "TheLegend27"
})

function createDashboardNotice(type, heading, description){
    let id
    switch (type){
        case webtools.Notices.Info:
            id = "infoBubble"
            break
        case webtools.Notices.Warning:
            id = "warningBubble"
            break
        case webtools.Notices.Error:
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

function createFriendCard(user){
    let friendCard = document.getElementById("example-friend-card").cloneNode(true)
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
        // TODO: Set color
    }
    if(bio.DisplayNamee !== undefined && bio.DisplayName !== "")
        usernameText.innerHTML = bio.DisplayName
    else
        usernameText.innerHTML = bio.Username
    // TODO: Implement server-side
    if(bio.StatusText === undefined || bio.StatusText === "")
        bio.StatusText = ""
    statusText.innerHTML = bio.StatusText
    // TODO: reparent
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