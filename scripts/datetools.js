export function fromUnix(unix) {
    return new Date(unix * 1000)
}

export function toUnix(date) {
    return date / 1000
}

export function dateToString(date, simple){
    if(simple)
        return date.toDateString()
    return date.toString()
}