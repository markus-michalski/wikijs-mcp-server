/**
 * Zod Schemas for Wiki.js MCP Server Tools
 *
 * All input validation schemas with proper constraints and descriptions
 */

import { z } from 'zod';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../constants.js';

// Common schemas
const localeSchema = z
  .string()
  .min(2)
  .max(5)
  .default('en')
  .describe('Page locale (e.g., "en", "de")');

const pageIdSchema = z
  .number()
  .int()
  .positive()
  .describe('Page ID (positive integer)');

const pagePathSchema = z
  .string()
  .min(1)
  .max(500)
  .describe('Page path without leading slash (e.g., "osticket/plugin-name" or "home")');

// Create Page Schema
export const createPageSchema = z.object({
  path: pagePathSchema,
  title: z
    .string()
    .min(1)
    .max(200)
    .describe('Page title'),
  content: z
    .string()
    .min(1)
    .describe('Page content (Markdown or HTML depending on editor)'),
  description: z
    .string()
    .min(1)
    .max(500)
    .describe('Short page description (meta description)'),
  locale: localeSchema,
  editor: z
    .enum(['markdown', 'code', 'ckeditor'])
    .default('markdown')
    .describe('Editor type: "markdown" (default), "code" (raw HTML), or "ckeditor" (visual)'),
  isPublished: z
    .boolean()
    .default(true)
    .describe('Whether the page should be published immediately'),
  isPrivate: z
    .boolean()
    .default(false)
    .describe('Whether the page should be private (restricted access)'),
  tags: z
    .array(z.string())
    .default([])
    .describe('Array of tags for the page (e.g., ["tutorial", "development"])'),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;

// Update Page Schema
export const updatePageSchema = z.object({
  id: pageIdSchema.optional().describe('Page ID to update (optional if path is provided)'),
  path: pagePathSchema.optional().describe('Page path (optional if id is provided)'),
  locale: localeSchema,
  content: z.string().optional().describe('New page content (optional)'),
  title: z.string().max(200).optional().describe('New page title (optional)'),
  description: z.string().max(500).optional().describe('New page description (optional)'),
  isPublished: z.boolean().optional().describe('Whether the page should be published (optional)'),
  tags: z.array(z.string()).optional().describe('Array of tags for the page (optional)'),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;

// Get Page Schema
export const getPageSchema = z.object({
  id: pageIdSchema.optional().describe('Page ID (optional if path is provided)'),
  path: pagePathSchema.optional().describe('Page path (optional if id is provided)'),
  locale: localeSchema,
});

export type GetPageInput = z.infer<typeof getPageSchema>;

// List Pages Schema
export const listPagesSchema = z.object({
  locale: z.string().min(2).max(5).optional().describe('Filter by locale (optional, e.g., "en", "de")'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT)
    .describe(`Maximum number of pages to return (default: ${DEFAULT_PAGE_LIMIT}, max: ${MAX_PAGE_LIMIT})`),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('Number of pages to skip for pagination (default: 0)'),
});

export type ListPagesInput = z.infer<typeof listPagesSchema>;

// Search Pages Schema
export const searchPagesSchema = z.object({
  query: z
    .string()
    .min(2)
    .max(200)
    .describe('Search query string (minimum 2 characters)'),
  locale: z.string().min(2).max(5).optional().describe('Filter results by locale (optional)'),
});

export type SearchPagesInput = z.infer<typeof searchPagesSchema>;

// Delete Page Schema
export const deletePageSchema = z.object({
  id: pageIdSchema.optional().describe('Page ID to delete (optional if path is provided)'),
  path: pagePathSchema.optional().describe('Page path (optional if id is provided)'),
  locale: localeSchema,
});

export type DeletePageInput = z.infer<typeof deletePageSchema>;

// Move Page Schema
export const movePageSchema = z.object({
  id: pageIdSchema.optional().describe('Page ID to move (optional if path is provided)'),
  path: pagePathSchema.optional().describe('Current page path (optional if id is provided)'),
  locale: localeSchema,
  destinationPath: z
    .string()
    .min(1)
    .max(500)
    .describe('New path for the page (e.g., "new-category/page-name")'),
  destinationLocale: localeSchema.describe('Target locale (e.g., "en", "de")'),
});

export type MovePageInput = z.infer<typeof movePageSchema>;
