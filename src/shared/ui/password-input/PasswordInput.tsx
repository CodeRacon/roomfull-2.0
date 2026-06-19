"use client";

import ICPwHidden from "@public/icons/general/ic-pw-hidden.svg";
import ICPwVisible from "@public/icons/general/ic-pw-visible.svg";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, useState } from "react";
import { TextInput } from "../text-input";

type PasswordInputProps = ComponentPropsWithoutRef<"input"> & {
	invalid?: boolean;
};

export function PasswordInput({
	disabled,
	invalid = false,
	className,
	...props
}: PasswordInputProps) {
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

	return (
		<div className="relative">
			<TextInput
				className={clsx("pr-10!", className)}
				type={isPasswordVisible ? "text" : "password"}
				disabled={disabled}
				invalid={invalid}
				{...props}
			></TextInput>
			<button
				className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:text-muted disabled:opacity-60"
				type="button"
				disabled={disabled}
				aria-label={
					isPasswordVisible ? "Passwort verbergen" : "Passwort anzeigen"
				}
				onClick={() => setIsPasswordVisible((current) => !current)}
			>
				{isPasswordVisible ? <ICPwVisible /> : <ICPwHidden />}
			</button>
		</div>
	);
}
