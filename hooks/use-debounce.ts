import { useCallback, useRef } from 'react';

// Simple debounce hook

export default function useDebounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );

  return debouncedFn;
}

// Example usage:

// 1. Debouncing an input change handler in a React component
/*

function SearchInput() {
    const [value, setValue] = useState("");
    const debouncedSearch = useDebounce((query: string) => {
    }, 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        debouncedSearch(e.target.value);
    };

    return <input value={value} onChange={handleChange} />;
}
*/

// 2. Debouncing a window resize event
/*

function useDebouncedResize(callback: () => void, delay: number) {
    const debouncedCallback = useDebounce(callback, delay);

    useEffect(() => {
        const handler = () => debouncedCallback();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [debouncedCallback]);
}
*/
