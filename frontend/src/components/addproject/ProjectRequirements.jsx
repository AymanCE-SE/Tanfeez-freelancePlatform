/** @format */

import { Form, Card, ButtonGroup, ToggleButton, InputGroup, Button, Badge, CloseButton } from "react-bootstrap";
import { FiChevronDown } from "react-icons/fi";
import { useState } from "react";

const ProjectRequirements = ({
  formData,
  setFormData,
  errors,
  levelOptions,
  handleLevelToggle,
  skillSuggestions,
  handleSkillClick,
  suggestionsRef,
  handleChange
}) => {
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  return (
    <Card className="custom-card">
      <div className="card-header-custom">
        <h5 className="mb-0 text-light">Requirements</h5>
      </div>
      <Card.Body className="card-body-custom">
        {/* Skills Section */}
        <Form.Group className="mb-3 position-relative">
          <Form.Label>Skills Required</Form.Label>
          <InputGroup>
            <Form.Control
              name="skills"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              isInvalid={!!errors.skills}
              placeholder="Type a skill and press Add"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <Button variant="outline-primary" onClick={handleAddSkill}>
              Add
            </Button>
          </InputGroup>
          <Form.Control.Feedback type="invalid">
            {errors.skills}
          </Form.Control.Feedback>
          {skillSuggestions.length > 0 && (
            <div ref={suggestionsRef} className="level-options">
              {skillSuggestions.map((skill, idx) => (
                <div
                  key={idx}
                  className="level-option"
                  onClick={() => {
                    setSkillInput(skill);
                  }}>
                  {skill}
                </div>
              ))}
            </div>
          )}
          {/* Display selected skills as badges */}
          <div className="d-flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, idx) => (
              <Badge key={idx} bg="primary" className="d-flex align-items-center">
                {skill}
                <CloseButton
                  onClick={() => handleRemoveSkill(skill)}
                  className="ms-2"
                />
              </Badge>
            ))}
          </div>
        </Form.Group>

        {/* Improved Experience Level Section */}
        <Form.Group className="mb-3">
      <Form.Label className="mb-2 me-5">Experience Level</Form.Label>
      <div className="mt-2">
      <ButtonGroup>
          {levelOptions.map((level, idx) => (
            <ToggleButton
              key={idx}
              id={`exp-level-${level}`}
              type="radio"
              variant={
                formData.experience_level === level
                  ? "primary"
                  : "outline-primary"
              }
              name="experience_level"
              value={level}
              checked={formData.experience_level === level}
              onChange={() => handleLevelToggle(level)}
            >
              {level}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </div>
        {errors.experience_level && (
          <div className="invalid-feedback d-block mt-2">
            {errors.experience_level}
          </div>
        )}
      </Form.Group>

      {/* Location Section */}
      <Form.Group>
        <Form.Label>Location</Form.Label>
        <Form.Control
          name="location"
          value={formData.location}
          onChange={handleChange}
          isInvalid={!!errors.location}
          placeholder="Project location (optional)"
        />
        <Form.Control.Feedback type="invalid">
          {errors.location}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Leave empty if location is not relevant
        </Form.Text>
      </Form.Group>
    </Card.Body>
  </Card>
  );
};

export default ProjectRequirements;