export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let index = 0; index < maxLength; index += 1) {
    const p1 = parts1[index] || 0;
    const p2 = parts2[index] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
};

export const extractLatestVersion = (html: string): string => {
  const tagMatch = html.match(/\/releases\/tag\/(v?[\d.]+)/);
  if (!tagMatch) {
    throw new Error('未找到发布版本信息');
  }
  return tagMatch[1].replace(/^v/, '');
};

export const extractReleaseNotes = (html: string): string => {
  const notesMatch = html.match(/<div[^>]*class="[^"]*markdown-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!notesMatch?.[1]) return '';

  const stripTags = (input: string): string => {
    let result = '';
    let inTag = false;
    for (const char of input) {
      if (char === '<') {
        inTag = true;
      } else if (char === '>') {
        inTag = false;
      } else if (!inTag) {
        result += char;
      }
    }
    return result;
  };

  const notesText = stripTags(notesMatch[1]);

  return notesText
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('\r\n', '\n')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim();
};
