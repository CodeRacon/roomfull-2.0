import { DemoLoginButton } from "@/features/auth/demo-login";
import { SignInForm } from "@/features/auth/sign-in";
import { getDictionary, isLocale } from "@/shared/i18n";
import { appRoutes, getSafeLocalizedNextPath } from "@/shared/routing";

type LoginPageProps = {
	params: Promise<{ lang: string }>;
	searchParams?: Promise<{
		next?: string | string[];
	}>;
};

function getNextParam(
	value: string | string[] | undefined,
): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
	params,
	searchParams,
}: LoginPageProps) {
	const { lang } = await params;
	const locale = isLocale(lang) ? lang : "de";
	const [dictionary, query] = await Promise.all([
		getDictionary(locale),
		searchParams,
	]);
	const nextPath = getSafeLocalizedNextPath(
		getNextParam(query?.next),
		locale,
		appRoutes.home(locale),
	);

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center gap-5">
				<SignInForm
					copy={dictionary.auth.signIn}
					locale={locale}
					nextPath={nextPath}
				/>
				<DemoLoginButton copy={dictionary.auth.demoLogin} locale={locale} />
			</div>
		</main>
	);
}
