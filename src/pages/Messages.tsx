import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button, Input, Card, Avatar, Skeleton } from '@/components/ui';
import { useAuthStore, useMessageStore } from '@/store';
import { messagesService, type DbConversation, type DbMessage } from '@/services/messages.service';
import { format, isToday, isYesterday } from 'date-fns';

export function Messages() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { fetchConversations, markAsRead } = useMessageStore();
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<DbConversation | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;

      try {
        const data = await messagesService.getConversations(user.id);
        setConversations(data);

        // Check if we need to open a conversation with a specific user
        const targetUserId = searchParams.get('userId');
        const context = searchParams.get('context'); // 'materials' or 'gig'
        
        if (targetUserId) {
          // Find existing conversation with this user
          const existingConv = data.find(c => {
            const otherParticipantId = c.participant_1_id === user.id 
              ? c.participant_2_id 
              : c.participant_1_id;
            return otherParticipantId === targetUserId;
          });

          if (existingConv) {
            setSelectedConv(existingConv);
          } else {
            // Create new conversation
            const newConv = await messagesService.getOrCreateConversation(user.id, targetUserId);
            setConversations(prev => [newConv, ...prev]);
            setSelectedConv(newConv);
          }
          
          // Pre-fill message for materials context (both new and existing conversations)
          if (context === 'materials') {
            const materialName = searchParams.get('materialName');
            const price = searchParams.get('price');
            const location = searchParams.get('location');
            
            let contextMessage = 'Hi! I saw your price submission';
            if (materialName) contextMessage += ` for ${materialName}`;
            if (price) contextMessage += ` at ${price}`;
            if (location) contextMessage += ` in ${location}`;
            contextMessage += '. I have some questions about it.';
            
            // Pre-fill the message input
            setNewMessage(contextMessage);
            console.log('Pre-filled message:', contextMessage);
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Subscribe to conversation updates
    if (user?.id) {
      const subscription = messagesService.subscribeToConversations(user.id, (conv) => {
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === conv.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...conv };
            return updated.sort((a, b) => 
              new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
            );
          }
          return prev;
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, markAsRead, fetchConversations, searchParams]);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConv || !user?.id) return;

      try {
        const data = await messagesService.getMessages(selectedConv.id, { limit: 50 });
        setMessages(data);
        
        // Mark messages as read
        await markAsRead(selectedConv.id);
        
        // Update unread count in local conversations list
        setConversations(prev => prev.map(c => 
          c.id === selectedConv.id ? { ...c, unread_count: 0 } : c
        ));
        
        // Refresh global conversations to update badge
        await fetchConversations();
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Subscribe to new messages
    if (selectedConv) {
      const subscription = messagesService.subscribeToMessages(selectedConv.id, (message) => {
        setMessages(prev => [...prev, message]);
        
        // Mark as read if from other user
        if (message.sender_id !== user?.id) {
          markAsRead(selectedConv.id);
          fetchConversations(); // Update badge
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConv, user, markAsRead, fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedConv || !newMessage.trim() || !user?.id) return;

    setSendingMessage(true);
    try {
      await messagesService.sendMessage(selectedConv.id, user.id, newMessage.trim());
      setNewMessage('');
      
      // Reload conversations to update the list
      const updatedConvs = await messagesService.getConversations(user.id);
      setConversations(updatedConvs);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatConversationDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getOtherParticipant = (conv: DbConversation) => {
    return conv.participants?.find((p: any) => p.id !== user?.id);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-64px)] flex bg-neutral-50 overflow-hidden">
        {/* Conversations List */}
        <div className={`${
          showConversationList ? 'block' : 'hidden'
        } md:block w-full md:w-80 border-r border-neutral-200 bg-white flex flex-col h-full`}>
          <div className="p-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Messages</h2>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-neutral-100">
                  <Skeleton height={50} />
                </div>
              ))
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const otherParticipant = getOtherParticipant(conv);
                const isSelected = selectedConv?.id === conv.id;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConv(conv);
                      setShowConversationList(false); // Hide list on mobile only when conversation is selected
                    }}
                    className={`w-full text-left p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                      isSelected ? 'bg-primary-50 border-l-2 border-l-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar 
                        name={otherParticipant?.name || 'Unknown'} 
                        src={otherParticipant?.avatar_url || undefined}
                        size="sm" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-medium text-sm truncate ${
                            (conv.unread_count || 0) > 0 ? 'text-neutral-900' : 'text-neutral-700'
                          }`}>
                            {otherParticipant?.name || 'Unknown'}
                          </p>
                          <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                            {formatConversationDate(conv.last_message_at)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          (conv.unread_count || 0) > 0 ? 'text-neutral-900 font-medium' : 'text-neutral-500'
                        }`}>
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {(conv.unread_count || 0) > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center">
                <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-neutral-500">No conversations yet</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Messages will appear here when you communicate with workers or employers
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`${
          !showConversationList ? 'block' : 'hidden md:block'
        } flex-1 flex flex-col`}>
          {selectedConv ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 bg-white border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setShowConversationList(true)}
                    className="md:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <Avatar 
                    name={getOtherParticipant(selectedConv)?.name || 'Unknown'} 
                    src={getOtherParticipant(selectedConv)?.avatar_url || undefined}
                    size="sm" 
                  />
                  <div>
                    <p className="font-medium text-neutral-900">
                      {getOtherParticipant(selectedConv)?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No messages yet</p>
                    <p className="text-sm text-neutral-400 mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.sender_id === user?.id;
                    const showDate = index === 0 || 
                      format(new Date(messages[index - 1].created_at), 'yyyy-MM-dd') !== 
                      format(new Date(msg.created_at), 'yyyy-MM-dd');

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                              {isToday(new Date(msg.created_at)) ? 'Today' :
                               isYesterday(new Date(msg.created_at)) ? 'Yesterday' :
                               format(new Date(msg.created_at), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md lg:max-w-lg ${
                            isOwn 
                              ? 'bg-primary-600 text-white rounded-l-lg rounded-tr-lg' 
                              : 'bg-white border border-neutral-200 rounded-r-lg rounded-tl-lg'
                          } p-3 shadow-sm`}>
                            {msg.message_type === 'system' ? (
                              <p className="text-sm italic">{msg.content}</p>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            )}
                            <p className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-neutral-400'}`}>
                              {format(new Date(msg.created_at), 'h:mm a')}
                              {isOwn && msg.read && (
                                <span className="ml-2 inline-flex">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-neutral-200">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    disabled={sendingMessage}
                  />
                  <Button onClick={handleSend} disabled={!newMessage.trim() || sendingMessage}>
                    {sendingMessage ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="text-center max-w-sm">
                <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="font-semibold text-neutral-900 mb-2">Your Messages</h3>
                <p className="text-neutral-500 text-sm">
                  Select a conversation to view messages or start a new conversation from a shift detail page.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
