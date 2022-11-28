export function setValue(key, value){
    localStorage.setItem(key, value)
}

export function getValue(key){
    return localStorage.getItem(key)
}

export function deleteKey(key){
    localStorage.removeItem(key)
}