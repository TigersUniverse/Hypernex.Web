import * as storage from '../../storage.js'

let userString = storage.getValue("currentUser")
if(!userString)
    window.location = "index.html"
let user = JSON.parse(userString)
document.getElementById("usn").innerHTML = "Howdy, " + user.Username