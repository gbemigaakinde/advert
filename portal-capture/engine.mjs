// Shared helpers for capturing the REAL school portal pages as screenshots.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import puppeteer from "puppeteer-core";
import { demoData, demoUser } from "./demo-data.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const require = createRequire(import.meta.url);
const nm = (p) => path.join(root, "node_modules", p);

export const SCHOOL_DIR = path.resolve(process.env.FAHMID_SCHOOL_DIR || path.join(root, "..", "fahmidschool"));
export const OUT_DIR = path.join(root, "public", "portal");

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".json": "application/json", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };

export function startServer() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/login") p = "/login.html";
    if (p === "/") p = "/index.html";
    let file = path.join(SCHOOL_DIR, p);
    if (p.startsWith("/__lib/")) file = nm(p.replace("/__lib/", ""));
    if (!file.startsWith(SCHOOL_DIR) && !file.startsWith(nm(""))) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
      res.end(buf);
    });
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r({ server, port: server.address().port })));
}

function fontCss(port) {
  const faces = [];
  const add = (pkg, family, weights, style = "normal") => weights.forEach((w) => {
    const f = `@fontsource/${pkg}/files/${pkg}-latin-${w}-${style}.woff2`;
    if (fs.existsSync(nm(f))) faces.push(`@font-face{font-family:'${family}';font-style:${style};font-weight:${w};font-display:block;src:url(http://127.0.0.1:${port}/__lib/${f}) format('woff2');}`);
  });
  add("dm-sans", "DM Sans", [300, 400, 500, 600, 700]);
  add("dm-sans", "DM Sans", [400], "italic");
  add("plus-jakarta-sans", "Plus Jakarta Sans", [400, 500, 600, 700, 800]);
  add("dm-serif-display", "DM Serif Display", [400]);
  add("dm-serif-display", "DM Serif Display", [400], "italic");
  return faces.join("\n");
}

async function findChrome() {
  const cands = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return { exe: c, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] };
  const { default: chromium } = await import("@sparticuz/chromium");
  return { exe: await chromium.executablePath(), args: chromium.args };
}

export async function launch() {
  const { exe, args } = await findChrome();
  return puppeteer.launch({ executablePath: exe, args, headless: "shell" });
}

/**
 * Open a real portal page.
 * opts: width, height, dsf, signedIn, hang (never finish sign-in check), data override
 */
export async function openPage(browser, port, urlPath, opts = {}) {
  const { width = 390, height = 844, dsf = 3, signedIn = false, hang = false, mobile = true } = opts;
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: dsf, isMobile: mobile, hasTouch: mobile });
  page.on("dialog", (d) => { console.warn("  [dialog]", d.message().slice(0, 160)); d.dismiss().catch(() => {}); });
  page.on("pageerror", (e) => console.warn("  [pageerror]", urlPath, String(e.message).slice(0, 140)));
  await page.evaluateOnNewDocument((data, user, signedIn, hang) => {
    window.print = function () {}; window.__DEMO_DATA__ = data; window.__DEMO_USER__ = user; window.__DEMO_SIGNED_IN__ = signedIn; window.__DEMO_HANG__ = hang;
    try { if (signedIn) localStorage.setItem("fahmid_login_time", String(Date.now())); } catch (e) {}
  }, demoData, demoUser, signedIn, hang);

  await page.setRequestInterception(true);
  const stub = fs.readFileSync(path.join(here, "firebase-stub.js"), "utf8");
  const localBase = `http://127.0.0.1:${port}`;
  page.on("request", (req) => {
    const u = req.url();
    if (u.startsWith(localBase) || u.startsWith("data:") || u.startsWith("blob:")) return req.continue();
    const ok = (body, type) => req.respond({ status: 200, contentType: type, body, headers: { "access-control-allow-origin": "*" } });
    if (u.includes("fonts.googleapis.com")) return ok(fontCss(port), "text/css");
    if (u.includes("unpkg.com/lucide")) return ok(fs.readFileSync(nm("lucide/dist/umd/lucide.min.js")), "text/javascript");
    if (u.includes("phosphor-icons") && u.endsWith(".css")) {
      let css = fs.readFileSync(nm("@phosphor-icons/web/src/regular/style.css"), "utf8");
      css = css.replace(/url\("?\.\/Phosphor/g, `url("${localBase}/__lib/@phosphor-icons/web/src/regular/Phosphor`);
      return ok(css, "text/css");
    }
    if (u.includes("firebase-app-compat")) return ok(stub, "text/javascript");
    if (u.includes("gstatic.com/firebasejs")) return ok("/* stub */", "text/javascript");
    return req.abort();
  });
  await page.goto(localBase + urlPath, { waitUntil: "load" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  return page;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const ensureDir = (d) => fs.mkdirSync(d, { recursive: true });

/** Bounding box of a selector in CSS px relative to the document (not viewport). */
export async function box(page, selector, index = 0) {
  return page.evaluate((sel, i) => {
    const el = document.querySelectorAll(sel)[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  }, selector, index);
}

export async function shot(page, file, clip, viewportRelative = false) {
  ensureDir(path.dirname(file));
  // viewportRelative: clip is measured against the visible screen (needed for fixed bars on a scrolled page)
  await page.screenshot({ path: file, type: "png", ...(clip ? { clip } : {}), ...(viewportRelative ? { captureBeyondViewport: false } : {}) });
}

/** Screenshot the whole page by growing the viewport (avoids stitching glitches with sticky/fixed bars). */
export async function fullShot(page, file, width, dsf, mobile = true) {
  const h = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
  // Chrome tiles incorrectly past ~8192 device px, so lower the pixel density for very tall pages.
  dsf = Math.max(1, Math.min(dsf, Math.floor((8000 / h) * 100) / 100));
  await page.setViewport({ width, height: h, deviceScaleFactor: dsf, isMobile: mobile, hasTouch: mobile });
  await sleep(500);
  const h2 = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
  ensureDir(path.dirname(file));
  await page.screenshot({ path: file, type: "png", clip: { x: 0, y: 0, width, height: h2 } });
  return { height: h2, dsf };
}
