// 雅思模块的 React 状态入口：统一用 useLocalStorage（存储层），
// 非 React 逻辑直接调 storage/*.js。
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import {
  IELTS_KEYS,
  DEFAULT_SETTINGS,
  getWritingProgress,
  recordWritingAttempt,
} from '../storage/ieltsStore.js'

export function useIeltsSettings() {
  return useLocalStorage(IELTS_KEYS.settings, DEFAULT_SETTINGS)
}

export function useIeltsDoc(key, initial) {
  return useLocalStorage(key, initial)
}

export { IELTS_KEYS, getWritingProgress, recordWritingAttempt }
