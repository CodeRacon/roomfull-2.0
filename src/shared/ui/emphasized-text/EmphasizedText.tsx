type EmphasizedTextProps = {
	emphasis: string | null;
	text: string;
};

export function EmphasizedText({ emphasis, text }: EmphasizedTextProps) {
	const emphasisStart = emphasis ? text.indexOf(emphasis) : -1;

	if (!emphasis || emphasisStart === -1) {
		return text;
	}

	const emphasisEnd = emphasisStart + emphasis.length;

	return (
		<>
			{text.slice(0, emphasisStart)}
			<em>{text.slice(emphasisStart, emphasisEnd)}</em>
			{text.slice(emphasisEnd)}
		</>
	);
}
