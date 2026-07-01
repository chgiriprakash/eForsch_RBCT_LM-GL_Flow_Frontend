declare module "react-quill" {
	import * as React from "react";

	export interface ReactQuillProps {
		theme?: string;
		value?: string;
		onChange?: (value: string) => void;
		readOnly?: boolean;
	}

	const ReactQuill: React.ComponentType<ReactQuillProps>;
	export default ReactQuill;
}
