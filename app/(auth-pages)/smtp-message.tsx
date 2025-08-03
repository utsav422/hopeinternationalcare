import { ArrowUpRight, InfoIcon } from 'lucide-react';
import Link from 'next/link';

export function SmtpMessage() {
  return (
    <div className="flex gap-4 rounded-md border bg-muted/50 px-5 py-3">
      <InfoIcon className="mt-0.5" size={16} />
      <div className="flex flex-col gap-1">
        <small className="text-secondary-foreground text-sm">
          <strong> Note:</strong> Emails are rate limited. Enable Custom SMTP to
          increase the rate limit.
        </small>
        <div>
          <Link
            className="flex items-center gap-1 text-primary/50 text-sm hover:text-primary"
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
          >
            Learn more <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
