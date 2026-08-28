/** @format */

import React from "react";
import { CheckCircleFill } from "react-bootstrap-icons";

const Message = ({ message, isSender, participant, formatTime }) => (
  <div
    className={`d-flex ${
      isSender ? "justify-content-end" : "justify-content-start"
    } mb-3`}>
    {!isSender && (
      <img
        src={participant.avatar}
        alt={participant.name}
        className="rounded-circle me-2 align-self-end"
        width="32"
        height="32"
        style={{ objectFit: "cover" }}
      />
    )}
    <div
      className={`message ${isSender ? "message-sent" : "message-received"}`}>
      <div className="message-content">{message.content}</div>
      <div
        className={`message-meta d-flex align-items-center ${
          isSender ? "justify-content-end" : "justify-content-start"
        } mt-1`}>
        <small className="text-muted me-2">
          {formatTime(message.timestamp)}
        </small>
          {isSender && (
            <small className={message.isRead ? "text-primary" : "text-muted"}>
              <CheckCircleFill size={12} />
            </small>
          )}
      </div>
    </div>
  </div>
);

export default Message;
