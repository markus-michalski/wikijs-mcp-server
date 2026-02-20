/**
 * Wiki.js MCP Server Constants
 */

// Maximum response size in characters to prevent overwhelming LLM context
export const CHARACTER_LIMIT = 100000;

// Maximum content size in characters for write operations
export const MAX_CONTENT_SIZE = 500_000;

// Default pagination settings
export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 200;

// Tag limits
export const MAX_TAG_LENGTH = 100;
export const MAX_TAGS_PER_PAGE = 50;

// API timeout in milliseconds
export const API_TIMEOUT = 30000;

// Response formats
export enum ResponseFormat {
  JSON = 'json',
  MARKDOWN = 'markdown'
}
