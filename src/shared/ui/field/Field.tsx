import { clsx } from "clsx";
import type { ReactNode } from "react";

type FieldProps = {
	label?: ReactNode;
	helperText?: ReactNode;
	errorText?: ReactNode;
	children: ReactNode;
	className?: string;
	htmlFor?: string;
};

export function Field({
	children,
	label,
	helperText,
	errorText,
	className,
	htmlFor,
}: FieldProps) {
	const fieldClassName = clsx("space-y-2 py-3", className);
	const labelClassName =
		"text-xs font-black uppercase tracking-[0.16em] text-primary";
	const feedbackClassName = "text-xs font-semibold leading-5";

	return (
		<div className={fieldClassName}>
			{label &&
				(htmlFor ? (
					<label htmlFor={htmlFor} className={labelClassName}>
						{label}
					</label>
				) : (
					<div className={labelClassName}>{label}</div>
				))}
			{children}
			{errorText ? (
				<p className={clsx(feedbackClassName, "text-danger-text")}>
					{errorText}
				</p>
			) : (
				helperText && (
					<p className={clsx(feedbackClassName, "text-muted")}>{helperText}</p>
				)
			)}
		</div>
	);
}
