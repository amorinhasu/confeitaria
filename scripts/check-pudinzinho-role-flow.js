process.env.KAIKI_USER_ID ||= '993955981220388894';
process.env.PUDINZINHO_ROLE_ID ||= '123456789012345678';

const { canUsePudinzinhoButton } = require('../src/utils/pudinzinhoRole');
const { kaikiUserId, pudinzinhoRoleId } = require('../src/utils/config');

if (!kaikiUserId) throw new Error('KAIKI_USER_ID não carregado pelo config.');
if (!pudinzinhoRoleId) throw new Error('PUDINZINHO_ROLE_ID não carregado pelo config.');
if (!canUsePudinzinhoButton(kaikiUserId)) throw new Error('Kaiki deveria poder usar o botão Pudinzinho.');
if (canUsePudinzinhoButton('111111111111111111')) throw new Error('Usuário que não é Kaiki não deveria poder usar o botão Pudinzinho.');

console.log('pudinzinho role flow ok');
