export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

export interface NewsItem {
  titleEn: string;
  contentEn: string;
  titleTr: string;
  contentTr: string;
}

export interface NewsResponse {
  items: NewsItem[];
  sources: { url: string; title: string }[];
}

export enum FetchState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
