
export interface ImageState {
  original: string | null;
  current: string | null;
  history: string[];
}

export interface EditRequest {
  image: string;
  prompt: string;
  mimeType: string;
}

export interface FilterOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}
