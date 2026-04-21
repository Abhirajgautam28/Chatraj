/**
 * URL and media related utility functions for the frontend.
 */

export const getYouTubeEmbedUrl = (urlString) => {
    if (!urlString) return '';
    try {
        const url = new URL(urlString);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return '';
        }
        const hostname = url.hostname.toLowerCase();
        const isYoutubeHost =
            hostname === 'youtube.com' ||
            hostname === 'www.youtube.com' ||
            hostname === 'm.youtube.com';
        const isShortHost =
            hostname === 'youtu.be' ||
            hostname === 'www.youtu.be';

        let videoId = '';

        if (isShortHost) {
            videoId = url.pathname.slice(1);
        } else if (isYoutubeHost) {
            if (url.pathname === '/watch' && url.searchParams.has('v')) {
                videoId = url.searchParams.get('v') || '';
            } else if (url.pathname.startsWith('/embed/')) {
                videoId = url.pathname.split('/embed/')[1].split(/[/?]/)[0];
            } else if (url.pathname.startsWith('/v/')) {
                videoId = url.pathname.split('/v/')[1].split(/[/?]/)[0];
            }
        }

        if (!videoId) {
            const match = urlString.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
            if (match && match[1]) {
                videoId = match[1];
            }
        }

        if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch {
        // ignore
    }
    return '';
};

const MAX_URL_LENGTH_BEFORE_DECODE = 2048;
const MAX_URL_LENGTH_AFTER_DECODE = 4096;
const MAX_DECODE_DEPTH = 3;
const TRAVERSAL_RE = /(^|[\/\\])\.\.([\/\\]|$)/;

const DECODE_STATUS = {
    OK: 'ok',
    OVERFLOW: 'overflow',
    MALFORMED: 'malformed',
};

function safeDecodeLimited(value, maxDepth, maxLength) {
    let decoded = value;
    let status = DECODE_STATUS.OK;
    let depth = 0;

    for (let i = 0; i < maxDepth; i++) {
        depth++;
        try {
            const next = decodeURIComponent(decoded);
            if (next === decoded) break;
            decoded = next;
            if (decoded.length > maxLength) {
                status = DECODE_STATUS.OVERFLOW;
                decoded = null;
                break;
            }
        } catch (_) {
            status = DECODE_STATUS.MALFORMED;
            break;
        }
    }

    return { value: decoded, status, depth };
}

export const isSafeUrl = (urlString) => {
    if (!urlString || typeof urlString !== 'string') return false;
    try {
        const url = new URL(urlString);
        const protocol = url.protocol.toLowerCase();
        return protocol === 'http:' || protocol === 'https:';
    } catch (e) {
        if (urlString.startsWith('//')) return false;
        if (urlString.length > MAX_URL_LENGTH_BEFORE_DECODE) return false;

        const decodedInfo = safeDecodeLimited(urlString, MAX_DECODE_DEPTH, MAX_URL_LENGTH_AFTER_DECODE);
        if (decodedInfo.status !== DECODE_STATUS.OK) return false;
        const decoded = decodedInfo.value;
        if (decoded === null || decoded.trim() === '') return false;

        if (TRAVERSAL_RE.test(decoded)) return false;
        if (decoded.includes(':')) return false;
        if (/\s/.test(decoded)) return false;
        if (!(decoded.startsWith('/') || /^[A-Za-z0-9_./~-]+$/.test(decoded))) return false;

        return true;
    }
};
