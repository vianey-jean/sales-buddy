import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, ChevronLeft, Users, Smile, Heart, Pencil, Trash2, Check, XCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤔','👍','👏','❤️','🔥','🎉','😢','😮','🙏','💪','✨','😊','🤗','😘','👌'];

interface ChatMessage {
  id: string;
  visitorId: string;
  visitorNom: string;
  adminId: string;
  contenu: string;
  from: 'visitor' | 'admin';
  date: string;
  lu: boolean;
  edited?: boolean;
  deleted?: boolean;
  likes?: string[];
}

interface AdminMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  contenu: string;
  date: string;
  lu: boolean;
}

interface Conversation {
  visitorId: string;
  visitorNom: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
  unreadCount: number;
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specification: string | null;
  profilePhoto: string | null;
  online: boolean;
}

interface AdminConversation {
  adminId: string;
  adminName: string;
  lastMessage: AdminMessage;
  unreadCount: number;
}

type TabType = 'visitors' | 'admins';

const LiveChatAdmin: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('visitors');
  
  // Visitor chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Admin chat state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [adminConversations, setAdminConversations] = useState<AdminConversation[]>([]);
  const [adminUnread, setAdminUnread] = useState(0);
  
  // Shared state
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [visitorTyping, setVisitorTyping] = useState<Record<string, boolean>>({});
  const [adminTyping, setAdminTyping] = useState<Record<string, boolean>>({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [adminDeleteConfirm, setAdminDeleteConfirm] = useState<{ msgId: string; type: 'own' | 'other' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const selectedConvRef = useRef<string | null>(null);
  const selectedAdminRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const adminTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { selectedConvRef.current = selectedConv; }, [selectedConv]);
  useEffect(() => { selectedAdminRef.current = selectedAdmin; }, [selectedAdmin]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const isAdmin = user?.role === 'administrateur' || user?.role === 'administrateur principale';

  const token = localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // ========== VISITOR CHAT FUNCTIONS ==========
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        setTotalUnread(data.reduce((sum: number, c: Conversation) => sum + c.unreadCount, 0));
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    }
  }, [user, token]);

  const loadMessages = useCallback(async (visitorId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/messages/${visitorId}/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        fetch(`${API_BASE}/api/messagerie/mark-read/${visitorId}/${user.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reader: 'admin' })
        }).then(() => loadConversations()).catch(() => {});
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }, [user, loadConversations]);

  // ========== ADMIN CHAT FUNCTIONS ==========
  const loadAdminUsers = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/admin-users`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        // Filter out self
        setAdminUsers(data.filter((a: AdminUser) => a.id !== user.id));
      }
    } catch (e) {
      console.error('Error loading admin users:', e);
    }
  }, [user, token]);

  const loadAdminConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/admin-conversations`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setAdminConversations(data);
        setAdminUnread(data.reduce((sum: number, c: AdminConversation) => sum + c.unreadCount, 0));
      }
    } catch (e) {
      console.error('Error loading admin conversations:', e);
    }
  }, [user, token]);

  const loadAdminMessages = useCallback(async (otherAdminId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/admin-messages/${otherAdminId}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setAdminMessages(data);
        // Mark as read
        fetch(`${API_BASE}/api/messagerie/admin-mark-read/${otherAdminId}`, {
          method: 'PUT', headers: authHeaders
        }).then(() => loadAdminConversations()).catch(() => {});
      }
    } catch (e) {
      console.error('Error loading admin messages:', e);
    }
  }, [user, token, loadAdminConversations]);


  // ========== SSE & POLLING ==========
  useEffect(() => {
    if (!isAuthenticated || !isAdmin || !user) return;
    loadConversations();
    loadAdminUsers();
    loadAdminConversations();

    const es = new EventSource(`${API_BASE}/api/messagerie/events?adminId=${user.id}`);
    eventSourceRef.current = es;

    es.addEventListener('new_message', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        if (msg.adminId !== user.id) return;
        if (selectedConvRef.current === msg.visitorId) {
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          if (msg.from === 'visitor') {
            fetch(`${API_BASE}/api/messagerie/mark-read/${msg.visitorId}/${user.id}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reader: 'admin' })
            }).catch(() => {});
          }
        }
        loadConversations();
      } catch {}
    });

    es.addEventListener('new_conversation_message', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        if (msg.adminId === user.id) {
          if (selectedConvRef.current === msg.visitorId) {
            setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          }
          loadConversations();
        }
      } catch {}
    });

    es.addEventListener('message_edited', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      } catch {}
    });

    es.addEventListener('message_deleted', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      } catch {}
    });

    es.addEventListener('message_liked', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      } catch {}
    });

    es.addEventListener('typing', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.from === 'visitor') {
          setVisitorTyping(prev => ({ ...prev, [data.visitorId]: data.isTyping }));
        }
      } catch {}
    });

    // Admin-to-admin messages via SSE
    es.addEventListener('admin_message', (e) => {
      try {
        const msg: AdminMessage = JSON.parse(e.data);
        const currentSelectedAdmin = selectedAdminRef.current;
        if (currentSelectedAdmin === msg.senderId || currentSelectedAdmin === msg.receiverId) {
          setAdminMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          if (msg.senderId !== user.id) {
            fetch(`${API_BASE}/api/messagerie/admin-mark-read/${msg.senderId}`, {
              method: 'PUT', headers: authHeaders
            }).catch(() => {});
          }
        }
        loadAdminConversations();
      } catch {}
    });

    // Admin-to-admin typing indicator via SSE
    es.addEventListener('admin_typing', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.senderId !== user.id) {
          setAdminTyping(prev => ({ ...prev, [data.senderId]: data.isTyping }));
        }
      } catch {}
    });

    // Admin-to-admin message deleted (own message deleted for both)
    es.addEventListener('admin_message_deleted', (e) => {
      try {
        const data = JSON.parse(e.data);
        setAdminMessages(prev => prev.filter(m => m.id !== data.id));
        loadAdminConversations();
      } catch {}
    });

    // Admin-to-admin message hidden (other's message hidden for self)
    es.addEventListener('admin_message_hidden', (e) => {
      try {
        const data = JSON.parse(e.data);
        setAdminMessages(prev => prev.filter(m => m.id !== data.id));
      } catch {}
    });

    es.onerror = () => {};

    const pollInterval = setInterval(() => {
      const cur = selectedConvRef.current;
      if (cur) {
        fetch(`${API_BASE}/api/messagerie/messages/${cur}/${user.id}`)
          .then(res => res.ok ? res.json() : [])
          .then(data => setMessages(data))
          .catch(() => {});
      }
      loadConversations();
      loadAdminUsers();
      loadAdminConversations();
    }, 3000);

    return () => { es.close(); eventSourceRef.current = null; clearInterval(pollInterval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, adminMessages, visitorTyping, adminTyping]);

  // ========== VISITOR CHAT HANDLERS ==========
  const openConversation = (visitorId: string) => {
    setSelectedConv(visitorId);
    setSelectedAdmin(null);
    loadMessages(visitorId);
  };

  const openAdminChat = (adminId: string) => {
    setSelectedAdmin(adminId);
    setSelectedConv(null);
    loadAdminMessages(adminId);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending || !user) return;
    
    if (activeTab === 'admins' && selectedAdmin) {
      // Admin-to-admin message
      setIsSending(true);
      try {
        const targetAdmin = adminUsers.find(a => a.id === selectedAdmin);
        const res = await fetch(`${API_BASE}/api/messagerie/admin-send`, {
          method: 'POST', headers: authHeaders,
          body: JSON.stringify({ receiverId: selectedAdmin, receiverName: `${targetAdmin?.firstName} ${targetAdmin?.lastName}`, contenu: input.trim() })
        });
        if (res.ok) {
          const msg = await res.json();
          setAdminMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          setInput('');
          setShowEmojis(false);
          sendAdminTypingIndicator(false);
          loadAdminConversations();
        }
      } catch (e) { console.error('Error sending:', e); }
      finally { setIsSending(false); }
    } else if (selectedConv) {
      // Visitor message
      setIsSending(true);
      try {
        const conv = conversations.find(c => c.visitorId === selectedConv);
        const res = await fetch(`${API_BASE}/api/messagerie/send`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId: selectedConv, visitorNom: conv?.visitorNom || 'Visiteur', adminId: user.id, contenu: input.trim(), from: 'admin' })
        });
        if (res.ok) {
          const msg = await res.json();
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          setInput('');
          setShowEmojis(false);
          sendTypingIndicator(false);
          loadConversations();
        }
      } catch (e) { console.error('Error sending:', e); }
      finally { setIsSending(false); }
    }
  };

  const handleLike = async (msgId: string) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/like/${msgId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'admin' })
      });
    } catch {}
    setContextMenuId(null);
  };

  const handleEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/edit/${msgId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: editText.trim(), from: 'admin' })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    } catch {}
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (msgId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/delete/${msgId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'admin' })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    } catch {}
    setContextMenuId(null);
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!selectedConv || !user) return;
    fetch(`${API_BASE}/api/messagerie/typing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: selectedConv, adminId: user.id, from: 'admin', isTyping })
    }).catch(() => {});
  };

  const sendAdminTypingIndicator = (isTyping: boolean) => {
    if (!selectedAdmin || !user) return;
    fetch(`${API_BASE}/api/messagerie/admin-typing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: user.id, receiverId: selectedAdmin, isTyping })
    }).catch(() => {});
  };

  const handleAdminDeleteOwn = async (msgId: string) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/admin-delete-own/${msgId}`, {
        method: 'DELETE', headers: authHeaders
      });
      setAdminMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (e) { console.error('Error deleting own admin message:', e); }
    setAdminDeleteConfirm(null);
  };

  const handleAdminHideOther = async (msgId: string) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/admin-hide/${msgId}`, {
        method: 'DELETE', headers: authHeaders
      });
      setAdminMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (e) { console.error('Error hiding admin message:', e); }
    setAdminDeleteConfirm(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (activeTab === 'visitors' && selectedConv) {
      sendTypingIndicator(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(false), 2000);
    }
    if (activeTab === 'admins' && selectedAdmin) {
      sendAdminTypingIndicator(true);
      if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
      adminTypingTimeoutRef.current = setTimeout(() => sendAdminTypingIndicator(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!isAuthenticated || !isAdmin) return null;

  const allUnread = totalUnread + adminUnread;
  const isInChat = selectedConv || selectedAdmin;

  if (!isOpen) {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => { setIsOpen(true); loadConversations(); loadAdminUsers(); loadAdminConversations(); }}
          className="relative p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {allUnread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center px-1 animate-pulse">
              {allUnread}
            </span>
          )}
        </button>
      </motion.div>
    );
  }

  const activeConversationId = selectedConv || null;
  const selectedConversation = conversations.find(c => c.visitorId === activeConversationId);
  const selectedAdminUser = adminUsers.find(a => a.id === selectedAdmin);

  const headerTitle = selectedConversation
    ? selectedConversation.visitorNom
    : selectedAdminUser
      ? `${selectedAdminUser.firstName} ${selectedAdminUser.lastName}`
      : 'Messagerie Live';
  
  const headerSubtitle = selectedConv
    ? (visitorTyping[selectedConv] ? 'En train d\'écrire...' : 'En ligne')
    : selectedAdmin
      ? (selectedAdmin && adminTyping[selectedAdmin] ? 'En train d\'écrire...' : selectedAdminUser?.online ? '🟢 En ligne' : '🔴 Hors ligne')
      : `${conversations.length} visiteur${conversations.length > 1 ? 's' : ''} · ${adminUsers.length} admin${adminUsers.length > 1 ? 's' : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-[9999] w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/[0.1]"
      onClick={() => { setContextMenuId(null); setShowEmojis(false); }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {isInChat && (
            <button onClick={() => { setSelectedConv(null); setSelectedAdmin(null); setMessages([]); setAdminMessages([]); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}
          <div>
            <div className="text-white font-bold text-sm">{headerTitle}</div>
            <div className="text-purple-200/70 text-xs">{headerSubtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>


      {/* Tab bar when no chat selected */}
      {!isInChat && (
        <div className="flex bg-slate-900/95 border-b border-white/[0.06] shrink-0">
          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${
              activeTab === 'visitors' ? 'text-white' : 'text-purple-300/50 hover:text-purple-200/70'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Visiteurs
              {totalUnread > 0 && (
                <span className="min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1 animate-pulse">
                  {totalUnread}
                </span>
              )}
            </div>
            {activeTab === 'visitors' && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${
              activeTab === 'admins' ? 'text-white' : 'text-purple-300/50 hover:text-purple-200/70'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Admins
              {adminUnread > 0 && (
                <span className="min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1 animate-pulse">
                  {adminUnread}
                </span>
              )}
            </div>
            {activeTab === 'admins' && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />}
          </button>
        </div>
      )}

      {/* Content area */}
      {!isInChat ? (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
          {activeTab === 'visitors' ? (
            /* Visitor conversations list */
            conversations.length === 0 ? (
              <div className="text-center text-purple-300/40 text-sm mt-16">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Aucune conversation en cours
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.visitorId}
                  onClick={() => { setActiveTab('visitors'); openConversation(conv.visitorId); }}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/[0.08] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {conv.visitorNom.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-sm truncate">{conv.visitorNom}</span>
                      {conv.lastMessage && (
                        <span className="text-purple-300/30 text-[10px] shrink-0 ml-2">
                          {new Date(conv.lastMessage.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-purple-300/40 text-xs truncate">
                        {conv.lastMessage ? (
                          conv.lastMessage.deleted
                            ? '🚫 Message supprimé'
                            : conv.lastMessage.from === 'visitor' 
                              ? `${conv.visitorNom} : ${conv.lastMessage.contenu}`
                              : `Vous : ${conv.lastMessage.contenu}`
                        ) : ''}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1 shrink-0 ml-2 animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {visitorTyping[conv.visitorId] && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-red-400 text-[10px] ml-1">en train d'écrire...</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )
          ) : (
            /* Admin users list */
            adminUsers.length === 0 ? (
              <div className="text-center text-purple-300/40 text-sm mt-16">
                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Aucun autre administrateur
              </div>
            ) : (
              adminUsers.map((admin) => {
                const conv = adminConversations.find(c => c.adminId === admin.id);
                return (
                  <button
                    key={admin.id}
                    onClick={() => { setActiveTab('admins'); openAdminChat(admin.id); }}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] text-left"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-white/[0.08] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {admin.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${admin.online ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm truncate">{admin.firstName} {admin.lastName}</span>
                        {conv?.lastMessage && (
                          <span className="text-purple-300/30 text-[10px] shrink-0 ml-2">
                            {new Date(conv.lastMessage.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            admin.role === 'administrateur principale' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : admin.specification === 'live'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {admin.role === 'administrateur principale' ? 'Principal' : admin.specification === 'live' ? 'Live' : 'Admin'}
                          </span>
                          {conv?.lastMessage && (
                            <span className="text-purple-300/40 text-xs truncate">
                              {conv.lastMessage.senderId === user?.id ? 'Vous : ' : ''}{conv.lastMessage.contenu}
                            </span>
                          )}
                        </div>
                        {conv && conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1 shrink-0 ml-2 animate-pulse">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {adminTyping[admin.id] && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="text-blue-400 text-[10px] ml-1">en train d'écrire...</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      ) : selectedAdmin ? (
        /* Admin-to-admin chat */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            {adminMessages.length === 0 && (
              <div className="text-center text-purple-300/40 text-sm mt-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Commencer la conversation
              </div>
            )}
            {adminMessages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="relative max-w-[80%]">
                  {!isOwn && (
                    <div className="text-[10px] text-emerald-400 font-semibold mb-1 ml-1">
                      {msg.senderName}
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                      : 'bg-white/[0.08] text-purple-100 border border-white/[0.06] rounded-bl-md'
                  }`}>
                    {msg.contenu}
                    <div className={`text-[10px] mt-1 ${isOwn ? 'text-purple-200/50' : 'text-purple-300/30'}`}>
                      {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {msg.lu && isOwn && <span className="ml-1">✓✓</span>}
                    </div>
                  </div>
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setAdminDeleteConfirm({ msgId: msg.id, type: isOwn ? 'own' : 'other' }); }}
                    className={`absolute top-1 ${isOwn ? '-left-7' : '-right-7'} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-500/20`}
                    title={isOwn ? 'Supprimer pour tous' : 'Supprimer pour moi'}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              </motion.div>
              );
            })}

            <AnimatePresence>
              {selectedAdmin && adminTyping[selectedAdmin] && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="bg-white/[0.08] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="bg-slate-800/95 backdrop-blur border-t border-white/[0.06] px-3 py-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojis(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors">{emoji}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="p-3 bg-slate-900/90 backdrop-blur border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors">
                <Smile className="h-5 w-5 text-purple-300/60" />
              </button>
              <Input value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Envoyer un message..."
                className="flex-1 h-11 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-purple-300/30 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30" />
              <Button onClick={handleSend} disabled={!input.trim() || isSending}
                className="h-11 w-11 p-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl shadow-lg border border-white/10">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Delete confirmation modal */}
          <AnimatePresence>
            {adminDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setAdminDeleteConfirm(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-800 border border-white/[0.1] rounded-2xl p-5 max-w-[300px] w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <h3 className="text-white font-bold text-sm">Supprimer le message</h3>
                  </div>
                  <p className="text-purple-200/60 text-xs mb-4 leading-relaxed">
                    {adminDeleteConfirm.type === 'own'
                      ? 'Ce message sera supprimé pour vous et pour l\'autre admin. Cette action est irréversible.'
                      : 'Ce message sera supprimé uniquement de votre côté. L\'autre admin pourra toujours le voir.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAdminDeleteConfirm(null)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] text-purple-200 text-xs font-semibold hover:bg-white/[0.1] transition-colors border border-white/[0.08]"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        if (adminDeleteConfirm.type === 'own') {
                          handleAdminDeleteOwn(adminDeleteConfirm.msgId);
                        } else {
                          handleAdminHideOther(adminDeleteConfirm.msgId);
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Visitor chat messages */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'} group relative`}
              >
                <div className="relative max-w-[80%]">
                  {msg.from === 'visitor' && (
                    <div className="text-[10px] text-fuchsia-400 font-semibold mb-1 ml-1">
                      {msg.visitorNom}
                    </div>
                  )}

                  {msg.deleted ? (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm italic ${
                      msg.from === 'admin'
                        ? 'bg-white/[0.04] text-purple-300/40 rounded-br-md'
                        : 'bg-white/[0.04] text-purple-300/40 rounded-bl-md'
                    }`}>
                      🚫 Ce message a été supprimé
                      <div className="text-[10px] mt-1 text-purple-300/20">
                        {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : editingId === msg.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(msg.id); if (e.key === 'Escape') { setEditingId(null); setEditText(''); } }}
                        className="h-9 text-sm bg-white/[0.08] border-purple-400/30 text-white rounded-lg"
                        autoFocus
                      />
                      <button onClick={() => handleEdit(msg.id)} className="p-1.5 text-emerald-400 hover:bg-white/10 rounded-lg"><Check className="h-4 w-4" /></button>
                      <button onClick={() => { setEditingId(null); setEditText(''); }} className="p-1.5 text-red-400 hover:bg-white/10 rounded-lg"><XCircle className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer ${
                          msg.from === 'admin'
                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                            : 'bg-white/[0.08] text-purple-100 border border-white/[0.06] rounded-bl-md'
                        }`}
                        onClick={(e) => { e.stopPropagation(); setContextMenuId(contextMenuId === msg.id ? null : msg.id); }}
                      >
                        {msg.contenu}
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.from === 'admin' ? 'text-purple-200/50' : 'text-purple-300/30'}`}>
                          {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {msg.edited && <span className="italic">(modifié)</span>}
                        </div>
                      </div>

                      {msg.likes && msg.likes.length > 0 && (
                        <div className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'} mt-0.5`}>
                          <span className="text-xs bg-white/[0.08] rounded-full px-2 py-0.5 flex items-center gap-0.5">
                            ❤️ {msg.likes.length}
                          </span>
                        </div>
                      )}

                      <AnimatePresence>
                        {contextMenuId === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`absolute z-50 ${msg.from === 'admin' ? 'right-0' : 'left-0'} top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button onClick={() => handleLike(msg.id)} className="w-full px-3 py-2 text-left text-xs text-purple-200 hover:bg-white/[0.06] flex items-center gap-2">
                              <Heart className="h-3.5 w-3.5 text-red-400" /> {msg.likes?.includes('admin') ? 'Retirer ❤️' : 'Aimer ❤️'}
                            </button>
                            {msg.from === 'admin' && (
                              <>
                                <button onClick={() => { setEditingId(msg.id); setEditText(msg.contenu); setContextMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-purple-200 hover:bg-white/[0.06] flex items-center gap-2">
                                  <Pencil className="h-3.5 w-3.5 text-blue-400" /> Modifier
                                </button>
                                <button onClick={() => handleDelete(msg.id)} className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-white/[0.06] flex items-center gap-2">
                                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {selectedConv && visitorTyping[selectedConv] && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="bg-white/[0.08] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-800/95 backdrop-blur border-t border-white/[0.06] px-3 py-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { setInput(prev => prev + emoji); setShowEmojis(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="p-3 bg-slate-900/90 backdrop-blur border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
              >
                <Smile className="h-5 w-5 text-purple-300/60" />
              </button>
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Répondre..."
                className="flex-1 h-11 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-purple-300/30 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="h-11 w-11 p-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl shadow-lg border border-white/10"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LiveChatAdmin;
