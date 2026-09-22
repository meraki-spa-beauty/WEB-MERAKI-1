import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function brandAssetUploadPlugin(): Plugin {
  return {
    name: 'brand-asset-upload',
    configureServer(server) {
      server.middlewares.use('/api/upload-hero', (req, res) => {
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString());
              if (body && body.data) {
                const base64Data = body.data.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const isMobile = body.target === 'mobile';
                const filename = isMobile ? 'fondo-mobile.webp' : 'fondo-desktop.webp';
                
                // Ensure directory exists
                const bgDir = path.resolve(process.cwd(), 'public/assets/backgrounds');
                if (!fs.existsSync(bgDir)) {
                  fs.mkdirSync(bgDir, { recursive: true });
                }

                const targetPath = path.resolve(bgDir, filename);
                fs.writeFileSync(targetPath, buffer);

                // Also update legacy path if desktop
                if (!isMobile) {
                  const legacyPath = path.resolve(process.cwd(), 'public/assets/brand/fondo-mrk-web.webp');
                  fs.writeFileSync(legacyPath, buffer);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  success: true, 
                  target: isMobile ? 'mobile' : 'desktop',
                  url: `/assets/backgrounds/${filename}` 
                }));
                return;
              }
            } catch (e) {
              console.error('Upload error:', e);
            }
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid payload' }));
          });
          return;
        }
        res.writeHead(405);
        res.end();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), brandAssetUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
