/** @format */

import React, { useState, useEffect, use } from "react";
import { Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Search, Funnel } from "react-bootstrap-icons";
import ServiceCard from "../components/cards/ServiceCard";
import { servicesData, categories } from "../mock/servicesData";
import "../styles/ServicesPage.css";
import { useDispatch, useSelector } from "react-redux";
import { myStore } from "../store";
import { getAllServicesAction, getServicesByTagAction } from "../store/slices/serviceSlice";

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedTag, setSelectedTag] = useState(""); // Add to your filter state and UI as needed

  const handleCategoryClick = (categoryName) => {
    if (categoryName === "All Services") {
      // Reset all filters
      setSelectedCategory("All Services");
      setSelectedSubcategory("");
      setPriceRange([0, 1000]);
      setSearchTerm("");
    } else {
      setSelectedCategory(categoryName);
    }
  };
  const { services, isLoading, error } = useSelector((myStore) => myStore.serviceSlice);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllServicesAction());
  }, [])

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  useEffect(() => {
    let filtered = services;

    // Search filter: by service_name, description, or tags
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.service_name.toLowerCase().includes(term) ||
          service.description.toLowerCase().includes(term) ||
          (Array.isArray(service.tags) &&
            service.tags.some((tag) => tag.toLowerCase().includes(term)))
      );
    }

    // Category filter
    if (selectedCategory !== "All Services") {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }

    // Subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(
        (service) =>
          service.subcategory && service.subcategory === selectedSubcategory
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (service) =>
        Number(service.price) >= priceRange[0] &&
        Number(service.price) <= priceRange[1]
    );

    // Tag filter (if you want a separate tag filter)
    if (selectedTag) {
      filtered = filtered.filter(
        (service) =>
          Array.isArray(service.tags) &&
          service.tags.some((tag) =>
            tag.toLowerCase().includes(selectedTag.toLowerCase())
          )
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory, selectedSubcategory, priceRange, selectedTag]);

  // Handle search input with Enter key
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        dispatch(getServicesByTagAction(searchTerm.trim()));
      } else {
        dispatch(getAllServicesAction());
      }
    }
  };

    if(localStorage.getItem("authToken") === null) {
      return (
        <Container className="py-5 vh-100 d-flex align-items-center justify-content-center">
          <Row className="mb-4 ">
            <Col>
              <h1 className="mb-4"></h1>
              <div className="text-center py-5">
                <p className="text-muted fs-1">Please login to access services.</p>
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
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">Available Services</h1>
          <div className="d-flex gap-3">
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search services by tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
              />
            </InputGroup>
            <Button
              variant="outline-primary"
              onClick={() => setShowFilters(!showFilters)}>
              <Funnel className="me-2" />
              Filters {showFilters ? "Hide" : "Show"}
            </Button>
          </div>
        </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row>
          {showFilters && (
            <Col md={3} className="mb-4">
              <div className="filters-card p-3">
                <h5 className="mb-4">Filters</h5>

                {/* Category Filter */}
                <div className="mb-4">
                  <h6 className="filter-title mb-3">Categories</h6>
                  <div className="category-list">
                    <div className="mb-2">
                      <Button
                        variant="link"
                        className={`category-btn ${selectedCategory === "All Services" ? "active" : ""
                          }`}
                        onClick={() => handleCategoryClick("All Services")}>
                        All Services
                      </Button>
                    </div>
                    {categories.map((category) => (
                      <div key={category.name} className="mb-2">
                        <Button
                          variant="link"
                          className={`category-btn ${selectedCategory === category.name ? "active" : ""
                            }`}
                          onClick={() => handleCategoryClick(category.name)}>
                          {category.name}
                        </Button>
                        {category.subcategories &&
                          selectedCategory === category.name && (
                            <div className="subcategory-list ms-3">
                              {category.subcategories.map((sub) => (
                                <Button
                                  key={sub}
                                  variant="link"
                                  className={`subcategory-btn ${selectedSubcategory === sub ? "active" : ""
                                    }`}
                                  onClick={() => setSelectedSubcategory(sub)}>
                                  {sub}
                                </Button>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-4">
                  <h6 className="filter-title mb-3">Price Range</h6>
                  <Form.Range
                    value={priceRange[1]}
                    min={0}
                    max={1000}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="custom-range"
                  />
                  <div className="d-flex justify-content-between">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </Col>
          )}

          <Col md={showFilters ? 9 : 12}>
            <div className="mb-3 text-muted">
              Found {services.length} services
            </div>

            {services.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">
                  No services found matching your criteria.
                </p>
              </div>
            ) : (
              <Row xs={1} md={showFilters ? 2 : 3} className="g-4">
                {services.map((service) => (
                  <Col key={service.id}>
                    <ServiceCard service={service} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ServicesPage;
