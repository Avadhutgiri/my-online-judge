import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const CodeEditorWindow = ({ onChange, language, code, theme }) => {
    const [value, setValue] = useState(code || "");

    useEffect(() => {
        setValue(code || "");
    }, [code]);

    const handleEditorChange = (value) => {
        setValue(value);
        onChange("code", value);
    };

    return (
        <div className="font-mono rounded-md overflow-hidden shadow-lg h-[63vh] w-full">
            <Editor
                height="100%"
                width="100%"
                language={language || "javascript"}
                value={value}
                theme={theme}
                defaultValue="// some comment"
                onChange={handleEditorChange}
            />
        </div>
    );
};

export default CodeEditorWindow;
