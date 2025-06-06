export type Gap = {
  start_km: number;
  end_km: number;
  length_km: number;
};

export type TrafikverketResult = {
  id: number;
  une_id: string;
  une: string;
  driftsomr: string;
  bandel: string;
  status: string;
  last_previous_test: string | null;
  planned_date: string | null;
  next_test_date: string | null;
  days_until: number | null;
  deadline: string | null;
  deadline_status: string;
  tested_date: string | null;
  coverage_pct: number;
  tested_length_km: number;
  total_length_km: number;
  km_from: number;
  km_to: number;
  gaps: Gap[];
};
