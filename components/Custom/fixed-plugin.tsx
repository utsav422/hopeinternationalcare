'use client';
import Image from 'next/image';
import { Button } from '../ui/button';

export function FixedPlugin() {
    return (
        <a
            href="https://www.facebook.com/messages/t/263095650220568"
            rel="noopener"
            target="_blank"
        >
            <Button className="fixed right-4 bottom-4 flex items-center gap-1 rounded-lg border border-blue-gray-50 bg-white px-3 py-2 text-gray-900 text-sm shadow-md transition-colors hover:bg-gray-50  dark:hover:bg-gray-700">
                <Image
                    alt="Messenger"
                    className="h-5 w-5"
                    height={128}
                    src="/image/messenger.png"
                    width={128}
                />
                Chat with us
            </Button>
        </a>
    );
}
