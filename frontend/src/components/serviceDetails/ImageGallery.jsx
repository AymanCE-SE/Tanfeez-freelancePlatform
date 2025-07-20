/** @format */

import React, { useState } from "react";
import { Image, Modal } from "react-bootstrap";
import { FiZoomIn, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ImageGallery({ mainImage, galleryImages }) {
  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

const allImages = [mainImage, ...galleryImages.map(img => img.image)];
  const handleImageSelect = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[newIndex]);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[newIndex]);
    setCurrentIndex(newIndex);
  };

  return (
    <div className="service-gallery container my-4">
      <div className="main-image-container">
        <Image
          src={selectedImage}
          alt="Main service image"
          className="main-image"
          onClick={() => setShowModal(true)}
        />
        <button className="zoom-button" onClick={() => setShowModal(true)}>
          <FiZoomIn />
        </button>
      </div>

      <div className="thumbnails-container">
        {allImages.map((image, index) => (
          <div
            key={index}
            className={`thumbnail-wrapper ${
              selectedImage === image ? "active" : ""
            }`}
            onClick={() => handleImageSelect(image, index)}>
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="thumbnail-image"
            />
          </div>
        ))}
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        centered
        className="gallery-modal">
        <Modal.Header closeButton />
        <Modal.Body>
          <div className="modal-image-container">
            <button className="nav-button prev" onClick={handlePrevious}>
              <FiChevronLeft />
            </button>
            <Image
              src={selectedImage}
              alt="Full size image"
              className="modal-image"
            />
            <button className="nav-button next" onClick={handleNext}>
              <FiChevronRight />
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
