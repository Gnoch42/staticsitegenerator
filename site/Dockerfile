# ─────────────────────────────────────────────────────────────
#  cv-site — serveur statique Caddy (toujours actif).
#  Sert le contenu de /data/site (volume partagé), en lecture seule.
# ─────────────────────────────────────────────────────────────
FROM caddy:2.8-alpine

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
# L'image caddy officielle démarre déjà avec ce Caddyfile ; CMD explicite
# pour lisibilité.
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
