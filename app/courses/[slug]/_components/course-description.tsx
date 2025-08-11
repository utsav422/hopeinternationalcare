'use client';

import { MDXEditor } from '@mdxeditor/editor';

interface CourseDescriptionProps {
  markdown: string;
}

export function CourseDescription({ markdown }: CourseDescriptionProps) {
  return (
    <div className="prose prose-lg mt-8 max-w-none text-gray-700 dark:text-gray-300">
      <MDXEditor
        className="dark:bg-gray-800 dark:text-gray-200"
        markdown={markdown}
        readOnly
      />
    </div>
  );
}
