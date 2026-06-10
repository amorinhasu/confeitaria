function hasImageExtension(url = '') {
  try {
    const pathname = new URL(url).pathname;
    return /\.(?:png|jpe?g|gif|webp)$/i.test(pathname);
  } catch {
    return /\.(?:png|jpe?g|gif|webp)(?:\?|$)/i.test(url);
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

module.exports = { getImageAttachmentUrl, hasImageExtension, isImageAttachment };
