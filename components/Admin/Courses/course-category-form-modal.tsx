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
import { adminGetAllCatogies } from '@/server-actions/admin/courses-categories';
import {
  CategoriesInsertSchema,
  type ZTInsertCourseCategories,
  type ZTSelectCourseCategories,
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
  const [categories, setCategories] = useState<
    ZTSelectCourseCategories[] | null
  >(null);

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(creationOnly);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const form = useForm<ZTInsertCourseCategories>({
    resolver: zodResolver(CategoriesInsertSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await adminGetAllCatogies();
      setCategories(data);
    };
    fetchCategories();
  }, []);

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
  const isLoadingCategoris = categories === null;
  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Course Category</DialogTitle>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} />
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
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                )) ?? <Loader className="animate-spin" />}
                {isLoadingCategoris && <Loader className="animate-spin" />}
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
            />
            <label
              className="font-medium text-sm leading-none"
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
          >
            {showNewCategoryForm ? 'Create' : 'Assign Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
