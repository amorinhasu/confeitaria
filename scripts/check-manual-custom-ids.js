const Module = require('node:module');

const originalLoad = Module._load;
Module._load = function loadWithTestMocks(request, parent, isMain) {
  if (request === 'discord.js') {
    class ActionRowBuilder {
      constructor() { this.components = []; }
      addComponents(...components) { this.components.push(...components.flat()); return this; }
    }
    class ButtonBuilder {
      constructor() { this.data = {}; }
      setCustomId(value) { this.data.custom_id = value; return this; }
      setLabel(value) { this.data.label = value; return this; }
      setStyle(value) { this.data.style = value; return this; }
      setEmoji(value) { this.data.emoji = value; return this; }
    }
    class EmbedBuilder {
      constructor() { this.data = {}; }
      setColor(value) { this.data.color = value; return this; }
      setTitle(value) { this.data.title = value; return this; }
      setDescription(value) { this.data.description = value; return this; }
      setTimestamp() { return this; }
      addFields(fields) { this.data.fields = fields; return this; }
      setImage(value) { this.data.image = { url: value }; return this; }
      setThumbnail(value) { this.data.thumbnail = { url: value }; return this; }
      setFooter(value) { this.data.footer = value; return this; }
    }
    return { ActionRowBuilder, ButtonBuilder, ButtonStyle: { Primary: 1, Secondary: 2 }, EmbedBuilder };
  }

  if (request === 'sqlite3') {
    class Database {
      exec(sql, callback) { callback?.(null); }
      run(sql, params, callback) { (typeof params === 'function' ? params : callback)?.call({ lastID: 1, changes: 1 }, null); }
      get(sql, params, callback) { (typeof params === 'function' ? params : callback)?.(null, null); }
      all(sql, params, callback) { (typeof params === 'function' ? params : callback)?.(null, []); }
    }
    return { verbose: () => ({ Database }) };
  }

  return originalLoad(request, parent, isMain);
};

const { createManualPageRows, manualPages } = require('../src/components/manual');

function checkManualCustomIds() {
  const failures = [];

  for (const page of manualPages) {
    const ids = createManualPageRows(page.id).flatMap((row) => row.components.map((component) => component.data.custom_id).filter(Boolean));
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

    if (duplicates.length > 0) {
      failures.push({ page: page.id, duplicates });
      console.error(`[Manual Test] Página ${page.id} tem custom_id duplicado: ${duplicates.join(', ')}`);
    }
  }

  if (failures.length > 0) return false;

  console.log(`[Manual Test] ${manualPages.length} página(s) sem custom_id duplicado.`);
  return true;
}

if (require.main === module && !checkManualCustomIds()) process.exit(1);

module.exports = { checkManualCustomIds };
