import type { SectionType, Multilingual } from "@/lib/types";

export interface EditorItem {
  id: number;
  data: Record<string, unknown>;
}

export interface EditorSection {
  id: number;
  type: SectionType;
  enabled: boolean;
  title: Multilingual;
  items: EditorItem[];
}

export interface AllowedSection {
  type: SectionType;
  label: string;
}
