import { SignInForm } from "@/features/auth/sign-in";
import { getSafeNextPath } from "@/shared/lib";

type LoginPageProps = {
	searchParams?: Promise<{
		next?: string | string[];
	}>;
};

function getNextParam(
	value: string | string[] | undefined,
): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const params = await searchParams;
	const nextPath = getSafeNextPath(getNextParam(params?.next));

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
				<SignInForm nextPath={nextPath} />
			</div>
		</main>
	);
}
