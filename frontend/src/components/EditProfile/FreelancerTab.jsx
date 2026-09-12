/** @format */
import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Badge,
  CloseButton,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyFreelancerProfileAction,
  updateFreelancerProfileAction,
} from "../../store/slices/userSlice";
import Swal from "sweetalert2";
import { fetchSkills, createSkill } from "../../api/skill";

const FreelancerTab = ({ navigate, id }) => {
  const [formData, setFormData] = useState({
    skills: [],
    certifications: [],
    educations: [],
    languages: [],
    qualities: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { freelancer, isLoading } = useSelector((state) => state.userSlice);

  // State for new cert/edu
  const [newCert, setNewCert] = useState({ name: "", issuer: "", year: "" });
  const [newEdu, setNewEdu] = useState({ degree: "", school: "", year: "" });

  // Load freelancer data
  useEffect(() => {
    if (!freelancer) {
      dispatch(getMyFreelancerProfileAction());
    }
  }, [freelancer, dispatch]);

  // Load skills on mount
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await fetchSkills();
        setAllSkills(data);
      } catch (err) {
        console.error("Failed to load skills:", err.message);
      }
    };
    loadSkills();
  }, []);

  
  // Populate form when freelancer data is available
useEffect(() => {
  if (freelancer) {
    // Extract only the skill IDs from the nested skill objects
    const skillIds = freelancer.skills?.map(skill => skill.id) || [];

    setFormData({
      cv: freelancer.cv || "",
      experience_level: freelancer.experience_level || "junior",
      portfolio: freelancer.portfolio || "",
      skills: skillIds,
      certifications: freelancer.certifications || [],
      educations: freelancer.educations || [],
      // Convert arrays to comma-separated strings for form display
      languages: Array.isArray(freelancer.languages_list) 
        ? freelancer.languages_list.join(", ") 
        : (freelancer.languages || ""),
      qualities: Array.isArray(freelancer.qualities_list) 
        ? freelancer.qualities_list.join(", ") 
        : (freelancer.qualities || ""),
    });
  }
}, [freelancer]);

  // Debounce skill input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (skillInput.trim()) {
        const filtered = allSkills.filter((skill) =>
          skill.skill_name.toLowerCase().includes(skillInput.toLowerCase())
        );
        setSuggestedSkills(filtered);
      } else {
        setSuggestedSkills([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [skillInput, allSkills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
  };

  const handleAddSkill = (skillId) => {
    if (!formData.skills.includes(skillId)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillId],
      }));
    }
    setSkillInput("");
    setSuggestedSkills([]);
  };

  const handleCreateNewSkill = async () => {
    if (!skillInput.trim()) return;

    try {
      const newSkill = await createSkill(skillInput.trim());

      setAllSkills((prev) => [...prev, newSkill]);
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.id],
      }));
      setSkillInput("");
      setSuggestedSkills([]);

      Swal.fire({
        icon: "success",
        title: "Skill Created",
        text: `"${newSkill.skill_name}" has been added.`,
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (err) {
      const message =
        err.response?.data?.name?.[0] ||
        "Failed to create new skill.";

      if (message.includes("already exists")) {
        const existingSkill = allSkills.find(
          s => s.skill_name.toLowerCase() === skillInput.trim().toLowerCase()
        );

        if (existingSkill && !formData.skills.includes(existingSkill.id)) {
          handleAddSkill(existingSkill.id);
        }

        Swal.fire({
          icon: "info",
          title: "Skill Exists",
          text: "This skill already exists. It has been selected automatically.",
          timer: 2000,
          showConfirmButton: false,
        });

      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        });
      }
    }
  };

  const handleSkillRemove = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((id) => id !== skillId),
    }));
  };

  // Certification handlers
  const handleAddCert = (e) => {
    e.preventDefault();
    if (newCert.name && newCert.issuer && newCert.year) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCert],
      }));
      setNewCert({ name: "", issuer: "", year: "" });
    }
  };

  const handleRemoveCert = (idx) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));
  };

  // Education handlers
  const handleAddEdu = (e) => {
    e.preventDefault();
    if (newEdu.degree && newEdu.school && newEdu.year) {
      setFormData((prev) => ({
        ...prev,
        educations: [...(prev.educations || []), newEdu],
      }));
      setNewEdu({ degree: "", school: "", year: "" });
    }
  };

  const handleRemoveEdu = (idx) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (!formData.experience_level) {
      setError("Please select an experience level.");
      return;
    }
  
    if (formData.skills.length === 0) {
      setError("At least one skill is required.");
      return;
    }
  
    try {
      const payload = {
        cv: formData.cv,
        experience_level: formData.experience_level,
        portfolio: formData.portfolio,
        skills: formData.skills.map(Number), // Ensure skills are numbers
        certifications: formData.certifications,
        educations: formData.educations,
        // Send arrays in the proper field names
        languages_list: formData.languages.split(",").map(lang => lang.trim()).filter(Boolean),
        qualities_list: formData.qualities.split(",").map(q => q.trim()).filter(Boolean)
      };
  
  
      await dispatch(updateFreelancerProfileAction(payload))
        .unwrap()
        .then(() => {
          dispatch(getMyFreelancerProfileAction()); // Refresh profile
          Swal.fire({
            icon: "success",
            title: "Profile Updated",
            text: "Your profile has been updated successfully",
            timer: 3000,
            showConfirmButton: false,
          });
        })
        .catch((err) => {
          let errorMessage = "Profile could not be updated.";
          if (err && typeof err === "object") {
            errorMessage = Object.entries(err)
              .map(([key, value]) => `${key}: ${value.join(", ")}`)
              .join("; ");
          }
  
          Swal.fire({
            icon: "error",
            title: "Profile Not Updated",
            html: `<pre>${errorMessage}</pre>`,
            footer: "Check console for full details",
          });
        });
  
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
  };


  return (
    <Form onSubmit={handleSubmit}>
      <h4 className="edit-profile-section-title">Professional Information</h4>
      <Row>
        {/* <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>CV Link</Form.Label>
            <Form.Control
              type="text"
              name="cv"
              value={formData.cv || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col> */}
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Expertise Level</Form.Label>
            <Form.Select
              name="experience_level"
              value={formData.experience_level || "junior"}
              onChange={handleChange}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Skills Section */}
      <Form.Group className="mb-3">
        <Form.Label>Skills</Form.Label>
        <div className="position-relative">
          <Form.Control
            type="text"
            placeholder="Search or add a skill"
            value={skillInput}
            onChange={handleSkillInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateNewSkill();
              }
            }}
          />

          {/* Suggestions Dropdown */}
          {suggestedSkills.length > 0 && (
            <ul className="list-group position-absolute w-100 mt-1 z-10 shadow">
              {suggestedSkills.map((skill) => (
                <li
                  key={skill.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleAddSkill(skill.id)}
                  style={{ cursor: "pointer" }}
                >
                  {skill.skill_name}
                </li>
              ))}
              <li
                className="list-group-item list-group-item-action text-primary"
                onClick={handleCreateNewSkill}
                style={{ cursor: "pointer" }}
              >
                + Add "{skillInput}"
              </li>
            </ul>
          )}
        </div>

        {/* Selected Skills Badges */}
        <div className="d-flex flex-wrap gap-2 mt-2">
          {formData.skills.map((id) => {
            const skill = allSkills.find((s) => s.id === id);
            return (
              <Badge key={id} bg="primary" className="d-flex align-items-center">
                {skill ? skill.skill_name : `Skill ID: ${id}`}
                <CloseButton
                  onClick={() => handleSkillRemove(id)}
                  className="ms-2"
                />
              </Badge>
            );
          })}
        </div>

        {error && <div className="text-danger mt-2">{error}</div>}
      </Form.Group>

      {/* Certifications */}
      <Form.Group className="mb-3">
        <Form.Label>Certifications</Form.Label>
