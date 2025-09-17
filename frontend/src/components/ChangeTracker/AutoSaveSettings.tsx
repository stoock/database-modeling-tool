import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  ClockIcon, 
  XMarkIcon,
  CheckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useAutoSave } from '../../utils/autoSave';

interface AutoSaveSettingsProps {
  onClose?: () => void;
}

const AutoSaveSettings: React.FC<AutoSaveSettingsProps> = ({ onClose }) => {
  const { state, setEnabled, setInterval } = useAutoSave();
  
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabledState] = useState(state.isEnabled);
  const [interval, setIntervalState] = useState(state.interval / 1000); // 초 단위로 표시
  
  // 설정 열기
  const openSettings = () => {
    setIsOpen(true);
    setEnabledState(state.isEnabled);
    setIntervalState(state.interval / 1000);
  };
  
  // 설정 닫기
  const closeSettings = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  
  // 설정 저장
  const saveSettings = () => {
    setEnabled(enabled);
    setInterval(interval * 1000); // 밀리초로 변환
    closeSettings();
  };
  
  return (
    <>
      <button
        onClick={openSettings}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
        자동 저장 설정
      </button>
      
      <Dialog
        open={isOpen}
        onClose={closeSettings}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                자동 저장 설정
              </Dialog.Title>
              <button
                onClick={closeSettings}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="autoSaveEnabled" className="text-sm font-medium text-gray-700">
                  자동 저장 활성화
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="autoSaveEnabled"
                    checked={enabled}
                    onChange={(e) => setEnabledState(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-10 ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform ${
                    enabled ? 'transform translate-x-4 border-blue-600' : 'border-gray-300'
                  }`}></div>
                </div>
              </div>
              
              <div>
                <label htmlFor="autoSaveInterval" className="block text-sm font-medium text-gray-700">
                  자동 저장 간격 (초)
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="range"
                    id="autoSaveInterval"
                    min="5"
                    max="300"
                    step="5"
                    value={interval}
                    onChange={(e) => setIntervalState(parseInt(e.target.value, 10))}
                    disabled={!enabled}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <span className="ml-3 w-12 text-sm text-gray-700">
                    {interval}초
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {interval < 30 ? '짧은 간격은 성능에 영향을 줄 수 있습니다.' : 
                   interval > 120 ? '긴 간격은 데이터 손실 위험이 있습니다.' : 
                   '적절한 간격입니다.'}
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  자동 저장은 변경사항이 있을 때만 작동합니다. 마지막 저장 시간은 화면 상단에 표시됩니다.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveSettings}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                설정 저장
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default AutoSaveSettings;