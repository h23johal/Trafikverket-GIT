export type Gap = {
  start_km: number;
  end_km: number;
  length_km: number;
};

export type TrafikverketResult = {
  id: string;
  une_id: string;
  une_id_raw: string;
  status: string;
  deadline_status: string;
  days_until: number | null;
  deadline: string | null;
  tested_date: string | null;
  last_previous_test: string | null;
  planned_date: string | null;
  next_test_date: string | null;
  km_from: number;
  km_to: number;
  total_length_km: number;
  bandel: string;
  driftsomr: string;
  une: string;
  coverage_pct: number;
  tested_length_km: number;
  gaps: Gap[];
};
