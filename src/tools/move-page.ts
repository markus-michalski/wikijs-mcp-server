/**
 * wikijs_move_page Tool
 *
 * Moves a page to a new path in Wiki.js
 */

import { z } from 'zod';
import type { WikiJsClient } from '../services/client.js';
import { movePageSchema, type MovePageInput } from '../schemas/index.js';
import { handleToolError, successResponse } from '../services/error-handler.js';

export const movePageToolDefinition = {
  name: 'wikijs_move_page',
  description: `Move a page to a new path in Wiki.js.

Reorganize your wiki structure by moving pages to different paths or locales. Identify the source page by ID or path+locale.

Args:
  - id (number, optional): Page ID to move (use this OR path)
  - path (string, optional): Current page path (use this OR id)
  - locale (string): Current page locale, default "en"
  - destinationPath (string, required): New path for the page
  - destinationLocale (string): Target locale, default "en"

Returns:
  Confirmation of move with old and new paths

Note: This changes the page URL. Update any links pointing to the old path.

Examples:
  - Move to new category: id=42, destinationPath="new-category/page-name"
  - Reorganize: path="old/path", destinationPath="new/path"
  - Change locale: id=42, destinationPath="page-name", destinationLocale="de"`,
  inputSchema: movePageSchema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export async function handleMovePage(
  client: WikiJsClient,
  args: z.infer<typeof movePageSchema>
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    // Validate input with Zod
    const validated: MovePageInput = movePageSchema.parse(args);

    if (!validated.id && !validated.path) {
      throw new Error('Either "id" or "path" must be provided');
    }

    // Resolve page ID from path if needed
    let pageId = validated.id;
    const sourcePath = validated.path;

    if (!pageId && sourcePath) {
      const page = await client.getPageByPath(sourcePath, validated.locale);
      if (!page) {
        throw new Error(`Page not found at path: ${sourcePath}`);
      }
      pageId = page.id;
    }

    if (!pageId) {
      throw new Error('Could not resolve page ID');
    }

    const result = await client.movePage(pageId, validated.destinationPath, validated.destinationLocale);

    return successResponse({
      message: `Page moved successfully`,
      from: sourcePath || `ID: ${pageId}`,
      to: validated.destinationPath,
      destinationLocale: validated.destinationLocale,
      result,
    });
  } catch (error) {
    return handleToolError(error, 'wikijs_move_page');
  }
}
