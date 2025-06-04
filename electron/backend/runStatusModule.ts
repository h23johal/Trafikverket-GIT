import { exec } from "child_process";

export type RunStatusArgs = {
  uneId: string;
  testedPath: string;
  untestedPath: string;
  planPath: string;
  useExe?: boolean;
};

export type TrafikverketResult = {
  une_id: string;
  coverage_pct: number;
  tested_length_km: number;
  total_length_km: number;
  status: string;
  planned_date: Date | null;
  tested_date: Date | null;
  deadline: Date | null;
  deadline_status: string;
  gaps: {
    start_km: number;
    end_km: number;
    length_km: number;
  }[];
};

const isValidResult = (
  raw: any
): raw is Omit<
  TrafikverketResult,
  "planned_date" | "tested_date" | "deadline"
> & {
  planned_date: string | null;
  tested_date: string | null;
  deadline: string | null;
} => {
  return (
    typeof raw === "object" &&
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
    raw.gaps.every(
      (gap: any) =>
        typeof gap.start_km === "number" &&
        typeof gap.end_km === "number" &&
        typeof gap.length_km === "number"
    )
  );
};

const parseTrafikverketResult = (
  json: ReturnType<typeof JSON.parse>
): TrafikverketResult => {
  const toDate = (d: string | null): Date | null => (d ? new Date(d) : null);

  return {
    ...json,
    planned_date: toDate(json.planned_date),
    tested_date: toDate(json.tested_date),
    deadline: toDate(json.deadline),
  };
};

export function runStatusModule({
  uneId,
  testedPath,
  untestedPath,
  planPath,
  useExe = false,
}: RunStatusArgs): Promise<TrafikverketResult> {
  const script = useExe
    ? "trafikverket_status_module.exe"
    : "trafikverket_status_module.py";

  const cmd = `${
    useExe ? "" : "python "
  } ${script} ${uneId} --tested "${testedPath}" --untested "${untestedPath}" --testplan "${planPath}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr));
        return;
      }

      let parsedJson;
      try {
        parsedJson = JSON.parse(stdout);
      } catch {
        reject(new Error(`Kunde inte parsa JSON: ${stdout}`));
        return;
      }

      if (!isValidResult(parsedJson)) {
        reject(
          new Error(
            "Svar saknar rätt struktur eller innehåller felaktiga typer."
          )
        );
        return;
      }

      const result = parseTrafikverketResult(parsedJson);
      resolve(result);
    });
  });
}
