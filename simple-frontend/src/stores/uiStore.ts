/**
 * UI 상태 관리 스토어
 */

import { create } from 'zustand';

type ModalType =
  | 'projectForm'
  | 'tableForm'
  | 'columnForm'
  | 'indexForm'
  | 'exportDialog'
  | 'validationResults';

interface UIStore {
  // 모달 상태
  modals: Record<ModalType, boolean>;

  // 모달 액션
  openModal: (modal: ModalType) => void;
  closeModal: (modal: ModalType) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // 초기 상태
  modals: {
    projectForm: false,
    tableForm: false,
    columnForm: false,
    indexForm: false,
    exportDialog: false,
    validationResults: false,
  },

  // 모달 열기
  openModal: (modal: ModalType) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    })),

  // 모달 닫기
  closeModal: (modal: ModalType) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    })),

  // 모든 모달 닫기
  closeAllModals: () =>
    set({
      modals: {
        projectForm: false,
        tableForm: false,
        columnForm: false,
        indexForm: false,
        exportDialog: false,
        validationResults: false,
      },
    }),
}));