<div className="d-flex flex-wrap gap-2 mb-2">
  {(formData.certifications || []).map((cert, idx) => (
    <Badge 
      key={`cert-${cert.id || idx}`} 
      bg="info" 
      className="d-flex align-items-center"
    >
      {cert.name} {cert.issuer && `(${cert.issuer})`}{" "}
      {cert.year && `- ${cert.year}`}
      <CloseButton
        className="ms-2"
        onClick={() => handleRemoveCert(idx)}
      />
    </Badge>
  ))}
</div>
        <Row>
          <Col>
            <Form.Control
              placeholder="Name"
              value={newCert.name}
              onChange={(e) =>
                setNewCert({ ...newCert, name: e.target.value })
              }
            />
          </Col>
          <Col>
            <Form.Control
              placeholder="Issuer"
              value={newCert.issuer}
              onChange={(e) =>
                setNewCert({ ...newCert, issuer: e.target.value })
              }
            />
          </Col>
          <Col>
            <Form.Control
              placeholder="Year"
              value={newCert.year}
              onChange={(e) =>
                setNewCert({ ...newCert, year: e.target.value })
              }
            />
          </Col>
          <Col xs="auto">
            <Button onClick={handleAddCert}>Add</Button>
          </Col>
        </Row>
      </Form.Group>

      {/* Educations */}
      <Form.Group className="mb-3">
        <Form.Label>Educations</Form.Label>
<div className="d-flex flex-wrap gap-2 mb-2">
  {(formData.educations || []).map((edu, idx) => (
    <Badge 
      key={`edu-${edu.id || idx}`} 
      bg="secondary" 
      className="d-flex align-items-center"
    >
      {edu.degree} - {edu.school} {edu.year && `(${edu.year})`}
      <CloseButton
        className="ms-2"
        onClick={() => handleRemoveEdu(idx)}
      />
    </Badge>
  ))}
</div>
        <Row>
          <Col>
            <Form.Control
              placeholder="Degree"
              value={newEdu.degree}
              onChange={(e) =>
                setNewEdu({ ...newEdu, degree: e.target.value })
              }
            />
          </Col>
          <Col>
            <Form.Control
              placeholder="School"
              value={newEdu.school}
              onChange={(e) =>
                setNewEdu({ ...newEdu, school: e.target.value })
              }
            />
          </Col>
          <Col>
            <Form.Control
              placeholder="Year"
              value={newEdu.year}
              onChange={(e) =>
                setNewEdu({ ...newEdu, year: e.target.value })
              }
            />
          </Col>
          <Col xs="auto">
            <Button onClick={handleAddEdu}>Add</Button>
          </Col>
        </Row>
      </Form.Group>

      {/* Languages */}
      <Form.Group className="mb-3">
        <Form.Label>Languages</Form.Label>
        <Form.Control
          as="textarea"
          name="languages"
          value={formData.languages}
          onChange={handleChange}
          placeholder="Enter languages separated by commas (e.g., English, Arabic, French)"
          rows={2}
        />
      </Form.Group>

      {/* Add qualitites */}
      <Form.Group className="mb-3">
        <Form.Label>Personal Qualities / Expertise</Form.Label>
        <Form.Control
          as="textarea"
          name="qualities"
          value={formData.qualities}
          onChange={handleChange}
          placeholder="E.g., Detail-oriented, Creative, Fast learner"
          rows={2}
        />
      </Form.Group>

      {/* Submit Buttons */}
      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(`/profile/${id}`)}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </div>
    </Form>
  );
};

export default FreelancerTab;