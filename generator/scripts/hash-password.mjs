#!/usr/bin/env node
// Génère un hash bcrypt pour ADMIN_PASSWORD_HASH.
// Usage : node scripts/hash-password.mjs "monMotDePasse"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "<mot de passe>"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
