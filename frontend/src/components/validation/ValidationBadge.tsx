import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ValidationResult } from '@/lib/validation';

interface ValidationBadgeProps {
  result: ValidationResult | null;
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ValidationBadge({ result, className = '', onSuggestionClick }: ValidationBadgeProps) {
  if (!result) {
    return null;
  }

  // 제안 텍스트를 파싱하여 클릭 가능한 옵션들 추출
  const parseSuggestions = (suggestionText: string): string[] => {
    // "예: " 또는 "제안: " 제거
    let cleanText = suggestionText.replace(/^(예|제안):\s*/, '');
    
    // 괄호 안의 설명 제거 (예: "100 (최대 4000)" -> "100")
    cleanText = cleanText.replace(/\s*\([^)]*\)\s*$/, '');
    
    const suggestions: string[] = [];
    
    // "또는"으로 구분된 경우
    if (cleanText.includes(' 또는 ')) {
      const parts = cleanText.split(' 또는 ').map(s => s.trim());
      suggestions.push(...parts);
    }
    // 쉼표로 구분된 경우
    else if (cleanText.includes(',')) {
      const parts = cleanText.split(',').map(s => s.trim());
      suggestions.push(...parts);
    }
    // 단일 제안
    else {
      suggestions.push(cleanText.trim());
    }
    
    return suggestions.filter(s => s.length > 0);
  };

  const suggestions = result.suggestion ? parseSuggestions(result.suggestion) : [];

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
              <div className="text-xs mt-1">
                <span className="text-gray-500">💡 </span>
                {onSuggestionClick && suggestions.length > 0 ? (
                  <span>
                    <span className="text-gray-500">예: </span>
                    {suggestions.map((suggestion, index) => (
                      <span key={index}>
                        <button
                          type="button"
                          onClick={() => onSuggestionClick(suggestion)}
                          className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-medium"
                        >
                          {suggestion}
                        </button>
                        {index < suggestions.length - 1 && (
                          <span className="text-gray-500"> 또는 </span>
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-gray-500">{result.suggestion}</span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
