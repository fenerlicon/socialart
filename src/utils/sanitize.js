/**
 * Safe HTML Sanitizer to prevent Stored & Reflected XSS
 */
export function sanitizeHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  if (typeof window === 'undefined') return rawHtml;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    const FORBIDDEN_TAGS = ['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'APPLET', 'META', 'LINK', 'STYLE', 'FORM', 'INPUT', 'BUTTON'];

    const sanitizeNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (FORBIDDEN_TAGS.includes(node.tagName.toUpperCase())) {
          node.remove();
          return;
        }

        const attrs = Array.from(node.attributes);
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();
          const attrVal = attr.value.trim().toLowerCase();

          if (attrName.startsWith('on') || attrVal.startsWith('javascript:') || attrVal.startsWith('data:text/html') || attrVal.startsWith('vbscript:')) {
            node.removeAttribute(attr.name);
          }
        }

        if (node.tagName.toUpperCase() === 'A') {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer nofollow');
        }
      }

      Array.from(node.childNodes).forEach(child => sanitizeNode(child));
    };

    Array.from(doc.body.childNodes).forEach(child => sanitizeNode(child));
    return doc.body.innerHTML;
  } catch (e) {
    console.warn('HTML sanitize error, stripping all tags as fallback:', e);
    return rawHtml.replace(/<[^>]*>?/gm, '');
  }
}