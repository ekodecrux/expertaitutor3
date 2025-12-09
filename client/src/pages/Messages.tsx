import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations, isLoading: loadingConversations } = trpc.messaging.getConversations.useQuery();
  const { data: messages, isLoading: loadingMessages } = trpc.messaging.getMessages.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      trpc.useUtils().messaging.getMessages.invalidate();
      trpc.useUtils().messaging.getConversations.invalidate();
    },
  });

  const markAsReadMutation = trpc.messaging.markAsRead.useMutation({
    onSuccess: () => {
      trpc.useUtils().messaging.getConversations.invalidate();
      trpc.useUtils().messaging.getUnreadCount.invalidate();
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversationId) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: messageText.trim(),
    });
  };

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    markAsReadMutation.mutate({ conversationId });
  };

  const filteredConversations = conversations?.filter((conv: any) =>
    conv.participants.some((p: any) => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const selectedConversation = conversations?.find((c: any) => c.id === selectedConversationId);

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 p-4">
      {/* Conversations List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a new conversation</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations?.map((conv: any) => {
                const otherParticipant = conv.participants[0];
                const initials = otherParticipant?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase() || "?";

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex gap-3 p-3 rounded-lg transition-colors ${
                      selectedConversationId === conv.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={otherParticipant?.profilePhotoUrl} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{otherParticipant?.name || "Unknown"}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-80 truncate">{otherParticipant?.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConversation.participants[0]?.profilePhotoUrl} />
                <AvatarFallback>
                  {selectedConversation.participants[0]?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedConversation.participants[0]?.name || "Unknown"}</h3>
                <p className="text-sm text-muted-foreground">{selectedConversation.participants[0]?.role}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                      <div className="max-w-[70%] p-3 rounded-lg bg-muted animate-pulse">
                        <div className="h-4 bg-muted-foreground/20 rounded w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((msg: any) => {
                    const isOwnMessage = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : ""}`}>
                        <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : ""}`}>
                          {!isOwnMessage && (
                            <p className="text-xs text-muted-foreground mb-1 px-3">{msg.senderName}</p>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? "opacity-80" : "text-muted-foreground"}`}>
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageText.trim() || sendMessageMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-2">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
