// frontend/src/pages/ChatBot.jsx
import React, { useState } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your diet assistant. Ask me about any food.' }
  ]);
  const [input, setInput] = useState('');
  const userId = localStorage.getItem('userId'); // adjust according to your auth setup

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: input })
      });

      const data = await response.json();
      setMessages([...newMessages, { role: 'bot', content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'bot', content: 'Error: Could not reach server.' }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbot-container">
      <h2>Diet Assistant Chatbot</h2>
      <div className="chatbox">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'user-msg' : 'bot-msg'}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask me about a food..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
