import { useState, useCallback, useRef } from 'react';
import { getWebContainer } from '../config/webContainer';

export const useWebContainer = (fileTree) => {
    const [webContainer, setWebContainer] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [runProcess, setRunProcess] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [booting, setBooting] = useState(false);

    const boot = useCallback(async () => {
        if (webContainer || booting) return;
        setBooting(true);
        try {
            const container = await getWebContainer();
            setWebContainer(container);
        } catch (error) {
            console.error('WebContainer boot failed:', error);
        } finally {
            setBooting(false);
        }
    }, [webContainer, booting]);

    const runProject = useCallback(async (showToast) => {
        if (!webContainer) {
            showToast?.("WebContainer is not ready yet.", "warning");
            return;
        }

        setIsRunning(true);
        try {
            await webContainer.mount({
                'package.json': {
                    file: {
                        contents: JSON.stringify({
                            name: 'express-app',
                            version: '1.0.0',
                            scripts: {
                                start: 'node app.js'
                            },
                            dependencies: {
                                express: '^4.18.2'
                            }
                        })
                    }
                },
                ...fileTree
            });

            if (runProcess) {
                await runProcess.kill();
            }

            let installSuccess = false;
            let retries = 3;

            while (!installSuccess && retries > 0) {
                try {
                    const installProcess = await webContainer.spawn('npm', ['install']);
                    const installExitCode = await new Promise(resolve => {
                        installProcess.exit.then(resolve);
                    });

                    if (installExitCode === 0) {
                        installSuccess = true;
                        showToast?.('Dependencies installed successfully', 'success');
                    }
                } catch (err) {
                    console.error(`Install attempt failed, ${retries - 1} retries left:`, err);
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (!installSuccess) {
                throw new Error('Failed to install dependencies after multiple attempts');
            }

            const tempRunProcess = await webContainer.spawn('npm', ['start']);
            setRunProcess(tempRunProcess);

            webContainer.on('server-ready', (port, url) => {
                showToast?.('Server is ready!', 'success');
                setIframeUrl(url);
            });

        } catch (error) {
            console.error('Error running project:', error);
            showToast?.(`Failed to run project: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    }, [webContainer, fileTree, runProcess]);

    return {
        webContainer,
        iframeUrl,
        runProject,
        isRunning,
        boot,
        setIframeUrl
    };
};
