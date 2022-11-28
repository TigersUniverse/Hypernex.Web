export function POST(url, data){
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest()
        xhr.open("POST", url)
        xhr.setRequestHeader("Accept", "application/json")
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                resolve(xhr.responseText)
            }};
        xhr.send(data)
    })
}

export function GET(url, data){
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest()
        xhr.open("GET", url)
        xhr.setRequestHeader("Accept", "application/json")
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.send(data)
        xhr.onload = function (){
            resolve(xhr.responseText)
        }
    })
}