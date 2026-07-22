/**
 * Bloc d'identité affiché en haut de la page CV (et dans le PDF) :
 * photo de profil (optionnelle) + nom complet. Repli propre : si pas de
 * photo, seul le nom s'affiche ; si ni l'un ni l'autre, rien n'est rendu.
 */
export function CvIdentity({
  ownerName,
  photoUrl,
}: {
  ownerName?: string | null;
  photoUrl?: string | null;
}) {
  if (!ownerName && !photoUrl) return null;
  return (
    <div className="cv-identity">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cv-photo" src={photoUrl} alt={ownerName ?? ""} />
      ) : null}
      {ownerName ? <h1 className="cv-name">{ownerName}</h1> : null}
    </div>
  );
}
