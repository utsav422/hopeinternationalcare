'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetAllCourseCategories } from '@/hooks/admin/course-categories';
import {
  CategoriesInsertSchema,
  type ZTInsertCourseCategories,
} from '@/utils/db/drizzle-zod-schema/course-categories';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: ZTInsertCourseCategories) => void;
  onCategorySelect?: (categoryId: string) => void;
  creationOnly?: boolean;
}

export default function CourseCategoryFormModal({
  isOpen,
  setIsOpen,
  onSubmit,
  onCategorySelect,
  creationOnly = false,
}: Props) {
  const {
    data: queryResult,
    isLoading: isLoadingCategories,
    error,
  } = useGetAllCourseCategories();
  const categories = queryResult?.data ?? null;

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(creationOnly);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const form = useForm<ZTInsertCourseCategories>({
    resolver: zodResolver(CategoriesInsertSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (error) {
      toast.error('Error fetching categories', {
        description: error.message,
      });
    }
  }, [error]);

  const handleNewCategorySubmit = (data: ZTInsertCourseCategories) => {
    onSubmit(data);
    form.reset();
    setIsOpen(false);
  };

  const handleExistingCategorySubmit = () => {
    if (selectedCategory && onCategorySelect) {
      onCategorySelect(selectedCategory);
      setIsOpen(false);
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="dark:border-gray-600 dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Manage Course Category
          </DialogTitle>
        </DialogHeader>

        {showNewCategoryForm ? (
          <div className="grid grid-cols-12 gap-4">
            <Form {...form}>
              <form
                className="w-full space-y-6"
                onSubmit={form.handleSubmit(handleNewCategorySubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                      <div className="space-y-1 md:col-span-1">
                        <FormLabel className="dark:text-gray-200">
                          Name
                        </FormLabel>
                      </div>{' '}
                      <div className="space-y-2 md:col-span-3">
                        <FormControl>
                          <Input
                            {...field}
                            className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                      <div className="space-y-1 md:col-span-1">
                        <FormLabel className="dark:text-gray-200">
                          Description
                        </FormLabel>
                      </div>
                      <div className="space-y-2 md:col-span-3">
                        <FormControl>
                          <Textarea
                            {...field}
                            className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        ) : (
          <div className="space-y-4">
            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger className="dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-white">
                {isLoadingCategories ? (
                  <Loader className="animate-spin" />
                ) : (
                  categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {!creationOnly && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={showNewCategoryForm}
              className="dark:border-gray-600"
              id="new-category-checkbox"
              onCheckedChange={() =>
                setShowNewCategoryForm(!showNewCategoryForm)
              }
            />
            <label
              className="font-medium text-sm leading-none dark:text-white"
              htmlFor="new-category-checkbox"
            >
              Create a new category
            </label>
          </div>
        )}

        <DialogFooter>
          <Button
            className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            onClick={
              showNewCategoryForm
                ? form.handleSubmit(handleNewCategorySubmit)
                : handleExistingCategorySubmit
            }
            type="submit"
          >
            {showNewCategoryForm ? 'Create' : 'Assign Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
