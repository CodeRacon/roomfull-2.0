import { SignUpForm } from "@/features/auth/sign-up";
import { getSafeNextPath } from "@/shared/lib";

type RegisterPageProps = {
	searchParams?: Promise<{
		next?: string | string[];
	}>;
};

function getNextParam(
	value: string | string[] | undefined,
): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({
	searchParams,
}: RegisterPageProps) {
	const params = await searchParams;
	const nextPath = getSafeNextPath(getNextParam(params?.next));

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
				<SignUpForm nextPath={nextPath} />
			</div>
		</main>
	);
}
