import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Badge, Navbar } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import apiClient from '../api/client';
import '../styles/ChatBot.css';

// Helper function to format timestamp
const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ''; // Fallback if parsing fails
  }
};

const getLastMessage = (conversation) => {
  const messages = conversation.messages || [];
  return messages[messages.length - 1] || null;
};

const getConversationActivity = (conversation) =>
  getLastMessage(conversation)?.timestamp || conversation.updated_at || conversation.created_at;

const formatConversationDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const getRequestError = (error, fallback) => {
  const responseError = error.response?.data?.detail || error.response?.data?.error;
  return typeof responseError === 'string' ? responseError : error.message || fallback;
};

const MarkdownContent = ({ content }) => (
  <ReactMarkdown
    components={{
      a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      ),
    }}
  >
    {content || ''}
  </ReactMarkdown>
);

// Individual Message Bubble Component with Markdown support
const MessageBubble = ({ message }) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';

  return (
    <div className={`chatbot-message ${isUser ? 'is-user' : 'is-assistant'}`}>
      <div className="chatbot-bubble">
        {isUser ? (
          <div>{content}</div>
        ) : (
          <MarkdownContent content={content} />
        )}
      </div>
      {timestamp && (
        <div className="chatbot-timestamp">
          {formatTimestamp(timestamp)}
        </div>
      )}
    </div>
  );
};

