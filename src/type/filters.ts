export type TriState = "include" | "exclude" | undefined;

export type TriStateMap = Record<string, TriState>;

export type FiltersState = {
  status: TriStateMap;
  une_id: TriStateMap;
  bandel: TriStateMap;
  driftsomr: TriStateMap;
  une: TriStateMap;
};
