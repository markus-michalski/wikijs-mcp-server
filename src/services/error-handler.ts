/**
 * Centralized Error Handler for Wiki.js MCP Server
 */

import { z } from 'zod';

export interface ToolErrorResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError: true;
}

/**
 * Handle tool errors and return a consistent error response
 */
export function handleToolError(error: unknown, toolName: string): ToolErrorResponse {
  let errorMessage: string;

  if (error instanceof z.ZodError) {
    // Zod validation errors - provide detailed field information
    const issues = error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    errorMessage = `Validation error in ${toolName}:\n${issues}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = String(error);
  }

  // Log error to stderr for debugging (stdio servers should log to stderr)
  console.error(`[${toolName}] Error:`, errorMessage);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: false,
            error: errorMessage,
            tool: toolName,
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}

/**
 * Helper to create success response
 */
export function successResponse(data: Record<string, unknown>): {
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            ...data,
          },
          null,
          2
        ),
      },
    ],
  };
}

/**
 * Format a markdown table from page list
 */
export function formatPageListMarkdown(
  pages: Array<{ id: number; title: string; path: string; locale: string; updatedAt?: string }>,
  totalCount: number
): string {
  if (pages.length === 0) {
    return '# Pages\n\nNo pages found.';
  }

  const lines = [
    `# Pages (showing ${pages.length} of ${totalCount})`,
    '',
    '| ID | Title | Path | Locale | Updated |',
    '|-----|-------|------|--------|---------|',
  ];

  for (const page of pages) {
    const updated = page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A';
    lines.push(`| ${page.id} | ${page.title} | ${page.path} | ${page.locale} | ${updated} |`);
  }

  return lines.join('\n');
}
