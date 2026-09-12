import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, InputGroup, Navbar } from 'react-bootstrap';
import apiClient from '../api/client';

// Bubble colors
const BUBBLE_COLORS = {
  user: {
    background: '#007bff', // Primary blue
    text: '#ffffff',       // White text
  },
  assistant: {
    background: '#f8f9fa',  // Light gray
    text: '#212529',        // Dark text
  }
};

// Helper function to format timestamp
const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return ''; // Fallback if parsing fails
  }
};

// Simple markdown parser without external dependencies
const SimpleMarkdown = ({ content }) => {
  // Process content for basic markdown: bold, italic, code, links, lists
  const formatMarkdown = (text) => {
    if (!text) return '';

    // Convert line breaks to <br> tags
    let formatted = text.replace(/\n/g, '<br>');

    // Bold: **text** or __text__
    formatted = formatted.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    // Italic: *text* or _text_
    formatted = formatted.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // Code blocks: ```code```
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-light p-2 rounded"><code>$1</code></pre>');

    // Inline code: `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-light px-1 rounded">$1</code>');

    // Unordered lists
    formatted = formatted.replace(/^\s*[-*]\s+(.*?)(?=\n|$)/gm, '<li>$1</li>').replace(/<li>(.*?)<\/li>(?:\s*<li>)/g, '<li>$1</li><li>');
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
      // Fix nested lists
      formatted = formatted.replace(/<\/ul><ul>/g, '');
    }

    // Headers
    formatted = formatted.replace(/^###\s+(.*?)(?=\n|$)/gm, '<h5>$1</h5>');
    formatted = formatted.replace(/^##\s+(.*?)(?=\n|$)/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^#\s+(.*?)(?=\n|$)/gm, '<h3>$1</h3>');

    // Links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    return formatted;
  };

  return <div dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }} />;
};

// Individual Message Bubble Component with Markdown support
const MessageBubble = ({ message }) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';

  const bubbleStyle = {
    backgroundColor: isUser ? BUBBLE_COLORS.user.background : BUBBLE_COLORS.assistant.background,
    color: isUser ? BUBBLE_COLORS.user.text : BUBBLE_COLORS.assistant.text,
    borderRadius: '18px',
    padding: '10px 16px',
    maxWidth: '100%',
    wordWrap: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    border: isUser ? 'none' : '1px solid #dee2e6',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    marginBottom: '8px',
  };

  const timestampStyle = {
    fontSize: '0.75rem',
    color: '#6c757d',
    marginTop: '4px',
    marginLeft: isUser ? '0' : '12px',
    marginRight: isUser ? '12px' : '0',
  };

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>
        {isUser ? (
          <div>{content}</div>
        ) : (
          <SimpleMarkdown content={content} />
        )}
      </div>
      {timestamp && (
        <div style={timestampStyle}>
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
  const messagesEndRef = useRef(null); // For auto-scrolling
  const messageContainerRef = useRef(null); // Reference to the message container

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
    if (!inputValue.trim()) return;
    setError(null);

    // Save the current scroll height
    const container = messageContainerRef.current;
    const previousHeight = container?.scrollHeight || 0;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
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

      if (data.model_response) {
        setMessages(prevMessages => [data.model_response, ...prevMessages]); // Reverse the order

        // Adjust scroll position after new content is added
        if (container) {
          const newScrollTop = container.scrollHeight - previousHeight;
          container.scrollTop = newScrollTop;
        }
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
      if (data.new_conversation_created) {
      }

    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start a new conversation
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInputValue('');
  };

  // Function to render the send button with icon
  const renderSendButton = () => {
    return (
      <Button
        variant="primary"
        onClick={handleSendMessage}
        disabled={isLoading || !inputValue.trim()}
        className="d-flex align-items-center justify-content-center"
      >
        <span className="me-1">Send</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
        </svg>
      </Button>
    );
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
                style={{ display: "block", margin: "0 auto" }}
                className="mt-3 px-4 py-2 fs-5 rounded-3 align-items-center"
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
    <Container fluid="md" className="d-flex flex-column  p-0 shadow-lg rounded overflow-hidden" style={{
      height
        : '80vh', maxWidth: '768px', border: '1px solid #dee2e6'
    }}>
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="false" className="px-3">
        <Navbar.Brand href="#home" className="fw-semibold">Tanfeez Chatbot</Navbar.Brand>
        <Button variant="info" size="sm" onClick={handleNewConversation}>
          New Chat
        </Button>
      </Navbar>

      {/* Message Display Area */}
      <div
        ref={messageContainerRef}
        className="flex-grow-1 p-3"
        style={{
          overflowY: 'auto',
          backgroundColor: '#f0f2f5', // Chat background color
          display: 'flex',
          flexDirection: 'column-reverse', // Change to column-reverse
          gap: '8px',
          padding: '16px'
        }}
      >
        {/* Update the messages rendering order */}
        <div ref={messagesEndRef} /> {/* Move anchor to top */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id || `msg-${Math.random()}`} message={msg} />
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
        <div className="p-2 text-center bg-white border-top" style={{ borderBottom: '1px solid #dee2e6' }}>
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
        <InputGroup>
          <Form.Control
            as="textarea"
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && inputValue.trim()) handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            disabled={isLoading}
            aria-label="Type your message"
            style={{ resize: 'none', maxHeight: '120px', overflowY: 'auto' }}
          />
          {renderSendButton()}
        </InputGroup>
        <div className="text-muted small mt-1">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </Container>
  );
};

// Example App component to showcase ChatbotInterface