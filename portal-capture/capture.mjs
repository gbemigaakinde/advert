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
