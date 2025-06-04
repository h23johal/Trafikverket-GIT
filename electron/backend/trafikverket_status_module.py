# Trafikverket Segment Status Script – Clean CLI Version
# Usage: python trafikverket_status_clean.py LDN3A --tested "path/to/tested.xlsx" --untested "path/to/untested.xlsx" --testplan "path/to/testplan.xlsx"

import pandas as pd
import numpy as np
from datetime import datetime
import re

# Globals
tested_df = None
untested_df = None
testplan_df = None

# ----------- Helper Functions -----------

def normalize_une_id(une_id) -> str:
    if not isinstance(une_id, str):
        return ""
    une_id = re.sub(r"[()]", "", une_id)
    une_id = une_id.replace("-", "").replace(" ", "")
    return une_id.strip()

def merge_intervals(intervals):
    if not intervals:
        return []
    sorted_intervals = sorted(intervals, key=lambda x: x[0])
    merged = [sorted_intervals[0]]
    for start, end in sorted_intervals[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged

def clip_to_bounds(intervals, bounds):
    start_bound, end_bound = bounds
    clipped = []
    for a, b in intervals:
        overlap_start = max(a, start_bound)
        overlap_end = min(b, end_bound)
        if overlap_start < overlap_end:
            clipped.append((overlap_start, overlap_end))
    return clipped

def find_gaps_within_bounds(merged_intervals, bounds):
    start_bound, end_bound = bounds
    gaps = []
    if not merged_intervals:
        return [(start_bound, end_bound)]
    if merged_intervals[0][0] > start_bound:
        gaps.append((start_bound, merged_intervals[0][0]))
    for i in range(1, len(merged_intervals)):
        prev_end = merged_intervals[i - 1][1]
        curr_start = merged_intervals[i][0]
        if curr_start > prev_end:
            gaps.append((prev_end, curr_start))
    if merged_intervals[-1][1] < end_bound:
        gaps.append((merged_intervals[-1][1], end_bound))
    return gaps

# ----------- Load & Analyze -----------

def load_data(tested_path, untested_path, testplan_path):
    global tested_df, untested_df, testplan_df
    tested_df = pd.read_excel(tested_path)
    untested_df = pd.read_excel(untested_path)
    testplan_df = pd.read_excel(testplan_path)

    tested_df.columns = tested_df.columns.str.strip()
    untested_df.columns = untested_df.columns.str.strip()
    testplan_df.columns = testplan_df.columns.str.strip()

    testplan_df["UNE_ID_NORM"] = testplan_df["SDMS UNE ID"].apply(normalize_une_id)
    tested_df["UNE_ID_NORM"] = tested_df["SDMS UNA ID"].apply(normalize_une_id)
    untested_df["UNE_ID_NORM"] = untested_df["Report Number"].apply(normalize_une_id)

def get_segment_status(une_id: str) -> dict:
    une_id = normalize_une_id(une_id)

    tested_rows = tested_df[tested_df["UNE_ID_NORM"] == une_id][["KmFrom", "KmTo"]]
    untested_rows = untested_df[untested_df["UNE_ID_NORM"] == une_id][["KmFrom", "KmTo"]]

    tested_intervals = list(tested_rows.itertuples(index=False, name=None))
    untested_intervals = set(untested_rows.itertuples(index=False, name=None))
    valid_intervals = [seg for seg in tested_intervals if seg not in untested_intervals]

    plan_row = testplan_df[testplan_df["UNE_ID_NORM"] == une_id]
    if plan_row.empty:
        return {"une_id": une_id, "error": "UNE ID not found in testplan"}

    row = plan_row.iloc[0]
    bounds = (min(row["KmFrom"], row["KmTo"]), max(row["KmFrom"], row["KmTo"]))
    total_length = row["Lenght"]
    tested_date = row.get("Tested", None)
    planned_date = row.get("Planned 2025", None)
    deadline_date = row.get("Interval, Last date", None)

    clipped = clip_to_bounds(valid_intervals, bounds)
    merged = merge_intervals(clipped)
    tested_length = sum(b - a for a, b in merged)
    coverage_pct = round((tested_length / total_length) * 100, 2) if total_length else 0.0

    if coverage_pct >= 99.9:
        status = "Färdigtestad"
    elif coverage_pct > 0:
        status = "Delvis testad"
    elif pd.notna(planned_date):
        status = "Planerad"
    else:
        status = "Otilldelad"

    deadline_status = "Unknown"
    if pd.notna(deadline_date):
        today = datetime.today().date()
        deadline = pd.to_datetime(deadline_date).date()
        delta_days = (deadline - today).days
        if delta_days < 0:
            deadline_status = "Overdue"
        elif delta_days <= 14:
            deadline_status = "Upcoming"
        else:
            deadline_status = "Safe"

    return {
        "une_id": str(une_id),
        "coverage_pct": float(coverage_pct),
        "tested_length_km": float(round(tested_length, 3)),
        "total_length_km": float(round(total_length, 3)),
        "status": str(status),
        "planned_date": str(planned_date.date()) if pd.notna(planned_date) else None,
        "tested_date": str(tested_date.date()) if pd.notna(tested_date) else None,
        "deadline": str(deadline_date.date()) if pd.notna(deadline_date) else None,
        "deadline_status": str(deadline_status),
        "gaps": [
            {
                "start_km": float(round(a, 3)),
                "end_km": float(round(b, 3)),
                "length_km": float(round(b - a, 3))
            }
            for a, b in find_gaps_within_bounds(merged, bounds)
        ]
    }

# ----------- CLI Wrapper -----------

if __name__ == "__main__":
    import argparse
    import json
    import sys

    parser = argparse.ArgumentParser(description="Get segment status for a given UNE ID")
    parser.add_argument("une_id", type=str, help="Normalized UNE ID (e.g., LDN3A)")
    parser.add_argument("--tested", type=str, required=True, help="Path to Tested_Segment_Report file")
    parser.add_argument("--untested", type=str, required=True, help="Path to Untested_Segment_Report file")
    parser.add_argument("--testplan", type=str, required=True, help="Path to Testplan file")

    args = parser.parse_args()

    try:
        load_data(args.tested, args.untested, args.testplan)
        result = get_segment_status(args.une_id)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)