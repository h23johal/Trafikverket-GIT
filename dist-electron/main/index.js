import { app, ipcMain, BrowserWindow, dialog, shell } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath as fileURLToPath$1 } from "node:url";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import path$1 from "node:path";
import os from "node:os";
const isDev = !!process.env.VITE_DEV_SERVER_URL;
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const pythonScriptPath = isDev ? path.join(__dirname$1, "trafikverket_status_module.py") : path.join(__dirname$1, "../../../dist-electron/trafikverket_status_module.py");
const isValidResult = (raw) => {
  return typeof raw === "object" && typeof raw.id === "number" && typeof raw.une_id === "string" && typeof raw.une === "string" && typeof raw.driftsomr === "string" && typeof raw.bandel === "string" && typeof raw.coverage_pct === "number" && typeof raw.tested_length_km === "number" && typeof raw.total_length_km === "number" && typeof raw.km_from === "number" && typeof raw.km_to === "number" && typeof raw.status === "string" && (raw.planned_date === null || typeof raw.planned_date === "string") && (raw.tested_date === null || typeof raw.tested_date === "string") && (raw.last_previous_test === null || typeof raw.last_previous_test === "string") && (raw.next_test_date === null || typeof raw.next_test_date === "string") && (raw.days_until === null || typeof raw.days_until === "number") && (raw.deadline === null || typeof raw.deadline === "string") && typeof raw.deadline_status === "string" && Array.isArray(raw.gaps) && raw.gaps.every(
    (gap) => typeof gap.start_km === "number" && typeof gap.end_km === "number" && typeof gap.length_km === "number"
  );
};
const parseTrafikverketResult = (json) => {
  const toDate = (d) => d ? new Date(d) : null;
  return {
    ...json,
    planned_date: toDate(json.planned_date),
    tested_date: toDate(json.tested_date),
    last_previous_test: toDate(json.last_previous_test),
    next_test_date: toDate(json.next_test_date),
    deadline: toDate(json.deadline),
    days_until: json.days_until
  };
};
function runStatusModule({
  id,
  testedPath,
  untestedPath,
  planPath,
  useExe = false
}) {
  const cmd = `${useExe ? "" : "python"} "${pythonScriptPath}" --all --tested "${testedPath}" --untested "${untestedPath}" --testplan "${planPath}"`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr.trim() || err.message));
      let parsedJson;
      try {
        parsedJson = JSON.parse(stdout);
      } catch {
        return reject(new Error(`Kunde inte parsa JSON:
${stdout}`));
      }
      if (!isValidResult(parsedJson)) {
        return reject(new Error("Svar saknar rätt struktur eller innehåller felaktiga typer."));
      }
      resolve(parseTrafikverketResult(parsedJson));
    });
  });
}
function runStatusModuleAll({
  testedPath,
  untestedPath,
  planPath,
  useExe = false
}) {
  const cmd = `${useExe ? "" : "python "}"${pythonScriptPath}" --all --tested "${testedPath}" --untested "${untestedPath}" --testplan "${planPath}"`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr.trim() || err.message));
      let parsedJson;
      try {
        parsedJson = JSON.parse(stdout);
      } catch {
        return reject(new Error(`Kunde inte parsa JSON:
${stdout}`));
      }
      console.log("DEBUG RESPONSE FROM PYTHON:", parsedJson);
      if (!Array.isArray(parsedJson)) {
        return reject(new Error("Svar var inte en array."));
      }
      if (!parsedJson.every(isValidResult)) {
        const broken = parsedJson.filter((r) => !isValidResult(r));
        console.log("Ogiltiga objekt:", broken);
        return reject(new Error("Minst ett objekt har ogiltig struktur."));
      }
      resolve(parsedJson.map(parseTrafikverketResult));
    });
  });
}
const { autoUpdater } = createRequire(import.meta.url)("electron-updater");
function update(win2) {
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.on("checking-for-update", function() {
  });
  autoUpdater.on("update-available", (arg) => {
    win2.webContents.send("update-can-available", { update: true, version: app.getVersion(), newVersion: arg == null ? void 0 : arg.version });
  });
  autoUpdater.on("update-not-available", (arg) => {
    win2.webContents.send("update-can-available", { update: false, version: app.getVersion(), newVersion: arg == null ? void 0 : arg.version });
  });
  ipcMain.handle("check-update", async () => {
    if (!app.isPackaged) {
      const error = new Error("The update feature is only available after the package.");
      return { message: error.message, error };
    }
    try {
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      return { message: "Network error", error };
    }
  });
  ipcMain.handle("start-download", (event) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          event.sender.send("update-error", { message: error.message, error });
        } else {
          event.sender.send("download-progress", progressInfo);
        }
      },
      () => {
        event.sender.send("update-downloaded");
      }
    );
  });
  ipcMain.handle("quit-and-install", () => {
    autoUpdater.quitAndInstall(false, true);
  });
}
function startDownload(callback, complete) {
  autoUpdater.on("download-progress", (info) => callback(null, info));
  autoUpdater.on("error", (error) => callback(error, null));
  autoUpdater.on("update-downloaded", complete);
  autoUpdater.downloadUpdate();
}
createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath$1(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "../..");
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();
if (process.platform === "win32") app.setAppUserModelId(app.getName());
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
let win = null;
const preload = path$1.join(__dirname, "../preload/index.mjs");
const indexHtml = path$1.join(RENDERER_DIST, "index.html");
async function createWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: "Main window",
    icon: path$1.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  update(win);
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});
app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
ipcMain.handle("open-file-dialog", async (_, options) => {
  const result = await dialog.showOpenDialog(options);
  return result.canceled ? null : result.filePaths[0];
});
ipcMain.handle("get-all-statuses", async (_event, paths) => {
  const results = await runStatusModuleAll(paths);
  return results;
});
ipcMain.handle("run-status-module", async (event, args) => {
  try {
    const result = await runStatusModule(args);
    return result;
  } catch (err) {
    return { error: err.message };
  }
});
ipcMain.handle("run-status-module-all", async (event, args) => {
  try {
    const result = await runStatusModuleAll(args);
    return result;
  } catch (err) {
    return { error: err.message };
  }
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
//# sourceMappingURL=index.js.map
