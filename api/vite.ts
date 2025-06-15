import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import type { ServerOptions, HmrOptions } from 'vite';
import { createLogger } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const viteLogger = createLogger();
const __dirname = dirname(fileURLToPath(import.meta.url));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function createViteServer(app: express.Application) {
  const vite = await createServer({
    server: {
      middlewareMode: true,
      hmr: process.env.VITE_DEV_SERVER_URL
        ? {
            port: parseInt(new URL(process.env.VITE_DEV_SERVER_URL).port, 10)
          }
        : undefined,
    },
    appType: "custom",
    root: resolve(__dirname, "../client"),
    build: {
      target: "esnext",
      outDir: resolve(__dirname, "../dist/public"),
      assetsDir: "assets",
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, "../client/src/main.tsx"),
      },
    },
  });

  app.use(vite.middlewares);

  return vite;
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer(app);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
