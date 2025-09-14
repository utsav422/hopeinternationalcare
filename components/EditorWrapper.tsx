"use client";

import {MDXEditor, MDXEditorMethods,} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import React, {Ref} from "react";

interface EditorWrapperProps {
    markdown: string;
    onChange: (markdown: string) => void;
    editorRef?: Ref<MDXEditorMethods> | null;
}

export default function EditorWrapper({
                                          markdown,
                                          onChange,
                                          editorRef,
                                      }: EditorWrapperProps) {
    return (
        <MDXEditor
            ref={editorRef}
            markdown={markdown}
            onChange={onChange}
            plugins={[
                // ... (configure plugins)
            ]}
        />
    );
}
