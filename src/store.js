import { useState, useCallback, useEffect } from 'react';

const defaultState = {
  currentView: 'import',
  isLoading: false,
  avatarData: null,
  chatHistory: [],
  settings: {
    qwenApiKey: '',
    qwenModel: 'qwen-turbo',
    aliyunAccessKeyId: '',
    aliyunAccessKeySecret: '',
    ttsVoice: 'zh-CN-XiaoxiaoNeural',
    ttsSpeed: 1.0,
    ttsEnabled: true,
  },
};

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage error:', e);
  }
}

export function useStore() {
  const [state, setState] = useState(() => ({
    ...defaultState,
    settings: loadFromStorage('avatar-settings', defaultState.settings),
    chatHistory: loadFromStorage('avatar-chat', []),
    avatarData: loadFromStorage('avatar-data', null),
  }));

  useEffect(() => {
    saveToStorage('avatar-settings', state.settings);
  }, [state.settings]);

  useEffect(() => {
    saveToStorage('avatar-chat', state.chatHistory);
  }, [state.chatHistory]);

  useEffect(() => {
    saveToStorage('avatar-data', state.avatarData);
  }, [state.avatarData]);

  const setCurrentView = useCallback((view) => setState(s => ({ ...s, currentView: view })), []);
  const setLoading = useCallback((loading) => setState(s => ({ ...s, isLoading: loading })), []);
  const setAvatarData = useCallback((data) => setState(s => ({ ...s, avatarData: data })), []);
  const addChatMessage = useCallback((msg) => setState(s => ({ ...s, chatHistory: [...s.chatHistory, { ...msg, timestamp: Date.now() }] })), []);
  const updateSettings = useCallback((updates) => setState(s => ({ ...s, settings: { ...s.settings, ...updates } })), []);
  const resetAll = useCallback(() => {
    setState(defaultState);
    localStorage.clear();
  }, []);

  return {
    ...state,
    setCurrentView,
    setLoading,
    setAvatarData,
    addChatMessage,
    updateSettings,
    resetAll,
  };
}