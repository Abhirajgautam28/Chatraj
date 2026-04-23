export const getYouTubeEmbedUrl = (urlString) => {
    if (!urlString) return '';
    try {
        const url = new URL(urlString);
        const hostname = url.hostname.toLowerCase();
        let videoId = '';
        if (hostname === 'youtu.be') videoId = url.pathname.slice(1);
        else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(hostname)) {
            if (url.pathname === '/watch') videoId = url.searchParams.get('v') || '';
            else if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/embed/')[1].split(/[/?]/)[0];
        }
        if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) return "https://www.youtube.com/embed/" + videoId;
    } catch (e) {}
    return '';
};
export const isSafeUrl = (urlString) => {
    if (!urlString || typeof urlString !== 'string') return false;
    try {
        const url = new URL(urlString);
        return ['http:', 'https:'].includes(url.protocol.toLowerCase());
    } catch (e) {
        return urlString.startsWith('/') && !urlString.includes('..');
    }
};
