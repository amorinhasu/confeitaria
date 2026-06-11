const texts = require('../../config/texts.json');

function getText(key, fallback = '') {
  return texts[key] || fallback;
}

module.exports = { getText, texts };
