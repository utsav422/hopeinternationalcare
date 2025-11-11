'use client';

import { Trash2 as RemoveIcon } from 'lucide-react';
import {
    createContext,
    type Dispatch,
    forwardRef,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    type DropzoneOptions,
    type DropzoneState,
    type FileRejection,
    useDropzone,
} from 'react-dropzone';
import { toast } from 'sonner';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type DirectionOptions = 'rtl' | 'ltr' | undefined;

type FileUploaderContextType = {
    dropzoneState: DropzoneState;
    isLOF: boolean;
    isFileTooBig: boolean;
    removeFileFromSet: (index: number) => void;
    activeIndex: number;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    orientation: 'horizontal' | 'vertical';
    direction: DirectionOptions;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
    const context = useContext(FileUploaderContext);
    if (!context) {
        throw new Error(
            'useFileUpload must be used within a FileUploaderProvider'
        );
    }
    return context;
};

type FileUploaderProps = {
    value: File[] | null;
    reSelect?: boolean;
    onValueChange: (value: File[] | null) => void;
    dropzoneOptions: DropzoneOptions;
    orientation?: 'horizontal' | 'vertical';
};

export const FileUploader = forwardRef<
    HTMLDivElement,
    FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
    (
        {
            className,
            dropzoneOptions,
            value,
            onValueChange,
            reSelect,
            orientation = 'vertical',
            children,
            dir,
            ...props
        },
        ref
    ) => {
        const [isFileTooBig, setIsFileTooBig] = useState(false);
        const [isLOF, setIsLOF] = useState(false);
        const [activeIndex, setActiveIndex] = useState(-1);
        const {
            accept = {
                'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
            },
            maxFiles = 1,
            maxSize = 4 * 1024 * 1024,
            multiple = true,
        } = dropzoneOptions;
        const opts = dropzoneOptions
            ? dropzoneOptions
            : { accept, maxFiles, maxSize, multiple };

        const reSelectAll = maxFiles === 1 ? true : reSelect;
        const direction: DirectionOptions = dir === 'rtl' ? 'rtl' : 'ltr';
        const onDrop = useCallback(
            (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
                const files = acceptedFiles;

                if (!files) {
                    toast.error('file error , probably too big');
                    return;
                }

                const newValues: File[] = value ? [...value] : [];

                if (reSelectAll) {
                    newValues.splice(0, newValues.length);
                }

                for (const file of files) {
                    if (newValues.length < maxFiles) {
                        newValues.push(file);
                    }
                }

                onValueChange(newValues);

                if (rejectedFiles.length > 0) {
                    for (const rejectedFile of rejectedFiles) {
                        if (rejectedFile.errors[0]?.code === 'file-too-large') {
                            toast.error(
                                `File is too large. Max size is ${
                                    maxSize / 1024 / 1024
                                }MB`
                            );
                            break;
                        }
                        if (rejectedFile.errors[0]?.message) {
                            toast.error(rejectedFile.errors[0].message);
                            break;
                        }
                    }
                }
            },
            [reSelectAll, maxFiles, maxSize, onValueChange, value]
        );
        const dropzoneState = useDropzone({
            ...opts,
            onDrop,
            onDropRejected: () => setIsFileTooBig(true),
            onDropAccepted: () => setIsFileTooBig(false),
        });
        const removeFileFromSet = useCallback(
            (i: number) => {
                if (!value) {
                    return;
                }
                const newFiles = value.filter((_, index) => index !== i);
                onValueChange(newFiles);
            },
            [value, onValueChange]
        );

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();

                if (!value) {
                    return;
                }

                const moveNext = () => {
                    const nextIndex = activeIndex + 1;
                    setActiveIndex(
                        nextIndex > value.length - 1 ? 0 : nextIndex
                    );
                };

                const movePrev = () => {
                    const nextIndex = activeIndex - 1;
                    setActiveIndex(
                        nextIndex < 0 ? value.length - 1 : nextIndex
                    );
                };
                let prevKey = 'ArrowUp';
                if (orientation === 'horizontal') {
                    prevKey = direction === 'ltr' ? 'ArrowLeft' : 'ArrowRight';
                }
                let nextKey = 'ArrowDown';
                if (orientation === 'horizontal') {
                    nextKey = direction === 'ltr' ? 'ArrowRight' : 'ArrowLeft';
                }

                if (e.key === nextKey) {
                    moveNext();
                } else if (e.key === prevKey) {
                    movePrev();
                } else if (e.key === 'Enter' || e.key === 'Space') {
                    if (activeIndex === -1) {
                        dropzoneState.inputRef.current?.click();
                    }
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (activeIndex !== -1) {
                        removeFileFromSet(activeIndex);
                        if (value.length - 1 === 0) {
                            setActiveIndex(-1);
                            return;
                        }
                        movePrev();
                    }
                } else if (e.key === 'Escape') {
                    setActiveIndex(-1);
                }
            },
            [
                value,
                activeIndex,
                direction,
                dropzoneState.inputRef,
                orientation,
                removeFileFromSet,
            ]
        );

        useEffect(() => {
            if (!value) {
                return;
            }
            if (value.length === maxFiles) {
                setIsLOF(true);
                return;
            }
            setIsLOF(false);
        }, [value, maxFiles]);

        return (
            <FileUploaderContext.Provider
                value={{
                    dropzoneState,
                    isLOF,
                    isFileTooBig,
                    removeFileFromSet,
                    activeIndex,
                    setActiveIndex,
                    orientation,
                    direction,
                }}
            >
                <div
                    className={cn(
                        'grid w-full overflow-hidden focus:outline-none ',
                        className,
                        {
                            'gap-2': value && value.length > 0,
                        }
                    )}
                    dir={dir}
                    onKeyDownCapture={handleKeyDown}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            </FileUploaderContext.Provider>
        );
    }
);

