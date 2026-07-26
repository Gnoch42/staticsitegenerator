import type { SectionWithItems, ItemWithProfiles } from "@/lib/queries";
import type { Multilingual, SectionType } from "@/lib/types";
import { isInProfile } from "@/lib/types";
import { I18n, pickField, hasContent } from "./I18n";
import { FormattedText } from "./FormattedText";
import { ContactIcon } from "./ContactIcon";

interface Ctx {
  langs: string[];
  mode: "online" | "print";
  /** Profil actif ; null = CV complet. */
  profileId: number | null;
}

export function SectionRenderer({
  section,
  ctx,
}: {
  section: SectionWithItems;
  ctx: Ctx;
}) {
  // Filtre les items par profil actif uniquement (un item sans profil est
  // toujours inclus). La visibilité en ligne/PDF et l'activation de section
  // ne sont plus des réglages : le ciblage se fait via les profils.
  const visibleItems = section.items.filter((it) =>
    isInProfile(it.profileIds, ctx.profileId),
  );
  if (visibleItems.length === 0) return null;

  // Sections datées : tri chronologique automatique (plus récent en haut).
  const sorted = sortItems(section.type, visibleItems);
  section = { ...section, items: sorted };

  return (
    <section className={`sec sec-${section.type}`} data-type={section.type}>
      {hasContent(section.title ?? {}) && (
        <h2 className="sec-title">
          <I18n field={section.title} langs={ctx.langs} />
        </h2>
      )}
      <div className="sec-body">{renderBody(section, ctx)}</div>
    </section>
  );
}

function renderBody(section: SectionWithItems, ctx: Ctx) {
  switch (section.type) {
    case "contact":
    case "contact_links":
      return <ContactList section={section} ctx={ctx} />;
    case "summary":
    case "custom":
      return <TextBlocks section={section} ctx={ctx} />;
    case "experience":
    case "involvement":
    case "education":
    case "formation":
    case "distinctions":
      return <TimelineList section={section} ctx={ctx} />;
    case "skills":
      return <SkillsList section={section} ctx={ctx} />;
    case "hobbies":
      return <TagList section={section} ctx={ctx} />;
    case "video_embed":
      return <VideoEmbeds section={section} ctx={ctx} />;
    case "publication_list":
      return <PublicationList section={section} ctx={ctx} />;
    case "portfolio_gallery":
      return <PortfolioGallery section={section} ctx={ctx} />;
    case "image":
      return <ImageBlock section={section} ctx={ctx} />;
    case "links":
      return <LinkButtons section={section} ctx={ctx} />;
    case "html":
      return <HtmlBlock section={section} ctx={ctx} />;
    default:
      return null;
  }
}

// ── Bloc image (une ou plusieurs images pleine largeur) ──
function ImageBlock({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <>
      {section.items.map((item) => {
        const d = item.data as { image?: string; link?: string; caption?: Multilingual };
        if (!d.image) return null;
        // eslint-disable-next-line @next/next/no-img-element
        const img = <img className="block-img" src={d.image} alt="" loading="lazy" />;
        return (
          <figure key={item.id} className="image-block">
            {d.link ? (
              <a href={d.link} target="_blank" rel="noreferrer">
                {img}
              </a>
            ) : (
              img
            )}
            {d.caption && hasContent(d.caption) && (
              <figcaption className="block-caption">
                <I18n field={d.caption} langs={ctx.langs} />
              </figcaption>
            )}
          </figure>
        );
      })}
    </>
  );
}

