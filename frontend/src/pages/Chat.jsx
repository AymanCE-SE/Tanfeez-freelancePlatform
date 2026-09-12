/** @format */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Container, Row, Col, Card, Form, Button, ListGroup, InputGroup,
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, ChatDots, Send, Paperclip } from "react-bootstrap-icons";
import "../styles/components/Chat.css";
import DateDivider from "../components/chat/DateDivider";
import Message from "../components/chat/Message";
import ChatHeader from "../components/chat/ChatHeader";
import EmojiPickerButton from "../components/chat/EmojiPickerButton";
import { getChatRooms, getMessages } from "../api/chatroom";
import { useChatSocket } from "../hooks/useChatSocket";
import { useNotifications } from "../context/NotificationContext";

const normalizeRestMessage = (m) => ({
  id: m.id, content: m.text, senderId: m.sender, timestamp: m.timestamp, isRead: m.is_read,
});
const normalizeLiveMessage = (m) => ({
  id: m.id, content: m.message, senderId: m.sender_id, timestamp: m.timestamp, isRead: false,
});

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const currentUser = useSelector((state) => state.authSlice.user);
  const [conversations, setConversations] = useState([]);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id.toString() === conversationId),
    [conversations, conversationId]
  );
  const isMeClient = currentUser?.id === currentConversation?.client;

  // On mobile, having a conversationId means "show the chat view instead of
  // the list" — this single boolean drives which panel is visible below.
  const isChatOpenOnMobile = Boolean(conversationId);
  const { refreshMessagesUnreadCount, messageEventTick } = useNotifications();
  const { liveMessages, presence, readMessageIds, sendMessage, markAsRead, status } =
    useChatSocket(conversationId, currentUser?.id);

  const loadConversations = useCallback(() => getChatRooms().then(setConversations), []);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    if (!conversationId) return;
    getMessages(conversationId).then((msgs) => setHistoryMessages(msgs.map(normalizeRestMessage)));
  }, [conversationId]);

  const messages = useMemo(() => {
    const combined = [...historyMessages, ...liveMessages.map(normalizeLiveMessage)];
    return combined.map((m) => ({ ...m, isRead: m.isRead || readMessageIds.has(m.id) }));
  }, [historyMessages, liveMessages, readMessageIds]);

  useEffect(() => {
    if (conversationId && status === "open") {
      markAsRead();
    }
  }, [conversationId, status, liveMessages.length, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (messageEventTick > 0) loadConversations();
  }, [loadConversations, messageEventTick]);

  useEffect(() => {
    if (readMessageIds.size > 0) {
      loadConversations();
      refreshMessagesUnreadCount();
    }
  }, [loadConversations, readMessageIds.size, refreshMessagesUnreadCount]);


    const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText);
    setMessageText("");
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getParticipantInfo = (conversation) => {
    if (!conversation) return { id: null, name: "Unknown", avatar: "", isOnline: false };
    const isMeClient = currentUser?.id === conversation.client;
    const other = isMeClient ? conversation.freelancer_detail : conversation.client_detail;
    const name = other?.name || "Unknown";
    return {
      id: other?.id,
      name,
      avatar: other?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      isOnline: false,
    };
  };
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aTime = a.messages?.[a.messages.length - 1]?.timestamp || a.created_at;
      const bTime = b.messages?.[b.messages.length - 1]?.timestamp || b.created_at;
      return new Date(bTime) - new Date(aTime);
    });
  }, [conversations]);

  const filteredConversations = sortedConversations.filter((c) =>
    getParticipantInfo(c).name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-page">
      <Container fluid="xxl">
        <Card className="chat-wrapper border-0">
          <Card.Body className="p-0">
            <Row className="g-0 h-100">
              {/* CONVERSATIONS LIST — hidden on mobile once a chat is open */}
              <Col
                md={4}
                className={`border-end conversations-column ${isChatOpenOnMobile ? "d-none d-md-block" : ""}`}>
                <div className="chat-header">
                  <h5 className="mb-3 fw-bold text-primary">Messages</h5>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-end-0">
                      <Search className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search conversations..."
                      className="border-start-0 bg-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </div>
                <div className="conversations-list">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    <ListGroup variant="flush">
                      {filteredConversations.map((conversation) => {
                        const participant = getParticipantInfo(conversation);
                        const isActive = currentConversation?.id === conversation.id;
                        const lastMsg = conversation.messages?.[conversation.messages.length - 1];
                        return (
                          <ListGroup.Item
                            key={conversation.id}
                            action
                            active={isActive}
                            onClick={() => navigate(`/chat/${conversation.id}`)}
                            className={`conversation-item px-3 py-3 border-bottom ${isActive ? "bg-primary bg-opacity-10" : ""}`}>
                            <div className="d-flex align-items-center">
                              <img src={participant.avatar} alt={participant.name}
                                className="chat-participant-avatar rounded-circle me-3" width="48" height="48" />
                              <div className="flex-grow-1 min-width-0">
                              <h6 className="mb-0 text-truncate fw-bold">
                                {participant.name}
                                {conversation.unread_count > 0 && (
                                  <Badge bg="danger" pill className="ms-2">{conversation.unread_count}</Badge>
                                )}
                              </h6>
                                <p className="mb-0 text-truncate small last-message">
                                  {lastMsg?.text || conversation.project_detail?.name || "No messages yet"}
                                </p>
                              </div>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-5">
                      <ChatDots size={48} className="text-muted mb-3" />
                      <p className="mb-0">No conversations yet</p>
                    </div>
                  )}
                </div>
              </Col>

              {/* CHAT VIEW — hidden on mobile until a conversation is picked */}
              <Col
                md={8}
                className={`messages-column ${!isChatOpenOnMobile ? "d-none d-md-flex" : "d-flex"} flex-column`}>
                {currentConversation ? (
                  <>
                    <ChatHeader
                      participant={getParticipantInfo(currentConversation)}
                      presence={presence}
                      projectName={currentConversation?.project_detail?.name}
                      onBack={() => navigate("/chat")}
                      serviceProposal={currentConversation?.service_proposal_detail}
                      canEditOffer={isMeClient && Boolean(currentConversation?.service_proposal_detail)}
                      onOfferUpdated={loadConversations}
                    />
                    <div className="chat-messages flex-grow-1">
                      <div className="messages-container chat-messages-container p-3">
                        {messages.length > 0 ? (
                          <div>
                            {messages.map((message, index) => {
                              const isSender = message.senderId === currentUser?.id;
                              const showDate = index === 0 ||
                                new Date(message.timestamp).toDateString() !==
                                  new Date(messages[index - 1].timestamp).toDateString();
                              return (
                                <div key={message.id}>
                                  {showDate && <DateDivider timestamp={message.timestamp} />}
                                  <Message message={message} isSender={isSender}
                                    participant={getParticipantInfo(currentConversation)}
                                    formatTime={formatTime} />
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        ) : (
                          <div className="text-center py-5">
                            <ChatDots size={48} className="text-muted mb-3" />
                            <p className="mb-0">No messages yet. Start the conversation!</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-input">
                      <div className="p-2 p-md-3 border-top">
                        <Form onSubmit={handleSendMessage}>
                          <InputGroup>
                            <Button variant="light" className="action-button d-none d-sm-flex"><Paperclip /></Button>
                            <Form.Control type="text" placeholder="Type a message..."
                              value={messageText} onChange={(e) => setMessageText(e.target.value)}
                              disabled={status !== "open"} />
                            <EmojiPickerButton onEmojiClick={(e) => setMessageText((p) => p + e)} />
                            <Button variant="success" type="submit" className="action-button ms-1"
                              disabled={!messageText.trim() || status !== "open"}>
                              <Send size={20} className="text-white" />
                            </Button>
                          </InputGroup>
                        </Form>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <ChatDots size={64} className="text-muted mb-3" />
                    <h5>Select a conversation</h5>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Chat;