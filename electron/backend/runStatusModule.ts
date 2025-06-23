import { exec } from "child_process";
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from 'electron';

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Flag to determine whether to use the executable or Python script
const USE_EXECUTABLE = false;

const getScriptPath = () => {
  if (app.isPackaged) {
    // In production, the executable will be in the same directory as the app
    return path.join(process.cwd(), "trafikverket_status_module.exe");
  } else {
    // In development, use the executable in the root directory
    return path.join(__dirname, "../../trafikverket_status_module.exe");
  }
};

const getPythonScriptPath = () => {
  if (app.isPackaged) {
    // In production, the script will be in the same directory as the app
    return path.join(process.cwd(), "trafikverket_status_module.py");
  } else {
    // In development, use the script in the backend directory
    return path.join(__dirname, "trafikverket_status_module.py");
  }
};

export type RunStatusArgs = {
  id: number;
  testedPath: string;
  untestedPath: string;
  planPath: string;
  useExe?: boolean;
};

export type TrafikverketRawResult = {
  id: number;
  une: string;
  driftsomr: string;
  une_id: string;
  bandel: number;
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
  TrafikverketRawResult,
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
    typeof raw.une_id_raw === "string" &&
    typeof raw.une === "string" &&
    typeof raw.driftsomr === "string" &&
    typeof raw.bandel === "number" &&
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

const parseTrafikverketResult = (json: ReturnType<typeof JSON.parse>): TrafikverketRawResult => {
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
  useExe = USE_EXECUTABLE,
}: RunStatusArgs): Promise<TrafikverketRawResult> {
  const scriptPath = useExe ? getScriptPath() : getPythonScriptPath();
  console.log("Using script path:", scriptPath);

  const cmd = `${useExe ? '' : 'python'} "${scriptPath}" --all --tested "${testedPath}" --untested "${untestedPath}" --testplan "${planPath}"`;

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
  useExe = USE_EXECUTABLE,
}: Omit<RunStatusArgs, "id">): Promise<TrafikverketRawResult[]> {
  const scriptPath = useExe ? getScriptPath() : getPythonScriptPath();
  console.log("Using script path:", scriptPath);

  const cmd = `${
    useExe ? "" : "python "
  }"${scriptPath}" --all --tested "${testedPath}" --untested "${untestedPath}" --testplan "${planPath}"`;

  const executeWithRetry = async (retries = 3, delay = 1000): Promise<TrafikverketRawResult[]> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await new Promise<TrafikverketRawResult[]>((resolve, reject) => {
          exec(cmd, (err, stdout, stderr) => {
            if (err) {
              console.error(`Attempt ${attempt}/${retries} - Script error:`, err);
              console.error("Script stderr:", stderr);
              return reject(new Error(stderr.trim() || err.message));
            }

            if (!stdout.trim()) {
              return reject(new Error("Script returned empty output"));
            }

            let parsedJson;
            try {
              parsedJson = JSON.parse(stdout);
            } catch (e) {
              console.error("Failed to parse output:", stdout);
              return reject(new Error(`Kunde inte parsa JSON:\n${stdout}`));
            }

            console.log(`Attempt ${attempt}/${retries} - DEBUG RESPONSE:`, parsedJson);

            if (!Array.isArray(parsedJson)) {
              console.error("Output is not an array:", parsedJson);
              return reject(new Error("Svar var inte en array."));
            }

            if (parsedJson.length === 0) {
              console.error("Returned empty array");
              return reject(new Error("Inga resultat hittades."));
            }

            if (!parsedJson.every(isValidResult)) {
              const broken = parsedJson.filter((r: any) => !isValidResult(r));
              console.error("Invalid objects in response:", broken);
              return reject(new Error("Minst ett objekt har ogiltig struktur."));
            }

            const results = parsedJson.map(parseTrafikverketResult);
            console.log(`Attempt ${attempt}/${retries} - Successfully parsed results:`, results.length);
            resolve(results);
          });
        });

        return result;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        console.log(`Attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error("All retry attempts failed");
  };

  return executeWithRetry();
}
