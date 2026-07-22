import type { SectionWithItems } from "@/lib/queries";
import type { Multilingual } from "@/lib/types";
import { isVisibleIn, isInProfile } from "@/lib/types";
import { I18n, pickField, hasContent } from "./I18n";

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
  // Section masquée, ou non visible dans ce mode (en ligne / imprimé).
  if (!section.enabled || !isVisibleIn(section.visibility, ctx.mode)) return null;

  // Filtre les items par visibilité (mode) ET par profil actif.
  const visibleItems = section.items.filter(
    (it) =>
      isVisibleIn(it.visibility, ctx.mode) &&
      isInProfile(it.profileIds, ctx.profileId),
  );
  if (visibleItems.length === 0) return null;
  section = { ...section, items: visibleItems };

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
    default:
      return null;
  }
}

// ── Portfolio : images commentées ──
function PortfolioGallery({ section, ctx }: { section: SectionWithItems; ctx: Ctx }) {
  return (
    <div className="gallery">
      {section.items.map((item) => {
        const d = item.data as {
          image?: string;
          alt?: string;
          link?: string;
          caption?: Multilingual;
        };
        if (!d.image) return null;
        const img = (
          <img className="gallery-img" src={d.image} alt={d.alt ?? ""} loading="lazy" />
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
            <p className="block-text">
              <I18n field={text} langs={ctx.langs} />
            </p>
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
        const start = typeof d.start_date === "string" ? d.start_date : "";
        const end = typeof d.end_date === "string" ? d.end_date : "";
        const dates = [start, end].filter(Boolean).join(" – ");
        return (
          <li key={item.id} className="timeline-item">
            <div className="ti-head">
              <h3 className="ti-title">
                <I18n field={title} langs={ctx.langs} />
              </h3>
              {dates && <span className="ti-dates">{dates}</span>}
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
              <p className="ti-desc">
                <I18n field={desc} langs={ctx.langs} />
              </p>
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
              <p className="pub-abstract">
                <I18n field={abstract} langs={ctx.langs} />
              </p>
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

function orField(a: Multilingual, b: Multilingual): Multilingual {
  return hasContent(a) ? a : b;
}
