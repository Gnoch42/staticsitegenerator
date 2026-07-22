import "server-only";

// ─────────────────────────────────────────────────────────────
//  Point d'extension : traduction automatique.
//
//  L'implémentation réelle (DeepL, API LLM, …) se branche ICI
//  sans toucher au reste de l'app. En v1 c'est un STUB : il
//  renvoie le texte source préfixé, pour valider l'architecture
//  (bouton "Traduire" dans l'admin → cette fonction).
//
//  Pour brancher un vrai fournisseur : implémenter `callProvider`
//  et lire une clé d'API depuis l'environnement.
// ─────────────────────────────────────────────────────────────

export interface TranslateRequest {
  text: string;
  from: string; // code langue source, ex "fr"
  to: string; // code langue cible, ex "en"
}

export interface TranslateResult {
  text: string;
  provider: string;
}

/** Interface stable appelée par l'admin. Ne pas casser sa signature. */
export async function translateContent(
  req: TranslateRequest,
): Promise<TranslateResult> {
  if (!req.text.trim()) return { text: "", provider: "noop" };
  return callProvider(req);
}

/** Traduit en lot un objet multilingue partiel vers une langue cible. */
export async function translateFields(
  fields: Record<string, string>,
  from: string,
  to: string,
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = (await translateContent({ text: value, from, to })).text;
  }
  return out;
}

// ── STUB v1 — remplacer par un appel API réel ──
async function callProvider(req: TranslateRequest): Promise<TranslateResult> {
  // Exemple d'intégration future (pseudo-code) :
  //
  //   const res = await fetch("https://api.deepl.com/v2/translate", {
  //     method: "POST",
  //     headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}` },
  //     body: new URLSearchParams({ text: req.text, source_lang: req.from, target_lang: req.to }),
  //   });
  //   const json = await res.json();
  //   return { text: json.translations[0].text, provider: "deepl" };

  return {
    text: `[${req.to}] ${req.text}`,
    provider: "stub",
  };
}
