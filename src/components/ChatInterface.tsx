import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Send message to bot
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.text,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <img 
                    src="/norse-logo.png" 
                    alt="Norse Atlantic Airways" 
                    className="logo"
                />
                <h1>Travel Assistant</h1>
            </div>
            
            <div className="messages-container">
                {messages.map((message) => (
                    <div 
                        key={message.id} 
                        className={`message ${message.sender}`}
                    >
                        <div className="message-content">
                            {message.text}
                        </div>
                        <div className="message-timestamp">
                            {message.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                />
                <button onClick={handleSend}>Send</button>
            </div>

            <style jsx>{`
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-width: 800px;
                    margin: 0 auto;
                    background: #ffffff;
                }

                .chat-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background: #003366;
                    color: white;
                }

                .logo {
                    height: 40px;
                    margin-right: 1rem;
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    background: #f5f5f5;
                }

                .message {
                    margin-bottom: 1rem;
                    max-width: 70%;
                }

                .message.user {
                    margin-left: auto;
                }

                .message.bot {
                    margin-right: auto;
                }

                .message-content {
                    padding: 0.8rem;
                    border-radius: 1rem;
                    background: #fff;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }

                .message.user .message-content {
                    background: #003366;
                    color: white;
                }

                .message-timestamp {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 0.3rem;
                }

                .input-container {
                    display: flex;
                    padding: 1rem;
                    background: white;
                    border-top: 1px solid #eee;
                }

                input {
                    flex: 1;
                    padding: 0.8rem;
                    border: 1px solid #ddd;
                    border-radius: 0.5rem;
                    margin-right: 0.5rem;
                }

                button {
                    padding: 0.8rem 1.5rem;
                    background: #003366;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                }

                button:hover {
                    background: #002244;
                }
            `}</style>
        </div>
    );
};

export default ChatInterface; 