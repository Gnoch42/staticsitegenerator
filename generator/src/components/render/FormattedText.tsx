import type { ReactNode } from "react";
import type { Multilingual } from "@/lib/types";

/**
 * Rend un texte multilingue en préservant les sauts de ligne, et en
 * enveloppant les tirets de début de ligne dans `<span class="li-dash">`
 * pour qu'ils soient stylables/masquables par template (CSS).
 */
export function FormattedText({
  field,
  langs,
  className,
}: {
  field: Multilingual | null | undefined;
  langs: string[];
  className?: string;
}) {
  if (!field) return null;
  return (
    <div className={className}>
      {langs.map((lang) => (
        <span key={lang} data-lang={lang} className="ftext">
          {formatLines(field[lang] ?? "")}
        </span>
      ))}
    </div>
  );
}

function formatLines(text: string): ReactNode {
  return text.split("\n").map((line, i) => {
    const m = line.match(/^(\s*)([-–—•])(\s+)(.*)$/);
    if (m) {
      const [, indent, dash, space, rest] = m;
      return (
        <span key={i} className="ftext-line has-dash">
          {indent}
          <span className="li-dash">{dash}</span>
          {space}
          {rest}
        </span>
      );
    }
    return (
      <span key={i} className="ftext-line">
        {line}
      </span>
    );
  });
}
