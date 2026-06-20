"use client";

import { RequireAuth } from "@/features/auth/require-auth";
import { AdminAnalyticsDashboard } from "@/widgets/admin-analytics-dashboard";

export function AdminDashboardPageClient() {
	return (
		<RequireAuth allowedRoles={["ADMIN"]}>
			<AdminAnalyticsDashboard />
		</RequireAuth>
	);
}
