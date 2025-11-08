import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/**
 * 키보드 단축키 도움말 컴포넌트
 */
export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  // ? 키로 도움말 열기
  useKeyboardShortcuts([
    {
      key: '?',
      shift: true,
      handler: () => setOpen(true),
      description: '키보드 단축키 도움말',
    },
  ]);

  const shortcuts = [
    {
      category: '전역',
      items: [
        { keys: ['Ctrl', 'N'], description: '새 프로젝트 생성' },
        { keys: ['Ctrl', 'E'], description: '스키마 내보내기' },
        { keys: ['Shift', '?'], description: '단축키 도움말' },
        { keys: ['Esc'], description: '다이얼로그 닫기 / 뒤로가기' },
      ],
    },
    {
      category: '네비게이션',
      items: [
        { keys: ['Tab'], description: '다음 요소로 이동' },
        { keys: ['Shift', 'Tab'], description: '이전 요소로 이동' },
        { keys: ['Enter'], description: '선택/실행' },
        { keys: ['Space'], description: '체크박스/버튼 토글' },
      ],
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="키보드 단축키 도움말 (Shift + ?)"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
      >
        <Keyboard className="h-5 w-5" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="sm:max-w-[600px]"
          aria-labelledby="shortcuts-title"
        >
          <DialogHeader>
            <DialogTitle id="shortcuts-title">키보드 단축키</DialogTitle>
            <DialogDescription>
              키보드만으로 애플리케이션을 효율적으로 사용할 수 있습니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm">{item.description}</span>
                      <div className="flex gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>팁:</strong> 언제든지 <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-blue-200 rounded">Shift</kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-blue-200 rounded">?</kbd> 를 눌러 이 도움말을 다시 볼 수 있습니다.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
