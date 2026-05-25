/**
 * Standard string template compiler for Chapter 31 letter templates.
 * Replaces placeholders in the format {{variableName}} with values from the variables dictionary.
 * If a variable is missing, it returns a readable uppercase bracketed placeholder.
 * 
 * @param {string} body - The raw template string containing {{placeholders}}.
 * @param {Object} variables - Key-value pairs of facts entered by the user.
 * @returns {string} The fully compiled text.
 */
export function renderTemplate(body, variables = {}) {
  if (!body) return '';
  return body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const val = variables[key];
    if (val !== undefined && val !== null && val !== '') {
      return val;
    }
    // Return a formatted placeholder (e.g. {{vrcName}} becomes [VRC NAME])
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toUpperCase();
    return `[${label}]`;
  });
}
