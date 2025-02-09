// app/api/perplexity/types.ts

export interface PerplexityAPIResponse {
    answer: string;
    sources: Array<{
      source: string;
      link: string;
    }>;
    // Add or adjust fields based on the official Perplexity response
  }
  