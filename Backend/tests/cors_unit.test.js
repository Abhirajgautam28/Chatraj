import { jest } from '@jest/globals';

const allowedOrigins = [
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatraj-fpo1pa3bz-abhiraj-gautams-projects.vercel.app'
];

const dynamicCors = (origin, callback) => {
  const vercelRegex = /^https:\/\/chatraj(-[a-zA-Z0-9-]+)?-abhiraj-gautams-projects\.vercel\.app$/;
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    vercelRegex.test(origin)
  ) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
};

describe('CORS validation regex', () => {
  const checkOrigin = (origin) => {
    return new Promise((resolve, reject) => {
      dynamicCors(origin, (err, success) => {
        if (err) return reject(err);
        resolve(success);
      });
    });
  };

  it('should allow explicitly allowed origin', async () => {
    await expect(checkOrigin('https://chatraj.vercel.app')).resolves.toBe(true);
  });

  it('should allow legitimate vercel preview URL', async () => {
    const previewUrl = 'https://chatraj-frontend-1234abc-abhiraj-gautams-projects.vercel.app';
    await expect(checkOrigin(previewUrl)).resolves.toBe(true);
  });

  it('should block arbitrary vercel domain', async () => {
    await expect(checkOrigin('https://attacker-project.vercel.app')).rejects.toThrow('Not allowed by CORS');
  });

  it('should block similar but malicious domains', async () => {
    await expect(checkOrigin('https://chatraj-malicious-abhiraj-gautams-projects.vercel.app.attacker.com')).rejects.toThrow('Not allowed by CORS');
  });

  it('should block null origin (e.g. from sandboxed iframes or local files)', async () => {
    await expect(checkOrigin('null')).rejects.toThrow('Not allowed by CORS');
  });
});
