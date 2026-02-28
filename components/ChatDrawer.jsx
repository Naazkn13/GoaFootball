import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/services/database';
import axiosInstance from '@/services/axios';
import { useAuth } from '@/store/AuthContext';
import styles from '@/styles/ChatDrawer.module.css';

export default function ChatDrawer({ isOpen, onClose, adminId, conversationId }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch existing messages
    const fetchMessages = useCallback(async () => {
        if (!conversationId || !user) return;
        setLoading(true);
        try {
            const fetchId = conversationId;
            const response = await axiosInstance.get(`/api/messages/${fetchId}`);
            setMessages(response.data.messages || []);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    }, [conversationId, user]);

    useEffect(() => {
        if (isOpen && conversationId) {
            fetchMessages();
        }
    }, [isOpen, conversationId, fetchMessages]);

    // Supabase Realtime subscription
    useEffect(() => {
        if (!isOpen || !user) return;

        const filterQuery = conversationId
            ? `conversation_id=eq.${conversationId}`
            : `receiver_id=eq.${user.id}`;

        const channel = supabase
            .channel('chat_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: filterQuery,
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, user, conversationId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await axiosInstance.post('/api/messages/send', {
                message: newMessage.trim(),
                conversationId: conversationId,
            });

            // Optimistically add message
            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.drawerOverlay} onClick={onClose}>
            <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.drawerHeader}>
                    <h3>💬 Chat with Admin</h3>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.messagesContainer}>
                    {loading ? (
                        <p className={styles.loadingText}>Loading messages...</p>
                    ) : messages.length === 0 ? (
                        <p className={styles.emptyText}>No messages yet. Start a conversation!</p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.message} ${msg.sender_id === user?.id ? styles.sent : styles.received}`}
                            >
                                <p className={styles.messageText}>{msg.message}</p>
                                <span className={styles.messageTime}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSend}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending}
                    />
                    <button type="submit" disabled={sending || !newMessage.trim()}>
                        {sending ? '...' : '➤'}
                    </button>
                </form>
            </div>
        </div>
    );
}
