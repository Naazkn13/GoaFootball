import { useState, useEffect, useRef } from 'react';
import axiosInstance from '@/services/axios';
import styles from '@/styles/Admin.module.css';

export default function ChatTab({ session }) {
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        // Poll for new conversations every 10 seconds
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeConv) {
            fetchMessages(activeConv.id);
            // Poll for new messages every 3 seconds when a conversation is open
            const interval = setInterval(() => fetchMessages(activeConv.id), 3000);
            return () => clearInterval(interval);
        }
    }, [activeConv?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await axiosInstance.get('/api/messages/conversations');
            setConversations(response.data.conversations || []);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await axiosInstance.get(`/api/messages/${conversationId}`);
            setMessages(prev => {
                const newMessages = response.data.messages || [];
                // Only update state if the number of messages or the last message has changed
                if (prev.length !== newMessages.length) return newMessages;
                if (prev.length > 0 && newMessages.length > 0 && prev[prev.length - 1].id !== newMessages[newMessages.length - 1].id) return newMessages;
                return prev;
            });
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv || sendingMsg) return;

        setSendingMsg(true);
        try {
            // In group chat architecture, admins always message the user
            const receiverId = session.is_admin ? activeConv.user_id : activeConv.admin_id;

            await axiosInstance.post('/api/messages/send', {
                receiverId: receiverId,
                message: newMessage.trim(),
                conversationId: activeConv.id,
                messageType: 'text',
            });

            setNewMessage('');
            fetchMessages(activeConv.id);
            fetchConversations();
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSendingMsg(false);
        }
    };

    const getPartnerName = (conv) => {
        if (!conv) return 'Unknown';
        // If the viewer is an admin, the partner is ALWAYS the user
        if (session.is_admin) {
            return conv.user?.name || conv.user?.email || 'User';
        }
        // If the viewer is a user, the partner is Support/Admin
        return 'Customer Support';
    };

    const getPartnerEmail = (conv) => {
        if (!conv) return '';
        if (session.is_admin) {
            return conv.user?.email || '';
        }
        return 'goafootballfestival.info@gmail.com';
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <section>
            <div className={styles.sectionHeader}>
                <h2>💬 Chat</h2>
            </div>

            <div className={styles.chatContainer}>
                {/* Conversation List */}
                <div className={styles.conversationList}>
                    <div className={styles.convListHeader}>
                        <h3>Conversations</h3>
                    </div>

                    {conversations.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`${styles.convItem} ${activeConv?.id === conv.id ? styles.convItemActive : ''}`}
                                onClick={() => setActiveConv(conv)}
                            >
                                <div className={styles.convAvatar}>
                                    {getPartnerName(conv).charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.convInfo}>
                                    <div className={styles.convName}>
                                        {getPartnerName(conv)}
                                        {conv.unreadCount > 0 && (
                                            <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                                        )}
                                    </div>
                                    <div className={styles.convPreview}>
                                        {conv.lastMessage?.message
                                            ? conv.lastMessage.message.substring(0, 50) + (conv.lastMessage.message.length > 50 ? '...' : '')
                                            : conv.subject || 'No messages yet'}
                                    </div>
                                </div>
                                <div className={styles.convTime}>
                                    {formatTime(conv.lastMessage?.created_at || conv.created_at)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Chat Area */}
                <div className={styles.chatArea}>
                    {activeConv ? (
                        <>
                            {/* Chat Header */}
                            <div className={styles.chatHeader}>
                                <div className={styles.chatHeaderInfo}>
                                    <div className={styles.convAvatar}>
                                        {getPartnerName(activeConv).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3>{getPartnerName(activeConv)}</h3>
                                        <span>{getPartnerEmail(activeConv)}</span>
                                    </div>
                                </div>
                                {activeConv.subject && (
                                    <span className={styles.chatSubject}>
                                        {activeConv.subject}
                                    </span>
                                )}
                            </div>

                            {/* Messages */}
                            <div className={styles.messagesArea}>
                                {messages.length === 0 ? (
                                    <div className={styles.emptyChat}>
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMyMessage = msg.sender_id === session.id;
                                        // Try to find the admin's name if they sent it (from conversations or session)
                                        const isFromAdmin = !isMyMessage && session.is_admin === false;

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`${styles.messageBubble} ${isMyMessage ? styles.messageSent : styles.messageReceived}`}
                                            >
                                                {/* In group chat, show which admin sent the reply */}
                                                {!isMyMessage && session.is_admin && (
                                                    <div className={styles.messageSenderName}>
                                                        {msg.sender_id === activeConv.user_id ? getPartnerName(activeConv) : "Admin"}
                                                    </div>
                                                )}
                                                <div className={styles.messageText}>{msg.message}</div>
                                                <div className={styles.messageTime}>
                                                    {formatTime(msg.created_at)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form className={styles.messageForm} onSubmit={handleSend}>
                                <input
                                    type="text"
                                    className={styles.messageInput}
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={sendingMsg}
                                />
                                <button
                                    type="submit"
                                    className={styles.sendBtn}
                                    disabled={!newMessage.trim() || sendingMsg}
                                >
                                    {sendingMsg ? '...' : '➤'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className={styles.emptyChatPlaceholder}>
                            <div className={styles.emptyChatIcon}>💬</div>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
