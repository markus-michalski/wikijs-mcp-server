/**
 * Get Page Tool
 *
 * Retrieves a page from Wiki.js by ID or path
 */

export const getPageTool = {
  name: 'get_page',
  description: 'Get a page from Wiki.js by ID or path. Returns full page content and metadata.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Page ID (optional if path is provided)',
      },
      path: {
        type: 'string',
        description: 'Page path (optional if id is provided, e.g., "osticket/plugin-name")',
      },
      locale: {
        type: 'string',
        description: 'Page locale (required if using path, e.g., "en", "de")',
        default: 'en',
      },
    },
  },
};

export async function handleGetPage(client, args) {
  try {
    let page;

    if (args.id) {
      page = await client.getPageById(args.id);
    } else if (args.path) {
      page = await client.getPageByPath(args.path, args.locale || 'en');
    } else {
      throw new Error('Either "id" or "path" must be provided');
    }

    if (!page) {
      throw new Error(`Page not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            page: {
              id: page.id,
              path: page.path,
              title: page.title,
              description: page.description,
              content: page.content,
              contentType: page.contentType,
              isPublished: page.isPublished,
              locale: page.locale,
              createdAt: page.createdAt,
              updatedAt: page.updatedAt,
            },
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
