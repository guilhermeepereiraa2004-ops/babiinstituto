# Verificação — 2026-10-18

Prévia servida em HTTP local, status 200. Inspeção pelo navegador CUA.

| Verificação | Resultado observado |
| --- | --- |
| Desktop, viewport inicial 1280 px | Hero em duas colunas, imagem em arco, selo, logo, Poppins e CTAs inspecionados |
| Portfólio desktop | Quatro fotos reais, alturas alternadas e títulos inspecionados |
| Filtro de cachos | Um card visível, status anunciado “1 resultado”; retorno para todos funcionando |
| Modal | Foto correta, título e origem no Instagram; botão de fechar funcionando |
| Especialidades | Seleção de Cor & visagismo fecha a anterior e muda a foto para coloracao.jpg |
| Mobile 390 px | Hero e galeria em duas colunas inspecionadas em iframe temporário |
| Mobile 320 px | Título, CTA e hero inspecionados; tipografia ajustada para não exceder a tela |
| Menu mobile | Abre com expanded=true; clique em Transformações navega e fecha o menu |
| Prévia estreita 555 px | Documento com scrollWidth 540 px, sem excesso horizontal |
| FAQ | Pergunta de agendamento abre com a resposta real |
| Contato e rodapé | Layout inspecionado; botão aponta para o perfil oficial |
| Imagens após navegação | Nenhuma imagem carregada com naturalWidth zero |
| Acessibilidade | Dialog nativo, focus-visible, alt, skip link, status live e media query de redução de movimento presentes |
| Gate estático | `node scripts/gate.mjs`: 8/8; `node scripts/check-layers.mjs`: fixtures e fonte aprovadas |

Não foi realizado agendamento ou envio de mensagem. Não houve teste em aparelho físico; mobile foi verificado em viewport de iframe. Não se realizou auditoria formal de acessibilidade. O iframe temporário de QA foi removido antes do empacotamento.

## MVP de agendamento — 2026-10-18

- Node local 4173: login de desenvolvimento, admin vazio e agenda pausada verificados. Nenhum dado de QA no banco real.
- Banco de QA separado na porta 4174: cliente escolheu Cortes & cachos, 19/10 às 09:00, preencheu nome e contato de teste e recebeu confirmação automática com código e link.
- A mesma reserva apareceu no painel da administração na data correta. Reagendamento para 11:00 persistiu; cancelamento mudou o status e liberou o intervalo.
- Formulário de configurações foi salvo pelo navegador e retornou confirmação de sucesso.
- UI inspecionada em 1280 px e dois iframes de 390 px para admin e cliente. Sem teste em aparelho físico. Iframe de QA removido e servidor 4174 encerrado.
- 12 testes de comportamento aprovados: permissões e origem, configuração, reserva e privacidade, idempotência, cancelamento/revisão, duração histórica no reagendamento, bloqueios, datas/antecedência, duas reservas concorrentes, persistência em arquivo reaberto, conclusão e bloqueio concorrente à reserva.
- Gate ampliado de 8 para 12 critérios para acompanhar o escopo. Sintaxe, camadas e referências aprovadas.
- Prévia final do admin salva em ../babi-admin-preview.png. Nova funcionalidade não publicada por decisão final da usuária.

## Refinamento da landing — 2026-10-20

- CUA em localhost:4173: abertura, serviços, apresentação da profissional, galeria, processo, FAQ, contato e rodapé inspecionados no desktop. Captura: [landing refinada](qa/landing-refinada-desktop.png).
- Iframes temporários de 1280, 768, 390 e 320 px: abertura inspecionada; scrollWidth igual a clientWidth em todos (1265, 753, 375 e 305 px úteis, descontada a barra de rolagem). Galeria mobile em duas colunas e filtros na mesma linha em 390 px.
- Selecionar Cor & visagismo fecha Mechas & loiros e muda a imagem/alt para coloracao.jpg. Filtro Cachos mostra um card e anuncia “1 resultado”; retorno para todos restaura os quatro cards.
- Modal de cachos mostra foto, título e link de origem corretos; fechamento devolve a galeria. FAQ de agendamento abre a explicação real, inclusive a alternativa pelo Instagram quando a agenda está pausada.
- Menu mobile abre com aria-expanded=true; selecionar Resultados navega à galeria e fecha com aria-expanded=false. Cabeçalho de 320 px exibe CTA compacto “Agendar”.
- Corrigidas a sobreposição entre legenda e cartão da profissional e a junção de palavras ao ocultar quebras de linha no mobile. Nenhuma imagem carregada com erro observada.
- Gate final: 12/12 critérios e 12 testes aprovados. Backend, banco real e configurações não foram alterados. Sem reserva ou mensagem de teste nesta etapa.
- Página temporária de QA removida. Sem teste em aparelho físico ou auditoria formal de acessibilidade. Resultado local, sem publicação.

