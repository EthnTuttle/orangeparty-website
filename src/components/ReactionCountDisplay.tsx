import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useReactions } from '@/hooks/useReactions';

interface ReactionCountDisplayProps {
  eventId: string;
  className?: string;
  size?: 'sm' | 'normal';
}

export function ReactionCountDisplay({ eventId, className = '', size = 'normal' }: ReactionCountDisplayProps) {
  const { data: reactions, isLoading } = useReactions(eventId);

  const isSmall = size === 'sm';
  const buttonClass = isSmall
    ? "h-6 px-1"
    : "h-8 px-2";
  const iconClass = isSmall
    ? "h-3 w-3"
    : "h-4 w-4";
  const textClass = isSmall
    ? "text-xs"
    : "text-sm";

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button variant="ghost" size="sm" className={`${buttonClass} hover:bg-green-100 dark:hover:bg-green-900`} disabled>
          <ArrowUp className={iconClass} />
        </Button>
        <span className={`${textClass} font-medium text-gray-400 min-w-[2rem] text-center`}>
          0
        </span>
        <Button variant="ghost" size="sm" className={`${buttonClass} hover:bg-red-100 dark:hover:bg-red-900`} disabled>
          <ArrowDown className={iconClass} />
        </Button>
      </div>
    );
  }

  const { upvotes = 0, downvotes = 0 } = reactions || {};
  const netScore = upvotes - downvotes;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button variant="ghost" size="sm" className={`${buttonClass} hover:bg-green-100 dark:hover:bg-green-900`}>
        <ArrowUp className={iconClass} />
      </Button>
      <span
        className={`${textClass} font-medium min-w-[2rem] text-center ${
          netScore > 0
            ? 'text-green-600 dark:text-green-400'
            : netScore < 0
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {netScore}
      </span>
      <Button variant="ghost" size="sm" className={`${buttonClass} hover:bg-red-100 dark:hover:bg-red-900`}>
        <ArrowDown className={iconClass} />
      </Button>
    </div>
  );
}