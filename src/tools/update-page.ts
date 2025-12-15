/**
 * wikijs_update_page Tool
 *
 * Updates an existing page in Wiki.js
 */

import { z } from 'zod';
import type { WikiJsClient } from '../services/client.js';
import { updatePageSchema, type UpdatePageInput } from '../schemas/index.js';
import { handleToolError, successResponse } from '../services/error-handler.js';

export const updatePageToolDefinition = {
  name: 'wikijs_update_page',
  description: `Update an existing page in Wiki.js.

Modify content, title, description, tags, or publish status of an existing page. Identify the page by ID or path+locale.

Args:
  - id (number, optional): Page ID (use this OR path)
  - path (string, optional): Page path (use this OR id)
  - locale (string): Page locale, default "en" (required with path)
  - content (string, optional): New page content
  - title (string, optional): New title (max 200 chars)
  - description (string, optional): New description (max 500 chars)
  - isPublished (boolean, optional): Publish/unpublish
  - tags (array, optional): Replace tags

Returns:
  Success confirmation with update result

Note: If you don't provide tags, existing tags are preserved.

Examples:
  - Update content: id=42, content="# New Content..."
  - Unpublish: path="drafts/old-post", isPublished=false
  - Update tags: id=42, tags=["updated", "v2"]`,
  inputSchema: updatePageSchema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export async function handleUpdatePage(
  client: WikiJsClient,
  args: z.infer<typeof updatePageSchema>
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    // Validate input with Zod
    const validated: UpdatePageInput = updatePageSchema.parse(args);

    if (!validated.id && !validated.path) {
      throw new Error('Either "id" or "path" must be provided');
    }

    // Resolve page ID from path if needed
    let pageId = validated.id;

    if (!pageId && validated.path) {
      const page = await client.getPageByPath(validated.path, validated.locale);
      if (!page) {
        throw new Error(`Page not found at path: ${validated.path}`);
      }
      pageId = page.id;
    }

    if (!pageId) {
      throw new Error('Could not resolve page ID');
    }

    // If tags not provided, fetch current tags to preserve them
    // (Wiki.js API requires tags parameter in update mutation)
    let tagsToUse = validated.tags;
    if (tagsToUse === undefined) {
      const pages = await client.getAllPages();
      const currentPage = pages.find((p) => p.id === pageId);
      tagsToUse = currentPage?.tags || [];
    }

    const result = await client.updatePage({
      id: pageId,
      content: validated.content ?? null,
      title: validated.title ?? null,
      description: validated.description ?? null,
      isPublished: validated.isPublished ?? null,
      tags: tagsToUse,
    });

    return successResponse({
      message: `Page ${pageId} updated successfully`,
      result,
    });
  } catch (error) {
    return handleToolError(error, 'wikijs_update_page');
  }
}
