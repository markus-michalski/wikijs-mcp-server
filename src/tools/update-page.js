/**
 * Update Page Tool
 *
 * Updates an existing page in Wiki.js
 */

export const updatePageTool = {
  name: 'update_page',
  description: 'Update an existing page in Wiki.js (content, title, description, tags, or publish status). Provide either id OR path+locale to identify the page.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Page ID to update (optional if path is provided)',
      },
      path: {
        type: 'string',
        description: 'Page path (optional if id is provided, e.g., "osticket/api-key-wildcard")',
      },
      locale: {
        type: 'string',
        description: 'Page locale (required if using path, e.g., "en", "de")',
        default: 'en',
      },
      content: {
        type: 'string',
        description: 'New page content (optional)',
      },
      title: {
        type: 'string',
        description: 'New page title (optional)',
      },
      description: {
        type: 'string',
        description: 'New page description (optional)',
      },
      isPublished: {
        type: 'boolean',
        description: 'Whether the page should be published (optional)',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of tags for the page (optional)',
      },
    },
  },
};

export async function handleUpdatePage(client, args) {
  try {
    // Resolve page ID from path if needed
    let pageId = args.id;

    if (!pageId && args.path) {
      const page = await client.getPageByPath(args.path, args.locale || 'en');
      if (!page) {
        throw new Error(`Page not found at path: ${args.path}`);
      }
      pageId = page.id;
    }

    if (!pageId) {
      throw new Error('Either "id" or "path" must be provided');
    }

    // Only pass defined values
    const updateParams = { id: pageId };
    if (args.content !== undefined) updateParams.content = args.content;
    if (args.title !== undefined) updateParams.title = args.title;
    if (args.description !== undefined) updateParams.description = args.description;
    if (args.isPublished !== undefined) updateParams.isPublished = args.isPublished;
    if (args.tags !== undefined) updateParams.tags = args.tags;

    const result = await client.updatePage(updateParams);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Page ${args.id} updated successfully`,
            result,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
