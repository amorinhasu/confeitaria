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
