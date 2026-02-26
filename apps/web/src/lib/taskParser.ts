import { parseDateFromText, removeDateFromText } from "./dateParser";

export interface Project {
  id: string;
  name: string;
  color?: string;
}

export interface ParsedTask {
  content: string;
  projectId?: string;
  projectName?: string;
  dueDate?: Date;
  scheduledWeek?: string;
}

// Extract #project reference from text
// Returns the project name (without #) and the full match including #
function extractProjectReference(text: string): { name: string; fullMatch: string } | null {
  // Match # followed by word characters, allowing spaces if quoted
  // e.g., #Personal, #"Home Improvement", #home-improvement
  const quotedMatch = text.match(/#"([^"]+)"/);
  if (quotedMatch) {
    return { name: quotedMatch[1], fullMatch: quotedMatch[0] };
  }

  // Match # followed by non-space characters (handles hyphenated names)
  const simpleMatch = text.match(/#([\w-]+)/);
  if (simpleMatch) {
    return { name: simpleMatch[1], fullMatch: simpleMatch[0] };
  }

  return null;
}

// Find a project by name (case-insensitive, partial match)
function findProjectByName(name: string, projects: Project[]): Project | null {
  const lowerName = name.toLowerCase();

  // First try exact match (case-insensitive)
  const exactMatch = projects.find(
    (p) => p.name.toLowerCase() === lowerName
  );
  if (exactMatch) return exactMatch;

  // Then try starts-with match
  const startsWithMatch = projects.find(
    (p) => p.name.toLowerCase().startsWith(lowerName)
  );
  if (startsWithMatch) return startsWithMatch;

  // Then try contains match
  const containsMatch = projects.find(
    (p) => p.name.toLowerCase().includes(lowerName)
  );
  if (containsMatch) return containsMatch;

  return null;
}

function removeProjectFromText(text: string, fullMatch: string): string {
  return text
    .replace(fullMatch, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTaskInput(text: string, projects: Project[]): ParsedTask {
  let content = text;
  const result: ParsedTask = { content: text };

  // Extract project reference
  const projectRef = extractProjectReference(content);
  if (projectRef) {
    const project = findProjectByName(projectRef.name, projects);
    if (project) {
      result.projectId = project.id;
      result.projectName = project.name;
      content = removeProjectFromText(content, projectRef.fullMatch);
    }
  }

  // Extract date reference
  const dateRef = parseDateFromText(content);
  if (dateRef) {
    if (dateRef.date) {
      result.dueDate = dateRef.date;
    }
    if (dateRef.scheduledWeek) {
      result.scheduledWeek = dateRef.scheduledWeek;
    }
    content = removeDateFromText(content, dateRef.matchedText);
  }

  result.content = content;
  return result;
}

// Helper to get autocomplete suggestions for projects
export function getProjectSuggestions(
  query: string,
  projects: Project[]
): Project[] {
  if (!query) return projects;

  const lowerQuery = query.toLowerCase();
  return projects.filter((p) =>
    p.name.toLowerCase().includes(lowerQuery)
  );
}

// Extract the current #query being typed (for autocomplete)
export function extractCurrentProjectQuery(
  text: string,
  cursorPosition: number
): { query: string; startIndex: number; endIndex: number } | null {
  // Find # before cursor
  const beforeCursor = text.slice(0, cursorPosition);
  const hashIndex = beforeCursor.lastIndexOf("#");

  if (hashIndex === -1) return null;

  // Check if there's a space between # and cursor (query ended)
  const textAfterHash = beforeCursor.slice(hashIndex + 1);
  if (textAfterHash.includes(" ")) return null;

  // Find end of query (space or end of text)
  const afterCursor = text.slice(cursorPosition);
  const spaceIndex = afterCursor.indexOf(" ");
  const endIndex = spaceIndex === -1
    ? text.length
    : cursorPosition + spaceIndex;

  return {
    query: text.slice(hashIndex + 1, endIndex),
    startIndex: hashIndex,
    endIndex,
  };
}

// Replace the #query with the selected project name
export function replaceProjectQuery(
  text: string,
  startIndex: number,
  endIndex: number,
  projectName: string
): string {
  const before = text.slice(0, startIndex);
  const after = text.slice(endIndex);
  // Add space after project name if there isn't one
  const suffix = after.startsWith(" ") ? "" : " ";
  return `${before}#${projectName}${suffix}${after.trimStart()}`;
}
