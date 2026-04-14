/// <reference types="vite/client" />

import type { DanteAPI } from '../preload/index'

declare global {
  interface Window {
    api: DanteAPI
  }
}
