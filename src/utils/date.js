function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(date);
}

function formatDuration(ms) {
  const totalMinutes = Math.max(1, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}


function formatDurationAllowZero(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes === 0) return '0 min';
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

function daysSince(dateText) {
  const start = new Date(`${dateText}T00:00:00-03:00`);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

module.exports = { daysSince, formatDate, formatDuration, formatDurationAllowZero };
