import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
  value: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  displayText?: boolean;
  onCopied?: () => void;
}

export function CopyButton({
  value,
  size = 'icon',
  variant = 'ghost',
  className = '',
  displayText = false,
  onCopied
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      
      toast({
        title: 'Copied to clipboard',
        description: displayText ? `"${value.substring(0, 20)}${value.length > 20 ? '...' : ''}" copied to clipboard` : 'Value copied to clipboard',
      });
      
      if (onCopied) {
        onCopied();
      }
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={`relative ${className}`}
      type="button"
      aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
      title={isCopied ? 'Copied' : 'Copy to clipboard'}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {displayText && (
        <span className="ml-2">{isCopied ? 'Copied' : 'Copy'}</span>
      )}
    </Button>
  );
}