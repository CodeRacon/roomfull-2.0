"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { clsx } from "clsx";

const EMPTY_OPTION_VALUE = "__roomfull-empty-select-option__";

export type SelectOption = {
	disabled?: boolean;
	label: string;
	value: string;
};

type SelectProps = {
	className?: string;
	disabled?: boolean;
	id?: string;
	invalid?: boolean;
	name?: string;
	onValueChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	value: string;
};

export function Select({
	className,
	disabled = false,
	id,
	invalid = false,
	name,
	onValueChange,
	options,
	placeholder,
	value,
}: SelectProps) {
	const hasEmptyOption = options.some((option) => option.value === "");
	const radixValue =
		value === "" && hasEmptyOption ? EMPTY_OPTION_VALUE : value || undefined;

	return (
		<SelectPrimitive.Root
			disabled={disabled}
			name={name}
			value={radixValue}
			onValueChange={(nextValue) =>
				onValueChange(nextValue === EMPTY_OPTION_VALUE ? "" : nextValue)
			}
		>
			<SelectPrimitive.Trigger
				id={id}
				aria-invalid={invalid || undefined}
				className={clsx(
					"flex min-h-11 w-full items-center justify-between gap-3 border-2 bg-background px-3 py-2 text-left text-sm font-semibold text-text transition-colors",
					"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
					"data-[placeholder]:text-muted",
					!invalid &&
						"border-primary/40 hover:border-primary disabled:border-primary/20 disabled:hover:border-primary/20",
					invalid &&
						"border-danger-text bg-danger-bg! text-danger-text focus-visible:outline-danger-text",
					"disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted disabled:opacity-70",
					className,
				)}
			>
				<SelectPrimitive.Value placeholder={placeholder} />
				<SelectPrimitive.Icon aria-hidden="true" className="text-primary">
					<svg
						aria-hidden="true"
						viewBox="0 0 16 16"
						className="size-4"
						fill="none"
					>
						<path
							d="m3 6 5 5 5-5"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="square"
						/>
					</svg>
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					position="popper"
					sideOffset={4}
					className="z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden border-2 border-primary bg-background text-text shadow-lg"
				>
					<SelectPrimitive.Viewport className="p-1">
						{options.map((option) => {
							const optionValue =
								option.value === "" ? EMPTY_OPTION_VALUE : option.value;

							return (
								<SelectPrimitive.Item
									key={optionValue}
									value={optionValue}
									disabled={option.disabled}
									className="relative flex min-h-10 cursor-default select-none items-center py-2 pr-9 pl-3 text-sm font-semibold outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-primary data-highlighted:text-on-primary"
								>
									<SelectPrimitive.ItemText>
										{option.label}
									</SelectPrimitive.ItemText>
									<SelectPrimitive.ItemIndicator className="absolute right-3 font-black">
										<span aria-hidden="true">✓</span>
									</SelectPrimitive.ItemIndicator>
								</SelectPrimitive.Item>
							);
						})}
					</SelectPrimitive.Viewport>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
