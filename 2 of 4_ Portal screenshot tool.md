# Part 2 of 4: The screenshot tool (`portal-capture/` folder)

These four files photograph the **real** school portal pages using fictional demo data (Aisha Ibrahim, ADM-2026-001). Create a new folder called `portal-capture` in the repository root and add all four files inside it.

---

## `portal-capture/engine.mjs`

**ADD (new file)** this file in your `advert` repository.

```js
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
```

---

## `portal-capture/firebase-stub.js`

**ADD (new file)** this file in your `advert` repository. Stands in for the real database during photography only, so no real pupil record is ever read.

```js
/*
 * In-memory stand-in for the Firebase SDK, used ONLY by the video capture
 * step. It lets the REAL, unmodified school portal pages run against
 * fictional demo data, so the video shows the genuine interface without
 * ever touching real pupil records. Nothing here is shipped to the school site.
 */
(function () {
  const RAW = window.__DEMO_DATA__ || {};

  class Timestamp {
    constructor(ms) { this._ms = ms; }
    toDate() { return new Date(this._ms); }
    toMillis() { return this._ms; }
    get seconds() { return Math.floor(this._ms / 1000); }
    get nanoseconds() { return 0; }
    static now() { return new Timestamp(Date.now()); }
    static fromDate(d) { return new Timestamp(d.getTime()); }
    static fromMillis(ms) { return new Timestamp(ms); }
  }

  // Revive { __ts: <ms offset from now> | "ISO" } markers into Timestamps.
  function revive(v) {
    if (v && typeof v === "object") {
      if (v.__ts !== undefined) {
        const t = typeof v.__ts === "number" ? Date.now() + v.__ts : Date.parse(v.__ts);
        return new Timestamp(t);
      }
      if (Array.isArray(v)) return v.map(revive);
      const o = {};
      for (const k of Object.keys(v)) o[k] = revive(v[k]);
      return o;
    }
    return v;
  }

  const store = {};
  for (const col of Object.keys(RAW)) {
    store[col] = {};
    for (const id of Object.keys(RAW[col])) store[col][id] = revive(RAW[col][id]);
  }

  const clone = (o) => (o === undefined ? o : Object.assign(Array.isArray(o) ? [] : {}, o));
  const val = (x) => (x && typeof x.toMillis === "function" ? x.toMillis() : x);
  const getField = (data, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), data);

  function matches(data, [field, op, target]) {
    const v = val(getField(data, field));
    const t = val(target);
    switch (op) {
      case "==": return v === t;
      case "!=": return v !== t;
      case "<": return v < t;
      case "<=": return v <= t;
      case ">": return v > t;
      case ">=": return v >= t;
      case "in": return Array.isArray(target) && target.map(val).includes(v);
      case "array-contains": return Array.isArray(v) && v.includes(t);
      default: return true;
    }
  }

  function docSnap(col, id) {
    const data = store[col] && store[col][id];
    return {
      id, exists: data !== undefined, ref: docRef(col, id),
      data: () => (data === undefined ? undefined : clone(data)),
      get: (f) => (data === undefined ? undefined : getField(data, f)),
    };
  }

  function querySnap(col, filters, orders, lim) {
    let ids = Object.keys(store[col] || {}).filter((id) => filters.every((f) => matches(store[col][id], f)));
    orders.forEach(([f, dir]) => {
      ids.sort((a, b) => {
        const x = val(getField(store[col][a], f)), y = val(getField(store[col][b], f));
        return (x > y ? 1 : x < y ? -1 : 0) * (dir === "desc" ? -1 : 1);
      });
    });
    if (lim) ids = ids.slice(0, lim);
    const docs = ids.map((id) => docSnap(col, id));
    return { empty: docs.length === 0, size: docs.length, docs, forEach: (cb) => docs.forEach(cb),
             docChanges: () => docs.map((d) => ({ type: "added", doc: d })) };
  }

  function query(col, filters = [], orders = [], lim = 0) {
    const q = {
      where: (f, op, v) => query(col, [...filters, [f, op, v]], orders, lim),
      orderBy: (f, dir) => query(col, filters, [...orders, [f, dir || "asc"]], lim),
      limit: (n) => query(col, filters, orders, n),
      startAfter: () => q, endBefore: () => q, startAt: () => q,
      get: () => Promise.resolve(querySnap(col, filters, orders, lim)),
      onSnapshot: (ok) => { setTimeout(() => ok(querySnap(col, filters, orders, lim)), 0); return () => {}; },
    };
    return q;
  }

  function docRef(col, id) {
    return {
      id, path: col + "/" + id,
      get: () => Promise.resolve(docSnap(col, id)),
      set: (d) => { (store[col] = store[col] || {})[id] = revive(d); return Promise.resolve(); },
      update: (d) => { (store[col] = store[col] || {})[id] = Object.assign({}, (store[col] || {})[id], d); return Promise.resolve(); },
      delete: () => { if (store[col]) delete store[col][id]; return Promise.resolve(); },
      onSnapshot: (ok) => { setTimeout(() => ok(docSnap(col, id)), 0); return () => {}; },
      collection: (sub) => collection(col + "/" + id + "/" + sub),
    };
  }

  function collection(name) {
    const q = query(name);
    return Object.assign(q, {
      doc: (id) => docRef(name, id || "auto_" + Math.random().toString(36).slice(2, 9)),
      add: (d) => { const id = "auto_" + Math.random().toString(36).slice(2, 9); (store[name] = store[name] || {})[id] = revive(d); return Promise.resolve(docRef(name, id)); },
    });
  }

  const fsInstance = {
    collection, enablePersistence: () => Promise.resolve(),
    enableNetwork: () => Promise.resolve(), disableNetwork: () => Promise.resolve(),
    batch: () => ({ set() {}, update() {}, delete() {}, commit: () => Promise.resolve() }),
    runTransaction: (fn) => Promise.resolve(fn({ get: (r) => r.get(), set() {}, update() {} })),
    settings() {}, collectionGroup: (n) => collection(n),
  };

  // ── Auth ───────────────────────────────────────────────────────────────
  const demoUser = window.__DEMO_USER__ || null;
  let currentUser = window.__DEMO_SIGNED_IN__ ? demoUser : null;
  const listeners = [];
  const authInstance = {
    get currentUser() { return currentUser; },
    onAuthStateChanged: (cb) => { listeners.push(cb); if (!window.__DEMO_HANG__) setTimeout(() => cb(currentUser), 0); return () => {}; },
    setPersistence: () => Promise.resolve(),
    signInWithEmailAndPassword: () => { currentUser = demoUser; listeners.forEach((l) => l(currentUser)); return Promise.resolve({ user: currentUser }); },
    signOut: () => { currentUser = null; listeners.forEach((l) => l(null)); return Promise.resolve(); },
    sendPasswordResetEmail: () => new Promise((r) => setTimeout(r, 350)),
  };
  if (demoUser) {
    demoUser.getIdToken = () => Promise.resolve("demo-token");
    demoUser.getIdTokenResult = () => Promise.resolve({ claims: {}, token: "demo-token" });
  }

  const firebase = {
    apps: [], initializeApp() { this.apps.push({}); return {}; },
    firestore: Object.assign(() => fsInstance, {
      Timestamp,
      FieldValue: { serverTimestamp: () => Timestamp.now(), increment: (n) => n, arrayUnion: (...a) => a, arrayRemove: () => [], delete: () => null },
    }),
    auth: Object.assign(() => authInstance, { Auth: { Persistence: { LOCAL: "local", SESSION: "session", NONE: "none" } } }),
    analytics: () => ({ logEvent() {} }),
  };
  window.firebase = firebase;
})();
```

