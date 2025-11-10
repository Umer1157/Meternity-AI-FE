export function formatAdvice(text) {
  const lines = text.split('\n');
  let formattedHTML = '';
  let currentSection = '';
  let insideSection = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (trimmedLine === '') {
      return;
    }

    // Check for section heading (lines with ** at start and end, or ending with :)
    if ((trimmedLine.startsWith('**') && trimmedLine.endsWith(':**')) || 
        (trimmedLine.startsWith('**') && trimmedLine.endsWith('**:') && trimmedLine.includes(':'))) {
      // Close previous section if exists
      if (insideSection) {
        currentSection += '</div>';
        formattedHTML += currentSection;
      }
      const heading = trimmedLine.replace(/\*\*/g, '').replace(/:$/, '');
      formattedHTML += `<h2 class="advice-heading"><strong>${heading}</strong>:</h2>`;
      currentSection = '<div class="advice-section">';
      insideSection = true;
    } 
    // Handle bullet list items (starts with *)
    else if (trimmedLine.startsWith('*')) {
      // Remove the bullet marker and any leading spaces
      let listItem = trimmedLine.replace(/^\*\s*/, '');
      // Convert **text** to <strong>text</strong>
      listItem = listItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      if (!insideSection) {
        currentSection = '<div class="advice-section">';
        insideSection = true;
      }
      currentSection += `<div class="advice-card">${listItem}</div>`;
    } 
    // Handle regular paragraphs
    else {
      // Convert **text** to <strong>text</strong>
      const cleanLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Ensure we're in a section
      if (!insideSection) {
        currentSection = '<div class="advice-section">';
        insideSection = true;
      }
      currentSection += `<div class="advice-card">${cleanLine}</div>`;
    }
  });

  // Close any open section at the end
  if (insideSection) {
    currentSection += '</div>';
    formattedHTML += currentSection;
  }

  return formattedHTML;
}


