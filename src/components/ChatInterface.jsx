import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';

function ChatInterface() {
  const { avatarData, chatHistory, addChatMessage, settings } = useStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const speechRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakMessage = useCallback((text) => {
    if (!settings.ttsEnabled) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = settings.ttsSpeed || 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === settings.ttsVoice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.ttsEnabled, settings.ttsSpeed, settings.ttsVoice]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.sender === 'avatar' && !isTyping) {
        speakMessage(lastMessage.content);
      }
    }
  }, [chatHistory, isTyping, speakMessage]);

  const generateResponse = async (userMessage) => {
    setIsTyping(true);
    try {
      const conversationContext = chatHistory
        .slice(-10)
        .map((msg) => `${msg.sender === 'user' ? '用户' : avatarData?.name || '数字分身'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `你是一个模仿${avatarData?.name || '某人'}说话风格的AI数字分身。
基于之前的聊天记录，用相似的方式回复。要简洁、自然、充满温暖。`;

      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.qwenApiKey}`,
        },
        body: JSON.stringify({
          model: settings.qwenModel || 'qwen-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `对话历史:\n${conversationContext}\n\n用户: ${userMessage}` },
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，我现在无法回应...';
      
      addChatMessage({ id: uuidv4(), sender: 'avatar', content: reply });
    } catch (error) {
      console.error('Error:', error);
      addChatMessage({ id: uuidv4(), sender: 'avatar', content: '抱歉，出了点问题...' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    const userMsg = inputMessage.trim();
    setInputMessage('');
    
    addChatMessage({ id: uuidv4(), sender: 'user', content: userMsg });
    await generateResponse(userMsg);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div className="welcome">
            <p>👋 你好！我是{avatarData?.name || '你的数字分身'}。</p>
            <p>有什么想和我聊的吗？</p>
          </div>
        )}
        
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="sender">{msg.sender === 'user' ? '你' : avatarData?.name}</div>
            <div className="content">{msg.content}</div>
            <div className="time">{formatTime(msg.timestamp)}</div>
            {msg.sender === 'avatar' && settings.ttsEnabled && (
              <button className="speak-btn" onClick={() => speakMessage(msg.content)}>🔊</button>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="message avatar">
            <div className="sender">{avatarData?.name}</div>
            <div className="typing"><span></span><span></span><span></span></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        {isSpeaking && (
          <button className="stop-speak-btn" onClick={handleSpeakToggle}>⏹️ 停止播放</button>
        )}
        <textarea
          ref={inputRef}
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          rows={1}
        />
        <button className="send-btn" onClick={handleSend} disabled={!inputMessage.trim() || isTyping}>
          发送
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;