import { exec } from "child_process";
import path from 'path';
import { fileURLToPath } from 'url';

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pythonScriptPath = isDev
  ? path.join(__dirname, 'trafikverket_status_module.py') // <- dev
  : path.join(__dirname, '../../../dist-electron/trafikverket_status_module.py'); //<- build

export type RunStatusArgs = {
  id: number;
  testedPath: string;
  untestedPath: string;
  planPath: string;
  useExe?: boolean;
};

export type TrafikverketResult = {
  id: number;
  une_id: string;
  bandel: string;
  coverage_pct: number;
  tested_length_km: number;
  total_length_km: number;
  status: string;
  planned_date: Date | null;
  tested_date: Date | null;
  last_previous_test: Date | null;
  next_test_date: Date | null;
  days_until: number | null;
  deadline: Date | null;
  deadline_status: string;
  km_from: number;
  km_to: number;
  gaps: {
    start_km: number;
    end_km: number;
    length_km: number;
  }[];
};

const isValidResult = (raw: any): raw is Omit<
  TrafikverketResult,
  "planned_date" | "tested_date" | "deadline" | "last_previous_test" | "next_test_date"
> & {
  planned_date: string | null;
  tested_date: string | null;
  deadline: string | null;
  last_previous_test: string | null;
  next_test_date: string | null;
} => {
  return (
    typeof raw === "object" &&
    typeof raw.id === "number" &&
    typeof raw.une_id === "string" &&
    typeof raw.bandel === "string" &&
    typeof raw.coverage_pct === "number" &&
    typeof raw.tested_length_km === "number" &&
    typeof raw.total_length_km === "number" &&
    typeof raw.km_from === "number" &&
    typeof raw.km_to === "number" &&
    typeof raw.status === "string" &&
    (raw.planned_date === null || typeof raw.planned_date === "string") &&
    (raw.tested_date === null || typeof raw.tested_date === "string") &&
    (raw.last_previous_test === null || typeof raw.last_previous_test === "string") &&
    (raw.next_test_date === null || typeof raw.next_test_date === "string") &&
    (raw.days_until === null || typeof raw.days_until === "number") &&
    (raw.deadline === null || typeof raw.deadline === "string") &&
    typeof raw.deadline_status === "string" &&
    Array.isArray(raw.gaps) &&
    raw.gaps.every(
      (gap: any) =>
        typeof gap.start_km === "number" &&
        typeof gap.end_km === "number" &&
        typeof gap.length_km === "number"
    )
  );
};

const parseTrafikverketResult = (json: ReturnType<typeof JSON.parse>): TrafikverketResult => {
  const toDate = (d: string | null): Date | null => (d ? new Date(d) : null);

  return {
    ...json,
    planned_date: toDate(json.planned_date),
    tested_date: toDate(json.tested_date),
    last_previous_test: toDate(json.last_previous_test),
    next_test_date: toDate(json.next_test_date),
    deadline: toDate(json.deadline),
    days_until: json.days_until,
  };
};

export function runStatusModule({
  id,
  testedPath,
  untestedPath,
  planPath,
  useExe = false,
}: RunStatusArgs): Promise<TrafikverketResult> {
  const script = useExe
    ? "trafikverket_status_module.exe"
    : "trafikverket_status_module.py";

  const cmd = `${useExe ? '' : 'python'} "${pythonScriptPath}" --all --tested "${testedPath}" --untested "${untestedPath}" --testplan "${planPath}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr.trim() || err.message));

      let parsedJson;
      try {
        parsedJson = JSON.parse(stdout);
      } catch {
        return reject(new Error(`Kunde inte parsa JSON:\n${stdout}`));
      }

      if (!isValidResult(parsedJson)) {
        return reject(new Error("Svar saknar rätt struktur eller innehåller felaktiga typer."));
      }

      resolve(parseTrafikverketResult(parsedJson));
    });
  });
}

export function runStatusModuleAll({
  testedPath,
  untestedPath,
  planPath,
  useExe = false,
}: Omit<RunStatusArgs, "uneId">): Promise<TrafikverketResult[]> {
  const script = useExe
    ? "trafikverket_status_module.exe"
    : "trafikverket_status_module.py";

  const cmd = `${
    useExe ? "" : "python "
  }"${pythonScriptPath}" --all --tested "${testedPath}" --untested "${untestedPath}" --testplan "${planPath}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr.trim() || err.message));

      let parsedJson;
      try {
        parsedJson = JSON.parse(stdout);
      } catch {
        return reject(new Error(`Kunde inte parsa JSON:\n${stdout}`));
      }

      console.log("DEBUG RESPONSE FROM PYTHON:", parsedJson);

      if (!Array.isArray(parsedJson)) {
        return reject(new Error("Svar var inte en array."));
      }

      if (!parsedJson.every(isValidResult)) {
        const broken = parsedJson.filter((r: any) => !isValidResult(r));
        console.log("Ogiltiga objekt:", broken);
        return reject(new Error("Minst ett objekt har ogiltig struktur."));
      }

      resolve(parsedJson.map(parseTrafikverketResult));
    });
  });
}
