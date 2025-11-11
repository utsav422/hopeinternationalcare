'use client';
import React from 'react';

function PageScrolling({
    children,
}: {
    children: (props: { isScrolling: boolean }) => React.ReactNode;
}) {
    const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
    React.useEffect(() => {
        function handleScroll() {
            if (window.scrollY > 0) {
                setIsScrolling(true);
            } else {
                setIsScrolling(false);
            }
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <div className={isScrolling ? 'dark:bg-gray-900 dark:shadow-lg' : ''}>
            {children({ isScrolling })}
        </div>
    );
}

export default PageScrolling;
