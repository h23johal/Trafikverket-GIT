import { TrafikverketResult } from "@/type/trafikverket";

export const isOverdue = (row: TrafikverketResult): boolean => {
  // Only check if status is "Planerad" (planned but not tested)
  if (row.status !== "Planerad") {
    return false;
  }
  
  // Check if planned_date exists
  if (!row.planned_date) {
    return false;
  }
  
  const today = new Date();
  const plannedDate = new Date(row.planned_date);
  
  // Calculate days since planned date
  const daysDifference = Math.floor((today.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Return true if more than 5 days have passed since planned date
  return daysDifference > 5;
};