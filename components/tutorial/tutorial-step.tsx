import { Checkbox } from '../ui/checkbox';

export function TutorialStep({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative">
      <Checkbox
        className={'peer absolute top-[3px] mr-2'}
        id={title}
        name={title}
      />
      <label
        className={
          'relative font-medium text-base text-foreground peer-checked:line-through'
        }
        htmlFor={title}
      >
        <span className="ml-8">{title}</span>
        <div
          className={
            'ml-8 font-normal text-muted-foreground text-sm peer-checked:line-through'
          }
        >
          {children}
        </div>
      </label>
    </li>
  );
}
