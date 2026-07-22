import type { SectionType, Multilingual, Visibility } from "@/lib/types";

export interface EditorItem {
  id: number;
  data: Record<string, unknown>;
  visibility: Visibility;
}

export interface EditorSection {
  id: number;
  type: SectionType;
  enabled: boolean;
  title: Multilingual;
  visibility: Visibility;
  items: EditorItem[];
}

export interface AllowedSection {
  type: SectionType;
  label: string;
}
