import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function EnvVarWarning() {
  return (
    <div className="flex items-center gap-4">
      <Badge className="font-normal" variant={'outline'}>
        Supabase environment variables required
      </Badge>
      <div className="flex gap-2">
        <Button
          asChild
          className="pointer-events-none cursor-none opacity-75"
          disabled
          size="sm"
          variant={'outline'}
        >
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button
          asChild
          className="pointer-events-none cursor-none opacity-75"
          disabled
          size="sm"
          variant={'default'}
        >
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    </div>
  );
}
