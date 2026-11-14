export type OptionKind = 'world' | 'god';
export type ChoiceKey = 'A' | 'B';

export interface StoryOption {
  key: ChoiceKey;
  kind: OptionKind;
  label: string;
  outcomeText: string;
  basePoints: number;
}

export interface Chapter {
  id: number;
  act: string;
  ageLabel: string;
  title: string;
  narration: string;
  catholicRef: string;
  options: [StoryOption, StoryOption];
}

export interface PublicOption {
  key: ChoiceKey;
  label: string;
}

export interface PublicChapter {
  id: number;
  act: string;
  ageLabel: string;
  title: string;
  narration: string;
  options: [PublicOption, PublicOption];
}

export interface EpilogueTier {
  id: 'rock' | 'divided' | 'shortcuts';
  title: string;
  reference: string;
  description: string;
}

export const EPILOGUE_NARRATION =
  'Os anos passaram depressa. De cabelos brancos, você caminha devagar pela Praça Santa Rita ouvindo a água do Rio Pomba correr debaixo da ponte e o sino do Santuário tocar para a Missa da tarde. A vida inteira passou como um sopro — do simulado do Enem até aqui. Na hora do balanço final, cada pequena escolha mostrou quem você se tornou.';

export const EPILOGUE_TIERS: Record<EpilogueTier['id'], EpilogueTier> = {
  rock: {
    id: 'rock',
    title: 'Casa sobre a Rocha',
    reference: 'Mt 7,24 • 2Tm 4,7',
    description:
      'Você perdeu atalhos, abriu mão de bônus e chorou em noites difíceis. Mas envelheceu rodeado de nomes que amou, com o coração em paz e pronto para o abraço de Deus.',
  },
  divided: {
    id: 'divided',
    title: 'Caminho em Construção',
    reference: 'Pr 16,9',
    description:
      'Você amou a Deus em vários trechos da estrada, mas muitas vezes deixou Ele para "quando sobrasse tempo". Descobriu que o plano de Deus não é um acessório da vida: é o chão onde tudo fica de pé.',
  },
  shortcuts: {
    id: 'shortcuts',
    title: 'Colheita dos Atalhos',
    reference: 'Mc 8,36',
    description:
      'Quase sempre escolheu o que parecia mais esperto na hora: a IA pronta, o currículo inflado, o domingo trocado por dinheiro, o conforto solitário. Ganhou aplausos rápidos, mas chegou à beira do rio sentindo que correu para o lugar errado.',
  },
};

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    act: 'Ato I — Barro e Prova',
    ageLabel: '17 anos • Sexta à noite',
    title: 'Sexta-feira de Calor e IA',
    narration:
      'Era uma sexta abafada de outubro em Cataguases. Amanhã cedo teria o último simulado antes do Enem e ainda havia uma redação valendo metade da nota para entregar. Na sala, Dona Marlene ainda costurava encomendas para fechar o mês. Seu celular vibrou: Gabriel mandou um áudio animado: "Para de sofrer! Joguei o tema na IA, ela escreveu uma redação nota mil. Só muda duas palavras, entrega e vai dormir ou jogar!"',
    catholicRef: 'Nota Antiqua et Nova (Vaticano, 2025) — IA amplia o humano, nunca substitui a consciência',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Copiar o texto pronto da IA, entregar em 10 minutos e aproveitar a noite livre.',
        outcomeText:
          'Na hora foi um alívio e até tirou 9,5 no dever. Mas no sábado de manhã, sem celular no simulado, sua cabeça travou na folha em branco.',
        basePoints: -12,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Usar a IA só para revisar gramática e escrever a própria redação até tarde.',
        outcomeText:
          'Foi dormir quase 1h da manhã e tirou só 7,5 na escola. Mas no simulado de sábado sua mente estava afiada e escreveu com segurança.',
        basePoints: 20,
      },
    ],
  },
  {
    id: 2,
    act: 'Ato I — Barro e Prova',
    ageLabel: '17 anos • Domingo de manhã',
    title: 'O Sino das Nove',
    narration:
      'O simulado de sábado deixou o corpo moído. Às 8h45 de domingo, o sino do Santuário Santa Rita bateu para a Missa e a Helena lembrou do grupo de jovens à tarde. No mesmo minuto, o grupo da sala ferveu: Gabriel comprou energético e chamou para um "intensivão de matemática o domingo inteiro" na casa dele.',
    catholicRef: 'Mt 6,33 • São Carlo Acutis ("A Eucaristia é a nossa rodovia para o Céu")',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Ir à Missa das 9h, participar do grupo e estudar focado por 3h no fim da tarde.',
        outcomeText:
          'Viu menos matéria que a turma e sentiu medo de ficar para trás. Mas saiu da Eucaristia sereno e rendeu o dobro nas três horas de estudo.',
        basePoints: 20,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Pular Missa e grupo: "Semana de Enem Deus entende, hoje o foco é 100% nota."',
        outcomeText:
          'Resolveu 30 questões a mais no papel, mas voltou para casa exausto de energético, ansioso e acabou discutindo feio com Dona Marlene.',
        basePoints: -12,
      },
    ],
  },
  {
    id: 3,
    act: 'Ato I — Barro e Prova',
    ageLabel: '17 anos • Dia do Enem',
    title: 'Vinte Minutos para o Portão',
    narration:
      'Três semanas depois chegou o domingo do Enem. Dona Marlene fez café forte antes do sol nascer. Só que perto da ponte do Rio Pomba o ônibus quebrou e todo mundo desceu a pé. Faltando 20 minutos para fechar o portão, você dobrou a esquina correndo — e viu uma senhora conhecida do bairro caída na calçada com a sacola rasgada e o tornozelo inchado.',
    catholicRef: 'Lc 10,33 (Bom Samaritano) • Pr 16,9',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Parar 5 minutos, ajudá-la a sentar na sombra e avisar o mercadinho antes de correr.',
        outcomeText:
          'Entrou pelo portão faltando 30 segundos, ensopado de suor e sem fôlego. Mas sentou com o coração inteiro em paz e fez a melhor prova do ano.',
        basePoints: 24,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Fingir que não viu e correr direto para garantir o horário com folga.',
        outcomeText:
          'Chegou 15 minutos antes de fechar. Porém, na primeira hora de prova, a imagem da senhora no chão não saiu da cabeça e você leu o texto três vezes sem foco.',
        basePoints: -14,
      },
    ],
  },
  {
    id: 4,
    act: 'Ato I — Barro e Prova',
    ageLabel: '18 anos • Janeiro',
    title: 'O Feed das Aprovações',
    narration:
      'Em janeiro saiu a nota do Enem. Não deu para ir morar fora na capital como você sonhava, mas abriu vaga num curso bom do IF Sudeste aqui na região. Enquanto Dona Marlene chorava de orgulho, seu Instagram explodiu de colegas ostentando festas e faculdades grandes. Gabriel ligou: "Larga essa vaga pequena, fica um ano em casa só tentando outro Enem!"',
    catholicRef: 'São Carlo Acutis ("Todos nascem originais, muitos morrem como fotocópias")',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Sentir vergonha da vaga local, largar tudo e ficar em casa tentando parecer vencedor.',
        outcomeText:
          'Evitou pegar circular às seis da manhã, mas passou meses trancado no quarto se comparando com stories perfeitos e afundando em tristeza.',
        basePoints: -15,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Assumir a matrícula no IF da região com gratidão e cortar o excesso de telas.',
        outcomeText:
          'Doeu no orgulho ver colegas viajando enquanto você pegava ônibus todo dia, mas logo descobriu ótimos professores e um propósito real.',
        basePoints: 24,
      },
    ],
  },
  {
    id: 5,
    act: 'Ato I — Barro e Prova',
    ageLabel: '19 anos • Sexta chuvosa',
    title: 'A Chuva na Praça Santa Rita',
    narration:
      'No segundo semestre do curso, o dinheiro vivia contado. Sexta à noite chovia forte no centro de Cataguases e você estava com os últimos R$ 35 no bolso para lanchar com a turma na Praça Santa Rita. Na marquise da farmácia, reconheceu Seu Antônio — o vizinho idoso que morava sozinho — encharcado, equilibrando um saco de arroz e remédios.',
    catholicRef: 'São Pier Giorgio Frassati (Caridade discreta • "Verso l\'alto!")',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Pagar um carro com seus R$ 35, subir as escadas com ele e voltar a pé na chuva.',
        outcomeText:
          'Chegou em casa molhado, sem dinheiro para o fim de semana e jantou pão com ovo. Mas dormiu com uma alegria silenciosa que não passava.',
        basePoints: 26,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Atravessar para a outra calçada para não perder o lanche nem atrasar para o rolê.',
        outcomeText:
          'Chegou sequinho e riu com a galera na lanchonete. Mas a cada trovão lembrava de Seu Antônio subindo a ladeira sozinho, e a noite perdeu a graça.',
        basePoints: -14,
      },
    ],
  },
  {
    id: 6,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '20 anos • Seleção de emprego',
    title: 'A Entrevista com o Cláudio',
    narration:
      'Com as notas do IF em dia, surgiu seleção para assistente numa empresa tradicional de Cataguases com o gerente Cláudio. Na recepção, Gabriel cochichou: "Botei no currículo Excel avançado e inglês fluente. O RH não testa na hora; coloca também senão você roda na triagem."',
    catholicRef: 'Lc 16,10 ("Quem é fiel no pouco, também é fiel no muito")',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Dar uma "turbinada" no currículo para não perder a vaga para quem faz igual.',
        outcomeText:
          'Cláudio sorriu na entrevista e elogiou seu perfil. Mas na segunda semana pediu uma planilha complexa, você travou e viveu meses com medo de ser desmascarado.',
        basePoints: -16,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Dizer exatamente o que sabe e se comprometer a estudar à noite o que falta.',
        outcomeText:
          'Perdeu a vaga principal na hora e entrou num cargo auxiliar ganhando menos. Meses depois, Cláudio promoveu você justamente pela sinceridade.',
        basePoints: 26,
      },
    ],
  },
  {
    id: 7,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '21 anos • Sexta, 17h30',
    title: 'O Erro das Cinco e Meia',
    narration:
      'Um ano depois, já efetivado no setor administrativo, sexta às 17h30 todos fechavam as mochilas. Ao revisar os pedidos, seu coração gelou: você digitou um código errado que atrasaria a remessa de segunda. Ninguém tinha visto — e o sistema estava aberto com o login de um estagiário novato no PC ao lado.',
    catholicRef: 'Pr 28,13 • Cl 3,23 ("Tudo o que fizerdes, fazei-o como para o Senhor")',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Bater na porta do Cláudio, assumir o erro na hora e ficar até 19h corrigindo.',
        outcomeText:
          'Levou uma bronca séria e perdeu o compromisso da sexta à noite. Mas a partir daquele dia Cláudio passou a confiar em você de olhos fechados.',
        basePoints: 26,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Ficar quieto e deixar parecer falha do sistema ou do novato na segunda.',
        outcomeText:
          'Saiu no horário tranquilo na sexta. Na segunda, o estagiário levou culpa injusta na frente da sala e o clima no trabalho apodreceu.',
        basePoints: -16,
      },
    ],
  },
  {
    id: 8,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '22 anos • Ritmo adulto',
    title: 'O Projeto de Todos os Domingos',
    narration:
      'Por causa dessa confiança, Cláudio ofereceu a você a coordenação de um projeto com 40% a mais de salário. Dona Marlene sorriu animada com o alívio nas contas. O detalhe: por oito meses você teria de trabalhar quase todos os sábados e domingos inteiros — zerando Missa em Santa Rita e tempo em casa.',
    catholicRef: 'Mc 8,36 ("De que adianta ganhar o mundo inteiro...") • São Carlo Acutis',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Aceitar sem negociar: "Agora é fase de juntar dinheiro; depois eu volto pra Igreja."',
        outcomeText:
          'A conta bancária subiu rápido e comprou o que queria. Mas sem domingo e sem Eucaristia, vieram a insônia e uma impaciência dura com todos em casa.',
        basePoints: -16,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Propor dividir a escala com um colega para ganhar menos bônus e preservar o domingo.',
        outcomeText:
          'Recebeu só metade do adicional possível e precisou segurar gastos. Mas manteve a alma viva na Missa de Santa Rita e atravessou o ano inteiro em paz.',
        basePoints: 28,
      },
    ],
  },
  {
    id: 9,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '24 anos • Saída da Missa',
    title: 'O Convite da Helena',
    narration:
      'Num domingo de manhã na escadaria do Santuário, Helena segurou você preocupada: "A turma de adolescentes lá do bairro de cima vai fechar por falta de gente mais velha para acompanhar. Os meninos estão afundando em apostas e solidão. Você topa assumir uma noite por semana?" Você já trabalhava o dia todo e estava moído.',
    catholicRef: '1Pd 4,10 • São Pier Giorgio Frassati',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Recusar educadamente para guardar suas noites de sofá, séries e descanso.',
        outcomeText:
          'Teve semanas bem confortáveis no quarto. Meses depois soube que o grupo fechou e sentiu sua própria fé esfriar até virar rotina vazia.',
        basePoints: -15,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Topar por um semestre toda quinta à noite, mesmo apertando as horas de sono.',
        outcomeText:
          'Teve quinta que você quase dormiu de pé depois do trabalho. Mas ver um garoto de 15 anos mudar de rumo porque alguém o escutou renovou sua esperança.',
        basePoints: 28,
      },
    ],
  },
  {
    id: 10,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '25 anos • Centro de Cataguases',
    title: 'O Reencontro na Padaria',
    narration:
      'Meses depois, comprando pão antes do serviço no centro, um rapaz parou olhando para o seu crachá: "Você não é vizinho do Seu Antônio da rua de cima? Eu sou o Marcos, filho dele!" Marcos tinha aberto uma pequena empresa de tecnologia e gestão na Zona da Mata e chamou você para um café para conversar sobre trabalhar junto.',
    catholicRef: 'Pr 11,25 ("Quem faz o bem será recompensado")',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Conversar com simplicidade, mostrar trabalho real e reconhecer suas limitações.',
        outcomeText:
          'Não veio salário milionário no primeiro mês, mas nasceu uma parceria limpa, leal e cheia de frutos para o futuro.',
        basePoints: 30,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Tentar impressionar Marcos inventando feitos e falando mal do chefe atual.',
        outcomeText:
          'Falou bonito por vinte minutos no café, mas Marcos percebeu a falta de lealdade quando checou referências e nunca mais retornou a ligação.',
        basePoints: -16,
      },
    ],
  },
  {
    id: 11,
    act: 'Ato III — Raízes e Tempestades',
    ageLabel: '27 anos • Projeto de vida',
    title: 'O Namoro que Dividia a Alma',
    narration:
      'Aos 27 anos, você começou a namorar uma pessoa carismática e admirada na cidade. No início parecia filme, mas logo veio o atrito: fazia piada toda vez que você ia ao Santuário, implicava com suas amizades da igreja e dizia que "quem quer crescer em Cataguases não pode perder tempo com coisa de paróquia".',
    catholicRef: 'Mt 7,24-27 (Casa sobre a rocha vs. areia)',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Ir cedendo por medo de ficar sozinho aos 27 anos: "Depois que casar melhora."',
        outcomeText:
          'Evitou brigas e ganhou fotos bonitas de status. Mas foi apagando sua fé aos poucos até não reconhecer quem você era no espelho.',
        basePoints: -18,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Conversar com verdade sobre o que é inegociável e aceitar o término se os rumos forem opostos.',
        outcomeText:
          'Doeu fundo; enfrentou meses de silêncio e saudade difícil. Mas preservou sua alma inteira e construiu terreno firme na rocha.',
        basePoints: 28,
      },
    ],
  },
  {
    id: 12,
    act: 'Ato III — Raízes e Tempestades',
    ageLabel: '30 anos • Grupo da empresa',
    title: 'O Áudio Cortado no WhatsApp',
    narration:
      'Aos trinta anos surgiu uma vaga de supervisão disputada entre você e Renato, um colega difícil. Na terça-feira, vazou no grupo da empresa um áudio cortado fora de contexto — quase editado por IA — onde Renato parecia falar mal da diretoria. Todos riam e encaminhavam.',
    catholicRef: 'Nota Antiqua et Nova (2025) — Combate à manipulação digital e defesa da verdade',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Escrever no grupo que o áudio está cortado e pedir que ouçam Renato antes de julgar.',
        outcomeText:
          'Ganhou fama de "chato" por algumas semanas e disputou a vaga no voto apertado. Mas dormiu com a consciência livre e ganhou respeito silencioso.',
        basePoints: 28,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Ficar calado e deixar a fofoca derrubar seu concorrente sozinho.',
        outcomeText:
          'Renato foi afastado e o caminho ficou livre. Mas cada vez que entrava naquela sala sentia peso na consciência e medo de ser o próximo alvo.',
        basePoints: -16,
      },
    ],
  },
  {
    id: 13,
    act: 'Ato III — Raízes e Tempestades',
    ageLabel: '33 anos • Crise e silêncio',
    title: 'A Demissão e o Esquema Fácil',
    narration:
      'Aos 33 anos uma crise forte atingiu o setor e você entrou num corte de custos bem no mês de contas pesadas. Sem dormir direito, recebeu mensagem do velho colega Gabriel: "Tô num grupo fechado de apostas e renda rápida. Bota metade da tua rescisão comigo que em quinze dias você dobra!"',
    catholicRef: 'Santa Rita de Cássia (fidelidade nas causas impossíveis) • Pr 16,3',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Arriscar parte da reserva no esquema "só para sair do sufoco desse mês".',
        outcomeText:
          'Ganhou um troco nos três primeiros dias e achou que tinha achado a saída. Na segunda semana a banca levou quase tudo, deixando dívida e vergonha.',
        basePoints: -20,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Bloquear o esquema, rezar no Santuário Santa Rita, cortar gastos e recomeçar com Marcos.',
        outcomeText:
          'Passou quatro meses de arroz com feijão bem apertado. Mas atravessou o vale de pé e reconstruiu a renda sem destruir a própria paz.',
        basePoints: 32,
      },
    ],
  },
  {
    id: 14,
    act: 'Ato III — Raízes e Tempestades',
    ageLabel: '36 anos • Negócio próprio',
    title: 'A Nota "Por Fora"',
    narration:
      'Três anos depois, você e Marcos estabilizaram um pequeno negócio sério em Cataguases. Um cliente grande ofereceu fechar o maior contrato do ano — mas pediu para lançar metade "por fora" sem nota fiscal para baratear 20% e fugir do imposto.',
    catholicRef: 'Mt 22,21 • Pr 10,9 ("Quem anda na integridade anda seguro")',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Recusar o acordo informal e apresentar um pacote menor dentro da lei.',
        outcomeText:
          'O cliente fechou com o concorrente e o caixa daquele mês apertou forte. Mas a fama de empresa séria trouxe contratos firmes nos anos seguintes.',
        basePoints: 30,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Aceitar o esquema: "O imposto é alto demais, todo mundo faz isso para sobreviver."',
        outcomeText:
          'Entrou dinheiro gordo no mês. Meses depois deu problema contratual sem respaldo de nota, o cliente sumiu e sobrou prejuízo jurídico.',
        basePoints: -18,
      },
    ],
  },
  {
    id: 15,
    act: 'Ato III — Raízes e Tempestades',
    ageLabel: '40 anos • Liderança e IA',
    title: 'A IA e os Três Veteranos',
    narration:
      'Aos 40 anos você liderava uma equipe de doze pessoas. Os sócios trouxeram um software novo de IA que automatizava planilhas — e colocaram uma meta na sua mesa: demitir imediatamente três funcionários antigos da cidade com mais de 50 anos para aumentar seu bônus anual em 20%.',
    catholicRef: 'Nota Antiqua et Nova (2025) — Tecnologia a serviço da dignidade humana',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Assinar as três demissões na sexta: "É a modernização; se eu não fizer, outro faz."',
        outcomeText:
          'A planilha brilhou e o bônus caiu na conta. Mas o olhar daqueles três pais de família saindo com a caixa na mão não saiu mais da sua memória.',
        basePoints: -20,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Abrir mão do bônus e propor treinar os três veteranos para atendimento humano com apoio da IA.',
        outcomeText:
          'Deu o dobro de trabalho ensinar a equipe e seu bônus foi zero naquele ano. Mas salvou três lares em Cataguases e formou uma equipe leal.',
        basePoints: 34,
      },
    ],
  },
  {
    id: 16,
    act: 'Ato IV — Legado e Travessia',
    ageLabel: '46 → 58 anos • Família',
    title: 'A Presença que Não Cabe no PIX',
    narration:
      'Os anos seguiram até você chegar à maturidade. Primeiro veio a doença de Dona Marlene, exigindo viagens de tratamento entre Cataguases e Juiz de Fora bem quando ofereceram uma consultoria fora. Depois, já aos 58 anos, um jovem de 17 anos da sua família chegou à sua mesa ansioso com o Enem e preso nas telas dizendo: "Parece que Deus nem liga pros meus planos", enquanto você tinha trabalho atrasado.',
    catholicRef: 'Eclo 3,12-14 • Dt 6,6-7 • São Pier Giorgio Frassati',
    options: [
      {
        key: 'A',
        kind: 'god',
        label: 'Ficar por perto na doença da mãe e fechar o notebook hoje para ouvir o jovem com café na mesa.',
        outcomeText:
          'Perdeu vitrines profissionais e acordou às 5h da manhã para dar conta do trabalho. Mas viveu o amor mais verdadeiro da sua vida e acendeu luz em outro coração.',
        basePoints: 36,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Viajar na consultoria pagando tudo à distância e dar só um conselho rápido + PIX ao jovem.',
        outcomeText:
          'O currículo brilhou e as entregas ficaram em dia. Mas descobriu tarde que presença e colo não se transferem por aplicativo.',
        basePoints: -20,
      },
    ],
  },
];
