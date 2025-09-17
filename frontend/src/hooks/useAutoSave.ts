import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

/**
 * 자동 저장 기능을 제공하는 훅
 */
export const useAutoSave = <T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  delay: number = 2000,
  enabled: boolean = true
) => {
  const debouncedData = useDebounce(data, delay);
  const initialRender = useRef(true);
  const lastSavedData = useRef<T>(data);

  useEffect(() => {
    // 첫 렌더링에서는 저장하지 않음
    if (initialRender.current) {
      initialRender.current = false;
      lastSavedData.current = debouncedData;
      return;
    }

    // 자동 저장이 비활성화되어 있으면 저장하지 않음
    if (!enabled) {
      return;
    }

    // 데이터가 변경되지 않았으면 저장하지 않음
    if (JSON.stringify(debouncedData) === JSON.stringify(lastSavedData.current)) {
      return;
    }

    // 자동 저장 실행
    const save = async () => {
      try {
        await saveFunction(debouncedData);
        lastSavedData.current = debouncedData;
      } catch (error) {
        console.error('Auto save failed:', error);
      }
    };

    save();
  }, [debouncedData, saveFunction, enabled]);
};

export default useAutoSave;