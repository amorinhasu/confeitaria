process.env.KAIKI_USER_ID ||= '993955981220388894';
process.env.PUDINZINHO_ROLE_ID ||= '1509920102911311943';

const { canUsePudinzinhoButton, givePudinzinhoRole } = require('../src/utils/pudinzinhoRole');
const { kaikiUserId, pudinzinhoRoleId } = require('../src/utils/config');
const { PUDINZINHO_LETTER_DESCRIPTION, PUDINZINHO_LETTER_TITLE } = require('../src/utils/pudinzinhoLetter');

async function main() {
  if (kaikiUserId !== '993955981220388894') throw new Error('KAIKI_USER_ID deve apontar para o ID real do Kaiki.');
  if (pudinzinhoRoleId !== '1509920102911311943') throw new Error('PUDINZINHO_ROLE_ID deve apontar para o cargo Pudinzinho real.');
  if (!canUsePudinzinhoButton(kaikiUserId)) throw new Error('Kaiki deveria poder usar o botão Pudinzinho.');
  if (canUsePudinzinhoButton('111111111111111111')) throw new Error('Usuário que não é Kaiki não deveria poder usar o botão Pudinzinho.');
  if (PUDINZINHO_LETTER_TITLE !== 'Meu Pudinzinho 💌') throw new Error('Título da carta Pudinzinho foi alterado.');
  if (!PUDINZINHO_LETTER_DESCRIPTION.includes('você supriu todas mhas expectativas')) throw new Error('Texto da carta Pudinzinho foi alterado ou corrigido indevidamente.');
  if (!PUDINZINHO_LETTER_DESCRIPTION.endsWith('feliz nosso dia dos namorados.')) throw new Error('Final da carta Pudinzinho foi alterado.');
  if (PUDINZINHO_LETTER_TITLE.length > 256) throw new Error('Título da carta ultrapassa o limite do Discord.');
  if (PUDINZINHO_LETTER_DESCRIPTION.length > 4096) throw new Error('Descrição da carta ultrapassa o limite do Discord.');

  const botMember = { permissions: { has: () => true }, roles: { highest: { comparePositionTo: () => 1 } } };
  const duplicateResult = await givePudinzinhoRole({
    user: { id: kaikiUserId },
    guild: {
      roles: { fetch: async (id) => (id === pudinzinhoRoleId ? { name: 'Pudinzinho' } : null) },
      members: { me: botMember, fetchMe: async () => botMember },
    },
    member: { roles: { add: async () => { throw new Error('Não deve adicionar cargo duplicado.'); }, cache: { has: (id) => id === pudinzinhoRoleId } } },
  });
  if (!duplicateResult.ok || duplicateResult.code !== 'already') throw new Error('Clique duplicado deveria retornar code=already sem adicionar cargo novamente.');

  console.log('pudinzinho role flow ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
