/**
 * wikijs_delete_page Tool
 *
 * Deletes a page from Wiki.js
 */

import { z } from 'zod';
import type { WikiJsClient } from '../services/client.js';
import { deletePageSchema, type DeletePageInput } from '../schemas/index.js';
import { handleToolError, successResponse } from '../services/error-handler.js';

export const deletePageToolDefinition = {
  name: 'wikijs_delete_page',
  description: `Delete a page from Wiki.js. WARNING: This action is IRREVERSIBLE!

Permanently removes a page and all its history. Identify the page by ID or path+locale.

Args:
  - id (number, optional): Page ID (use this OR path)
  - path (string, optional): Page path (use this OR id)
  - locale (string): Page locale, default "en" (required with path)

Returns:
  Confirmation of deletion

CAUTION: This operation cannot be undone. All page history will be lost.

Examples:
  - Delete by ID: id=42
  - Delete by path: path="old/deprecated-page", locale="en"`,
  inputSchema: deletePageSchema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: true, // This is a destructive operation!
    idempotentHint: false,
    openWorldHint: true,
  },
};

export async function handleDeletePage(
  client: WikiJsClient,
  args: z.infer<typeof deletePageSchema>
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    // Validate input with Zod
    const validated: DeletePageInput = deletePageSchema.parse(args);

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

    const result = await client.deletePage(pageId);

    return successResponse({
      message: `Page ${pageId} deleted permanently`,
      result,
    });
  } catch (error) {
    return handleToolError(error, 'wikijs_delete_page');
  }
}
