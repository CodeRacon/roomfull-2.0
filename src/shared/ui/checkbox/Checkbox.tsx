import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type CheckboxProps = Omit<
	ComponentPropsWithoutRef<"input">,
	"className" | "type"
> & {
	className?: string;
	invalid?: boolean;
	label: ReactNode;
};

export function Checkbox({
	className,
	disabled,
	invalid = false,
	label,
	...props
}: CheckboxProps) {
	return (
		<label
			className={clsx(
				"group inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-text",
				disabled && "cursor-not-allowed text-muted",
				className,
			)}
		>
			<input
				type="checkbox"
				disabled={disabled}
				aria-invalid={invalid || undefined}
				className="peer sr-only"
				{...props}
			/>
			<span
				aria-hidden="true"
				className={clsx(
					"grid size-5 shrink-0 place-items-center border-2 bg-background text-on-primary transition-colors",
					"peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
					"peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:opacity-100",
					"peer-disabled:border-primary/20 peer-disabled:bg-surface-muted peer-disabled:opacity-70",
					invalid
						? "border-danger-text bg-danger-bg! peer-focus-visible:outline-danger-text"
						: "border-primary/40 group-hover:border-primary",
				)}
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					className="size-4 opacity-0"
					fill="none"
				>
					<path
						d="m3 8 3 3 7-7"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="square"
					/>
				</svg>
			</span>
			<span>{label}</span>
		</label>
	);
}
