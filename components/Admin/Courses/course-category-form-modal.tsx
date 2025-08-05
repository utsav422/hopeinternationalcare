'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useGetAllCourseCategories } from '@/hooks/course-categories';
import {
  CategoriesInsertSchema,
  type ZTInsertCourseCategories,
} from '@/utils/db/drizzle-zod-schema/course-categories';
import { toast } from 'sonner';

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
      <DialogContent className="dark:bg-gray-800 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Manage Course Category</DialogTitle>
        </DialogHeader>

        {showNewCategoryForm ? (
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleNewCategorySubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-white">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              id="new-category-checkbox"
              onCheckedChange={() =>
                setShowNewCategoryForm(!showNewCategoryForm)
              }
              className="dark:border-gray-600"
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
            onClick={
              showNewCategoryForm
                ? form.handleSubmit(handleNewCategorySubmit)
                : handleExistingCategorySubmit
            }
            type="submit"
            className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          >
            {showNewCategoryForm ? 'Create' : 'Assign Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
