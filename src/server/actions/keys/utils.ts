import { encodeHexLowerCase } from "@oslojs/encoding";

import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export function generateApiKey(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return `sk-${token}`;
}

export function hashApiKey(apiKey: string): string {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(apiKey)));
}
