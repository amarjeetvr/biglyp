export const generateId = (): string => {
  // Use a simple UUID-like ID generator for edge environment
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