// Main Chatbot Interface Component using React Bootstrap
export const ChatbotInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [historyNextPage, setHistoryNextPage] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [openingConversationId, setOpeningConversationId] = useState(null);
  const messagesEndRef = useRef(null); // For auto-scrolling
  const messageContainerRef = useRef(null); // Reference to the message container
  const inputRef = useRef(null);

  const loadConversationHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setHistoryLoading(true);
    try {
      const { data } = await apiClient.get('conversations/');
      const conversationList = Array.isArray(data) ? data : data?.results || [];
      setHistoryNextPage(data?.next || null);
      setConversations([...conversationList].sort((first, second) => (
        new Date(getConversationActivity(second)) - new Date(getConversationActivity(first))
      )));
      setHistoryError(null);
    } catch (historyRequestError) {
      setHistoryError(getRequestError(historyRequestError, 'Could not load conversation history.'));
    } finally {
      if (!silent) setHistoryLoading(false);
    }
  }, []);

  const handleLoadMoreHistory = async () => {
    if (!historyNextPage || historyLoading) return;
    setHistoryLoading(true);
    try {
      const { data } = await apiClient.get(historyNextPage);
      const nextConversations = Array.isArray(data) ? data : data?.results || [];
      setConversations((currentConversations) => {
        const existingIds = new Set(currentConversations.map((conversation) => conversation.id));
        return [...currentConversations, ...nextConversations.filter((conversation) => !existingIds.has(conversation.id))]
          .sort((first, second) => (
            new Date(getConversationActivity(second)) - new Date(getConversationActivity(first))
          ));
      });
      setHistoryNextPage(data?.next || null);
      setHistoryError(null);
    } catch (historyRequestError) {
      setHistoryError(getRequestError(historyRequestError, 'Could not load older conversations.'));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      loadConversationHistory();
    }
  }, [loadConversationHistory]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = 'auto';
    const maxHeight = 160;
    input.style.height = `${Math.min(input.scrollHeight, maxHeight)}px`;
    input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputValue]);

  // Modify the scroll behavior to go up
  const scrollToTop = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    // Check if user is close to top before auto-scrolling
    const isUserNearTop = container.scrollTop < 100;

    if (isUserNearTop) {
      container.scrollTop = 0;
    }
  };

  // Update the useEffect to use the new scroll behavior
  useEffect(() => {
    scrollToTop();
  }, [messages]);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isLoading) return;
    setError(null);

    // Save the current scroll height
    const container = messageContainerRef.current;
    const previousHeight = container?.scrollHeight || 0;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages => [userMessage, ...prevMessages]); // Reverse the order
    setInputValue('');
    setIsLoading(true);

    try {
      const { data } = await apiClient.post('chat/', {
          prompt: userMessage.content,
          conversation_id: conversationId,
      });

      const responseMessages = [data.model_response, data.user_message || userMessage].filter(Boolean);
      setMessages((prevMessages) => [
        ...responseMessages,
        ...prevMessages.filter((message) => message.id !== userMessage.id),
      ]);

      // Adjust scroll position after new content is added
      if (container) {
        const newScrollTop = container.scrollHeight - previousHeight;
        container.scrollTop = newScrollTop;
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
      loadConversationHistory({ silent: true });

    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prevMessages) => prevMessages.filter((message) => message.id !== userMessage.id));
      setInputValue(userMessage.content);
      const responseError = err.response?.data?.details ?? err.response?.data?.error ?? err.response?.data?.detail;
      setError(typeof responseError === 'string' ? responseError : err.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConversation = async (selectedConversation) => {
    setOpeningConversationId(selectedConversation.id);
    setHistoryError(null);
    try {
      const { data } = await apiClient.get(`conversations/${selectedConversation.id}/`);
      const conversationMessages = Array.isArray(data.messages) ? [...data.messages].reverse() : [];
      setMessages(conversationMessages);
      setConversationId(data.id);
      setInputValue('');
      setError(null);
      setActiveView('chat');
    } catch (historyRequestError) {
      setHistoryError(getRequestError(historyRequestError, 'Could not open this conversation.'));
    } finally {
      setOpeningConversationId(null);
    }
  };

  // Function to start a new conversation
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInputValue('');
    setActiveView('chat');
  };
    if(localStorage.getItem("authToken") === null) {
      return (
        <Container className="py-5 vh-100 d-flex align-items-center justify-content-center">
          <Row className="mb-4 ">
            <Col>
              <h1 className="mb-4"></h1>
              <div className="text-center py-5">
                <p className="text-muted fs-1">Please login to Use Chatbot.</p>
              </div>

              <Button 
                variant="primary"
                // make button in center
                className="chatbot-login-btn mt-3 px-4 py-2 fs-5 rounded-3 align-items-center"
                onClick={() => window.location.href = "/login"}>
                Login
              </Button>
            </Col>
          </Row>
        </Container>
      );
    }

  return (
    // make the hight is 90%
    <Container fluid="md" className="chatbot-shell d-flex flex-column p-0 shadow-lg rounded overflow-hidden">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="false" className="px-3">
        <Navbar.Brand href="#home" className="fw-semibold">Tanfeez Chatbot</Navbar.Brand>
        <Button variant="info" size="sm" onClick={handleNewConversation}>
          New Chat
        </Button>
      </Navbar>

      <div className="chatbot-tabs" role="tablist" aria-label="Chat views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'chat'}
          className={`chatbot-tab ${activeView === 'chat' ? 'is-active' : ''}`}
          onClick={() => setActiveView('chat')}
        >
          Chat
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'history'}
          className={`chatbot-tab ${activeView === 'history' ? 'is-active' : ''}`}
          onClick={() => setActiveView('history')}
        >
          History <Badge bg="secondary">{conversations.length}</Badge>
        </button>
      </div>

      {activeView === 'history' ? (
        <div className="chatbot-history-view flex-grow-1 p-3" role="tabpanel">
          <div className="chatbot-history-heading">
            <div>
              <h2>Conversation history</h2>
              <p>Return to one of your previous chats.</p>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => loadConversationHistory()}
              disabled={historyLoading}
            >
              {historyLoading ? <Spinner animation="border" size="sm" aria-label="Refreshing history" /> : 'Refresh'}
            </Button>
          </div>

          {historyError && <Alert variant="danger">{historyError}</Alert>}

          {historyLoading && conversations.length === 0 ? (
            <div className="chatbot-history-status">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading conversation history...</span>
              </Spinner>
            </div>
          ) : conversations.length === 0 && !historyError ? (
            <div className="chatbot-history-empty">
              <h3>No saved conversations yet</h3>
              <p>Your chats will appear here after your first message.</p>
              <Button variant="primary" onClick={handleNewConversation}>Start a chat</Button>
            </div>
          ) : (
            <div className="chatbot-history-list">
              {conversations.map((conversation) => {
                const lastMessage = getLastMessage(conversation);
                const title = conversation.title || lastMessage?.content || 'Untitled conversation';

                return (
                  <button
                    type="button"
                    className={`chatbot-history-item ${conversationId === conversation.id ? 'is-active' : ''}`}
                    key={conversation.id}
                    onClick={() => handleOpenConversation(conversation)}
                    disabled={openingConversationId !== null}
                  >
                    <span className="chatbot-history-item-heading">
                      <span className="chatbot-history-title">{title}</span>
                      <time dateTime={getConversationActivity(conversation)}>
                        {formatConversationDate(getConversationActivity(conversation))}
                      </time>
                    </span>
                    <span className="chatbot-history-preview">
                      {lastMessage?.content || 'No messages yet'}
                    </span>
                    <span className="chatbot-history-item-footer">
                      <span>{conversation.messages?.length || 0} messages</span>
                      {openingConversationId === conversation.id && (
                        <Spinner animation="border" size="sm" aria-label="Opening conversation" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {historyNextPage && (
            <div className="chatbot-history-more">
              <Button
                variant="outline-primary"
                onClick={handleLoadMoreHistory}
                disabled={historyLoading}
              >
                {historyLoading ? <Spinner animation="border" size="sm" aria-label="Loading older conversations" /> : 'Load older conversations'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Message Display Area */}
      <div
        ref={messageContainerRef}
        className="chatbot-message-list flex-grow-1 p-3"
      >
        {/* Update the messages rendering order */}
        <div ref={messagesEndRef} /> {/* Move anchor to top */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted my-auto">
            <div className="mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z" />
              </svg>
            </div>
            <p>No messages yet. Start typing below!</p>
          </div>
        )}
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="chatbot-loading p-2 text-center bg-white border-top">
          <Spinner animation="grow" size="sm" role="status" variant="primary" className="me-2">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <span className="text-primary">Model is thinking...</span>
        </div>
      )}
      {error && (
        <Alert variant="danger" className="m-0 p-2 small text-center rounded-0 border-top border-bottom-0">
          Error: {error}
        </Alert>
      )}

      {/* Input Area */}
      <div className="p-3 border-top bg-white">
        <div className="chatbot-composer">
          <Form.Control
            ref={inputRef}
            as="textarea"
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (!isLoading && inputValue.trim()) handleSendMessage();
              }
            }}
            placeholder="Message Tanfeez AI..."
            disabled={isLoading}
            aria-label="Message Tanfeez AI"
            className="chatbot-input"
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="chatbot-send-button"
            aria-label="Send message"
            title="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
            </svg>
          </Button>
        </div>
        <div className="text-muted small mt-1">
          Enter to send · Shift+Enter for a new line
        </div>
      </div>
        </>
      )}
    </Container>
  );
};

// Example App component to showcase ChatbotInterface