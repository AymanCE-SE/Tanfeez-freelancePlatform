/** @format */

import { Form, Card } from "react-bootstrap";

const ProjectBasicInfo = ({ formData, handleChange, errors }) => (
  <Card className="add-project-card">
    <div className="add-project-card-header">
      <h5 className="mb-0 text-light">Basic Information</h5>
    </div>
    <Card.Body className="add-project-card-body">
    <Form.Group className="mb-3">
  <Form.Label>Project Title</Form.Label>
  <Form.Control
    name="name"
    value={formData.name}
    onChange={handleChange}
    isInvalid={!!errors.name}
  />
  <Form.Control.Feedback type="invalid">
    {errors.name}
  </Form.Control.Feedback>
</Form.Group>

<Form.Group>
  <Form.Label>Description</Form.Label>
  <Form.Control
    as="textarea"
    rows={4}
    name="description"
    value={formData.description}
    onChange={handleChange}
    isInvalid={!!errors.description}
  />
  <Form.Control.Feedback type="invalid">
    {errors.description}
  </Form.Control.Feedback>
</Form.Group>

      {/* <Form.Group className="mt-3">
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          isInvalid={!!errors.start_date}
        />
        <Form.Control.Feedback type="invalid">
          {errors.start_date}
        </Form.Control.Feedback>
      </Form.Group> */}

      {/* <Form.Group className="mt-3">
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          isInvalid={!!errors.end_date}
        />
        <Form.Control.Feedback type="invalid">
          {errors.end_date}
        </Form.Control.Feedback>
      </Form.Group> */}
    </Card.Body>
  </Card>
);

export default ProjectBasicInfo;