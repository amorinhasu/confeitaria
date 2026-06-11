function hasImageExtension(url = '') {
  try {
    const pathname = new URL(url).pathname;
    return /\.(?:png|jpe?g|gif|webp)$/i.test(pathname);
  } catch {
    return /\.(?:png|jpe?g|gif|webp)(?:\?|$)/i.test(url);
  }
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:'].includes(parsed.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

function isImageAttachment(attachment) {
  if (!attachment) return false;
  const contentType = attachment.contentType || '';
  return contentType.startsWith('image/') || hasImageExtension(attachment.url || '');
}

function getImageAttachmentUrl(attachment) {
  return isImageAttachment(attachment) ? attachment.url : null;
}

module.exports = { getImageAttachmentUrl, hasImageExtension, isImageAttachment, normalizeImageUrl };
