"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStatusModule = runStatusModule;
var child_process_1 = require("child_process");
function isValidResult(raw) {
    return (typeof raw === "object" &&
        typeof raw.une_id === "string" &&
        typeof raw.coverage_pct === "number" &&
        typeof raw.tested_length_km === "number" &&
        typeof raw.total_length_km === "number" &&
        typeof raw.status === "string" &&
        (raw.planned_date === null || typeof raw.planned_date === "string") &&
        (raw.tested_date === null || typeof raw.tested_date === "string") &&
        (raw.deadline === null || typeof raw.deadline === "string") &&
        typeof raw.deadline_status === "string" &&
        Array.isArray(raw.gaps) &&
        raw.gaps.every(function (gap) {
            return typeof gap.start_km === "number" &&
                typeof gap.end_km === "number" &&
                typeof gap.length_km === "number";
        }));
}
function parseTrafikverketResult(json) {
    var toDate = function (d) { return (d ? new Date(d) : null); };
    return __assign(__assign({}, json), { planned_date: toDate(json.planned_date), tested_date: toDate(json.tested_date), deadline: toDate(json.deadline) });
}
function runStatusModule(_a) {
    var uneId = _a.uneId, testedPath = _a.testedPath, untestedPath = _a.untestedPath, planPath = _a.planPath, _b = _a.useExe, useExe = _b === void 0 ? false : _b;
    var script = useExe
        ? "trafikverket_status_module.exe"
        : "trafikverket_status_module.py";
    var cmd = "".concat(useExe ? "" : "python ", " ").concat(script, " ").concat(uneId, " --tested \"").concat(testedPath, "\" --untested \"").concat(untestedPath, "\" --testplan \"").concat(planPath, "\"");
    return new Promise(function (resolve, reject) {
        (0, child_process_1.exec)(cmd, function (err, stdout, stderr) {
            if (err) {
                reject(new Error(stderr));
                return;
            }
            var parsedJson;
            try {
                parsedJson = JSON.parse(stdout);
            }
            catch (_a) {
                reject(new Error("Kunde inte parsa JSON: ".concat(stdout)));
                return;
            }
            if (!isValidResult(parsedJson)) {
                reject(new Error("Svar saknar rätt struktur eller innehåller felaktiga typer."));
                return;
            }
            var result = parseTrafikverketResult(parsedJson);
            resolve(result);
        });
    });
}
