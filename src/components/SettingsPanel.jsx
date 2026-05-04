import React from 'react';
import { useStore } from '../store';

function SettingsPanel() {
  const { settings, updateSettings, resetAll } = useStore();

  const voiceOptions = [
    { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓（女声）' },
    { value: 'zh-CN-YunxiNeural', label: '云希（男声）' },
    { value: 'zh-CN-YunxiaNeural', label: '云夏（女声）' },
    { value: 'zh-CN-YunyangNeural', label: '云阳（男声）' },
    { value: 'zh-CN-LiaoningNeural', label: '辽宁话' },
    { value: 'zh-CN-ShanghaiNeural', label: '上海话' },
    { value: 'zh-CN-GuangzhouNeural', label: '粤语' },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>设置</h2>
        <p>配置您的数字分身</p>
      </div>

      <div className="settings-section">
        <h3>通义千问 API</h3>
        <div className="setting-item">
          <label>API Key <small>用于调用大模型</small></label>
          <input
            type="password"
            value={settings.qwenApiKey}
            onChange={(e) => updateSettings({ qwenApiKey: e.target.value })}
            placeholder="sk-..."
          />
        </div>
        <div className="setting-item">
          <label>模型</label>
          <select value={settings.qwenModel} onChange={(e) => updateSettings({ qwenModel: e.target.value })}>
            <option value="qwen-turbo">qwen-turbo (快速)</option>
            <option value="qwen-plus">qwen-plus (增强)</option>
            <option value="qwen-max">qwen-max (最强)</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>阿里云语音合成</h3>
        <div className="setting-item">
          <label>AccessKey ID</label>
          <input
            type="password"
            value={settings.aliyunAccessKeyId}
            onChange={(e) => updateSettings({ aliyunAccessKeyId: e.target.value })}
            placeholder="LTAI..."
          />
        </div>
        <div className="setting-item">
          <label>AccessKey Secret</label>
          <input
            type="password"
            value={settings.aliyunAccessKeySecret}
            onChange={(e) => updateSettings({ aliyunAccessKeySecret: e.target.value })}
            placeholder="xxxxxxxx..."
          />
        </div>
        <div className="setting-item">
          <label>语音选择</label>
          <select value={settings.ttsVoice} onChange={(e) => updateSettings({ ttsVoice: e.target.value })}>
            {voiceOptions.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="setting-item">
          <label>语速</label>
          <div className="slider-group">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.ttsSpeed}
              onChange={(e) => updateSettings({ ttsSpeed: parseFloat(e.target.value) })}
            />
            <span>{settings.ttsSpeed.toFixed(1)}x</span>
          </div>
        </div>
        <div className="setting-item toggle-item">
          <label>启用语音合成</label>
          <div
            className={`toggle ${settings.ttsEnabled ? 'on' : ''}`}
            onClick={() => updateSettings({ ttsEnabled: !settings.ttsEnabled })}
          />
        </div>
      </div>

      <div className="settings-section danger">
        <h3>数据管理</h3>
        <button className="reset-btn" onClick={() => { if (window.confirm('确定重置？')) resetAll(); }}>
          重置所有数据
        </button>
      </div>
    </div>
  );
}

export default SettingsPanel;