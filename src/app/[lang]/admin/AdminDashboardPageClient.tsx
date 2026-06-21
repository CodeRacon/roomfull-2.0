"use client";

import { RequireAuth } from "@/features/auth/require-auth";
import type { Dictionary } from "@/shared/i18n";
import { AdminAnalyticsDashboard } from "@/widgets/admin-analytics-dashboard";

type AdminDashboardPageClientProps = {
	copy: Dictionary["adminShell"]["analytics"];
};

export function AdminDashboardPageClient({
	copy,
}: AdminDashboardPageClientProps) {
	return (
		<RequireAuth allowedRoles={["ADMIN"]}>
			<AdminAnalyticsDashboard copy={copy} />
		</RequireAuth>
	);
}
