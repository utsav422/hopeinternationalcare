'use client';

import { MDXEditor, MDXEditorMethods } from '@mdxeditor/editor';
import { FC, forwardRef } from 'react';

interface EditorWrapperProps {
    markdown: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const EditorWrapper: FC<EditorWrapperProps> = forwardRef<
    MDXEditorMethods,
    EditorWrapperProps
>((props, ref) => {
    const { markdown, onChange, placeholder } = props;

    return (
        <MDXEditor
            ref={ref}
            markdown={markdown}
            onChange={onChange}
            placeholder={placeholder}
            plugins={[]}
        />
    );
});

EditorWrapper.displayName = 'EditorWrapper';

export default EditorWrapper;