FileUploader.displayName = 'FileUploader';

export const FileUploaderContent = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
    const { orientation } = useFileUpload();
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            aria-description="content file holder"
            className={cn('w-full px-1')}
            ref={containerRef}
        >
            <div
                {...props}
                className={cn(
                    'flex gap-1 rounded-xl',
                    orientation === 'horizontal'
                        ? 'flex-raw flex-wrap'
                        : 'flex-col',
                    className
                )}
                ref={ref}
            >
                {children}
            </div>
        </div>
    );
});

FileUploaderContent.displayName = 'FileUploaderContent';

export const FileUploaderItem = forwardRef<
    HTMLDivElement,
    { index: number } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, children, ...props }, ref) => {
    const { removeFileFromSet, activeIndex, direction } = useFileUpload();
    const isSelected = index === activeIndex;
    return (
        <div
            className={cn(
                buttonVariants({ variant: 'ghost' }),
                'relative h-6 cursor-pointer justify-between p-1',
                className,
                isSelected ? 'bg-muted' : ''
            )}
            ref={ref}
            {...props}
        >
            <div className="flex h-full w-full items-center gap-1.5 font-medium leading-none tracking-tight">
                {children}
            </div>
            <button
                className={cn(
                    'absolute',
                    direction === 'rtl' ? 'top-1 left-1' : 'top-1 right-1'
                )}
                onClick={() => removeFileFromSet(index)}
                type="button"
            >
                <span className="sr-only">remove item {index}</span>
                <RemoveIcon className="h-4 w-4 duration-200 ease-in-out hover:stroke-destructive" />
            </button>
        </div>
    );
});

FileUploaderItem.displayName = 'FileUploaderItem';

export const FileInput = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { dropzoneState, isFileTooBig, isLOF } = useFileUpload();
    const rootProps = isLOF ? {} : dropzoneState.getRootProps();
    let borderColorClass = 'border-gray-300';

    if (dropzoneState.isDragAccept) {
        borderColorClass = 'border-green-500';
    } else if (dropzoneState.isDragReject || isFileTooBig) {
        borderColorClass = 'border-red-500';
    }
    return (
        <div
            ref={ref}
            {...props}
            className={`relative w-full ${
                isLOF ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer '
            }`}
        >
            <div
                className={cn(
                    `w-full rounded-lg duration-300 ease-in-out ${borderColorClass}`,
                    className
                )}
                {...rootProps}
            >
                {children}
            </div>
            <Input
                disabled={isLOF}
                ref={dropzoneState.inputRef}
                {...dropzoneState.getInputProps()}
                className={`${isLOF ? 'cursor-not-allowed' : ''}`}
            />
        </div>
    );
});

FileInput.displayName = 'FileInput';
