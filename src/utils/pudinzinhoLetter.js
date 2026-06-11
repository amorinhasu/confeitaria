const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('./theme');

const PUDINZINHO_LETTER_TITLE = 'Meu Pudinzinho 💌';
const PUDINZINHO_LETTER_DESCRIPTION = `meu pudinzinho, feliz nosso primeiro dia dos namorados juntos, eu profetizo que iremos viver juntos essa data por muitos anos ainda.

eu sei que eu não canso de dizer o quanto sou feliz por ter você, amar você é tão bom, ser amada por você é melhor ainda.

eu não tenho dúvida que estou vivendo o melhor momento da minha vida graças a você, você ilumina meus dias, você fez eu acreditar que ainda existe amor e que vale a pena amar alguém hoje em dia.

tenho vivido dias incríveis do seu lado, desde o dia que nos conhecemos que passamos o dia e a madrugada inteira conversando por mensagem e relembrando coisas nostálgicas, até hoje meu coração treme, achei que eu era a única no mundo que assistiu quase anjos, achei que isso era um surto coletivo, com poucas horas de conversa estava eu as 03 da manhã mandando áudio cantando a música de abertura de quase anjos pra você, confesso que nesse dia eu sabia que seria você.

a primeira vez que fomos em call, TUA EX ENTROU e eu me mordi de ciúmes mas não podia falar nada né, a gente nem tinha flertado ainda e nesse dia passamos o dia todo em call e a madrugada colocando fogo no servidor junto com uns "colegas" nesse dia eu tive mais certeza, vi que sua loucura combinava com a minha e que eu podia ser eu sem ter medo dos julgamentos.

depois disso os dias se tornaram mais perfeitos ainda, dormindo juntos todos os dias, se declarando desde o segundo dia e claro, nunca vou esquecer do dia em que vc disse que baixou roblox pra jogar comigo mesmo sem eu se quer ter falado algo e hoje em dia você é tão viciado quanto eu, joga até sem mim.

também vale lembrar a primeira vez que você twittou algo sobre mim, meu deus eu fiquei tão feliz por uma coisa tão simples e quando vc falava de mim pros seus amigos? minha nossa senhora eu me sentia a mulher mais feliz do mundo, aliás eu me sinto a mulher mais feliz do mundo todos os dias.

eu espero que eu consiga te dar 1% de tudo que você me dá, sempre irei me esforçar muito pra te dar o melhor que o amor pode te oferecer, você merece, eu to aqui do seu lado sempre, na alegria e na tristeza, pra comemorar e pra juntar seus caquinhos, estou aqui por você pela eternidade.

obrigada por ser o melhor namorado do mundo, nem se eu fizesse um pedido pra deus, eu conseguiria pedir alguém tão incrível quanto você, você supriu todas mhas expectativas e tá realizando todos os sonhos que eu nem poderia imaginar sonhar.

eu sou sortuda por ter você, eu te amo pra um caralho ana luiza, feliz nosso dia dos namorados.`;

function createPudinzinhoLetterEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.blue)
    .setTitle(PUDINZINHO_LETTER_TITLE)
    .setDescription(PUDINZINHO_LETTER_DESCRIPTION)
    .setTimestamp();
}

module.exports = { createPudinzinhoLetterEmbed, PUDINZINHO_LETTER_DESCRIPTION, PUDINZINHO_LETTER_TITLE };
