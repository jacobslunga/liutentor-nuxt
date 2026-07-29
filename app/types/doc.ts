export interface DocSection {
  title: string;
  /** A single paragraph, or several rendered in sequence. */
  content: string | string[];
  items?: string[];
}
