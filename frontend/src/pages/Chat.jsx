/** @format */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Container, Row, Col, Card, Form, Button, ListGroup, Badge, InputGroup,
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

// بتحول شكل الرسالة القادمة من الـ REST (history) لنفس شكل الرسالة القادمة من الـ WebSocket (live)
// عشان الـ <Message /> component ياخدهم بنفس الطريقة من غير ما يعرف الفرق
const normalizeRestMessage = (m) => ({
  id: m.id,
  content: m.text,
  senderId: m.sender,
  timestamp: m.timestamp,
});
const normalizeLiveMessage = (m) => ({
  id: `${m.sender_id}-${m.timestamp}`, // مفيش id حقيقي من الـ socket، بنعمل واحد فريد
  content: m.message,
  senderId: m.sender_id,
  timestamp: m.timestamp,
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

  // الـ hook بيفتح اتصال جديد أوتوماتيك كل ما conversationId يتغير
  const { liveMessages, sendMessage, status } = useChatSocket(conversationId);

  // 1. هات ليست الأوض مرة واحدة لما الصفحة تفتح
  useEffect(() => {
    getChatRooms()
      .then((rooms) => {
        setConversations(rooms);
        if (!conversationId && rooms.length > 0) {
          navigate(`/chat/${rooms[0].id}`, { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. هات الـ history بتاع الأوضة دي بس لما تتفتح
  useEffect(() => {
    if (!conversationId) return;
    getMessages(conversationId).then((msgs) =>
      setHistoryMessages(msgs.map(normalizeRestMessage))
    );
  }, [conversationId]);

  // 3. ادمج الـ history + الرسايل اللايف الجديدة في ليست واحدة للعرض
  const messages = useMemo(
    () => [...historyMessages, ...liveMessages.map(normalizeLiveMessage)],
    [historyMessages, liveMessages]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText); // بس كده — مفيش setState يدوي للرسالة الجديدة،
    setMessageText("");        // هتيجي أوتوماتيك من onmessage بتاع الـ hook زي أي حد تاني
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

  const filteredConversations = conversations.filter((c) => {
    const p = getParticipantInfo(c);
    return p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="chat-page">
      <Container fluid="xxl">
        <Card className="chat-wrapper border-0">
          <Card.Body className="p-0">
            <Row className="g-0 h-100">
              <Col md={4} className="border-end conversations-column">
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
                                className="rounded-circle me-3" width="48" height="48"
                                style={{ objectFit: "cover" }} />
                              <div className="flex-grow-1 min-width-0">
                                <h6 className="mb-0 text-truncate fw-bold">{participant.name}</h6>
                                <p className="mb-0 text-truncate small last-message">
                                  {lastMsg?.text || "No messages yet"}
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

              <Col md={8} className="messages-column">
                {currentConversation ? (
                  <>
                    <ChatHeader participant={getParticipantInfo(currentConversation)} />
                    <div className="chat-messages">
                      <div className="messages-container p-3"
                        style={{ height: "calc(100vh - 240px)", overflowY: "auto" }}>
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
                      <div className="p-3 border-top">
                        <Form onSubmit={handleSendMessage}>
                          <InputGroup>
                            <Button variant="light" className="action-button"><Paperclip /></Button>
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