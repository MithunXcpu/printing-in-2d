import { contextBridge, ipcRenderer } from 'electron'

const api = {
  platform: process.platform,

  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  store: {
    getApiKey: (service: string) => ipcRenderer.invoke('store:getApiKey', service),
    setApiKey: (service: string, key: string) =>
      ipcRenderer.invoke('store:setApiKey', service, key),
    deleteApiKey: (service: string) => ipcRenderer.invoke('store:deleteApiKey', service),
    hasApiKeys: () => ipcRenderer.invoke('store:hasApiKeys'),
  },

  db: {
    query: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:query', sql, params),
    run: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:run', sql, params),
  },

  conversation: {
    startSession: () => ipcRenderer.invoke('conversation:start'),
    sendAudio: (buffer: ArrayBuffer) => ipcRenderer.invoke('conversation:audio', buffer),
    stopSession: () => ipcRenderer.invoke('conversation:stop'),
    sendText: (text: string) => ipcRenderer.invoke('conversation:sendText', text),
    functionResult: (callId: string, result: string) =>
      ipcRenderer.invoke('conversation:functionResult', callId, result),
    onTranscript: (callback: (data: unknown) => void) => {
      const handler = (_event: unknown, data: unknown) => callback(data)
      ipcRenderer.on('conversation:transcript', handler)
      return () => ipcRenderer.removeListener('conversation:transcript', handler)
    },
    onResponse: (callback: (data: unknown) => void) => {
      const handler = (_event: unknown, data: unknown) => callback(data)
      ipcRenderer.on('conversation:response', handler)
      return () => ipcRenderer.removeListener('conversation:response', handler)
    },
    onFunctionCall: (callback: (data: unknown) => void) => {
      const handler = (_event: unknown, data: unknown) => callback(data)
      ipcRenderer.on('conversation:functionCall', handler)
      return () => ipcRenderer.removeListener('conversation:functionCall', handler)
    },
  },

  toolGen: {
    recommend: (profile: unknown) => ipcRenderer.invoke('tool:recommend', profile),
    generate: (config: unknown) => ipcRenderer.invoke('tool:generate', config),
    customize: (request: string) => ipcRenderer.invoke('tool:customize', request),
  },

  dataIngest: {
    openFilePicker: () => ipcRenderer.invoke('data:openFilePicker'),
    parseFile: (filePath: string) => ipcRenderer.invoke('data:parseFile', filePath),
    inferSchema: (filePath: string) => ipcRenderer.invoke('data:inferSchema', filePath),
  },

  theme: {
    get: () => ipcRenderer.invoke('theme:get'),
    set: (theme: 'light' | 'dark' | 'system') => ipcRenderer.invoke('theme:set', theme),
  },

  ollama: {
    checkConnection: () => ipcRenderer.invoke('ollama:checkConnection'),
    listModels: () => ipcRenderer.invoke('ollama:listModels'),
    setModel: (model: string) => ipcRenderer.invoke('ollama:setModel', model),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type API = typeof api
