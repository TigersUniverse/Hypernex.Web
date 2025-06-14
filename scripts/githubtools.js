export async function GetVersion(repoPath){
    const finalUrl = await getFinalRedirect(repoPath);
    if (finalUrl) {
        const parts = finalUrl.split('/');
        const tag = parts[parts.length - 1];
        return tag;
    }
    return "unknown";
}

export function GetLatestBuildUrl(repoPath, fileName){
    if(repoPath === undefined || fileName === undefined)
        return undefined
    return "https://github.com/" + repoPath + "/releases/latest/download/" + fileName
}

async function getFinalRedirect(repoPath) {
    const response = await fetch(`https://api.github.com/repos/${repoPath}/releases/latest`, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    let json = await response.json();
    return json.html_url;
}

