import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ValidationResult } from '@/lib/validation';

interface ValidationBadgeProps {
  result: ValidationResult | null;
  className?: string;
}

export function ValidationBadge({ result, className = '' }: ValidationBadgeProps) {
  if (!result) {
    return null;
  }

  return (
    <div className={`flex items-start gap-2 text-sm mt-1 ${className}`}>
      {result.isValid ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="text-green-600">
            <p>{result.message}</p>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-red-600">
            <p>{result.message}</p>
            {result.suggestion && (
              <p className="text-xs text-gray-500 mt-1">{result.suggestion}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
