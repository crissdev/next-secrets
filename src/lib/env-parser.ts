export interface ParsedEnvEntry {
  key: string;
  value: string;
  lineNumber: number;
}

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function parseEnvFile(content: string): ParsedEnvEntry[] {
  const result: ParsedEnvEntry[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    // Strip "export " prefix
    const line = trimmed.startsWith('export ') ? trimmed.slice(7).trimStart() : trimmed;

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const key = line.slice(0, eqIdx).trim();
    if (!KEY_PATTERN.test(key)) continue;

    let value = line.slice(eqIdx + 1);

    // Double-quoted value
    if (value.startsWith('"')) {
      const end = findClosingQuote(value, '"');
      if (end !== -1) {
        value = value
          .slice(1, end)
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } else {
        value = value.slice(1);
      }
    } else if (value.startsWith("'")) {
      // Single-quoted: no escape processing
      const end = findClosingQuote(value, "'");
      value = end !== -1 ? value.slice(1, end) : value.slice(1);
    } else {
      // Unquoted: strip inline comments
      const commentIdx = value.search(/\s+#/);
      if (commentIdx !== -1) value = value.slice(0, commentIdx);
      value = value.trim();
    }

    result.push({ key, value, lineNumber: i + 1 });
  }

  return result;
}

function findClosingQuote(s: string, quote: string): number {
  for (let i = 1; i < s.length; i++) {
    if (s[i] === '\\' && quote === '"') {
      i++; // skip escaped char
      continue;
    }
    if (s[i] === quote) return i;
  }
  return -1;
}
