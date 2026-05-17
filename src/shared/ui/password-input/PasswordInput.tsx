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
				className="absolute right-4 top-3 cursor-pointer"
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
