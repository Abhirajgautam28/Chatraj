/**
 * Groups projects by category.
 */
export const groupProjectsByCategory = (projects) => {
  if (!Array.isArray(projects)) return {};
  return projects.reduce((acc, project) => {
    const cat = project.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {});
};

/**
 * Formats date for display.
 */
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
