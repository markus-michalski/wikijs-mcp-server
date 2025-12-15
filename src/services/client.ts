/**
 * Wiki.js GraphQL API Client
 *
 * Provides methods to interact with the Wiki.js GraphQL API
 */

import { API_TIMEOUT, CHARACTER_LIMIT } from '../constants.js';
import type {
  WikiPage,
  WikiPageListItem,
  SearchResponse,
  CreatePageParams,
  UpdatePageParams,
  ApiResponseResult,
} from '../types.js';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class WikiJsClient {
  private apiUrl: string;
  private apiToken: string;

  constructor(apiUrl: string, apiToken: string) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  /**
   * Execute a GraphQL query
   */
  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as GraphQLResponse<T>;

      if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL API');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(`Wiki.js API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all pages with optional filtering
   */
  async listPages(locale: string | null = null, limit: number = 100, offset: number = 0): Promise<{ pages: WikiPageListItem[]; total: number }> {
    const query = `
      query {
        pages {
          list {
            id
            path
            title
            description
            isPublished
            locale
            contentType
            createdAt
            updatedAt
            tags
          }
        }
      }
    `;

    const data = await this.query<{ pages: { list: WikiPageListItem[] } }>(query);
    let pages = data.pages.list;
    const total = pages.length;

    // Filter by locale if provided
    if (locale) {
      pages = pages.filter((p) => p.locale === locale);
    }

    // Apply pagination
    const paginatedPages = pages.slice(offset, offset + limit);

    return { pages: paginatedPages, total };
  }

  /**
   * Get a single page by ID
   */
  async getPageById(id: number): Promise<WikiPage | null> {
    const query = `
      query($id: Int!) {
        pages {
          single(id: $id) {
            id
            path
            title
            description
            content
            contentType
            isPublished
            locale
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.query<{ pages: { single: WikiPage | null } }>(query, { id });
    const page = data.pages.single;

    // Truncate content if needed
    if (page?.content && page.content.length > CHARACTER_LIMIT) {
      page.content =
        page.content.substring(0, CHARACTER_LIMIT) +
        `\n\n[Content truncated. Original length: ${page.content.length} chars. Use path-based access for full content.]`;
    }

    return page;
  }

  /**
   * Get a single page by path
   */
  async getPageByPath(path: string, locale: string = 'en'): Promise<WikiPage | null> {
    const query = `
      query($path: String!, $locale: String!) {
        pages {
          singleByPath(path: $path, locale: $locale) {
            id
            path
            title
            description
            content
            contentType
            isPublished
            locale
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.query<{ pages: { singleByPath: WikiPage | null } }>(query, { path, locale });
    const page = data.pages.singleByPath;

    // Truncate content if needed
    if (page?.content && page.content.length > CHARACTER_LIMIT) {
      page.content =
        page.content.substring(0, CHARACTER_LIMIT) +
        `\n\n[Content truncated. Original length: ${page.content.length} chars]`;
    }

    return page;
  }

  /**
   * Search pages
   */
  async searchPages(searchQuery: string, locale: string | null = null): Promise<SearchResponse> {
    const query = `
      query($query: String!) {
        pages {
          search(query: $query) {
            results {
              id
              title
              path
              description
              locale
            }
            suggestions
            totalHits
          }
        }
      }
    `;

    const data = await this.query<{ pages: { search: SearchResponse } }>(query, { query: searchQuery });
    const results = data.pages.search;

    // Filter by locale if provided
    if (locale && results.results) {
      results.results = results.results.filter((r) => r.locale === locale);
      results.totalHits = results.results.length;
    }

    return results;
  }

  /**
   * Create a new page
   */
  async createPage(params: CreatePageParams): Promise<WikiPage> {
    const query = `
      mutation(
        $content: String!
        $description: String!
        $editor: String!
        $isPublished: Boolean!
        $isPrivate: Boolean!
        $locale: String!
        $path: String!
        $tags: [String]!
        $title: String!
      ) {
        pages {
          create(
            content: $content
            description: $description
            editor: $editor
            isPublished: $isPublished
            isPrivate: $isPrivate
            locale: $locale
            path: $path
            tags: $tags
            title: $title
          ) {
            responseResult {
              succeeded
              errorCode
              slug
              message
            }
            page {
              id
              path
              title
            }
          }
        }
      }
    `;

    const data = await this.query<{
      pages: {
        create: {
          responseResult: ApiResponseResult;
          page: WikiPage;
        };
      };
    }>(query, params as unknown as Record<string, unknown>);

    if (!data.pages.create.responseResult.succeeded) {
      throw new Error(`Failed to create page: ${data.pages.create.responseResult.message}`);
    }

    return data.pages.create.page;
  }

  /**
   * Update an existing page
   */
  async updatePage(params: UpdatePageParams): Promise<ApiResponseResult> {
    // Build dynamic mutation based on provided fields
    const fields: string[] = [];
    const variables: Record<string, unknown> = { id: params.id };

    if (params.content !== null && params.content !== undefined) {
      fields.push('content: $content');
      variables.content = params.content;
    }
    if (params.title !== null && params.title !== undefined) {
      fields.push('title: $title');
      variables.title = params.title;
    }
    if (params.description !== null && params.description !== undefined) {
      fields.push('description: $description');
      variables.description = params.description;
    }
    if (params.isPublished !== null && params.isPublished !== undefined) {
      fields.push('isPublished: $isPublished');
      variables.isPublished = params.isPublished;
    }
    if (params.tags !== null && params.tags !== undefined) {
      fields.push('tags: $tags');
      variables.tags = params.tags;
    }

    const variableDefinitions = Object.keys(variables)
      .map((key) => {
        if (key === 'id') return '$id: Int!';
        if (key === 'content' || key === 'title' || key === 'description') return `$${key}: String`;
        if (key === 'isPublished') return '$isPublished: Boolean';
        if (key === 'tags') return '$tags: [String]';
        return null;
      })
      .filter(Boolean)
      .join(', ');

    const query = `
      mutation(${variableDefinitions}) {
        pages {
          update(
            id: $id
            ${fields.join('\n            ')}
          ) {
            responseResult {
              succeeded
              errorCode
              message
            }
          }
        }
      }
    `;

    const data = await this.query<{
      pages: {
        update: {
          responseResult: ApiResponseResult;
        };
      };
    }>(query, variables);

    if (!data.pages.update.responseResult.succeeded) {
      throw new Error(`Failed to update page: ${data.pages.update.responseResult.message}`);
    }

    return data.pages.update.responseResult;
  }

  /**
   * Delete a page
   */
  async deletePage(id: number): Promise<ApiResponseResult> {
    const query = `
      mutation($id: Int!) {
        pages {
          delete(id: $id) {
            responseResult {
              succeeded
              errorCode
              message
            }
          }
        }
      }
    `;

    const data = await this.query<{
      pages: {
        delete: {
          responseResult: ApiResponseResult;
        };
      };
    }>(query, { id });

    if (!data.pages.delete.responseResult.succeeded) {
      throw new Error(`Failed to delete page: ${data.pages.delete.responseResult.message}`);
    }

    return data.pages.delete.responseResult;
  }

  /**
   * Move a page to a new path
   */
  async movePage(id: number, destinationPath: string, destinationLocale: string = 'en'): Promise<ApiResponseResult> {
    const query = `
      mutation($id: Int!, $destinationPath: String!, $destinationLocale: String!) {
        pages {
          move(
            id: $id
            destinationPath: $destinationPath
            destinationLocale: $destinationLocale
          ) {
            responseResult {
              succeeded
              errorCode
              message
            }
          }
        }
      }
    `;

    const data = await this.query<{
      pages: {
        move: {
          responseResult: ApiResponseResult;
        };
      };
    }>(query, { id, destinationPath, destinationLocale });

    if (!data.pages.move.responseResult.succeeded) {
      throw new Error(`Failed to move page: ${data.pages.move.responseResult.message}`);
    }

    return data.pages.move.responseResult;
  }

  /**
   * Get all pages (for fetching tags when updating)
   */
  async getAllPages(): Promise<WikiPageListItem[]> {
    const { pages } = await this.listPages(null, 10000, 0);
    return pages;
  }
}
