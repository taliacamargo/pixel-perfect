// Gera o segredo do segundo fator do painel (ADMIN_TOTP_SECRET).
// Uso: pnpm gerar-2fa
// O segredo aparece só no seu terminal: não salve em arquivos nem mande por mensagem.
import { randomBytes } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
let bits = "";
for (const byte of randomBytes(20)) bits += byte.toString(2).padStart(8, "0");
let secret = "";
for (let i = 0; i + 5 <= bits.length; i += 5) secret += BASE32[parseInt(bits.slice(i, i + 5), 2)];

const label = encodeURIComponent("Napkin Notes:Painel");
const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent("Napkin Notes")}&algorithm=SHA1&digits=6&period=30`;

console.log(`
Segredo (ADMIN_TOTP_SECRET):

  ${secret}

No app autenticador (Google Authenticator, Authy, 1Password…):
  "Adicionar" > "Inserir chave de configuração" e digite o segredo acima
  (nome: Napkin Notes · tipo: baseado em tempo).

Link otpauth (para apps que aceitam colar o link):
  ${uri}
`);
