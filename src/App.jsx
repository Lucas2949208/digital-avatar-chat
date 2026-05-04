import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import DataImport from './components/DataImport';
import ChatInterface from './components/ChatInterface';
import SettingsPanel from './components/SettingsPanel';
import DigitalAvatar from './components/DigitalAvatar';

function App() {
  const store = useStore();
  const { currentView, setCurrentView, avatarData, isLoading } = store;
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'import': return <DataImport />;
      case 'chat': return <ChatInterface />;
      case 'settings': return <SettingsPanel />;
      default: return <DataImport />;
    }
  };

  if (showIntro) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <h1>数字分身聊天</h1>
          <p className="subtitle">让爱永远在线</p>
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">数字分身</h1>
          {avatarData?.name && <span className="avatar-badge">与 {avatarData.name} 对话中</span>}
        </div>
        <nav className="nav">
          <button className={currentView === 'import' ? 'active' : ''} onClick={() => setCurrentView('import')}>数据导入</button>
          <button className={currentView === 'chat' ? 'active' : ''} onClick={() => setCurrentView('chat')} disabled={!avatarData}>开始聊天</button>
          <button className={currentView === 'settings' ? 'active' : ''} onClick={() => setCurrentView('settings')}>设置</button>
        </nav>
      </header>
      <main className="main">
        {isLoading && <div className="loading-overlay"><div className="spinner"></div><p>处理中...</p></div>}
        <div className="content">{renderView()}</div>
        {avatarData && currentView === 'chat' && (
          <aside className="avatar-sidebar"><DigitalAvatar /></aside>
        )}
      </main>
    </div>
  );
}

export default App;