// ── Boutons / liens ──
function LinkButtons({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <div className="link-buttons">
      {section.items.map((item) => {
        const d = item.data as { label?: Multilingual; url?: string };
        if (!d.url) return null;
        const href = /^(https?:|mailto:|tel:|\/|#)/.test(d.url) ? d.url : `https://${d.url}`;
        return (
          <a key={item.id} className="link-btn" href={href}>
            <I18n field={d.label} langs={ctx.langs} />
          </a>
        );
      })}
    </div>
  );
}

// ── HTML libre (multilingue, rendu tel quel) ──
function HtmlBlock({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <>
      {section.items.map((item) => {
        const d = item.data as Record<string, unknown>;
        return (
          <div key={item.id} className="html-block">
            {ctx.langs.map((lang) => {
              const perLang = d[lang];
              const html =
                perLang && typeof perLang === "object"
                  ? String((perLang as Record<string, unknown>).html ?? "")
                  : "";
              return (
                <div
                  key={lang}
                  data-lang={lang}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

// ── Portfolio : images commentées ──
function PortfolioGallery({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <div className="gallery">
      {section.items.map((item) => {
        const d = item.data as {
          image?: string;
          link?: string;
          caption?: Multilingual;
        };
        if (!d.image) return null;
        const img = (
          <img className="gallery-img" src={d.image} alt="" loading="lazy" />
        );
        return (
          <figure key={item.id} className="gallery-item">
            {d.link ? (
              <a href={d.link} target="_blank" rel="noreferrer">
                {img}
              </a>
            ) : (
              img
            )}
            {d.caption && hasContent(d.caption) && (
              <figcaption className="gallery-caption">
                <I18n field={d.caption} langs={ctx.langs} />
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

// ── Coordonnées / liens de contact ──
function ContactList({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <ul className="contact-list">
      {section.items.map((item) => {
        const d = item.data as { kind?: string; label?: Multilingual; value?: string };
        const href = contactHref(d.kind, d.value);
        return (
          <li key={item.id} className="contact-item" data-kind={d.kind}>
            <ContactIcon kind={d.kind} />
            <span className="contact-label">
              <I18n field={d.label} langs={ctx.langs} />
            </span>
            {href ? (
              <a className="contact-value" href={href}>
                {d.value}
              </a>
            ) : (
              <span className="contact-value">{d.value}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Résumé / section personnalisée : blocs de texte multilingues ──
function TextBlocks({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <>
      {section.items.map((item) => {
        const d = item.data as Record<string, unknown>;
        const heading = pickField(d, ctx.langs, "heading");
        const text = orField(pickField(d, ctx.langs, "text"), pickField(d, ctx.langs, "body"));
        return (
          <div key={item.id} className="text-block">
            {hasContent(heading) && (
              <h3 className="block-heading">
                <I18n field={heading} langs={ctx.langs} />
              </h3>
            )}
            <FormattedText field={text} langs={ctx.langs} className="block-text" />
          </div>
        );
      })}
    </>
  );
}

// ── Expériences / implications / éducation / distinctions ──
function TimelineList({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <ul className="timeline">
      {section.items.map((item) => {
        const d = item.data as Record<string, unknown>;
        const title = pickField(d, ctx.langs, "title");
        const org = pickField(d, ctx.langs, "organization");
        const loc = pickField(d, ctx.langs, "location");
        const desc = pickField(d, ctx.langs, "description");
        // start/end couvrent aussi les dates d'émission/expiration (formation).
        const start =
          (typeof d.start_date === "string" && d.start_date) ||
          (typeof d.issue_date === "string" && d.issue_date) ||
          "";
        const end =
          (typeof d.end_date === "string" && d.end_date) ||
          (typeof d.expiry_date === "string" && d.expiry_date) ||
          "";
        const yearOnly =
          d.year !== undefined && d.year !== "" ? String(d.year) : "";
        // Si pas de plage de dates mais une année (distinctions) : afficher l'année.
        const dates =
          start || end
            ? dateRangeMultilingual(start, end, ctx.langs)
            : yearOnly
              ? Object.fromEntries(ctx.langs.map((l) => [l, yearOnly]))
              : {};
        return (
          <li key={item.id} className="timeline-item">
            <div className="ti-head">
              <h3 className="ti-title">
                <I18n field={title} langs={ctx.langs} />
              </h3>
              {hasContent(dates) && (
                <span className="ti-dates">
                  <I18n field={dates} langs={ctx.langs} />
                </span>
              )}
            </div>
            {(hasContent(org) || hasContent(loc)) && (
              <div className="ti-meta">
                <I18n field={org} langs={ctx.langs} />
                {hasContent(loc) && (
                  <>
                    {" · "}
                    <I18n field={loc} langs={ctx.langs} />
                  </>
                )}
              </div>
            )}
            {hasContent(desc) && (
              <FormattedText field={desc} langs={ctx.langs} className="ti-desc" />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Compétences : catégorie → valeur ──
function SkillsList({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <ul className="skills-list">
      {section.items.map((item) => {
        const d = item.data as Record<string, unknown>;
        const category = pickField(d, ctx.langs, "category");
        const value = pickField(d, ctx.langs, "value");
        const level = pickField(d, ctx.langs, "level");
        return (
          <li key={item.id} className="skill-item">
            {hasContent(category) && (
              <span className="skill-cat">
                <I18n field={category} langs={ctx.langs} />
                {": "}
              </span>
            )}
            <span className="skill-val">
              <I18n field={value} langs={ctx.langs} />
            </span>
            {hasContent(level) && (
              <span className="skill-level">
                {" · "}
                <I18n field={level} langs={ctx.langs} />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Loisirs : liste de tags ──
function TagList({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <ul className="tag-list">
      {section.items.map((item) => {
        const d = item.data as Record<string, unknown>;
        const value = orField(pickField(d, ctx.langs, "value"), pickField(d, ctx.langs, "text"));
        return (
          <li key={item.id} className="tag">
            <I18n field={value} langs={ctx.langs} />
          </li>
        );
      })}
    </ul>
  );
}

// ── Vidéo intégrée ──
function VideoEmbeds({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <>
      {section.items.map((item) => {
        const d = item.data as { provider?: string; url?: string; caption?: Multilingual };
        const embed = embedUrl(d.provider, d.url);
        return (
          <figure key={item.id} className="video-figure">
            {embed ? (
              <div className="video-frame">
                <iframe
                  src={embed}
                  title="video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              d.url && (
                <a href={d.url} className="video-link">
                  {d.url}
                </a>
              )
            )}
            {d.caption && hasContent(d.caption) && (
              <figcaption>
                <I18n field={d.caption} langs={ctx.langs} />
              </figcaption>
            )}
          </figure>
        );
      })}
    </>
  );
}

// ── Publications ──
function PublicationList({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <ol className="pub-list">
      {section.items.map((item) => {
        const d = item.data as Record<string, unknown>;
        const title = pickField(d, ctx.langs, "title");
        const venue = pickField(d, ctx.langs, "venue");
        const abstract = pickField(d, ctx.langs, "abstract");
        const year = typeof d.year === "number" ? d.year : undefined;
        const authors = typeof d.authors === "string" ? d.authors : undefined;
        const link = typeof d.link === "string" ? d.link : undefined;
        return (
          <li key={item.id} className="pub-item">
            <div className="pub-head">
              <h3 className="pub-title">
                {link ? (
                  <a href={link}>
                    <I18n field={title} langs={ctx.langs} />
                  </a>
                ) : (
                  <I18n field={title} langs={ctx.langs} />
                )}
              </h3>
              {year && <span className="pub-year">{year}</span>}
            </div>
            {authors && <div className="pub-authors">{authors}</div>}
            {hasContent(venue) && (
              <div className="pub-venue">
                <em>
                  <I18n field={venue} langs={ctx.langs} />
                </em>
              </div>
            )}
            {hasContent(abstract) && (
              <FormattedText field={abstract} langs={ctx.langs} className="pub-abstract" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── utilitaires ──
function contactHref(kind?: string, value?: string): string | undefined {
  if (!value) return undefined;
  switch (kind) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:${value}`;
    case "linkedin":
    case "github":
    case "website":
    case "url":
      return value.startsWith("http") ? value : `https://${value}`;
    default:
      return undefined;
  }
}

function embedUrl(provider?: string, url?: string): string | undefined {
  if (!url) return undefined;
  if (provider === "youtube" || /youtu/.test(url)) {
    const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : undefined;
  }
  if (provider === "vimeo" || /vimeo/.test(url)) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : undefined;
  }
  return undefined;
}

// ── Tri chronologique (plus récent en haut) pour les sections datées ──
const DATED_SECTIONS: SectionType[] = [
  "experience",
  "involvement",
  "education",
  "formation",
];

function sortItems(
  type: SectionType,
  items: ItemWithProfiles[],
): ItemWithProfiles[] {
  if (DATED_SECTIONS.includes(type)) {
    return [...items].sort((a, b) => recency(b.data) - recency(a.data));
  }
  if (type === "publication_list" || type === "distinctions") {
    return [...items].sort((a, b) => pubYear(b.data) - pubYear(a.data));
  }
  return items;
}

/** Clé de récence d'un item daté = max(dates) en (année*12+mois). */
function recency(data: Record<string, unknown>): number {
  const dates = ["start_date", "end_date", "issue_date", "expiry_date"]
    .map((k) => (typeof data[k] === "string" ? dateKey(data[k] as string) : 0));
  return Math.max(0, ...dates);
}
function pubYear(data: Record<string, unknown>): number {
  return typeof data.year === "number" ? data.year : 0;
}
function dateKey(s: string): number {
  const m = s.match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 12 + (m[2] ? parseInt(m[2], 10) : 0);
}

// ── Format des dates par langue (FR: mois-année · EN: année-mois) ──
function formatDateForLang(s: string, lang: string): string {
  const m = s.match(/^(\d{4})-(\d{2})$/);
  if (!m) return s; // année seule ou texte libre : inchangé
  const [, y, mo] = m;
  return lang === "en" ? `${y}-${mo}` : `${mo}-${y}`;
}
function dateRangeMultilingual(
  start: string,
  end: string,
  langs: string[],
): Multilingual {
  const out: Multilingual = {};
  for (const lang of langs) {
    out[lang] = [start, end]
      .filter(Boolean)
      .map((d) => formatDateForLang(d, lang))
      .join(" – ");
  }
  return out;
}

function orField(a: Multilingual, b: Multilingual): Multilingual {
  return hasContent(a) ? a : b;
}
