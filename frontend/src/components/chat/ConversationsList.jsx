import React from "react";
import { ListGroup, Badge } from "react-bootstrap";
import { ChatDots } from "react-bootstrap-icons";
import LoadingPreview from "../common/LoadingPreview";

const ConversationsList = ({
  loading,
  conversations,
  currentConversation,
  getParticipantInfo,
  formatTime,
  onSelectConversation,
}) => {
  return (
    <div className="conversations-list">
      {loading && conversations.length === 0 ? (
        <LoadingPreview variant="list" count={4} label="Loading conversations" />
      ) : conversations.length > 0 ? (
        <ListGroup variant="flush">
          {conversations.map((conversation) => {
            const participant = getParticipantInfo(conversation);
            const isActive = currentConversation?.id === conversation.id;

            return (
              <ListGroup.Item
                key={conversation.id}
                action
                active={isActive}
                onClick={() => onSelectConversation(conversation.id)}
                className={`conversation-item ${isActive ? "active" : ""}`}>
                {/* ...existing conversation item content... */}
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
  );
};

export default ConversationsList;
