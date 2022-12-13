import * as webtools from '../../webtools.js'
import * as HypernexAPI from '../../HypernexAPI.js'

const FriendsList = document.getElementById("friends-list")
const ShowOfflineFriendsCheckbox = document.getElementById("friends-show-offline")

const SHORTENED_TEXT_LIMIT = 35

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

function renderPage(userdata){
    document.getElementById("hiusn").innerHTML = getRandomGreetingPhrase(userdata.Username)
    document.getElementById("friends-nav-left").addEventListener("click", () => FriendsList.scrollLeft -= 400)
    document.getElementById("friends-nav-right").addEventListener("click", () => FriendsList.scrollLeft += 400)
    let f = sortOfflineFriends(userdata.Friends).TotalFriends
    for(let i = 0; i < f.length; i++){
        let friend = f[i]
        createFriendCard(friend)
    }
    toggleOfflineFriends(ShowOfflineFriendsCheckbox.checked)
    ShowOfflineFriendsCheckbox.addEventListener("click", () => toggleOfflineFriends(ShowOfflineFriendsCheckbox.checked))
    document.getElementById("friends-label").innerHTML = "Friends (" + f.length + ")"
}

renderPage({
    Username: "TheLegend27",
    Friends: []
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