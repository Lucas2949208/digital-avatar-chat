import React, { useState, useCallback } from 'react';
import { useStore } from '../store';
import Papa from 'papaparse';

function DataImport() {
  const { avatarData, setAvatarData, setCurrentView, setLoading } = useStore();
  const [files, setFiles] = useState({ photos: [], chatLogs: [] });

  const handleImportPhotos = useCallback((e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarData({ 
          photo: ev.target.result,
          name: file.name.replace(/\.[^/.]+$/, '')
        });
      };
      reader.readAsDataURL(file);
      setFiles(prev => ({ ...prev, photos: [...prev.photos, file.name] }));
    }
  }, [setAvatarData]);

  const handleImportChatLogs = useCallback((e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        const ext = file.name.split('.').pop().toLowerCase();
        let chatData = [];
        
        if (ext === 'csv') {
          const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
          chatData = parsed.data || [];
        } else if (ext === 'json') {
          try { chatData = JSON.parse(content); } catch (e) {}
        }
        
        setAvatarData({ chatData });
      };
      reader.readAsText(file);
      setFiles(prev => ({ ...prev, chatLogs: [...prev.chatLogs, file.name] }));
    }
  }, [setAvatarData]);

  const canStartChat = avatarData?.photo && files.chatLogs.length > 0;

  const handleStartChat = () => {
    if (canStartChat) {
      setLoading(true, '初始化中...');
      setTimeout(() => {
        setLoading(false);
        setCurrentView('chat');
      }, 1000);
    }
  };

  return (
    <div className="import-page">
      <div className="import-header">
        <h2>导入亲人数据</h2>
        <p>请导入照片和微信聊天记录，创建数字分身</p>
      </div>
      
      <div className="import-cards">
        <div className="card">
          <div className="card-icon">📷</div>
          <h3>亲人照片</h3>
          <p>上传清晰照片用于生成数字人形象</p>
          <label className="upload-btn">
            选择照片
            <input type="file" accept="image/*" onChange={handleImportPhotos} hidden />
          </label>
          {files.photos.length > 0 && <p className="file-name">已选择: {files.photos[0]}</p>}
        </div>

        <div className="card">
          <div className="card-icon">💬</div>
          <h3>微信聊天记录</h3>
          <p>导入聊天记录（CSV/JSON格式）</p>
          <label className="upload-btn">
            选择文件
            <input type="file" accept=".csv,.json" onChange={handleImportChatLogs} hidden />
          </label>
          {files.chatLogs.length > 0 && <p className="file-name">已选择: {files.chatLogs[0]}</p>}
        </div>

        <div className="card">
          <div className="card-icon">🎤</div>
          <h3>语音样本</h3>
          <p>语音克隆功能开发中...</p>
          <button className="upload-btn" disabled>即将支持</button>
        </div>
      </div>

      {avatarData?.photo && (
        <div className="avatar-preview">
          <img src={avatarData.photo} alt="预览" />
          <input 
            type="text" 
            className="name-input"
            placeholder="输入数字分身名字"
            value={avatarData.name || ''}
            onChange={(e) => setAvatarData({ name: e.target.value })}
          />
        </div>
      )}

      <button className="start-btn" onClick={handleStartChat} disabled={!canStartChat}>
        {canStartChat ? '开始聊天' : '请先导入照片和聊天记录'}
      </button>
    </div>
  );
}

export default DataImport;