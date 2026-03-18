import React, { useState, useEffect } from 'react';
import { messagesAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchConversation(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchData = async () => {
    try {
      const [messagesRes, usersRes] = await Promise.all([
        messagesAPI.getAll(),
        usersAPI.getAll()
      ]);
      
      setUsers(usersRes.data.users.filter(u => u._id !== user.id));
      
      // Group messages by conversation
      const convos = messagesRes.data.messages.reduce((acc, msg) => {
        const otherUserId = msg.sender._id === user.id ? msg.recipient._id : msg.sender._id;
        const otherUser = msg.sender._id === user.id ? msg.recipient : msg.sender;
        
        if (!acc[otherUserId]) {
          acc[otherUserId] = {
            user: otherUser,
            lastMessage: msg,
            unreadCount: msg.recipient._id === user.id && !msg.isRead ? 1 : 0
          };
        } else {
          if (new Date(msg.createdAt) > new Date(acc[otherUserId].lastMessage.createdAt)) {
            acc[otherUserId].lastMessage = msg;
          }
          if (msg.recipient._id === user.id && !msg.isRead) {
            acc[otherUserId].unreadCount++;
          }
        }
        return acc;
      }, {});
      
      setConversations(Object.values(convos));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (userId) => {
    try {
      const response = await messagesAPI.getConversation(userId);
      setMessages(response.data.messages);
      
      // Mark messages as read
      response.data.messages.forEach(msg => {
        if (msg.recipient._id === user.id && !msg.isRead) {
          messagesAPI.markAsRead(msg._id);
        }
      });
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await messagesAPI.send({
        recipient: selectedUser._id,
        content: newMessage
      });
      setNewMessage('');
      fetchConversation(selectedUser._id);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="messages-page">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Messagerie interne sécurisée</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)]">
        {/* Conversations List */}
        <Card className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-2" size={32} />
                <p className="text-sm">Aucune conversation</p>
              </div>
            ) : (
              <div>
                {conversations.map((convo) => (
                  <div
                    key={convo.user._id}
                    onClick={() => setSelectedUser(convo.user)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent transition-colors border-b ${
                      selectedUser?._id === convo.user._id ? 'bg-accent' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={convo.user.avatar} />
                      <AvatarFallback className="bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400">
                        {convo.user.firstName?.[0]}{convo.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">
                          {convo.user.firstName} {convo.user.lastName}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {convo.lastMessage.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(convo.lastMessage.createdAt), 'PPp', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                </div>
              </div>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Aucun message. Commencez la conversation !</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender._id === user.id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg p-3 ${
                              isOwn
                                ? 'bg-brand-500 text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(message.createdAt), 'p', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrire un message..."
                    className="resize-none"
                    rows={2}
                  />
                  <Button type="submit" size="icon" className="self-end bg-brand-600 hover:bg-brand-700">
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-4" size={48} />
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
