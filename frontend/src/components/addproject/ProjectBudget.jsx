/** @format */

import { Form, Card, Row, Col } from "react-bootstrap";

const ProjectBudget = ({ formData, handleChange, errors, typeOptions }) => {
  return (
    <Card className="add-project-card">
      <div className="add-project-card-header">
        <h5 className="mb-0 text-light">Budget & Timeline</h5>
      </div>
      <Card.Body className="add-project-card-body">
        <Form.Group className="mb-3">
          <Form.Label>Project Type</Form.Label>
          <Form.Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            isInvalid={!!errors.type}>
            {typeOptions.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.type}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Budget</Form.Label>
          {formData.type === "Fixed Price" ? (
            <div className="input-group">
              <span className="input-group-text">$</span>
              <Form.Control
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="5"
                isInvalid={!!errors.budget}
              />
              <Form.Control.Feedback type="invalid">
                {errors.budget}
              </Form.Control.Feedback>
            </div>
          ) : (
            <Row>
              <Col md={6}>
                <div className="input-group mb-3">
                  <span className="input-group-text">$/hr</span>
                  <Form.Control
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    min="3"
                    isInvalid={!!errors.hourlyRate}
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.hourlyRate}
                </Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <div className="input-group">
                  <Form.Control
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    placeholder="Est. hours (optional)"
                  />
                  <span className="input-group-text">hrs</span>
                </div>
              </Col>
            </Row>
          )}
          <span>
            {formData.type === "Fixed Price"
              ? `$${formData.budget || "0"}`
              : `$${formData.hourlyRate || "0"}/hr`}
          </span>
        </Form.Group>

        <Form.Group>
          <Form.Label>Delivery Time (days)</Form.Label>
          <Form.Control
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            isInvalid={!!errors.duration}
          />
          <Form.Control.Feedback type="invalid">
            {errors.duration}
          </Form.Control.Feedback>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default ProjectBudget;