## Fabrícia como imagem principal — 2026-10-20

- CUA desktop: foto fabricia-leao.jpg em destaque, rosto visível e cartão de apresentação sem miniatura repetida. Origem/dimensões confirmadas no DOM: 150 × 150 px. Captura em [desktop](qa/fabricia-principal-desktop.png).
- Mobile em iframes de 390 e 320 px: retrato logo após o título, antes da descrição e ações. Sem excesso horizontal (375/375 e 305/305 px úteis). Captura em [mobile](qa/fabricia-principal-mobile.png).
- Inventário de imagens do main: retratos nas seções inicio e sobre; os quatro arquivos de cabelos somente em portfolio. Especialidades agora usa lista completa sem imagem; abrir Cor & visagismo fecha a anterior, mantendo um único details aberto, sem tentativa de atualizar imagem removida.
- Gate: 12/12 e 12 testes. Página temporária qa-portrait.html removida; nenhuma alteração no backend, banco ou serviços de hospedagem.

## Rollback do retrato no hero — 2026-10-20

- CUA confirmou volta de loiro-perolado.jpg à abertura, cartão com avatar pequeno e apresentação da profissional preservada. Inspeção no desktop e painel estreito de aproximadamente 540 px; ordem mobile voltou a texto e ações antes da foto.
- Especialidades restaurada em duas colunas no desktop, com imagem. Abrir Cor & visagismo fecha a anterior e troca src/alt para coloracao.jpg; observado somente um details aberto.
- Gate 12/12, 12 testes aprovados e git diff --check sem problemas. app.js voltou ao conteúdo anterior à troca do retrato. Nenhuma mudança no banco ou backend.
- Evidência: [abertura após rollback](qa/rollback-landing-desktop.png). Sem página temporária de QA. Prévia de restauração permanece sem referência na UI.

## Anamnese e financeiro — 2026-10-21/22

História verificada: cliente reserva um horário com anamnese → servidor salva reserva e respostas em SQLite → administradora consulta respostas privadas → conclui com valor/pagamento → entrada recebida aparece uma única vez no financeiro → saída, correção e anulação recalculam o saldo.

| Fronteira | Resultado | Evidência |
| --- | --- | --- |
| Navegador da cliente | Verificado | Quatro etapas; anamnese com seleções, detalhes condicionais, autorização específica e dados preservados |
| Cliente → API → SQLite | Verificado | Reserva de QA em 22/10 às 09:00, Cortes & cachos; registro persistido com anamnese e confirmação automática |
| Comprovante público | Verificado | Mostra reserva/serviço, sem respostas da anamnese, telefone ou valores financeiros |
| Consulta administrativa | Verificado | Histórico químico, reação e cuidados fictícios visíveis só nos detalhes privados, com data de autorização |
| Conclusão → financeiro | Verificado | Informados R$ 150,50 / Pix; uma entrada vinculada de R$ 150,50 na data de conclusão |
| Saída e saldo | Verificado | Saída R$ 35,25; saldo R$ 115,25. Correção para R$ 35,50: saldo R$ 115,00 |
| Anulação e histórico | Verificado | Saída anulada com motivo permanece na tabela; saldo retorna a R$ 150,50 |
| Recarga, período e paginação | Verificado | Registros persistem após recarga; filtro em 22/10 não inclui recebimento de 21/10; teste cobre totais além da página de 50 itens |
| Mobile 390 × 844 | Verificado | Anamnese e financeiro inspecionados; largura útil 375 px e scrollWidth 375 px, sem excesso horizontal; navegação do admin em duas colunas |
| Console | Verificado | Sem erros ou avisos de aplicação no financeiro durante QA |
| API e migração | Verificado | 25 testes cobrem acesso/origem, consentimento, privacidade, idempotência, concorrência, rollback por falhas, legado sem preço e persistência em arquivo reaberto |
| Banco real | Preservado | Antes e depois: quatro reservas confirmadas, agenda já ativa. Novas tabelas vazias; nenhum dado de QA inserido |

