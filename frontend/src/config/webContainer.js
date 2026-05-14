import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;

export const getWebContainer = async () => {
    // WebContainer uses SharedArrayBuffer and requires crossOriginIsolated.
    // If the hosting environment is not cross-origin isolated (e.g., local dev without COOP/COEP),
    // avoid calling `WebContainer.boot()` which will throw a DataCloneError.
    if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
        // Gracefully skip booting WebContainer in non-isolated environments.
        // Consumers should handle a `null` return value.
        console.warn('Skipping WebContainer.boot(): window.crossOriginIsolated is not enabled.');
        return null;
    }

    if (webContainerInstance === null) {
        try {
            webContainerInstance = await WebContainer.boot();
        } catch (error) {
            console.error('WebContainer.boot failed:', error);
            webContainerInstance = null;
        }
    }
    return webContainerInstance;
};