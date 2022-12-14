export function POST(url, data, dontStringify){
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest()
        xhr.open("POST", url)
        xhr.setRequestHeader("Accept", "application/json")
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                resolve(xhr.responseText)
            }};
        if(!dontStringify)
            xhr.send(JSON.stringify(data))
        else
            xhr.send(data)
    })
}

export function GET(url, data, responsetype){
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest()
        xhr.open("GET", url)
        xhr.setRequestHeader("Accept", "application/json")
        xhr.setRequestHeader("Content-Type", "application/json")
        if(responsetype)
            xhr.responseType = responsetype
        xhr.send(data)
        xhr.onload = function (){
            if(responsetype){
                resolve(xhr.response)
                return
            }
            resolve(xhr.responseText)
        }
    })
}