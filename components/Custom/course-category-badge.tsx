'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { toast } from 'sonner';
import { useGetCourseCategoryById } from '@/hooks/admin/course-categories';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

const badgeVariants = cva(
  'inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'rounded-full border border-transparent bg-primary px-2.5 py-0.5 font-semibold text-primary-foreground text-xs hover:bg-primary/80',
        secondary:
          'rounded-full border border-transparent bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground text-xs hover:bg-secondary/80',
        destructive:
          'rounded-full border border-transparent bg-destructive px-2.5 py-0.5 font-semibold text-destructive-foreground text-xs hover:bg-destructive/80',
        outline:
          'rounded-full border px-2.5 py-0.5 font-semibold text-foreground text-xs',
        ghost:
          'rounded-md px-2 py-1 font-semibold text-xs hover:bg-accent hover:text-accent-foreground',
        link: 'font-semibold text-primary text-xs underline-offset-4 hover:underline',
        card: 'flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface CourseCategoryBadgeProps extends React.HTMLAttributes<HTMLElement> {
  categoryId: string;
  variant?: VariantProps<typeof badgeVariants>['variant'];
  as?: 'div' | 'button' | 'a' | 'span';
  href?: string;
  showDescription?: boolean;
}

const CourseCategoryBadge = ({
  categoryId,
  variant,
  className,
  as = 'div',
  href,
  showDescription,
  ...props
}: CourseCategoryBadgeProps) => {
  //   const [category, setCategory] = useState<ZTSelectCourseCategories | null>(
  //     null
  //   );
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState<string | null>(null);
  const {
    data: queryResult,
    error,
    isLoading,
  } = useGetCourseCategoryById(categoryId);
  const category = queryResult?.data;
  //   useEffect(() => {
  //     if (!categoryId) {
  //       setLoading(false);
  //       return;
  //     }

  //     const fetchCategory = async () => {
  //       setLoading(true);
  //       try {
  //         const result = await adminGetCourseCategoriesById(categoryId);
  //         if (result.success) {
  //           setCategory(result.data);
  //         } else {
  //           setError('Category not found.');
  //         }
  //       } catch {
  //         setError('Failed to fetch category.');
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchCategory();
  //   }, [categoryId]);

  if (isLoading) {
    return <Skeleton className="h-6 w-24 dark:bg-gray-700" />;
  }
  if (error) {
    toast.error('Something went wrong while fetching categories', {
      description: error.message,
    });
  }

  if (!category) {
    return (
      <span className="text-gray-500 text-xs dark:text-gray-400">N/A</span>
    );
  }

  const content = (
    <>
      <span className="font-bold dark:text-white">{category.name}</span>
      {showDescription && category.description && (
        <p className="text-muted-foreground text-sm dark:text-gray-400">
          {category.description}
        </p>
      )}
    </>
  );

  const commonProps = {
    className: cn(
      badgeVariants({ variant }),
      className,
      'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
    ),
    ...props,
  };

  if (as === 'a') {
    return (
      <Link href={href || '#'} {...commonProps}>
        {content}
      </Link>
    );
  }

  if (as === 'button') {
    return (
      <button type="button" {...commonProps}>
        {content}
      </button>
    );
  }

  if (as === 'span') {
    return <span {...commonProps}>{content}</span>;
  }

  return <div {...commonProps}>{content}</div>;
};

export { CourseCategoryBadge, badgeVariants };
