const projectStatuses = {
  not_started: { label: "Open", color: "primary" },
  open: { label: "Open", color: "primary" },
  in_progress: { label: "In Progress", color: "info" },
  completed: { label: "Closed", color: "secondary" },
  cancelled: { label: "Closed", color: "secondary" },
};

export function getProjectStatus(progress) {
  return projectStatuses[progress] || {
    label: progress ? progress.replaceAll("_", " ") : "Unknown",
    color: "secondary",
  };
}