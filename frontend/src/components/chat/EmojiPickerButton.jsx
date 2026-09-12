/** @format */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { EmojiSmile } from "react-bootstrap-icons";
import EmojiPicker from "emoji-picker-react";

const EmojiPickerButton = ({ onEmojiClick }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    onEmojiClick(emojiData.emoji);
    setShowPicker(false);
  };

  return (
    <div className="position-relative" ref={pickerRef}>
      <Button
        variant="link"
        className="action-button"
        aria-label="Open emoji picker"
        onClick={() => setShowPicker(!showPicker)}>
        <EmojiSmile />
      </Button>

      {showPicker && (
        <div className="emoji-picker-container">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            lazyLoadEmojis={true}
            searchPlaceHolder="Search emojis..."
            width={320}
            height={400}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerButton;
