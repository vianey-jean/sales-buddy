import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  User,
  Search,
  Sparkles,
  Crown
} from 'lucide-react';
import { useMessages, Message } from '@/hooks/use-messages';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import Layout from '@/components/Layout';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import PremiumLoading from '@/components/ui/premium-loading';
import { motion } from 'framer-motion';

const MessagesPage: React.FC = () => {
  const { messages, unreadCount, isLoading, markAsRead, markAsUnread, deleteMessage } = useMessages();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center border-0 bg-white/[0.06] backdrop-blur-2xl border-white/[0.1] shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-3xl">
            <CardContent className="pt-12 pb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
                <MessageSquare className="relative h-20 w-20 text-purple-400 mx-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Accès Requis</h2>
              <div className="text-purple-200/60 mb-6">
                Connectez-vous pour accéder à votre messagerie sécurisée.
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading text="Chargement de vos messages" size="xl" overlay={true} variant="default" />
      </Layout>
    );
  }

  const handleMarkAsRead = async (message: Message) => {
    await markAsRead(message.id);
    if (selectedMessage?.id === message.id) setSelectedMessage({ ...message, lu: true });
  };

  const handleMarkAsUnread = async (message: Message) => {
    await markAsUnread(message.id);
    if (selectedMessage?.id === message.id) setSelectedMessage({ ...message, lu: false });
  };

  const handleDelete = async (messageId: string) => {
    await deleteMessage(messageId);
    if (selectedMessage?.id === messageId) setSelectedMessage(null);
    toast({ title: "Message supprimé", description: "Le message a été supprimé avec succès." });
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.lu) handleMarkAsRead(message);
  };

  const filteredMessages = messages.filter(message =>
    message.expediteurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950/50 to-indigo-950">
        {/* Grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        
        <div className="relative container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08] mb-4">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-purple-300/80">Messagerie Premium</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 drop-shadow-[0_4px_20px_rgba(139,92,246,0.3)]">
              Votre Messagerie
            </h1>

            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <span className="font-semibold text-white text-base">
                  {messages.length} message{messages.length > 1 ? 's' : ''}
                </span>
              </div>

              {unreadCount > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 bg-red-500/10 backdrop-blur-2xl rounded-2xl border border-red-500/20 shadow-[0_10px_30px_rgba(239,68,68,0.1)]">
                  <Mail className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300 text-base">
                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 max-w-8xl mx-auto">
            {/* Sidebar */}
            <div className="lg:col-span-2">
              <Card className="border-0 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                {/* Top shimmer */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
                
                <CardHeader className="border-b border-white/[0.06] pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg text-white">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-[0_8px_20px_rgba(168,85,247,0.3)] border border-white/10">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    Boîte de réception
                  </CardTitle>

                  <div className="relative mt-4 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300/40 z-10" />
                    <Input
                      placeholder="Rechercher dans les messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="relative pl-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-purple-300/30 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30 transition-all"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {filteredMessages.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageSquare className="h-16 w-16 mx-auto text-purple-400/20 mb-4" />
                      <div className="text-purple-300/40 text-base">Aucun message trouvé</div>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-5 cursor-pointer transition-all duration-300 hover:bg-white/[0.04] group ${
                            !message.lu ? 'bg-emerald-500/[0.04] border-l-2 border-l-emerald-400' : 'border-l-2 border-l-transparent'
                          } ${
                            selectedMessage?.id === message.id ? 'bg-purple-500/[0.06] border-l-purple-400' : ''
                          }`}
                          onClick={() => handleMessageClick(message)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-white/[0.06] rounded-lg">
                                <User className="h-4 w-4 text-purple-300/60" />
                              </div>
                              <span className={`font-medium text-sm ${!message.lu ? 'font-bold text-white' : 'text-purple-200/70'}`}>
                                {message.expediteurNom}
                              </span>
                            </div>
                            {!message.lu && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-2 py-0.5 border-0">
                                Nouveau
                              </Badge>
                            )}
                          </div>

                          <div className={`text-sm mb-2 line-clamp-2 ${!message.lu ? 'font-semibold text-white' : 'text-purple-200/50'}`}>
                            {message.sujet}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-purple-300/40">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(message.dateEnvoi), { addSuffix: true, locale: fr })}
                            </div>
                            {!message.lu && (
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reading panel */}
            <div className="lg:col-span-3">
              {selectedMessage ? (
                <Card className="border-0 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
                  
                  <CardHeader className="border-b border-white/[0.06] pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 mb-4 text-xl text-white">
                          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-[0_8px_20px_rgba(168,85,247,0.3)] border border-white/10">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <span>{selectedMessage.sujet}</span>
                          {!selectedMessage.lu && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs border-0">Non lu</Badge>
                          )}
                        </CardTitle>

                        <div className="space-y-2.5">
                          {[
                            { icon: User, label: 'De:', value: selectedMessage.expediteurNom },
                            { icon: Mail, label: 'Email:', value: selectedMessage.expediteurEmail },
                            ...(selectedMessage.expediteurTelephone ? [{ icon: Phone, label: 'Téléphone:', value: selectedMessage.expediteurTelephone }] : []),
                            { icon: Calendar, label: 'Reçu le:', value: new Date(selectedMessage.dateEnvoi).toLocaleString('fr-FR') },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-xl">
                              <item.icon className="h-4 w-4 text-purple-400/60" />
                              <span className="font-medium text-purple-200/60 text-sm">{item.label}</span>
                              <span className="text-purple-100/80 text-sm">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedMessage.lu ? handleMarkAsUnread(selectedMessage) : handleMarkAsRead(selectedMessage)}
                          className="bg-white/[0.04] border-white/[0.1] text-purple-200 hover:bg-white/[0.08] hover:text-white transition-all rounded-xl"
                        >
                          {selectedMessage.lu ? <><EyeOff className="h-4 w-4 mr-1.5 text-red-400" />Non lu</> : <><Eye className="h-4 w-4 mr-1.5 text-emerald-400" />Lu</>}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-500 hover:to-pink-500 border-0 rounded-xl shadow-[0_8px_20px_rgba(239,68,68,0.2)]">
                              <Trash2 className="h-4 w-4 mr-1.5" />Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/[0.1] shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold text-white">Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription className="text-purple-200/60">Cette action est irréversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/[0.06] border-white/[0.1] text-white hover:bg-white/[0.1] rounded-xl">Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(selectedMessage.id)} className="bg-gradient-to-r from-red-500 to-pink-500 border-0 rounded-xl">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-8">
                    <div className="bg-white/[0.03] p-6 sm:p-8 rounded-2xl border border-white/[0.05]">
                      <div className="whitespace-pre-wrap text-purple-100/80 leading-relaxed text-base">
                        {selectedMessage.contenu}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full border-0 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <CardContent className="flex items-center justify-center h-full py-32">
                    <div className="text-center">
                      <MessageSquare className="h-20 w-20 mx-auto text-purple-400/15 mb-6" />
                      <h3 className="text-xl font-semibold text-purple-200/40 mb-2">Sélectionnez un message</h3>
                      <div className="text-purple-300/30">Choisissez un message pour le lire</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
