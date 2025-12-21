import { requireStaffContext } from "@/lib/auth";
import { fetchTodaySummary } from "@/lib/todaySummary";
import TodayClient from "./todayClient";

export default async function TodayPage() {
  const staff = await requireStaffContext();
  const summary = await fetchTodaySummary(staff.salonId);

  return <TodayClient initialSummary={summary} salonId={staff.salonId} />;
}

