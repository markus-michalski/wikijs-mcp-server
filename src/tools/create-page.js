/**
 * Create Page Tool
 *
 * Creates a new page in Wiki.js
 */

export const createPageTool = {
  name: 'create_page',
  description: 'Create a new page in Wiki.js with markdown or HTML content',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Page path (e.g., "osticket/plugin-name" or "home"). Do not include leading slash.',
      },
      title: {
        type: 'string',
        description: 'Page title',
      },
      content: {
        type: 'string',
        description: 'Page content (Markdown or HTML depending on editor)',
      },
      description: {
        type: 'string',
        description: 'Short page description (meta description)',
      },
      locale: {
        type: 'string',
        description: 'Page locale (e.g., "en", "de")',
        default: 'en',
      },
      editor: {
        type: 'string',
        description: 'Editor type: "markdown" (default), "code" (raw HTML), or "ckeditor" (visual)',
        enum: ['markdown', 'code', 'ckeditor'],
        default: 'markdown',
      },
      isPublished: {
        type: 'boolean',
        description: 'Whether the page should be published immediately',
        default: true,
      },
      isPrivate: {
        type: 'boolean',
        description: 'Whether the page should be private (restricted access)',
        default: false,
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of tags for the page (e.g., ["tutorial", "development"])',
        default: [],
      },
    },
    required: ['path', 'title', 'content', 'description'],
  },
};

export async function handleCreatePage(client, args) {
  try {
    const page = await client.createPage({
      path: args.path,
      title: args.title,
      content: args.content,
      description: args.description,
      locale: args.locale || 'en',
      editor: args.editor || 'markdown',
      isPublished: args.isPublished !== false,
      isPrivate: args.isPrivate || false,
      tags: args.tags || [],
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Page created successfully at /${args.path}`,
            page: {
              id: page.id,
              path: page.path,
              title: page.title,
              url: `https://faq.markus-michalski.net/${args.locale || 'en'}/${args.path}`,
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
