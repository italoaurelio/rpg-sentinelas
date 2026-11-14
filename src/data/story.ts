export type OptionKind = 'world' | 'world-mild' | 'god' | 'god-bold';
export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

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
  options: [StoryOption, StoryOption, StoryOption, StoryOption];
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
  options: [PublicOption, PublicOption, PublicOption, PublicOption];
}

export interface EpilogueTier {
  id: 'rock' | 'divided' | 'shortcuts';
  title: string;
  reference: string;
  description: string;
}

export const EPILOGUE_NARRATION =
  'Os anos passaram depressa. De cabelos brancos, você caminha devagar pelas ruas de Cataguases ouvindo a água do Rio Pomba correr e o sino da Igreja Nossa Senhora do Rosário tocar para a Missa da tarde. A vida inteira passou como um sopro — do simulado do Enem até aqui. Na hora do balanço final, cada pequena escolha mostrou quem você se tornou.';

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
      'Quase sempre escolheu o que parecia mais esperto ou cômodo na hora: a IA pronta, o currículo inflado, o domingo trocado por dinheiro, a omissão silenciosa. Ganhou aplausos rápidos, mas chegou à beira do rio sentindo que correu para o lugar errado.',
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
        label: 'Copiar a redação inteira da IA, entregar em 5 minutos e jogar até de madrugada.',
        outcomeText:
          'Na hora foi um alívio e até tirou 9,5 no dever. Mas no sábado de manhã, sem celular no simulado, sua cabeça travou na folha em branco.',
        basePoints: -14,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Usar a IA apenas para tirar dúvidas de gramática e escrever seu próprio texto até 23h30.',
        outcomeText:
          'Dormiu tarde e tirou só 7,5 na escola. Mas no simulado de sábado sua mente estava treinada e escreveu com firmeza.',
        basePoints: 18,
      },
      {
        key: 'C',
        kind: 'world-mild',
        label: 'Pegar a estrutura pronta da IA, trocar algumas frases correndo e ir dormir cedo.',
        outcomeText:
          'Descansou bem, mas não treinou repertório de verdade e travou na metade da prova discursiva.',
        basePoints: -6,
      },
      {
        key: 'D',
        kind: 'god-bold',
        label: 'Escrever do zero sem muleta de IA, rezar pedindo clareza e ainda ajudar Dona Marlene a arrumar a sala.',
        outcomeText:
          'Deu muito sono no fim da noite e a nota da escola foi comum, mas você saiu leve, treinado e com a mãe sorrindo de gratidão.',
        basePoints: 24,
      },
    ],
  },
  {
    id: 2,
    act: 'Ato I — Barro e Prova',
    ageLabel: '17 anos • Domingo de manhã',
    title: 'O Sino da Rosário',
    narration:
      'O simulado de sábado deixou o corpo moído. Às 8h45 de domingo, o sino da Igreja Nossa Senhora do Rosário bateu para a Missa e a Helena lembrou do grupo de jovens à tarde. No mesmo minuto, o grupo da sala ferveu: Gabriel comprou energético e chamou para um "intensivão de matemática o domingo inteiro" na casa dele.',
    catholicRef: 'Mt 6,33 • São Carlo Acutis ("A Eucaristia é a nossa rodovia para o Céu")',
    options: [
      {
        key: 'A',
        kind: 'god-bold',
        label: 'Ir à Missa na Nossa Senhora do Rosário, participar do grupo de jovens e estudar 3h focado no fim da tarde.',
        outcomeText:
          'Viu menos matéria que a turma e sentiu medo de ficar para trás. Mas saiu da Eucaristia sereno e rendeu o dobro nas três horas.',
        basePoints: 24,
      },
      {
        key: 'B',
        kind: 'world-mild',
        label: 'Ficar em casa no celular de manhã dizendo que "vai estudar sozinho", mas passar o dia enrolando.',
        outcomeText:
          'Evitou o cansaço do intensivão, mas não foi à Missa nem estudou direito — terminou o domingo culpado.',
        basePoints: -8,
      },
      {
        key: 'C',
        kind: 'god',
        label: 'Ir à Missa das 9h para entregar a semana a Deus e estudar em silêncio no resto do dia.',
        outcomeText:
          'Sentiu falta da resenha com os amigos no grupo, mas a oração ordenou sua semana e manteve sua paz.',
        basePoints: 18,
      },
      {
        key: 'D',
        kind: 'world',
        label: 'Pular Missa e grupo: "Semana de Enem Deus entende, hoje o foco é 100% nota."',
        outcomeText:
          'Resolveu 30 questões a mais no papel, mas voltou exausto de energético, ansioso e discutiu feio com Dona Marlene.',
        basePoints: -14,
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
        kind: 'world-mild',
        label: 'Gritar de longe "alguém ajuda aqui!" sem diminuir o passo para não perder tempo.',
        outcomeText:
          'Entrou na escola sem atraso, mas o resto da tarde ficou pensando se alguém realmente parou para socorrê-la.',
        basePoints: -8,
      },
      {
        key: 'B',
        kind: 'god-bold',
        label: 'Parar 5 minutos, levantá-la com cuidado até a sombra e avisar a família no mercadinho antes de disparar.',
        outcomeText:
          'Cruzou o portão faltando 30 segundos, ensopado de suor e sem fôlego. Mas sentou com a alma inteira e fez a melhor prova do ano.',
        basePoints: 26,
      },
      {
        key: 'C',
        kind: 'world',
        label: 'Fingir que não viu e correr para garantir lugar confortável e banheiro antes da prova.',
        outcomeText:
          'Chegou 15 minutos antes. Porém, na primeira hora, a imagem da senhora no chão não saía da cabeça e você errou questões fáceis.',
        basePoints: -15,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Parar rápido para chamar o dono da padaria da esquina e garantir que ela fosse atendida antes de correr.',
        outcomeText:
          'Chegou quase no limite do portão e cansado, mas tranquilo por não deixá-la desamparada.',
        basePoints: 18,
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
        label: 'Sentir vergonha da vaga local, largar tudo e passar os dias se comparando com o Instagram.',
        outcomeText:
          'Evitou pegar circular às 6h da manhã, mas ficou meses trancado no quarto tentando copiar a vida editada das telas.',
        basePoints: -16,
      },
      {
        key: 'B',
        kind: 'world-mild',
        label: 'Matricular por obrigação, mas viver reclamando do curso e sem se dedicar às aulas.',
        outcomeText:
          'Não perdeu o ano todo, porém desperdiçou oportunidades por desprezar o lugar onde Deus o colocou.',
        basePoints: -8,
      },
      {
        key: 'C',
        kind: 'god-bold',
        label: 'Assumir a matrícula no IF com gratidão, cortar o excesso de redes sociais e ajudar em casa no contraturno.',
        outcomeText:
          'Doeu no orgulho ver colegas viajando enquanto você pegava ônibus todo dia, mas descobriu professores incríveis e um propósito real.',
        basePoints: 26,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Aceitar o curso da região com calma, mesmo sem contar para todo mundo por enquanto.',
        outcomeText:
          'Levou algumas semanas para vencer a frustração inicial, mas aos poucos pegou gosto pelos estudos.',
        basePoints: 18,
      },
    ],
  },
  {
    id: 5,
    act: 'Ato I — Barro e Prova',
    ageLabel: '19 anos • Sexta chuvosa',
    title: 'A Chuva no Centro',
    narration:
      'No segundo semestre do curso, o dinheiro vivia contado. Sexta à noite chovia forte no centro de Cataguases e você estava com os últimos R$ 35 no bolso para lanchar com a turma perto da Nossa Senhora do Rosário. Na marquise da farmácia, reconheceu Seu Antônio — o vizinho idoso que morava sozinho — encharcado, equilibrando um saco de arroz e remédios.',
    catholicRef: 'São Pier Giorgio Frassati (Caridade discreta • "Verso l\'alto!")',
    options: [
      {
        key: 'A',
        kind: 'god-bold',
        label: 'Pagar um carro com seus R$ 35, subir as escadas com ele e voltar a pé na chuva sem postar nada.',
        outcomeText:
          'Chegou molhado, sem dinheiro para o fim de semana e jantou pão com ovo. Mas dormiu com uma alegria silenciosa que não passava.',
        basePoints: 28,
      },
      {
        key: 'B',
        kind: 'world-mild',
        label: 'Ajudar a ajeitar a sacola na marquise por 30 segundos e correr pro lanche com os amigos.',
        outcomeText:
          'Não virou totalmente as costas, mas o vento frio lá fora lembrou a noite inteira que você podia ter feito muito mais.',
        basePoints: -6,
      },
      {
        key: 'C',
        kind: 'god',
        label: 'Dividir seu guarda-chuva até a esquina dele e ir ao lanche com metade do dinheiro contado.',
        outcomeText:
          'Chegou atrasado no encontro e gastou menos com você, mas voltou em paz por não deixá-lo sozinho.',
        basePoints: 20,
      },
      {
        key: 'D',
        kind: 'world',
        label: 'Atravessar para a outra calçada para não sujar o tênis nem perder o rolê.',
        outcomeText:
          'Chegou sequinho e riu com a galera, mas a cada trovão lembrava de Seu Antônio na ladeira e o sabor da noite azedou.',
        basePoints: -15,
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
        label: 'Colocar Excel avançado e inglês fluente para impressionar e ganhar do concorrente.',
        outcomeText:
          'Cláudio sorriu na entrevista e elogiou seu perfil. Mas na segunda semana pediu uma planilha complexa, você travou e viveu meses com medo.',
        basePoints: -16,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Dizer exatamente o que sabe sem aumentar nada e mostrar disposição para aprender.',
        outcomeText:
          'Sentiu insegurança perto dos currículos enfeitados, mas dormiu tranquilo e ganhou respeito pela clareza.',
        basePoints: 18,
      },
      {
        key: 'C',
        kind: 'world-mild',
        label: 'Deixar um termo vago tipo "conhecimento sólido" para parecer mais do que realmente sabe.',
        outcomeText:
          'Passou na triagem, mas logo descobriu a dor de cabeça de sustentar uma imagem que não era real.',
        basePoints: -8,
      },
      {
        key: 'D',
        kind: 'god-bold',
        label: 'Assumir o nível básico com transparência e levar um plano pronto de curso noturno para dominar tudo no mês.',
        outcomeText:
          'Perdeu a vaga principal na hora e começou como auxiliar ganhando menos. Meses depois, Cláudio promoveu você justamente pela verdade.',
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
        kind: 'god-bold',
        label: 'Bater na porta do Cláudio, assumir o erro na hora e ficar até 19h corrigindo tudo pessoalmente.',
        outcomeText:
          'Levou uma bronca séria e perdeu o compromisso da sexta à noite. Mas a partir daquele dia Cláudio passou a confiar em você de olhos fechados.',
        basePoints: 28,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Ficar quieto e deixar a culpa cair naturalmente no login do estagiário na segunda.',
        outcomeText:
          'Saiu no horário tranquilo na sexta. Na segunda, o novato levou advertência injusta na frente da sala e o clima apodreceu.',
        basePoints: -18,
      },
      {
        key: 'C',
        kind: 'god',
        label: 'Corrigir o código sozinho em silêncio na hora e mandar mensagem avisando o Cláudio do ocorrido.',
        outcomeText:
          'Deu trabalho extra na sexta, mas evitou prejuízo para a empresa e protegeu o estagiário.',
        basePoints: 20,
      },
      {
        key: 'D',
        kind: 'world-mild',
        label: 'Apagar rápido e inventar na segunda que foi "instabilidade do sistema" sem acusar ninguém.',
        outcomeText:
          'Ninguém foi punido, mas você passou o fim de semana tenso com medo da auditoria do sistema.',
        basePoints: -8,
      },
    ],
  },
  {
    id: 8,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '22 anos • Ritmo adulto',
    title: 'O Projeto de Todos os Domingos',
    narration:
      'Por causa dessa confiança, Cláudio ofereceu a você a coordenação de um projeto com 40% a mais de salário. Dona Marlene sorriu animada com o alívio nas contas. O detalhe: por oito meses você teria de trabalhar quase todos os sábados e domingos inteiros — zerando Missa na Nossa Senhora do Rosário e tempo em casa.',
    catholicRef: 'Mc 8,36 ("De que adianta ganhar o mundo inteiro...") • São Carlo Acutis',
    options: [
      {
        key: 'A',
        kind: 'world-mild',
        label: 'Aceitar metade dos domingos sem combinar horário de Missa, "indo só quando der folga".',
        outcomeText:
          'Ganhou um extra bom, mas foi ficando três ou quatro domingos seguidos longe da Eucaristia sem perceber.',
        basePoints: -8,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Aceitar tudo sem negociar: "Agora é hora de juntar dinheiro; depois eu volto pra Igreja."',
        outcomeText:
          'A conta bancária subiu rápido e comprou o que queria. Mas sem domingo e sem oração vieram a insônia e grosseria em casa.',
        basePoints: -18,
      },
      {
        key: 'C',
        kind: 'god-bold',
        label: 'Propor dividir a escala com um colega para ganhar menos bônus, mas blindar o domingo em família e na Rosário.',
        outcomeText:
          'Recebeu só metade do adicional possível e segurou gastos. Mas manteve a alma viva na Eucaristia e atravessou o ano inteiro em paz.',
        basePoints: 28,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Recusar o cargo de chefia para manter a rotina atual, mesmo perdendo a chance de ganhar mais.',
        outcomeText:
          'O orçamento continuou apertado em casa, mas sua vida espiritual e os laços familiares permaneceram de pé.',
        basePoints: 18,
      },
    ],
  },
  {
    id: 9,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '24 anos • Saída da Missa',
    title: 'O Convite da Helena',
    narration:
      'Num domingo de manhã na saída da Igreja Nossa Senhora do Rosário, Helena segurou você preocupada: "A turma de adolescentes do grupo vai fechar por falta de gente mais velha para acompanhar. Os meninos estão afundando em apostas e solidão. Você topa assumir uma noite por semana?" Você já trabalhava o dia todo e estava moído.',
    catholicRef: '1Pd 4,10 • São Pier Giorgio Frassati',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Recusar na hora dizendo que está sem tempo, para guardar todas as noites de descanso e séries.',
        outcomeText:
          'Teve noites bem confortáveis no sofá. Meses depois soube que o grupo fechou e sentiu sua própria fé esfriar até virar costume.',
        basePoints: -16,
      },
      {
        key: 'B',
        kind: 'god-bold',
        label: 'Topar acompanhar por um semestre toda quinta à noite, mesmo apertando suas horas de sono.',
        outcomeText:
          'Teve quinta que você quase dormiu de pé depois do trabalho. Mas ver um garoto de 15 anos mudar de rumo porque foi escutado renovou sua vida.',
        basePoints: 28,
      },
      {
        key: 'C',
        kind: 'world-mild',
        label: 'Prometer ajudar "só nos dias que estiver tranquilo", mas sempre dar desculpa em cima da hora.',
        outcomeText:
          'Evitou desgaste, mas a turma sentiu falta de compromisso real e parou de contar com você.',
        basePoints: -8,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Assumir apoio quinzenal com outros dois jovens para dividir o peso com responsabilidade.',
        outcomeText:
          'Deu trabalho encaixar na agenda corrida, mas manteve o grupo vivo e criou amizades verdadeiras na paróquia.',
        basePoints: 20,
      },
    ],
  },
  {
    id: 10,
    act: 'Ato II — O Primeiro Trabalho',
    ageLabel: '25 anos • Centro de Cataguases',
    title: 'O Reencontro na Padaria',
    narration:
      'Meses depois, comprando pão antes do serviço no centro, um rapaz parou olhando para o seu crachá: "Você não é vizinho do Seu Antônio da rua de cima? Eu sou o Marcos, filho dele!" Marcos tinha aberto uma pequena empresa de tecnologia e gestão na Zona da Mata e chamou você para um café para falar sobre trabalhar junto.',
    catholicRef: 'Pr 11,25 ("Quem faz o bem será recompensado")',
    options: [
      {
        key: 'A',
        kind: 'god-bold',
        label: 'Conversar com simplicidade, reconhecer suas falhas e construir uma proposta honesta a longo prazo.',
        outcomeText:
          'Não veio salário milionário no primeiro mês, mas nasceu uma parceria limpa, leal e cheia de frutos para o futuro.',
        basePoints: 30,
      },
      {
        key: 'B',
        kind: 'world-mild',
        label: 'Esconder suas dificuldades e prometer prazos irreais só para fechar contrato rápido.',
        outcomeText:
          'Assinou logo, mas passou meses estressado tentando cumprir o que não conseguia entregar.',
        basePoints: -8,
      },
      {
        key: 'C',
        kind: 'world',
        label: 'Tentar impressionar Marcos inventando cargos e falando mal da empresa onde você trabalha hoje.',
        outcomeText:
          'Falou bonito por vinte minutos no café, mas Marcos percebeu a falta de lealdade ao checar referências e nunca mais ligou.',
        basePoints: -16,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Agradecer pela lembrança, indicar outros colegas também e manter portas abertas com humildade.',
        outcomeText:
          'Dividiu o espaço sem egoísmo, fortalecendo sua reputação na cidade.',
        basePoints: 20,
      },
    ],
  },
  {
    id: 11,
    act: 'Ato III — Raízes e Tempestades',
    ageLabel: '27 anos • Projeto de vida',
    title: 'O Namoro que Dividia a Alma',
    narration:
      'Aos 27 anos, você começou a namorar uma pessoa carismática e admirada na cidade. No início parecia filme, mas logo veio o atrito: fazia piada toda vez que você ia à Nossa Senhora do Rosário, implicava com suas amizades da igreja e dizia que "quem quer crescer em Cataguases não pode perder tempo com coisa de paróquia".',
    catholicRef: 'Mt 7,24-27 (Casa sobre a rocha vs. areia)',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Ir cedendo em tudo por medo de ficar sozinho perto dos 30: "Depois que casar melhora."',
        outcomeText:
          'Evitou brigas e ganhou fotos bonitas de status. Mas foi apagando sua fé até não reconhecer quem você era no espelho.',
        basePoints: -18,
      },
      {
        key: 'B',
        kind: 'god',
        label: 'Marcar limites claros sobre sua fé e buscar orientação espiritual antes de decidir.',
        outcomeText:
          'As conversas foram difíceis e tensas, mas trouxeram clareza para não construir um relacionamento sobre ilusão.',
        basePoints: 20,
      },
      {
        key: 'C',
        kind: 'world-mild',
        label: 'Começar a ir à Missa escondido e evitar tocar no assunto de Deus para "manter a paz".',
        outcomeText:
          'A calma aparente durou pouco e virou um cansaço constante de viver uma vida dupla.',
        basePoints: -10,
      },
      {
        key: 'D',
        kind: 'god-bold',
        label: 'Conversar com verdade sobre o que é inegociável e aceitar o término ao ver que os rumos eram opostos.',
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
        kind: 'god-bold',
        label: 'Escrever no grupo que o áudio está cortado e defender em voz alta que ouçam Renato antes de julgar.',
        outcomeText:
          'Ganhou fama de "chato" por algumas semanas e disputou a vaga no voto apertado. Mas dormiu com a consciência livre e ganhou respeito.',
        basePoints: 28,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Dar uma risada no grupo e encaminhar no privado para acelerar a queda do concorrente.',
        outcomeText:
          'Renato foi afastado e a vaga ficou fácil. Mas cada vez que entrava naquela sala sentia nojo da própria atitude.',
        basePoints: -18,
      },
      {
        key: 'C',
        kind: 'world-mild',
        label: 'Ficar totalmente calado olhando o linchamento para não se queimar com ninguém.',
        outcomeText:
          'Ninguém brigou com você, mas a omissão pesou na consciência e criou medo de ser o próximo alvo.',
        basePoints: -8,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Chamar Renato no particular para avisar do áudio e orientar ele a se defender com a diretoria.',
        outcomeText:
          'Não teve aplauso público, mas agiu com justiça e evitou uma demissão injusta.',
        basePoints: 20,
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
    catholicRef: 'Nossa Senhora do Rosário (oração nas horas difíceis) • Pr 16,3',
    options: [
      {
        key: 'A',
        kind: 'world',
        label: 'Arriscar metade da rescisão no esquema para tentar resolver tudo em quinze dias.',
        outcomeText:
          'Ganhou um troco nos três primeiros dias e achou que tinha achado a saída. Na segunda semana a banca levou quase tudo.',
        basePoints: -20,
      },
      {
        key: 'B',
        kind: 'world-mild',
        label: 'Colocar "só um pouquinho pra testar", escondendo de todo mundo em casa.',
        outcomeText:
          'Perdeu menos dinheiro, mas entrou no vício da ansiedade olhando o celular de madrugada.',
        basePoints: -10,
      },
      {
        key: 'C',
        kind: 'god',
        label: 'Recusar o esquema, pedir ajuda à família e enviar currículos todo dia sem desespero.',
        outcomeText:
          'Demorou semanas difíceis para ajustar os boletos, mas manteve a casa honesta e de pé.',
        basePoints: 20,
      },
      {
        key: 'D',
        kind: 'god-bold',
        label: 'Bloquear o esquema, rezar o terço na Igreja Nossa Senhora do Rosário, cortar luxos e recomeçar com Marcos.',
        outcomeText:
          'Passou quatro meses de arroz com feijão bem apertado. Mas atravessou o vale de pé e reconstruiu a renda com paz.',
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
        kind: 'god-bold',
        label: 'Recusar o acordo informal e apresentar um pacote mais enxuto 100% dentro da lei.',
        outcomeText:
          'O cliente fechou com o concorrente e o caixa apertou forte. Mas a fama de empresa séria atraiu contratos firmes nos anos seguintes.',
        basePoints: 30,
      },
      {
        key: 'B',
        kind: 'world-mild',
        label: 'Aceitar "só dessa vez" dizendo que o sistema tributário obriga todo mundo a dar jeitinho.',
        outcomeText:
          'Aliviou o mês, mas abriu brecha para clientes folgados pedirem sempre o mesmo esquema.',
        basePoints: -10,
      },
      {
        key: 'C',
        kind: 'god',
        label: 'Explicar para o cliente que sem nota não há garantia e oferecer parcelamento honesto.',
        outcomeText:
          'A negociação foi dura e o lucro menor, mas o contrato saiu limpo.',
        basePoints: 22,
      },
      {
        key: 'D',
        kind: 'world',
        label: 'Fazer tudo por fora e ainda usar o lucro extra sem declarar nada para os sócios.',
        outcomeText:
          'Entrou dinheiro rápido, mas meses depois deu problema na fiscalização e quebrou a confiança da parceria.',
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
          'A planilha brilhou e o bônus caiu na conta. Mas o olhar daqueles três pais de família saindo com a caixa na mão nunca saiu da sua memória.',
        basePoints: -20,
      },
      {
        key: 'B',
        kind: 'god-bold',
        label: 'Abrir mão do bônus anual e montar plano de 6 meses treinando os três veteranos para atendimento humano com apoio da IA.',
        outcomeText:
          'Deu o dobro de trabalho ensinar a equipe e seu bônus foi zero naquele ano. Mas salvou três lares em Cataguases e formou equipe leal.',
        basePoints: 34,
      },
      {
        key: 'C',
        kind: 'world-mild',
        label: 'Pedir para o RH assinar as demissões no seu lugar para não parecer o vilão da história.',
        outcomeText:
          'Limpou a própria imagem na hora, mas as famílias perderam o sustento do mesmo jeito e a equipe sentiu sua covardia.',
        basePoints: -12,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Negociar redução de jornada e recolocação interna antes de aceitar qualquer corte.',
        outcomeText:
          'Passou semanas tensas defendendo a equipe, mas conseguiu preservar dignidade e respeito.',
        basePoints: 22,
      },
    ],
  },
  {
    id: 16,
    act: 'Ato IV — Legado e Travessia',
    ageLabel: '46 → 58 anos • Família',
    title: 'A Presença que Não Cabe no PIX',
    narration:
      'Os anos seguiram até você chegar à maturidade. Primeiro veio a doença de Dona Marlene, exigindo viagens entre Cataguases e Juiz de Fora bem quando ofereceram uma consultoria fora. Depois, aos 58 anos, um jovem de 17 anos da família chegou à sua mesa ansioso com o Enem e preso nas telas dizendo: "Parece que Deus nem liga pros meus planos", enquanto você tinha trabalho atrasado.',
    catholicRef: 'Eclo 3,12-14 • Dt 6,6-7 • São Pier Giorgio Frassati',
    options: [
      {
        key: 'A',
        kind: 'god-bold',
        label: 'Ficar por perto cuidando de Dona Marlene e fechar o notebook hoje para ouvir o jovem com café na mesa.',
        outcomeText:
          'Perdeu vitrines profissionais e acordou às 5h da manhã para terminar entregas. Mas viveu o amor mais verdadeiro da vida e acendeu luz em outro coração.',
        basePoints: 36,
      },
      {
        key: 'B',
        kind: 'world',
        label: 'Viajar na consultoria pagando tudo à distância e mandar só um conselho rápido + PIX ao jovem.',
        outcomeText:
          'O currículo brilhou e as entregas ficaram em dia. Mas descobriu tarde que presença e colo não se transferem por aplicativo.',
        basePoints: -20,
      },
      {
        key: 'C',
        kind: 'world-mild',
        label: 'Ajudar só quando sobra brecha na agenda e conversar olhando para o celular ao mesmo tempo.',
        outcomeText:
          'Cumpriu as obrigações mínimas, mas deixou passar a chance de estar presente de corpo e alma.',
        basePoints: -10,
      },
      {
        key: 'D',
        kind: 'god',
        label: 'Organizar rodízio honesto com parentes para a mãe e reservar a manhã de sábado para o jovem.',
        outcomeText:
          'Apertou a semana inteira, mas manteve os laços vivos e mostrou que Deus caminha nas escolhas reais.',
        basePoints: 24,
      },
    ],
  },
];
