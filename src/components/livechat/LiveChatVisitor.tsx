import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Loader2, User, Smile, Heart, Pencil, Trash2, Check, XCircle, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebRTC } from './useWebRTC';
import CallOverlay from './CallOverlay';
import { Input } from '@/components/ui/input';

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

interface LiveChatVisitorProps {
  visitorNom: string;
  adminId: string;
  onClose: () => void;
}

const LiveChatVisitor: React.FC<LiveChatVisitorProps> = ({ visitorNom, adminId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const pseudo = useRef(localStorage.getItem('livechat_pseudo') || visitorNom);
  const visitorId = useRef(
    localStorage.getItem('livechat_visitor_id') || 
    `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const webrtc = useWebRTC({
    visitorId: visitorId.current,
    adminId,
    from: 'visitor',
    eventSourceRef,
  });

  useEffect(() => {
    localStorage.setItem('livechat_visitor_id', visitorId.current);
    localStorage.setItem('livechat_pseudo', visitorNom);
    pseudo.current = visitorNom;
  }, [visitorNom]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/messages/${visitorId.current}/${adminId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }, [adminId]);

  useEffect(() => {
    loadMessages();
    const es = new EventSource(`${API_BASE}/api/messagerie/events?visitorId=${visitorId.current}`);
    eventSourceRef.current = es;

    es.addEventListener('new_message', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        if (msg.visitorId === visitorId.current && msg.adminId === adminId) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.from === 'admin') {
            fetch(`${API_BASE}/api/messagerie/mark-read/${visitorId.current}/${adminId}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reader: 'visitor' })
            }).catch(() => {});
          }
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
        if (data.from === 'admin' && data.visitorId === visitorId.current) {
          setAdminTyping(data.isTyping);
        }
      } catch {}
    });

    es.addEventListener('admin_status', () => {});
    es.onerror = () => {};

    const pollInterval = setInterval(() => { loadMessages(); }, 2000);
    return () => { es.close(); eventSourceRef.current = null; clearInterval(pollInterval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, adminTyping]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: visitorId.current, visitorNom: pseudo.current, adminId, contenu: input.trim(), from: 'visitor' })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        setInput('');
        setShowEmojis(false);
        sendTypingIndicator(false);
      }
    } catch (e) { console.error('Error sending:', e); }
    finally { setIsSending(false); }
  };

  const handleLike = async (msgId: string) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/like/${msgId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'visitor' })
      });
    } catch {}
    setContextMenuId(null);
  };

  const handleEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/messagerie/edit/${msgId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: editText.trim(), from: 'visitor' })
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
        body: JSON.stringify({ from: 'visitor' })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    } catch {}
    setContextMenuId(null);
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    fetch(`${API_BASE}/api/messagerie/typing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorId.current, adminId, from: 'visitor', isTyping })
    }).catch(() => {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTypingIndicator(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (isMinimized) {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-[9999]">
        <button onClick={() => setIsMinimized(false)} className="relative p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:scale-110 transition-transform">
          <MessageCircle className="h-6 w-6 text-white" />
          {messages.filter(m => m.from === 'admin' && !m.lu).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
              {messages.filter(m => m.from === 'admin' && !m.lu).length}
            </span>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.8 }}
      className="fixed bottom-6 right-6 z-[9999] w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/[0.1]"
      onClick={() => { setContextMenuId(null); setShowEmojis(false); }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-purple-600" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">{pseudo.current}</div>
            <div className="text-purple-200/70 text-xs">Chat en direct</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => webrtc.startCall('audio')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Appel audio">
            <Phone className="h-4 w-4 text-white" />
          </button>
          <button onClick={() => webrtc.startCall('video')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Appel vidéo">
            <Video className="h-4 w-4 text-white" />
          </button>
          <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Minimize2 className="h-4 w-4 text-white" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Call Overlay */}
      <CallOverlay
        callStatus={webrtc.callStatus}
        callType={webrtc.callType}
        isMuted={webrtc.isMuted}
        isVideoOff={webrtc.isVideoOff}
        callDuration={webrtc.callDuration}
        incomingCall={webrtc.incomingCall}
        localVideoRef={webrtc.localVideoRef}
        remoteVideoRef={webrtc.remoteVideoRef}
        remoteAudioRef={webrtc.remoteAudioRef}
        callerName="Admin"
        onAccept={webrtc.acceptCall}
        onReject={webrtc.rejectCall}
        onEnd={() => webrtc.endCall(true)}
        onToggleMute={webrtc.toggleMute}
        onToggleVideo={webrtc.toggleVideo}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
        {messages.length === 0 && (
          <div className="text-center text-purple-300/40 text-sm mt-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            Envoyez votre premier message !
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'} group relative`}
          >
            <div className="relative max-w-[80%]">
              {/* Deleted message */}
              {msg.deleted ? (
                <div className={`px-4 py-2.5 rounded-2xl text-sm italic ${
                  msg.from === 'visitor' 
                    ? 'bg-white/[0.04] text-purple-300/40 rounded-br-md' 
                    : 'bg-white/[0.04] text-purple-300/40 rounded-bl-md'
                }`}>
                  🚫 Ce message a été supprimé
                  <div className="text-[10px] mt-1 text-purple-300/20">
                    {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ) : editingId === msg.id ? (
                /* Editing mode */
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
                      msg.from === 'visitor'
                        ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                        : 'bg-white/[0.08] text-purple-100 border border-white/[0.06] rounded-bl-md'
                    }`}
                    onClick={(e) => { e.stopPropagation(); setContextMenuId(contextMenuId === msg.id ? null : msg.id); }}
                  >
                    {msg.contenu}
                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.from === 'visitor' ? 'text-purple-200/50' : 'text-purple-300/30'}`}>
                      {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {msg.edited && <span className="italic">(modifié)</span>}
                    </div>
                  </div>

                  {/* Likes */}
                  {msg.likes && msg.likes.length > 0 && (
                    <div className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'} mt-0.5`}>
                      <span className="text-xs bg-white/[0.08] rounded-full px-2 py-0.5 flex items-center gap-0.5">
                        ❤️ {msg.likes.length}
                      </span>
                    </div>
                  )}

                  {/* Context menu */}
                  <AnimatePresence>
                    {contextMenuId === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute z-50 ${msg.from === 'visitor' ? 'right-0' : 'left-0'} top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button onClick={() => handleLike(msg.id)} className="w-full px-3 py-2 text-left text-xs text-purple-200 hover:bg-white/[0.06] flex items-center gap-2">
                          <Heart className="h-3.5 w-3.5 text-red-400" /> {msg.likes?.includes('visitor') ? 'Retirer ❤️' : 'Aimer ❤️'}
                        </button>
                        {msg.from === 'visitor' && (
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
          {adminTyping && (
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
            className="bg-slate-800/95 backdrop-blur border-t border-white/[0.06] px-3 py-2"
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
      <div className="p-3 bg-slate-900/90 backdrop-blur border-t border-white/[0.06]">
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
            placeholder="Écrivez votre message..."
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
    </motion.div>
  );
};

export default LiveChatVisitor;
