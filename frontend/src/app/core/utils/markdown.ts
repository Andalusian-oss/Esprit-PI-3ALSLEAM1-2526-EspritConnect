/**
 * Minimal Markdown -> HTML renderer for chat messages.
 * Input is HTML-escaped first, so the output only contains tags we generate.
 * Supports: code blocks, inline code, bold, italic, links, headings, lists.
 */

const CODE_SENTINEL = String.fromCharCode(1); // control char, never present in chat text

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(text: string): string {
  return text
    // inline code first so other rules don't touch its content
    .replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    // links - http(s) only
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function renderMarkdown(raw: string): string {
  if (!raw) return '';
  // Strip any sentinel chars from input, then escape HTML
  const escaped = escapeHtml(raw.split(CODE_SENTINEL).join(''));

  // Extract fenced code blocks so list/paragraph logic doesn't touch them
  const codeBlocks: string[] = [];
  const withPlaceholders = escaped.replace(/```(\w*)\n?([\s\S]*?)(```|$)/g, (_m, lang, code) => {
    const cls = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre class="md-pre"><code${cls}>${code.replace(/\n$/, '')}</code></pre>`);
    return CODE_SENTINEL + (codeBlocks.length - 1) + CODE_SENTINEL;
  });

  const lines = withPlaceholders.split('\n');
  const out: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  };

  const blockOnlyRe = new RegExp(`^\\s*${CODE_SENTINEL}\\d+${CODE_SENTINEL}\\s*$`);

  for (const line of lines) {
    // A line that is only a code-block placeholder: emit it bare, not inside <p>
    if (blockOnlyRe.test(line)) {
      closeList();
      out.push(line.trim());
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (heading) {
      closeList();
      out.push(`<div class="md-h">${renderInline(heading[2])}</div>`);
    } else if (bullet) {
      if (listType !== 'ul') { closeList(); out.push('<ul class="md-list">'); listType = 'ul'; }
      out.push(`<li>${renderInline(bullet[1])}</li>`);
    } else if (ordered) {
      if (listType !== 'ol') { closeList(); out.push('<ol class="md-list">'); listType = 'ol'; }
      out.push(`<li>${renderInline(ordered[1])}</li>`);
    } else if (line.trim() === '') {
      closeList();
      out.push('<div class="md-gap"></div>');
    } else {
      closeList();
      out.push(`<p class="md-p">${renderInline(line)}</p>`);
    }
  }
  closeList();

  // Restore code blocks
  const sentinelRe = new RegExp(`${CODE_SENTINEL}(\\d+)${CODE_SENTINEL}`, 'g');
  return out.join('').replace(sentinelRe, (_m, i) => codeBlocks[Number(i)]);
}
