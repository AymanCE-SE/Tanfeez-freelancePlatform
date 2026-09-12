import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, InputGroup, Button, Spinner, Pagination } from "react-bootstrap";
import { Search, Funnel } from "react-bootstrap-icons";
import ProjectCard from "../components/cards/ProjectCard";
import ProjectFilters from "../components/projects/ProjectFilters";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getAllProjectAction } from "../store/slices/projectSlice";
import "../styles/pages/Projects.css";
import "../styles/marketplace.css";

const Projects = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectList, isLoading, error, totalProjects, totalProjectPages } = useSelector((state) => state.projectSlice);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: 10000,
    status: "all",
    type: "all",
    level: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const goToPage = (page) => {
    setSearchParams({ page: String(page) });
  };

  // Fetch projects from backend on mount
  useEffect(() => {
    dispatch(getAllProjectAction(currentPage));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      goToPage(1);
    }
  }, [searchTerm, filters]);

  const filteredProjects = useMemo(() => {
    const filtered = (projectList || []).filter((project) => {
      // Search filter
      const matchesSearch =
        (project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        filters.status === "all" ||
        project.status === filters.status;

      // Type filter
      const typeMap = {
        "Fixed Price": "fixed_price",
        "Hourly": "hourly",
        all: "all"
      };
      const matchesType =
        filters.type === "all" ||
        project.type === typeMap[filters.type];

      // Level filter
      const levelMap = {
        Beginner: "junior",
        Intermediate: "mid",
        Expert: "senior",
        all: "all"
      };
      const matchesLevel =
        filters.level === "all" ||
        project.experience_level === levelMap[filters.level];

      // Budget filter
      const matchesBudget =
        !project.budget || project.budget <= filters.priceRange;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesLevel &&
        matchesBudget
      );
    });

    return filtered;
  }, [projectList, filters, searchTerm]);
  if(localStorage.getItem("authToken") === null) {
    return (
      <Container className="py-5 vh-100 d-flex align-items-center justify-content-center">
        <Row className="mb-4 ">
          <Col>
            <h1 className="mb-4">Available Projects</h1>
            <div className="text-center py-5">
              <p className="text-muted">Please login to view projects.</p>
            </div>
            <div className="text-center">
              <p className="text-muted">You can login from the top right corner.</p>
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

    <Container className="marketplace-page">
      <div className="marketplace-intro">
        <div>
          <span className="marketplace-eyebrow">Open opportunities</span>
          <h1 className="marketplace-title">Projects waiting for the right mind.</h1>
        </div>
        <p className="marketplace-lede">Find meaningful briefs, understand the scope, and send your best proposal with confidence.</p>
      </div>
      <div className="marketplace-toolbar">
            <InputGroup className="marketplace-search">
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button
              className="marketplace-filter-toggle"
              variant="outline-primary"
              onClick={() => setShowFilters(!showFilters)}>
              <Funnel className="me-2" />
              Filters {showFilters ? "Hide" : "Show"}
            </Button>
      </div>

      <Row>
        {showFilters && (
          <Col md={3} className="mb-4">
            <ProjectFilters filters={filters} setFilters={setFilters} />
          </Col>
        )}

        <Col md={showFilters ? 9 : 12}>
          <div className="marketplace-summary">
            {isLoading
              ? "Loading projects..."
              : <><span><strong>{filteredProjects.length}</strong> projects on this page</span><span>{totalProjects} total results</span></>}
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <div className="marketplace-empty text-danger">
              {error || "Failed to load projects."}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="marketplace-empty">
              <p>No projects found matching your criteria.</p>
            </div>
          ) : (
            <Row xs={1} md={showFilters ? 2 : 3} className="marketplace-grid g-4">
              {filteredProjects.map((project) => (
                <Col key={project.id}>
                  <ProjectCard project={project} />
                </Col>
              ))}
            </Row>
          )}
          {!isLoading && !error && totalProjects > 0 && (
            <Pagination className="marketplace-pagination justify-content-center">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              />
              {Array.from({ length: totalProjectPages }, (_, index) => index + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalProjectPages}
                onClick={() => goToPage(currentPage + 1)}
              />
            </Pagination>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Projects;