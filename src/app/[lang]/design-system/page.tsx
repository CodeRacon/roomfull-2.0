import {
	Anchor,
	Badge,
	Button,
	FeedbackBox,
	Field,
	Panel,
	PasswordInput,
	TextInput,
} from "@/shared/ui";

export default function DesignSystemPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<div className="max-w-2xl">
					<h1 className="text-3xl font-semibold tracking-tight text-text">
						Design System v0
					</h1>
					<p className="mt-3 text-sm leading-6 text-muted">
						Shared UI primitives for RoomFull forms, feedback, and operational
						screens.
					</p>
				</div>

				<section className="mt-10 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">Button</h2>
					<div className="mt-5 flex flex-wrap gap-3">
						<Button>Primary</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="danger">Danger</Button>
						<Button disabled>Disabled primary</Button>
						<Button variant="secondary" disabled>
							Disabled secondary
						</Button>
						<Button variant="danger" disabled>
							Disabled danger
						</Button>
					</div>
				</section>

				<section className="mt-10 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">Anchor</h2>
					<div className="mt-5 flex flex-wrap gap-3">
						<Anchor variant="primary" href="/">
							Primary
						</Anchor>
						<Anchor variant="secondary" href="/">
							Secondary
						</Anchor>
					</div>
				</section>

				<section className="mt-6 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">Auth Pages</h2>
					<p className="mt-2 text-sm leading-6 text-muted">
						Test login and register with a safe booking redirect target.
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<Anchor href="/login?next=/bookings/new?unitId=demo-unit">
							Login testen
						</Anchor>
						<Anchor
							variant="secondary"
							href="/register?next=/bookings/new?unitId=demo-unit"
						>
							Register testen
						</Anchor>
					</div>
				</section>

				<section className="mt-6 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">TextInput</h2>
					<div className="mt-5 grid gap-4 sm:grid-cols-3">
						<TextInput placeholder="Normal input" />
						<TextInput invalid placeholder="Invalid input" />
						<TextInput disabled placeholder="Disabled input" />
					</div>
				</section>

				<section className="mt-6 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">PasswordInput</h2>
					<div className="mt-5 grid gap-4 sm:grid-cols-3">
						<PasswordInput placeholder="your password..." />
					</div>
				</section>

				<section className="mt-6 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">Panels & Fields</h2>

					<div className="mt-5 grid gap-12 sm:grid-cols-2">
						<Panel>
							<h3 className="text-sm text-text">Panel</h3>
							<Field label="Some Label" errorText="This is an E R R O R Text">
								<TextInput invalid placeholder="some text..." />
							</Field>
						</Panel>
						<Panel variant="muted" padding="compact">
							<h3 className="text-sm text-text">Panel</h3>
							<Field
								label="Some other Label"
								helperText="This is an H E L P E R Text"
							>
								<TextInput placeholder="some text..." />
							</Field>
						</Panel>
					</div>
				</section>

				<section className="mt-6 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">Badges</h2>

					<div className="mt-5 grid gap-4 sm:grid-cols-4">
						<Badge>Neutral Badge</Badge>
						<Badge variant="success">success Badge</Badge>
						<Badge variant="warning">Neutral Badge</Badge>
						<Badge variant="danger">Neutral Badge</Badge>
					</div>
				</section>

				<section className="mt-6 rounded-md border border-border bg-surface p-6 shadow-xs">
					<h2 className="text-lg font-medium text-text">FeedbackBox</h2>

					<div className="mt-5 grid gap-4 sm:grid-cols-5">
						<FeedbackBox title="This is an Info:">
							This is a text providing more context to the Info
						</FeedbackBox>
						<FeedbackBox variant="empty">Empty State</FeedbackBox>
						<FeedbackBox variant="success">Success</FeedbackBox>
						<FeedbackBox title="This is a warning:" variant="warning">
							This is a text providing more context to the Warning
						</FeedbackBox>
						<FeedbackBox variant="error">Error</FeedbackBox>
					</div>
				</section>
			</div>
		</main>
	);
}
