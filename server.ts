import express from 'express';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON & base64 file payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // REST API routes matching Laravel specification
  app.use('/api', apiRouter);

  // Serve assets
  app.use('/src/assets/images', express.static(path.resolve(__dirname, 'src/assets/images')));

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Vite Dev Server middleware mode (HMR disabled in container environment to eliminate websocket connection errors)
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevLearn Platform] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[DevLearn Server Error]', err);
  process.exit(1);
});
