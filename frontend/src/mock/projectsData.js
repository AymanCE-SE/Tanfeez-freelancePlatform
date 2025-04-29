/** @format */

export const mockProjects = [
  {
    id: 1,
    title: "E-commerce Website Development",
    description:
      "Looking for a full-stack developer to build an e-commerce platform",
    status: "open",
    postedDate: "2024-04-15",
    budget: "$5000", // Simplified budget format
    location: "Remote",
    skills: ["React", "Node.js", "MongoDB"],
    type: "Fixed Price",
    level: "Intermediate",
    clientId: "2",
    proposals: 0,
    category: "Web Development",
    clientInfo: {
      rating: 4.8,
      totalSpent: 15000,
      totalProjects: 12,
    },
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    description:
      "Need a skilled designer for our fitness tracking app interface",
    status: "open",
    postedDate: "2024-04-20",
    budget: "$1500-$3000",
    location: "Remote",
    skills: ["UI/UX", "Figma", "Mobile Design"],
    type: "Fixed Price",
    level: "Expert",
    clientId: "2",
    proposals: 3,
    category: "Design",
    clientInfo: {
      rating: 4.8,
      totalSpent: 15000,
      totalProjects: 12,
    },
  },
  {
    id: 3,
    title: "Backend API Development",
    description: "Develop RESTful APIs for an existing mobile application",
    status: "in-progress",
    postedDate: "2024-04-10",
    budget: "$3000-$5000",
    location: "Remote",
    skills: ["Node.js", "Express", "PostgreSQL"],
    type: "Fixed Price",
    level: "Intermediate",
    clientId: "3",
    proposals: 5,
    category: "Backend Development",
    clientInfo: {
      rating: 4.8,
      totalSpent: 15000,
      totalProjects: 12,
    },
  },
  {
    id: 4,
    title: "WordPress Website Customization",
    description: "Customize an existing WordPress theme for a business website",
    status: "open",
    postedDate: "2024-04-18",
    budget: "$500-$1000",
    location: "Remote",
    skills: ["WordPress", "PHP", "CSS"],
    type: "Fixed Price",
    level: "Beginner",
    clientId: "2",
    proposals: 2,
    category: "CMS Development",
    clientInfo: {
      rating: 4.8,
      totalSpent: 15000,
      totalProjects: 12,
    },
  },
];

export const projectCategories = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Backend Development",
  "Frontend Development",
  "CMS Development",
  "DevOps",
  "Database Design",
  "Quality Assurance",
];

export const projectLevels = [
  { value: "Beginner", label: "Entry Level" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Expert", label: "Expert" },
];

export const projectTypes = [
  { value: "Fixed Price", label: "Fixed Price" },
  { value: "Hourly", label: "Hourly Rate" },
];

export const projectStatus = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
