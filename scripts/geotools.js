async function getIpFromHostname(hostname) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${hostname}`)
        const data = await response.json()

        if (data.Answer) {
            const ip = data.Answer[0].data;
            return ip
        } else {
            console.log('No IP address found for this hostname')
        }
    } catch (error) {
        console.error('Error fetching IP:', error)
    }
}

async function getLocationInfo(ip) {
    try {
        const response = await fetch(`https://api.seeip.org/geoip/${ip}`)
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching Location:', error)
    }
}

function distance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2-lat1);
    const dLon = toRadians(lon2-lon1);
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function isLocal(urlHostname){
    return /(?:^|\.)localhost$|^(?:\[::1\]|127(?:\.\d+){3})?$/i.test(urlHostname);
}

export async function findClosestServer(servers){
    if(servers.length === 0) {
        return undefined
    }
    else if(servers.length === 1) {
        return servers[0]
    }
    let localGeoData = getLocationInfo("")
    let ips = []
    for (let server of servers){
        let url = new URL(server)
        if(isLocal(url.hostname)){
            ips.push({
                Server: server,
                URL: url,
                IP: url.hostname,
                Latitude: 0,
                Longitude: 0
            })
            continue
        }
        let ip = await getIpFromHostname(url.hostname)
        let geoData = await getLocationInfo(ip)
        ips.push({
            Server: server,
            URL: url,
            IP: ip,
            Latitude: geoData.latitude,
            Longitude: geoData.longitude
        })
    }
    let shortest = ips[0]
    let shortestDistance = distance(localGeoData.latitude, localGeoData.longitude, ips[0].Latitude, ips[0].Longitude)
    for (let i = 1; i < ips.length; i++){
        let ip = ips[i]
        let d = distance(localGeoData.latitude, localGeoData.longitude, ip.Latitude, ip.Longitude)
        if(d > shortestDistance)
            continue
        shortest = ip
        shortestDistance = d
    }
    return shortest
}