---

## `portal-capture/demo-data.mjs`

**ADD (new file)** this file in your `advert` repository. **All the fictional pupil, fee, test and result data lives here.** Edit it if you want different demo values.

```js
// ─────────────────────────────────────────────────────────────────────────────
// FICTIONAL DEMONSTRATION DATA. No real pupil, parent, payment or result
// is used anywhere in the video. Edit freely; re-run the workflow to update.
// { __ts: <ms from now> } becomes a timestamp when the page loads.
// ─────────────────────────────────────────────────────────────────────────────
const DAY = 86400000;
const PUPIL_ID = "demo-pupil-001";

const subjects = [
  "Mathematics", "English Language", "Basic Science", "Social Studies",
  "Civic Education", "Computer Studies", "Creative Arts", "Physical Education",
];
const scores = {
  "Mathematics": [34, 52], "English Language": [32, 48], "Basic Science": [30, 45],
  "Social Studies": [28, 41], "Civic Education": [35, 50], "Computer Studies": [36, 55],
  "Creative Arts": [33, 47], "Physical Education": [37, 54],
};

const results = {};
const addResults = (session, term, shift) => subjects.forEach((s, i) => {
  const [ca, ex] = scores[s];
  results[`r_${session.replace("/", "-")}_${term.replace(" ", "")}_${i}`] = {
    pupilId: PUPIL_ID, classId: "primary-5", session, term, subject: s,
    caScore: Math.min(40, ca + shift), examScore: Math.min(60, ex + shift), status: "approved",
  };
});
addResults("2025/2026", "First Term", 0);
addResults("2024/2025", "First Term", -2);
addResults("2024/2025", "Second Term", 0);
addResults("2024/2025", "Third Term", 2);

export const demoUser = { uid: PUPIL_ID, email: "parent.demo@example.com", displayName: "Aisha Ibrahim", emailVerified: true };

export const demoData = {
  settings: {
    current: {
      session: "2025/2026", term: "First Term",
      currentSession: { name: "2025/2026", startYear: 2025, endYear: 2026 },
      resumptionDate: "2026-01-12",
    },
  },
  users: { [PUPIL_ID]: { role: "pupil", email: demoUser.email, name: "Aisha Ibrahim" } },
  pupils: {
    [PUPIL_ID]: {
      name: "Aisha Ibrahim", admissionNo: "ADM-2026-001", gender: "Female", dob: "2015-03-14",
      contact: "0800 000 0000", address: "12 Sample Street, Lagos", email: demoUser.email,
      class: { id: "primary-5", name: "Primary 5" }, religion: "",
      assignedTeacher: { id: "demo-teacher", name: "Mrs. Sample Teacher" },
      subjects, status: "active", isActive: true, admissionSession: "2024/2025", admissionTerm: "First Term",
    },
  },
  classes: { "primary-5": { name: "Primary 5", teacherId: "demo-teacher", subjects } },
  teachers: { "demo-teacher": { name: "Mrs. Sample Teacher", email: "teacher.demo@example.com" } },
  results,
  remarks: {}, attendance: {},
  fee_structures: { "fee_primary-5": { total: 150000, classId: "primary-5", className: "Primary 5" } },
  payments: {
    // Previous session fully paid, so the demo shows a clean "current term" balance with no arrears.
    [`${PUPIL_ID}_2024-2025_First Term`]: { totalPaid: 150000, balance: 0, pupilId: PUPIL_ID, session: "2024/2025", term: "First Term" },
    [`${PUPIL_ID}_2024-2025_Second Term`]: { totalPaid: 150000, balance: 0, pupilId: PUPIL_ID, session: "2024/2025", term: "Second Term" },
    [`${PUPIL_ID}_2024-2025_Third Term`]: { totalPaid: 150000, balance: 0, pupilId: PUPIL_ID, session: "2024/2025", term: "Third Term" },
    [`${PUPIL_ID}_2025-2026_First Term`]: { totalPaid: 100000, pupilId: PUPIL_ID, session: "2025/2026", term: "First Term" },
  },
  payment_transactions: {
    "RCP-DEMO-0001": { pupilId: PUPIL_ID, pupilName: "Aisha Ibrahim", className: "Primary 5", session: "2025/2026", term: "First Term",
            amountPaid: 60000, paymentMethod: "Bank Transfer", receiptNo: "RCP-DEMO-0001", balanceBefore: 150000,
            balanceAfter: 90000, totalDue: 150000, totalPaidAfter: 60000, notes: "", paymentDate: { __ts: -35 * DAY } },
    "RCP-DEMO-0002": { pupilId: PUPIL_ID, pupilName: "Aisha Ibrahim", className: "Primary 5", session: "2025/2026", term: "First Term",
            amountPaid: 40000, paymentMethod: "Cash", receiptNo: "RCP-DEMO-0002", balanceBefore: 90000,
            balanceAfter: 50000, totalDue: 150000, totalPaidAfter: 100000, notes: "", paymentDate: { __ts: -12 * DAY } },
  },
  cbt_tests: {
    test_open: { classId: "primary-5", published: true, session: "2025/2026", term: "First Term", title: "Mathematics First Term Test",
                 subject: "Mathematics", type: "Test", timerMinutes: 20, scheduledDate: { __ts: -2 * DAY }, expiryDate: { __ts: 5 * DAY } },
    test_done: { classId: "primary-5", published: true, session: "2025/2026", term: "First Term", title: "English Language Test",
                 subject: "English Language", type: "Test", timerMinutes: 25, scheduledDate: { __ts: -9 * DAY }, expiryDate: { __ts: 20 * DAY } },
  },
  cbt_attempts: {
    att1: { pupilId: PUPIL_ID, testId: "test_done", status: "completed", score: 17, total: 20, percentage: 85 },
  },
};
```

