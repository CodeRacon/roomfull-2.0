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
	const fieldClassName = clsx("p-4", className);
	const labelClassName = "text-m font-medium text-text";
	const feedbackClassName = "ml-1 mt-1 text-xs";

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
