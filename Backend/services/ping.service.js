import https from 'https';

const pingService = (url) => {
    setInterval(() => {
        https.get(url, (resp) => {
            if (resp.statusCode === 200) {
                console.log('Server kept alive');
            }
        }).on('error', (err) => {
            console.log('Ping error:', err.message);
        });
    }, 840000); // Ping every 14 minutes
};

export default pingService;