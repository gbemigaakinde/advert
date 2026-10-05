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
