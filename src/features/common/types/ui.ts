export type ToastType = "success" | "error" | "info";

/** 화면에 표시되는 개별 토스트 */
export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  /** 자동 사라짐(ms). 0 이하이면 자동으로 사라지지 않음 */
  duration: number;
}

/** showToast 호출 시 전달하는 옵션 */
export interface ToastOptions {
  type?: ToastType;
  duration?: number;
}
