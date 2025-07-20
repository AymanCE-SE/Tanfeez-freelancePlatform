import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FiUpload, FiDollarSign, FiX, FiImage, FiInfo, FiYoutube, FiTag } from 'react-icons/fi';
import '../styles/CreateService.css';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addServiceAction, updateServiceAction, getServiceByIdAction } from '../store/slices/serviceSlice';

const CreateService = () => {
  const { id } = useParams();
  const { service } = useSelector((myStore) => myStore.serviceSlice);

  const galleryInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    service_name: '',
    category: '',
    tags: [],
    price: '',
    description: '',
    photo: null,           // Thumbnail image
    galleryImages: [],     // Multiple gallery images
    video: ''
  });

  useEffect(() => {
    if (id !== "0") {
      dispatch(getServiceByIdAction(id))
        .unwrap()
        .then((data) => {
          setFormData({
            ...data,
            tags: Array.isArray(data.tags) ? data.tags : [],
            photo: data.photo || null,
            video: data.video || '',
            galleryImages: Array.isArray(data.gallery_images)
              ? data.gallery_images.map(img => img.image)
              : [],  
          });
        })
        .catch((error) => {
          console.error('Failed to load service:', error);
        });
    }
  }, [id, dispatch]);

  const [currentTag, setCurrentTag] = useState('');
  const [validated, setValidated] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [youtubeError, setYoutubeError] = useState('');

  const categories = [
    'Web Development', 'Graphic Design', 'Interior Design', 'Content Writing',
    'Digital Marketing', 'UI/UX Design', 'Video Editing', 'Translation', 'Photography', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'video') setYoutubeError('');
  };

  const handleThumbnailUpload = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        photo: e.target.files[0]
      }));
    }
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubePreview = (e) => {
    e.preventDefault();
    const videoId = extractYoutubeId(formData.video);
    if (videoId) {
      setYoutubeVideoId(videoId);
      setYoutubeError('');
    } else {
      setYoutubeError('Please enter a valid YouTube URL');
      setYoutubeVideoId('');
    }
  };
  // Add tag to the tags array
  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() !== '' && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  // Handle tag input keypress (add on Enter)
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(e);
    }
  };

  // Remove tag from the tags array
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleRemoveYoutubeVideo = () => {
    setFormData(prev => ({
      ...prev,
      video: ''
    }));
    setYoutubeVideoId('');
    setYoutubeError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false || (!formData.photo && id === "0")) {
      e.stopPropagation();
      setValidated(true);
      if (!formData.photo && id === "0") {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please upload a thumbnail image.'
        });
      }
      return;
    }

    if (formData.video && !extractYoutubeId(formData.video)) {
      setYoutubeError('Invalid YouTube URL.');
      return;
    }

    const serviceData = new FormData();
    serviceData.append('service_name', formData.service_name);
    serviceData.append('category', formData.category);
    serviceData.append('price', formData.price);
    serviceData.append('description', formData.description);
    serviceData.append('video', formData.video);

    if (formData.photo instanceof File) {
      serviceData.append('photo', formData.photo);
    }
    formData.galleryImages.forEach(img => {
      if (img instanceof File) {
        serviceData.append('gallery_images', img);
      }
    });
    formData.tags.forEach(tag => serviceData.append('tags', tag));



    const action = id !== "0"
      ? updateServiceAction({ id, data: serviceData })
      : addServiceAction(serviceData);

    dispatch(action).unwrap()
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: id !== "0" ? 'Service updated successfully' : 'Service created successfully',
          showConfirmButton: false,
          timer: 1500
        }).then(() => navigate('/services'));
      })
      .catch((error) => {
        const errorMessages = [];
        if (error?.data) {
          for (const key in error.data) {
            if (Array.isArray(error.data[key])) {
              errorMessages.push(...error.data[key]);
            } else {
              errorMessages.push(error.data[key]);
            }
          }
        } else {
          errorMessages.push('An unknown error occurred.');
        }

        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          html: errorMessages.join('<br>'),
        });
      });
  };

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="fw-bold">Add a New Service</h1>
          <p className="text-muted mb-0">
            Complete the form below to create a service that clients can order.
          </p>
        </div>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card className="mb-4 custom-card">
                <div className="card-header-custom">
                  <h5 className="mb-0 text-light">Basic Information</h5>
                </div>
                <Card.Body className="card-body-custom">
                  <Form.Group className="mb-4">
                    <Form.Label>Service Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="service_name"
                      value={formData.service_name}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a service title.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Please select a category.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Tags</Form.Label>
                    <div className="d-flex input-group-custom">
                      <Form.Control
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        placeholder="E.g., responsive, modern, etc."
                        className="form-control-custom"
                      />
                      <Button
                        variant="primary"
                        onClick={handleAddTag}
                        className="px-3"
                      >
                        <FiTag /> Add
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Press Enter to add a tag
                    </Form.Text>
                    <div className="mt-3">
                      {formData.tags.map((tag, index) => (
                        <span className="tag-badge" key={index}>
                          {tag}
                          <FiX
                            className="remove-tag-icon"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </span>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Starting Price ($)</Form.Label>
                    <div className="input-group input-group-custom">
                      <span className="input-group-text"><FiDollarSign /></span>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid starting price.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4 custom-card">
                <div className="card-header-custom">
                  <h5 className="mb-0 text-light">Service Description</h5>
                </div>
                <Card.Body className="card-body-custom">
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a service description.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="mb-4 custom-card">
                <div className="card-header-custom">
                  <h5 className="mb-0 text-light">Media</h5>
                </div>
                <Card.Body className="card-body-custom">
                  <Form.Group className="mb-4">
                    <Form.Label>Thumbnail Image</Form.Label>
                    <div className="mb-3">
                      {formData.photo ? (
                        <div className="thumbnail-preview">
                          <img
                            src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : formData.photo}
                            alt="Thumbnail preview"
                            className="thumbnail-image"
                          />
                          <Button
                            variant="light"
                            className="remove-button"
                            onClick={() => setFormData({ ...formData, photo: null })}
                          >
                            <FiX size={18} />
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="thumbnail-upload" className="thumbnail-container">
                          <FiImage size={48} className="text-muted mb-2" />
                          <p className="text-muted mb-0">Click to upload thumbnail image</p>
                          <input
                            id="thumbnail-upload"
                            type="file"
                            className="d-none"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                          />
                        </label>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>YouTube Video (Optional)</Form.Label>
                    <div className="youtube-form">
                      <div className="input-group input-group-custom">
                        <Form.Control
                          type="text"
                          name="video"
                          value={formData.video}
                          onChange={handleInputChange}
                          placeholder="Paste YouTube URL"
                        />
                        <Button variant="primary" onClick={handleYoutubePreview}>
                          <FiYoutube /> Preview
                        </Button>
                      </div>

                      {youtubeError && <div className="text-danger small mt-2">{youtubeError}</div>}

                      {youtubeVideoId && (
                        <div className="youtube-preview mt-3">
                          <div className="youtube-container">
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                              title="YouTube video"
                              frameBorder="0"
                              allowFullScreen
                              className="youtube-iframe"
                            ></iframe>
                            <Button
                              variant="light"
                              className="remove-button"
                              onClick={handleRemoveYoutubeVideo}
                            >
                              <FiX size={18} />
                            </Button>
                          </div>
                          <div className="text-muted small mt-2">
                            <FiInfo className="me-1" /> This video will be shown on your service page
                          </div>
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Gallery Images</Form.Label>
                    <div className="mb-3">
                      <label htmlFor="gallery-upload" className="gallery-container">
                        <FiImage size={32} className="text-muted mb-2" />
                        <span className="text-muted mb-0">Click to upload gallery images</span>
                        <input
                          id="gallery-upload"
                          type="file"
                          multiple
                          className="d-none"
                          accept="image/*"
                          onChange={e => setFormData({
                            ...formData,
                            galleryImages: [
                              ...(formData.galleryImages || []),
                              ...Array.from(e.target.files)
                            ]
                          })}
                        />
                      </label>
                      <div className="gallery-grid mt-2">
                        {formData.galleryImages.map((img, idx) => (
                          <div key={idx} className="gallery-item">
                            <img
                              src={img instanceof File ? URL.createObjectURL(img) : img}
                              alt={`Gallery ${idx + 1}`}
                              className="gallery-image"
                            />
                            <Button
                              variant="light"
                              className="remove-button"
                              onClick={() => setFormData({
                                ...formData,
                                galleryImages: formData.galleryImages.filter((_, i) => i !== idx)
                              })}
                            >
                              <FiX size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="primary" type="submit" className="button-primary">
              Publish Service
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default CreateService;
