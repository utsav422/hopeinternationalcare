'use client';

import type { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { ForwardRefEditor } from './forward-ref-editor';

interface ControlledMDXEditorProps {
  field: ControllerRenderProps<FieldValues, string>;
  status: {
    isDirty: boolean;
    invalid: boolean;
  };
}

export function ControlledMDXEditor({
  field,
  status,
}: ControlledMDXEditorProps) {
  return (
    <div
      className={`rounded-md border ${status.invalid ? 'border-destructive' : 'border-input'} dark:border-gray-700`}
    >
      <ForwardRefEditor
        className="min-h-[150px] rounded-md dark:bg-gray-700 dark:text-white"
        contentEditableClassName="prose prose-sm max-w-none p-4 dark:prose-invert"
        markdown={field.value}
        onChange={field.onChange}
      />
      {status.isDirty && !status.invalid && (
        <p className="mt-1 px-3 pb-2 text-muted-foreground text-xs dark:text-gray-400">
          Content has unsaved changes
        </p>
      )}
    </div>
  );
}