---

## `portal-capture/capture.mjs`

**ADD (new file)** this file in your `advert` repository.

```js
// Captures every portal screen used by the Parent Portal Guide video.
// Usage: node portal-capture/capture.mjs   (set FAHMID_SCHOOL_DIR to the fahmidschool checkout)
import fs from "node:fs";
import path from "node:path";
import { startServer, launch, openPage, sleep, shot, box, fullShot, ensureDir, OUT_DIR, SCHOOL_DIR } from "./engine.mjs";

const IDENT = "ADM-2026-001";
const PASSWORD = "demo-pass";
const manifest = { generatedAt: new Date().toISOString(), screens: {} };
const out = (f) => path.join(OUT_DIR, f);

async function setValue(page, sel, value) {
  await page.evaluate((s, v) => {
    const el = document.querySelector(s); el.focus();
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
  }, sel, value);
}
async function vp(page) { return page.evaluate(() => ({ w: innerWidth, h: innerHeight })); }
async function settle(page, ms = 400) { await page.evaluate(() => window.lucide && lucide.createIcons && lucide.createIcons()); await sleep(ms); }

// ── LOGIN (real login.html) ────────────────────────────────────────────────
async function captureLogin(b, port) {
  console.log("• login (mobile)");
  const p = await openPage(b, port, "/login", {});
  await sleep(900); await settle(p);
  await shot(p, out("login_m_empty.png"));
  const m = {
    viewport: await vp(p),
    identifier: await box(p, "#login-identifier"), password: await box(p, "#login-password"),
    submit: await box(p, "#login-btn"), forgot: await box(p, "#forgot-btn"),
    tabRegister: await box(p, "#tab-register"), tabLogin: await box(p, "#tab-login"),
    toggle: await box(p, "#password-toggle"),
  };
  // typing, one screenshot per character (real focus ring, real input styling)
  for (let i = 0; i <= IDENT.length; i++) {
    await setValue(p, "#login-identifier", IDENT.slice(0, i)); await sleep(40);
    await shot(p, out(`login_m_id_${String(i).padStart(2, "0")}.png`));
  }
  for (let i = 0; i <= PASSWORD.length; i++) {
    await setValue(p, "#login-password", PASSWORD.slice(0, i)); await sleep(40);
    await shot(p, out(`login_m_pw_${String(i).padStart(2, "0")}.png`));
  }
  m.idChars = IDENT.length; m.pwChars = PASSWORD.length;
  // Register tab (real "Registration is Currently Locked" panel)
  await p.click("#tab-register"); await sleep(500); await settle(p);
  await shot(p, out("login_m_register.png"));
  m.register = { contact: await box(p, ".reg-locked") };
  await p.click("#tab-login"); await sleep(400);
  // Forgot password
  await p.click("#forgot-btn"); await sleep(600); await settle(p);
  await shot(p, out("login_m_forgot.png"));
  m.forgotEmail = await box(p, "#forgot-email"); m.forgotSubmit = await box(p, "#forgot-submit-btn");
  const EMAIL = "parent.demo@example.com";
  for (let i = 0; i <= EMAIL.length; i += 3) {
    await setValue(p, "#forgot-email", EMAIL.slice(0, i)); await sleep(30);
    await shot(p, out(`login_m_forgot_${String(i / 3 | 0).padStart(2, "0")}.png`));
  }
  await setValue(p, "#forgot-email", EMAIL); await sleep(60);
  m.forgotSteps = Math.floor(EMAIL.length / 3) + 1;
  await shot(p, out("login_m_forgot_full.png"));
  await p.click("#forgot-submit-btn"); await sleep(1200); await settle(p);
  await shot(p, out("login_m_forgot_success.png"));
  m.forgotBack = await box(p, "#forgot-success-back-btn");
  manifest.screens.loginMobile = m;
  await p.close();

  // Sign-in button pressed state: submit with all fields, grab spinner frame
  const q = await openPage(b, port, "/login", {});
  await sleep(700);
  await setValue(q, "#login-identifier", IDENT); await setValue(q, "#login-password", PASSWORD);
  await q.evaluate(() => document.getElementById("login-btn").classList.add("loading"));
  await q.evaluate(() => { const b = document.getElementById("login-btn"); b.disabled = true; });
  await sleep(150); await shot(q, out("login_m_submitting.png"));
  await q.close();

  // Tablet + desktop layouts (real responsive CSS)
  console.log("• login (tablet, desktop)");
  const t = await openPage(b, port, "/login", { width: 820, height: 1180, dsf: 2, mobile: false });
  await sleep(900); await settle(t); await shot(t, out("login_t.png")); await t.close();
  const d = await openPage(b, port, "/login", { width: 1440, height: 900, dsf: 2, mobile: false });
  await sleep(900); await settle(d); await shot(d, out("login_d.png"));
  manifest.screens.loginDesktop = { viewport: await vp(d), identifier: await box(d, "#login-identifier") };
  await d.close();
}

// ── LOADING SCREEN (real portal.html) ──────────────────────────────────────
async function captureLoading(b, port) {
  console.log("• loading screen");
  const msgs = ["Verifying your session\u2026", "Checking your access level\u2026", "Welcome! Opening your pupil portal\u2026"];
  let viewport = null;
  for (let i = 0; i < msgs.length; i++) {
    // A fresh page per frame keeps each still independent of the page's own animations.
    const p = await openPage(b, port, "/portal.html", { hang: true, signedIn: true });
    await sleep(800);
    await p.evaluate((n, t) => {
      const e = document.getElementById("portal-status"); if (e) e.textContent = t;
      ["step-auth", "step-role", "step-redirect"].forEach((id, k) => {
        const el = document.getElementById(id); if (!el) return;
        el.classList.remove("active", "done"); if (k < n) el.classList.add("done"); else if (k === n) el.classList.add("active");
      });
    }, i, msgs[i]);
    await sleep(500); await shot(p, out(`loading_m_${i + 1}.png`));
    viewport = await vp(p);
    await p.close();
  }
  manifest.screens.loading = { messages: msgs, viewport };
}

// ── PUPIL PORTAL (real pupil.html) ─────────────────────────────────────────
async function capturePupil(b, port) {
  console.log("• pupil portal (mobile)");
  const p = await openPage(b, port, "/pupil.html", { signedIn: true });
  await sleep(2800); await settle(p, 800);
  const v = await vp(p);
  const nav = await box(p, ".pp-bottom-nav");
  const top = await box(p, ".pp-topbar, header");
  await shot(p, out("pupil_m_view.png"));

  // Fixed bar pieces: top bar + bottom nav in each active state (real tap behaviour)
  await shot(p, out("pupil_m_topbar.png"), { x: 0, y: 0, width: v.w, height: Math.ceil(top.h) }, true);
  const secs = ["profile", "tests", "results", "fees"];
  await p.evaluate(() => window.scrollTo(0, 0));
  for (const s of secs) {
    // Mark the section active directly (same class the portal itself uses) so the page never scrolls.
    await p.evaluate((n) => {
      document.querySelectorAll(".pp-bottom-nav__link").forEach((l) => l.classList.toggle("pp-bottom-nav__link--active", l.dataset.section === n));
    }, s);
    await sleep(500);
    const nb = await p.evaluate(() => { const r = document.querySelector(".pp-bottom-nav").getBoundingClientRect(); return { y: r.top, h: r.height }; });
    await shot(p, out(`pupil_m_bottomnav_${s}.png`), { x: 0, y: Math.floor(nb.y), width: v.w, height: Math.min(v.h - Math.floor(nb.y), Math.ceil(nb.h) + 1) }, true);
  }
  const navLinks = {};
  for (let i = 0; i < 4; i++) navLinks[secs[i]] = await p.evaluate((i) => {
    const r = document.querySelectorAll(".pp-bottom-nav__link")[i].getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, i);
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(500);

  // Full-page content with fixed bars hidden (the video scrolls it inside the phone)
  await p.addStyleTag({ content: ".pp-bottom-nav{display:none!important} .pp-topbar,header{position:static!important}" });
  await sleep(400);
  const fs1 = await fullShot(p, out("pupil_m_full.png"), v.w, 3);
  const dims = { h: fs1.height, dsf: fs1.dsf };
  const el = {
    topbar: await box(p, ".pp-topbar, header"), hero: await box(p, ".pp-hero"),
    printHero: await box(p, ".pp-hero__actions button", 0), feeHero: await box(p, ".pp-hero__actions button", 1),
    profile: await box(p, "#pp-profile"), tests: await box(p, "#pp-tests"), results: await box(p, "#pp-results"),
    fees: await box(p, "#pp-fees"), session: await box(p, "#pupil-session-select"),
    printReport: await box(p, ".pp-card__footer .pp-btn"), logout: top && await box(p, ".pp-btn-logout"),
    resultsTable: await box(p, ".results-table"),
  };
  const btns = await p.evaluate(() => [...document.querySelectorAll("#pp-tests button, #pp-tests a")].map((b) => {
    const r = b.getBoundingClientRect(); return { text: b.innerText.trim().slice(0, 30), x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  }));
  const cards = await p.evaluate(() => [...document.querySelectorAll("#pp-tests [class*='cbt']")].filter((n) => n.className.toString().includes("card")).map((n) => {
    const r = n.getBoundingClientRect(); return { cls: n.className.toString().slice(0, 40), x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  }));
  const receipts = await p.evaluate(() => [...document.querySelectorAll("#pp-fees button")].map((b) => {
    const r = b.getBoundingClientRect(); return { text: b.innerText.trim().slice(0, 30), x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  }));
  manifest.screens.pupilMobile = { viewport: v, fullHeight: dims.h, fullDsf: dims.dsf, nav: nav && { y: nav.y, h: nav.h }, navLinks, el, testButtons: btns, testCards: cards, feeButtons: receipts };

  // Results for a previous session (real selector behaviour)
  await p.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await sleep(400);
  await p.select("#pupil-session-select", "2024/2025"); await sleep(1500); await settle(p);
  const resH = await box(p, "#pp-results");
  await shot(p, out("pupil_m_results_hist.png"), { x: 0, y: resH.y, width: v.w, height: resH.h });
  manifest.screens.pupilMobile.resultsHist = resH;
  manifest.screens.pupilMobile.sessionOptions = await p.evaluate(() => [...document.querySelectorAll("#pupil-session-select option")].map((o) => o.textContent.trim()));
  await p.close();

  // Tablet + desktop (responsive)
  console.log("• pupil portal (tablet, desktop)");
  const t = await openPage(b, port, "/pupil.html", { signedIn: true, width: 820, height: 1180, dsf: 2, mobile: false });
  await sleep(2800); await settle(t, 600); await shot(t, out("pupil_t_view.png")); await t.close();
  const d = await openPage(b, port, "/pupil.html", { signedIn: true, width: 1440, height: 900, dsf: 2, mobile: false });
  await sleep(2800); await settle(d, 600); await shot(d, out("pupil_d_view.png"));
  manifest.screens.pupilDesktop = { viewport: await vp(d) };
  await d.close();
}

// ── REPORT CARD + RECEIPT ──────────────────────────────────────────────────
async function captureDocuments(b, port) {
  console.log("• report card");
  for (const [tag, opt] of [["m", { width: 390, height: 844, dsf: 3 }], ["d", { width: 1100, height: 900, dsf: 2, mobile: false }]]) {
    const p = await openPage(b, port, "/print-results.html?session=2025%2F2026", { signedIn: true, ...opt });
    await sleep(3200); await settle(p, 600);
    const { height: h, dsf: fd } = await fullShot(p, out(`report_${tag}_full.png`), opt.width, opt.dsf, opt.mobile !== false);
    manifest.screens[`report_${tag}`] = { viewport: { w: opt.width, h: opt.height }, fullHeight: h, dsf: fd };
    await p.close();
  }
  console.log("• receipt");
  for (const [tag, opt] of [["m", { width: 390, height: 844, dsf: 3 }], ["d", { width: 800, height: 700, dsf: 2, mobile: false }]]) {
    const p = await openPage(b, port, "/receipt.html?receipt=RCP-DEMO-0002", { signedIn: true, ...opt });
    await sleep(2500); await settle(p, 500);
    const { height: h, dsf: fd } = await fullShot(p, out(`receipt_${tag}_full.png`), opt.width, opt.dsf, opt.mobile !== false);
    manifest.screens[`receipt_${tag}`] = { viewport: { w: opt.width, h: opt.height }, fullHeight: h, dsf: fd };
    await p.close();
  }
}

const only = process.argv[2];
ensureDir(OUT_DIR);
console.log("School portal source:", SCHOOL_DIR);
const { server, port } = await startServer();
const browser = await launch();
try {
  if (!only || only === "login") await captureLogin(browser, port);
  if (!only || only === "loading") await captureLoading(browser, port);
  if (!only || only === "pupil") await capturePupil(browser, port);
  if (!only || only === "docs") await captureDocuments(browser, port);
  const mf = out("manifest.json");
  const prev = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, "utf8")) : { screens: {} };
  fs.writeFileSync(mf, JSON.stringify({ ...manifest, screens: { ...prev.screens, ...manifest.screens } }, null, 2));
  console.log("Done. Screens written to", OUT_DIR);
} finally { await browser.close(); server.close(); }
```

---