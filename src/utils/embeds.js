const { getAssetPublicUrl } = require('./assets');
const { daysSince, formatDuration } = require('./date');
const { emoji, withEmoji } = require('./emojis');
const { getText } = require('./texts');
const { momozinEmbed } = require('./theme');

function profileEmbed(profile, mode = 'full') {
  const achievements = profile.achievements
    .split(';')
    .map((item) => `${emoji('perfil', 'achievement')} ${item.trim()}`)
    .join('\n');
  const days = daysSince(profile.start_date);

  if (mode === 'achievements') {
    return momozinEmbed({
      title: withEmoji('perfil', 'achievement', 'Conquistas do casal'),
      description: achievements,
      image: getAssetPublicUrl('profile_banner'),
    });
  }

  if (mode === 'status') {
    return momozinEmbed({
      title: withEmoji('perfil', 'heart', 'Status do casal'),
      description: withEmoji('perfil', 'heart', profile.status),
      image: getAssetPublicUrl('profile_banner'),
    });
  }

  return momozinEmbed({
    title: withEmoji('perfil', 'heart', getText('profile_title', 'Perfil do casal')),
    description: getText('profile_description', 'O arquivo oficial, fofo e de madrugada do casal Momozin.'),
    image: getAssetPublicUrl('profile_banner'),
    fields: [
      { name: 'Casal', value: `${emoji('perfil', 'couple')} ${profile.trivia_name} + ${profile.kaiki_name}`, inline: true },
      { name: 'Apelidos', value: profile.nicknames, inline: true },
      { name: 'Contador desde o dia 05', value: `${days} dia(s) desde ${profile.start_date}`, inline: false },
      { name: 'Status', value: withEmoji('perfil', 'heart', profile.status), inline: false },
      { name: 'Conquistas', value: achievements, inline: false },
    ],
  });
}

function studyStatsEmbed(stats) {
  return momozinEmbed({
    title: withEmoji('estudos', 'book', 'Progresso dos estudos'),
    description: stats.open ? 'Tem uma sessão de estudo aberta agora.' : 'Nenhuma sessão aberta no momento.',
    image: getAssetPublicUrl('study_banner'),
    fields: [
      { name: 'Sessões finalizadas', value: String(stats.sessions), inline: true },
      { name: 'Tempo total', value: formatDuration(stats.minutes * 60000), inline: true },
      { name: 'MomoCoins por estudo', value: String(stats.coins), inline: true },
    ],
  });
}

module.exports = { profileEmbed, studyStatsEmbed };
