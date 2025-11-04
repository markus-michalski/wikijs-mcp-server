/**
 * Wiki.js GraphQL API Client
 *
 * Provides methods to interact with the Wiki.js GraphQL API
 */

import fetch from 'node-fetch';

export class WikiJsClient {
  constructor(apiUrl, apiToken) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  /**
   * Execute a GraphQL query
   * @param {string} query - GraphQL query string
   * @param {object} variables - Query variables
   * @returns {Promise<object>} - API response
   */
  async query(query, variables = {}) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      throw new Error(`Wiki.js API request failed: ${error.message}`);
    }
  }

  /**
   * List all pages
   * @param {string} locale - Page locale (e.g., 'en', 'de')
   * @param {number} limit - Maximum number of pages to return
   * @returns {Promise<Array>} - Array of pages
   */
  async listPages(locale = null, limit = 100) {
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

    const data = await this.query(query);
    let pages = data.pages.list;

    // Filter by locale if provided
    if (locale) {
      pages = pages.filter(p => p.locale === locale);
    }

    // Apply limit
    return pages.slice(0, limit);
  }

  /**
   * Get a single page by ID
   * @param {number} id - Page ID
   * @returns {Promise<object>} - Page data
   */
  async getPageById(id) {
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

    const data = await this.query(query, { id });
    return data.pages.single;
  }

  /**
   * Get a single page by path
   * @param {string} path - Page path (e.g., 'home', 'osticket/plugin-name')
   * @param {string} locale - Page locale (e.g., 'en', 'de')
   * @returns {Promise<object>} - Page data
   */
  async getPageByPath(path, locale = 'en') {
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

    const data = await this.query(query, { path, locale });
    return data.pages.singleByPath;
  }

  /**
   * Search pages
   * @param {string} searchQuery - Search query
   * @param {string} locale - Optional locale filter
   * @returns {Promise<object>} - Search results
   */
  async searchPages(searchQuery, locale = null) {
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

    const data = await this.query(query, { query: searchQuery });
    let results = data.pages.search;

    // Filter by locale if provided
    if (locale && results.results) {
      results.results = results.results.filter(r => r.locale === locale);
      results.totalHits = results.results.length;
    }

    return results;
  }

  /**
   * Create a new page
   * @param {object} params - Page parameters
   * @returns {Promise<object>} - Created page data
   */
  async createPage({
    content,
    description,
    editor = 'markdown',
    isPublished = true,
    isPrivate = false,
    locale = 'en',
    path,
    tags = [],
    title
  }) {
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

    const variables = {
      content,
      description,
      editor,
      isPublished,
      isPrivate,
      locale,
      path,
      tags,
      title
    };

    const data = await this.query(query, variables);

    if (!data.pages.create.responseResult.succeeded) {
      throw new Error(
        `Failed to create page: ${data.pages.create.responseResult.message}`
      );
    }

    return data.pages.create.page;
  }

  /**
   * Update an existing page
   * @param {object} params - Update parameters
   * @returns {Promise<object>} - Response result
   */
  async updatePage({
    id,
    content = null,
    title = null,
    description = null,
    isPublished = null,
    tags = null
  }) {
    // Build dynamic mutation based on provided fields
    const fields = [];
    const variables = { id };

    if (content !== null) {
      fields.push('content: $content');
      variables.content = content;
    }
    if (title !== null) {
      fields.push('title: $title');
      variables.title = title;
    }
    if (description !== null) {
      fields.push('description: $description');
      variables.description = description;
    }
    if (isPublished !== null) {
      fields.push('isPublished: $isPublished');
      variables.isPublished = isPublished;
    }
    if (tags !== null) {
      fields.push('tags: $tags');
      variables.tags = tags;
    }

    const variableDefinitions = Object.keys(variables)
      .map(key => {
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

    const data = await this.query(query, variables);

    if (!data.pages.update.responseResult.succeeded) {
      throw new Error(
        `Failed to update page: ${data.pages.update.responseResult.message}`
      );
    }

    return data.pages.update.responseResult;
  }

  /**
   * Delete a page
   * @param {number} id - Page ID
   * @returns {Promise<object>} - Response result
   */
  async deletePage(id) {
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

    const data = await this.query(query, { id });

    if (!data.pages.delete.responseResult.succeeded) {
      throw new Error(
        `Failed to delete page: ${data.pages.delete.responseResult.message}`
      );
    }

    return data.pages.delete.responseResult;
  }

  /**
   * Move a page to a new path
   * @param {number} id - Page ID
   * @param {string} destinationPath - New path
   * @param {string} destinationLocale - Target locale
   * @returns {Promise<object>} - Response result
   */
  async movePage(id, destinationPath, destinationLocale = 'en') {
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

    const data = await this.query(query, { id, destinationPath, destinationLocale });

    if (!data.pages.move.responseResult.succeeded) {
      throw new Error(
        `Failed to move page: ${data.pages.move.responseResult.message}`
      );
    }

    return data.pages.move.responseResult;
  }

  /**
   * Get all tags
   * @returns {Promise<Array>} - Array of tags
   */
  async getTags() {
    const query = `
      query {
        pages {
          tags {
            id
            tag
            title
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.query(query);
    return data.pages.tags;
  }
}
