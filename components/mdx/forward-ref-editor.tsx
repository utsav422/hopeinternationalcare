// /components/mdx/ForwardRefEditor.tsx
'use client';

import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
import dynamic from 'next/dynamic';
import { forwardRef } from 'react';

const EditorComponent = dynamic(() => import('./initialized-mdx-editor'), {
  ssr: false,
});

export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
  (props, ref) => <EditorComponent {...props} editorRef={ref} />
);

ForwardRefEditor.displayName = 'ForwardRefEditor';
