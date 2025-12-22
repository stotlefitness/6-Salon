import { requireStaffSession } from "@/lib/auth";
import { fetchTodaySummary } from "@/lib/todaySummary";
import TodayClient from "./today/todayClient";

export default async function AdminPage() {
  const staff = await requireStaffSession();
  const summary = await fetchTodaySummary(staff.salonId);

  return <TodayClient initialSummary={summary} salonId={staff.salonId} />;
}

