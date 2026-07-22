import "server-only";
import type { ReactElement } from "react";

/**
 * Rend un élément React en HTML statique. `react-dom/server` est importé
 * dynamiquement pour rester hors du graphe des composants (Next.js
 * interdit son import statique dans l'App Router). Utilisé uniquement
 * par la génération statique (publish) et le PDF — jamais par un composant.
 */
export async function renderElementToString(
  element: ReactElement,
): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(element);
}
