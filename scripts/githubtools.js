export async function GetVersion(repoPath){
    const gitUrl = "https://github.com/" + repoPath + "/releases/latest"
    const finalUrl = await getFinalRedirect(gitUrl);
    if (finalUrl) {
        const parts = finalUrl.split('/');
        const tag = parts[parts.length - 1];
        return tag;
    }
    return "unknown";
}

export function GetLatestBuildUrl(repoPath, fileName){
    return "https://github.com/" + repoPath + "/releases/latest/download/" + fileName
}

async function getFinalRedirect(url) {
    if (!url || !url.trim()) return url;
    let maxRedirects = 8;
    let currentUrl = url;
    try {
        while (maxRedirects-- > 0) {
            const response = await fetch(currentUrl, {
                method: 'HEAD',
                redirect: 'manual'
            });
            if (response.status === 200) {
                return currentUrl;
            }
            if ([301, 302, 303, 307, 308].includes(response.status)) {
                const location = response.headers.get('Location');
                if (!location) return currentUrl;
                try {
                    currentUrl = new URL(location, currentUrl).toString();
                } catch {
                    return currentUrl;
                }
            } else {
                return currentUrl;
            }
        }
    } catch (error) {
        return currentUrl;
    }
    return currentUrl;
}
