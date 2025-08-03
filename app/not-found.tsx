import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h2 className="text-2xl">Page Not Found</h2>
      <p>Could not find the requested page.</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
