import { app as o, ipcMain as u, BrowserWindow as b, dialog as J, shell as B } from "electron";
import { createRequire as A } from "node:module";
import { fileURLToPath as F } from "node:url";
import { exec as T } from "child_process";
import y from "path";
import { fileURLToPath as H } from "url";
import c from "node:path";
import j from "node:os";
process.env.VITE_DEV_SERVER_URL;
const U = y.dirname(H(import.meta.url)), I = !0, O = () => o.isPackaged ? y.join(process.cwd(), "trafikverket_status_module.exe") : y.join(U, "../../trafikverket_status_module.exe"), V = () => o.isPackaged ? y.join(process.cwd(), "trafikverket_status_module.py") : y.join(U, "trafikverket_status_module.py"), P = (e) => typeof e == "object" && typeof e.id == "number" && typeof e.une_id == "string" && typeof e.une_id_raw == "string" && typeof e.une == "string" && typeof e.driftsomr == "string" && typeof e.bandel == "string" && typeof e.coverage_pct == "number" && typeof e.tested_length_km == "number" && typeof e.total_length_km == "number" && typeof e.km_from == "number" && typeof e.km_to == "number" && typeof e.status == "string" && (e.planned_date === null || typeof e.planned_date == "string") && (e.tested_date === null || typeof e.tested_date == "string") && (e.last_previous_test === null || typeof e.last_previous_test == "string") && (e.next_test_date === null || typeof e.next_test_date == "string") && (e.days_until === null || typeof e.days_until == "number") && (e.deadline === null || typeof e.deadline == "string") && typeof e.deadline_status == "string" && Array.isArray(e.gaps) && e.gaps.every(
  (t) => typeof t.start_km == "number" && typeof t.end_km == "number" && typeof t.length_km == "number"
), D = (e) => {
  const t = (n) => n ? new Date(n) : null;
  return {
    ...e,
    planned_date: t(e.planned_date),
    tested_date: t(e.tested_date),
    last_previous_test: t(e.last_previous_test),
    next_test_date: t(e.next_test_date),
    deadline: t(e.deadline),
    days_until: e.days_until
  };
};
function K({
  id: e,
  testedPath: t,
  untestedPath: n,
  planPath: p,
  useExe: m = I
}) {
  const w = m ? O() : V();
  console.log("Using script path:", w);
  const k = `${m ? "" : "python"} "${w}" --all --tested "${t}" --untested "${n}" --testplan "${p}"`;
  return new Promise((i, f) => {
    T(k, (a, _, h) => {
      if (a) return f(new Error(h.trim() || a.message));
      let l;
      try {
        l = JSON.parse(_);
      } catch {
        return f(new Error(`Kunde inte parsa JSON:
${_}`));
      }
      if (!P(l))
        return f(new Error("Svar saknar rätt struktur eller innehåller felaktiga typer."));
      i(D(l));
    });
  });
}
function x({
  testedPath: e,
  untestedPath: t,
  planPath: n,
  useExe: p = I
}) {
  const m = p ? O() : V();
  console.log("Using script path:", m);
  const w = `${p ? "" : "python "}"${m}" --all --tested "${e}" --untested "${t}" --testplan "${n}"`;
  return (async (i = 3, f = 1e3) => {
    for (let a = 1; a <= i; a++)
      try {
        return await new Promise((h, l) => {
          T(w, (E, v, R) => {
            if (E)
              return console.error(`Attempt ${a}/${i} - Script error:`, E), console.error("Script stderr:", R), l(new Error(R.trim() || E.message));
            if (!v.trim())
              return l(new Error("Script returned empty output"));
            let d;
            try {
              d = JSON.parse(v);
            } catch {
              return console.error("Failed to parse output:", v), l(new Error(`Kunde inte parsa JSON:
${v}`));
            }
            if (console.log(`Attempt ${a}/${i} - DEBUG RESPONSE:`, d), !Array.isArray(d))
              return console.error("Output is not an array:", d), l(new Error("Svar var inte en array."));
            if (d.length === 0)
              return console.error("Returned empty array"), l(new Error("Inga resultat hittades."));
            if (!d.every(P)) {
              const $ = d.filter((q) => !P(q));
              return console.error("Invalid objects in response:", $), l(new Error("Minst ett objekt har ogiltig struktur."));
            }
            const S = d.map(D);
            console.log(`Attempt ${a}/${i} - Successfully parsed results:`, S.length), h(S);
          });
        });
      } catch (_) {
        if (a === i)
          throw _;
        console.log(`Attempt ${a}/${i} failed, retrying in ${f}ms...`), await new Promise((h) => setTimeout(h, f));
      }
    throw new Error("All retry attempts failed");
  })();
}
const { autoUpdater: s } = A(import.meta.url)("electron-updater");
function z(e) {
  s.autoDownload = !1, s.disableWebInstaller = !1, s.allowDowngrade = !1, s.on("checking-for-update", function() {
  }), s.on("update-available", (t) => {
    e.webContents.send("update-can-available", { update: !0, version: o.getVersion(), newVersion: t == null ? void 0 : t.version });
  }), s.on("update-not-available", (t) => {
    e.webContents.send("update-can-available", { update: !1, version: o.getVersion(), newVersion: t == null ? void 0 : t.version });
  }), u.handle("check-update", async () => {
    if (!o.isPackaged) {
      const t = new Error("The update feature is only available after the package.");
      return { message: t.message, error: t };
    }
    try {
      return await s.checkForUpdatesAndNotify();
    } catch (t) {
      return { message: "Network error", error: t };
    }
  }), u.handle("start-download", (t) => {
    G(
      (n, p) => {
        n ? t.sender.send("update-error", { message: n.message, error: n }) : t.sender.send("download-progress", p);
      },
      () => {
        t.sender.send("update-downloaded");
      }
    );
  }), u.handle("quit-and-install", () => {
    s.quitAndInstall(!1, !0);
  });
}
function G(e, t) {
  s.on("download-progress", (n) => e(null, n)), s.on("error", (n) => e(n, null)), s.on("update-downloaded", t), s.downloadUpdate();
}
A(import.meta.url);
const M = c.dirname(F(import.meta.url));
process.env.APP_ROOT = c.join(M, "../..");
const oe = c.join(process.env.APP_ROOT, "dist-electron"), L = c.join(process.env.APP_ROOT, "dist"), g = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = g ? c.join(process.env.APP_ROOT, "public") : L;
j.release().startsWith("6.1") && o.disableHardwareAcceleration();
process.platform === "win32" && o.setAppUserModelId(o.getName());
o.requestSingleInstanceLock() || (o.quit(), process.exit(0));
let r = null;
const W = c.join(M, "../preload/index.mjs"), C = c.join(L, "index.html");
async function N() {
  r = new b({
    width: 1920,
    height: 1080,
    title: "Main window",
    icon: c.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: W
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    }
  }), g ? (r.loadURL(g), r.webContents.openDevTools()) : r.loadFile(C), r.webContents.on("did-finish-load", () => {
    r == null || r.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), r.webContents.setWindowOpenHandler(({ url: e }) => (e.startsWith("https:") && B.openExternal(e), { action: "deny" })), z(r);
}
o.whenReady().then(N);
o.on("window-all-closed", () => {
  r = null, process.platform !== "darwin" && o.quit();
});
o.on("second-instance", () => {
  r && (r.isMinimized() && r.restore(), r.focus());
});
o.on("activate", () => {
  const e = b.getAllWindows();
  e.length ? e[0].focus() : N();
});
u.handle("open-win", (e, t) => {
  const n = new b({
    webPreferences: {
      preload: W,
      nodeIntegration: !0,
      contextIsolation: !1
    }
  });
  g ? n.loadURL(`${g}#${t}`) : n.loadFile(C, { hash: t });
});
u.handle("open-file-dialog", async (e, t) => {
  const n = await J.showOpenDialog(t);
  return n.canceled ? null : n.filePaths[0];
});
u.handle("get-all-statuses", async (e, t) => {
  console.log("Main process: getAllStatuses called with paths:", t);
  try {
    console.log("Main process: Calling runStatusModuleAll");
    const n = await x({
      testedPath: t.testedPath,
      untestedPath: t.untestedPath,
      planPath: t.planPath
    });
    return console.log("Main process: runStatusModuleAll completed, result length:", n.length), n;
  } catch (n) {
    return console.error("Main process: Error in getAllStatuses:", n), { error: "Failed to get status data" };
  }
});
u.handle("run-status-module", async (e, t) => {
  try {
    return await K(t);
  } catch (n) {
    return { error: n.message };
  }
});
u.handle("run-status-module-all", async (e, t) => {
  try {
    return await x(t);
  } catch (n) {
    return { error: n.message };
  }
});
export {
  oe as MAIN_DIST,
  L as RENDERER_DIST,
  g as VITE_DEV_SERVER_URL
};
