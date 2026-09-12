/** @format */

import React from "react";
import { Card, Form } from "react-bootstrap";

const ProjectFilters = ({ filters, setFilters }) => {
  const formatPrice = (price) => `$${price.toLocaleString()}`;

  const handleRangeChange = (e) => {
    const value = Number(e.target.value);
    setFilters({
      ...filters,
      priceRange: value,
    });
  };

  return (
    <Card className="filters-card">
      <Card.Body>
        <h5 className="mb-3 text-muted">Filters</h5>

        <Form.Group className="mb-4 text-muted fw-medium">
          <Form.Label className="d-flex justify-content-between">
            <span>Maximum Budget</span>
            <span>{formatPrice(filters.priceRange)}</span>
          </Form.Label>
          <Form.Range
            value={filters.priceRange}
            onChange={handleRangeChange}
            min={0}
            max={10000}
            step={100}
            className="mb-2 custom-range"
          />
          <div className="d-flex justify-content-between text-muted">
            <small>{formatPrice(0)}</small>
            <small>{formatPrice(10000)}</small>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Project Status</Form.Label>
          <Form.Select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Project Type</Form.Label>
          <Form.Select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="all">All Types</option>
            <option value="Fixed Price">Fixed Price</option>
            <option value="Hourly">Hourly</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Experience Level</Form.Label>
          <Form.Select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}>
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </Form.Select>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default ProjectFilters;
