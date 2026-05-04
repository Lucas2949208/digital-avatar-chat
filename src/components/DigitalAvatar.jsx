import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

function DigitalAvatar() {
  const { avatarData, chatHistory, settings } = useStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;

  useEffect(() => {
    if (lastMessage && lastMessage.sender === 'avatar') {
      setIsSpeaking(true);
      const timer = setTimeout(() => setIsSpeaking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastMessage]);

  if (!avatarData?.photo) {
    return (
      <div className="avatar-placeholder">
        <div className="placeholder-icon">👤</div>
        <p>暂无照片</p>
      </div>
    );
  }

  return (
    <div className="avatar-display">
      <div className="avatar-image-container">
        <img src={avatarData.photo} alt={avatarData.name} />
        {settings.memoryEnabled && (
          <div className={`status-badge ${isSpeaking ? 'speaking' : ''}`}>
            {isSpeaking ? '🎤 说话中' : '🔇'}
          </div>
        )}
      </div>
      <div className="avatar-info">
        <h4>{avatarData.name || '数字分身'}</h4>
        <p>{isSpeaking ? '正在说话...' : '等待对话'}</p>
      </div>
    </div>
  );
}

export default DigitalAvatar;