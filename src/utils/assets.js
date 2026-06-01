const path = require('node:path');
const assetsConfig = require('../../config/assets.json');

function getAssetConfig(name) {
  return assetsConfig.items[name] || null;
}

function getAssetPublicUrl(name) {
  const asset = getAssetConfig(name);
  const baseUrl = process.env[assetsConfig.base_url_env];

  if (!asset || !baseUrl) return null;
  return new URL(asset.file.replace(/^assets\//, ''), `${baseUrl.replace(/\/$/, '')}/`).toString();
}

function getAssetLocalPath(name) {
  const asset = getAssetConfig(name);
  if (!asset) return null;
  return path.resolve(process.cwd(), asset.file);
}

module.exports = { getAssetConfig, getAssetLocalPath, getAssetPublicUrl };
