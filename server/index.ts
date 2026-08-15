import { app } from './app.js';
import { env } from './env.js';
import express from 'express';
import path from 'path';

async function startServer() {
  if (env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const fs = await import('fs');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.use(async (req: any, res: any, next: any) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
}

startServer().catch(console.error);
