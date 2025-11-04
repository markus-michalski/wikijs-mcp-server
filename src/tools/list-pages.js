/**
 * List Pages Tool
 *
 * Lists all pages in Wiki.js with optional filtering
 */

export const listPagesTool = {
  name: 'list_pages',
  description: 'List all pages in Wiki.js. Optionally filter by locale and limit results.',
  inputSchema: {
    type: 'object',
    properties: {
      locale: {
        type: 'string',
        description: 'Filter by locale (optional, e.g., "en", "de")',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of pages to return (default: 100)',
        default: 100,
      },
    },
  },
};

export async function handleListPages(client, args) {
  try {
    const pages = await client.listPages(args.locale, args.limit || 100);

    const pageList = pages.map(p => ({
      id: p.id,
      path: p.path,
      title: p.title,
      description: p.description,
      locale: p.locale,
      isPublished: p.isPublished,
      tags: p.tags || [],
      updatedAt: p.updatedAt,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: pageList.length,
            pages: pageList,
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
