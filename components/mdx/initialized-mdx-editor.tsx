'use client';

import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CreateLink,
    DiffSourceToggleWrapper,
    headingsPlugin,
    InsertImage,
    InsertTable,
    ListsToggle,
    listsPlugin,
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    markdownShortcutPlugin,
    quotePlugin,
    Separator,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';
import '@mdxeditor/editor/style.css';

export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return (
        <MDXEditor
            {...props}
            className="dark-theme"
            plugins={[
                toolbarPlugin({
                    toolbarClassName: 'flex',
                    toolbarContents: () => (
                        <div className="flex flex-grow dark:bg-gray-700 ">
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <CreateLink />
                            <Separator />
                            <InsertImage />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <InsertTable />
                            <Separator />
                            <DiffSourceToggleWrapper>
                                <UndoRedo />
                            </DiffSourceToggleWrapper>
                        </div>
                    ),
                }),
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
            ]}
            ref={editorRef}
        />
    );
}
