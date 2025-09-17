import React, { forwardRef } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import type { ValidationError } from '../../types';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  validationErrors?: ValidationError[];
  onApplySuggestion?: (suggestion: string) => void;
  showValidationIcon?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    validationErrors = [], 
    onApplySuggestion,
    showValidationIcon = true,
    className, 
    ...props 
  }, ref) => {
    const hasValidationErrors = validationErrors.length > 0;
    const hasError = error || hasValidationErrors;
    const isValid = !hasError && props.value && String(props.value).trim().length > 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
              hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              isValid && showValidationIcon ? 'pr-10' : '',
              hasError && showValidationIcon ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          
          {/* 검증 상태 아이콘 */}
          {showValidationIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {hasError ? (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              ) : isValid ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : null}
            </div>
          )}
        </div>

        {/* 일반 에러 메시지 */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {/* 검증 에러 메시지들 */}
        {validationErrors.map((validationError, index) => (
          <div key={index} className="mt-1">
            <p className="text-sm text-red-600 flex items-start">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400 mt-0.5 mr-1 flex-shrink-0" />
              {validationError.message}
            </p>
            
            {/* 제안이 있는 경우 */}
            {validationError.suggestion && onApplySuggestion && (
              <div className="mt-1 ml-5">
                <button
                  type="button"
                  onClick={() => onApplySuggestion(validationError.suggestion!)}
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  <LightBulbIcon className="h-3 w-3 mr-1" />
                  제안: "{validationError.suggestion}" 적용하기
                </button>
              </div>
            )}
          </div>
        ))}

        {/* 도움말 텍스트 */}
        {helperText && !hasError && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;