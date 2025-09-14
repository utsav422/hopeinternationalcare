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
import { useAdminCourseCategoryListAll } from '@/hooks/admin/course-categories';
import {
    ZodCourseCategoryInsertSchema,
    type ZodInsertCourseCategoryType,
} from '@/lib/db/drizzle-zod-schema/course-categories';

interface Props {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSubmit: (data: ZodInsertCourseCategoryType) => void;
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
    } = useAdminCourseCategoryListAll();
    const categories =
        (queryResult?.data as {
            id: string;
            name: string;
            description: string | null;
            created_at: string;
            updated_at: string;
        }[]) ?? [];

    const [showNewCategoryForm, setShowNewCategoryForm] = useState(creationOnly);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
        undefined
    );

    const form = useForm<ZodInsertCourseCategoryType>({
        resolver: zodResolver(ZodCourseCategoryInsertSchema),
        defaultValues: { name: '', description: '' },
    });

    useEffect(() => {
        if (error) {
            toast.error('Error fetching categories', {
                description: error.message,
            });
        }
    }, [error]);

    const handleNewCategorySubmit = (data: ZodInsertCourseCategoryType) => {
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

            <DialogContent >
                <DialogHeader>
                    <DialogTitle >
                        Manage Course Category
                    </DialogTitle>
                </DialogHeader>
                {showNewCategoryForm ? (
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
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                Name
                                            </FormLabel>
                                        </div>{' '}
                                        <div className="space-y-2 md:col-span-3">
                                            <FormControl>
                                                <Input
                                                    {...field}
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
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                Description
                                            </FormLabel>
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <FormControl>
                                                <Textarea
                                                    {...field}
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
                ) : (
                    <div className="space-y-4">
                        <Select onValueChange={setSelectedCategory}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent >
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
                        />
                        <label
                            className="font-medium text-sm leading-none "
                            htmlFor="new-category-checkbox"
                        >
                            Create a new category
                        </label>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant={'destructive'}
                        onClick={() => {
                            form.reset();
                            setIsOpen(false)
                        }}
                        type="submit"
                    >
                        Close
                    </Button>
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
        </Dialog >
    );
}
