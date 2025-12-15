/**
 * Wiki.js MCP Server Type Definitions
 */

// Wiki.js Page Types
export interface WikiPage {
  id: number;
  path: string;
  title: string;
  description: string;
  content?: string;
  contentType?: string;
  isPublished: boolean;
  locale: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface WikiPageListItem {
  id: number;
  path: string;
  title: string;
  description: string;
  isPublished: boolean;
  locale: string;
  contentType: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface SearchResult {
  id: number;
  title: string;
  path: string;
  description: string;
  locale: string;
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: string[];
  totalHits: number;
}

export interface ApiResponseResult {
  succeeded: boolean;
  errorCode: number;
  message: string;
  slug?: string;
}

export interface CreatePageParams {
  content: string;
  description: string;
  editor: 'markdown' | 'code' | 'ckeditor';
  isPublished: boolean;
  isPrivate: boolean;
  locale: string;
  path: string;
  tags: string[];
  title: string;
}

export interface UpdatePageParams {
  id: number;
  content?: string | null;
  title?: string | null;
  description?: string | null;
  isPublished?: boolean | null;
  tags?: string[] | null;
}

// Pagination Types
export interface PaginationMeta {
  limit: number;
  offset: number;
  total_count: number;
  has_more: boolean;
  next_offset?: number;
}
