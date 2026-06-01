module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`💙 Momozin ligado como ${client.user.tag}.`);
  },
};
