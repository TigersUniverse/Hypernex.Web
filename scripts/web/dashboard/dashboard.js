import * as webtools from '../../webtools.js'

function getRandomGreetingPhrase(username) {
    const greetings = ["Howdy", "Hello", "Greetings", "Welcome", "G'day", "Hey", "Howdy-do", "Shalom"]
    let i = Math.floor(Math.random() * greetings.length)
    return greetings[i] + ", " + username + "!"
}

function renderPage(userdata){
    document.getElementById("hiusn").innerHTML = getRandomGreetingPhrase(userdata.Username)
}

renderPage({
    Username: "TheLegend27"
})

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