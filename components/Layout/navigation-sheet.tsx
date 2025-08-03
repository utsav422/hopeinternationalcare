import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';

export const NavigationSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild className="bg-transparent">
        <Button
          className="bg-teal-600 text-white dark:bg-teal-900/50 dark:text-black"
          size="icon"
          variant="ghost"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Logo />
        <NavMenu className="mt-12" orientation="vertical" />
      </SheetContent>
    </Sheet>
  );
};