O QA usou exclusivamente `data/qa-intake-finance-20261021.sqlite`, na porta 4174. Os valores e o nome Cliente QA Anamnese são fictícios e não entraram no banco real. Ao terminar, servidor/abas de QA encerrados e viewport restaurado. A porta 4173 ficou com a versão atualizada e o financeiro real vazio. Não foi feita cobrança, transferência, publicação ou envio de mensagem.

Capturas: [anamnese desktop](qa/anamnese-desktop.png), [anamnese mobile](qa/anamnese-mobile.png), [consulta privada de QA](qa/anamnese-admin.png), [financeiro de QA desktop](qa/financeiro-qa-desktop.png), [financeiro de QA mobile](qa/financeiro-qa-mobile.png), [financeiro local vazio](qa/financeiro-local.png). Nenhuma captura contém dados reais de clientes.

Gate final: 16/16 e 25 testes aprovados. As duas falhas de persistência injetadas nos testes retornam erro controlado, sem gravar dados parciais. Não houve teste em aparelho físico ou auditoria formal de acessibilidade. O acesso permanece uma sessão local de desenvolvimento.

## Neon e Vercel — 2026-10-22

Produção: https://babi-instituto.vercel.app/ . Deployment dpl_Dyi3CigVpe3NVDB2xyKE6Ga9rezj, READY, função api/index em gru1 (1,28 MB). Alias público confirmado apontando para esse deployment e projeto da conta de Guilherme.

- Gate 19/19. Offline: 27 aprovados e uma suíte remota omitida. Neon real: nove casos/subtestes aprovados, em schema descartável do recurso QA, incluindo cadastro inicial único, cookie seguro, origem, privacidade, reserva simultânea, falha transacional, conclusão única, centavos e logout.
- CUA em 4175, banco Neon de QA: login fictício, seleção de corte, dia 23/10 às 09:00, dados fictícios, autorização e anamnese; confirmação automática com reserva persistida. Consulta privada por API confirmou a mesma resposta. Conclusão via API do mesmo atendimento gerou R$ 150,50/Pix e saída fictícia de R$ 35,25; saldo de R$ 115,25 persistido. Agenda QA novamente pausada. Nada foi gravado em produção durante esse fluxo.
- Preview Vercel validou /api/config consultando o recurso QA. Staging de produção verificou agenda pausada, local=false e financeiro negado sem sessão antes da promoção.
- Domínio público: landing/admin/agendar/config/session retornam 200; financeiro privado retorna 403 sem login; /.env, /server/core.mjs e /data/appointments.sqlite retornam 404.
- Usuária definiu pessoalmente a senha e abriu o painel publicado. CUA confirmou agenda pausada, zero reservas e financeiro zerado. Produção não recebeu as quatro reservas/configurações SQLite.
- Inspeção desktop 1280 e mobile 390: hierarquia, navegação e financeiro legíveis, sem overflow horizontal; console sem erros. Viewport restaurado. Capturas [desktop](qa/vercel-financeiro-desktop.png) e [mobile](qa/vercel-financeiro-mobile.png) mostram apenas estado vazio, sem dados de clientes.

Primeiro build falhou porque .gitignore não é enviado pela Vercel. Build ajustado para sintaxe e testes, mantendo o gate completo obrigatório localmente. Não houve teste em aparelho físico ou auditoria formal de acessibilidade. Publicação por CLI, sem CI Git automática.

Encerramento: comando npm run test:postgres aprovado (9/9); gate final 19/19. Contagem de produção após primeiro acesso: 0 reservas, 0 anamneses, 0 lançamentos, 1 conta proprietária; agenda=false. Servidor temporário 4175 encerrado, 4173 preservado.
