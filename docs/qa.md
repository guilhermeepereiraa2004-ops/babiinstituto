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

## Sincronização e tentativa de conexão Git — 2026-10-29

Gate 19/19 antes do commit; 56 arquivos revisados, nenhum caminho privado ou padrão de credencial no conjunto preparado. Código enviado a main no commit 6ddb004. Vercel project inspect confirmou Guilherme Pereira/babi-instituto. vercel git connect recusou com 400: You need admin or write access to the repository. Integração não concluída; aguarda autorização GitHub da usuária. Não houve alteração funcional, de UI ou de dados de produção.

## Conexão do repositório próprio — 2026-10-29

Destino vazio confirmado por git ls-remote. main enviada com a credencial existente de Guilherme, selecionada somente neste checkout. Vercel git connect retornou Connected; API do projeto confirmou org guilhermeepereiraa2004-ops, repo babiinstituto, repoId 1438468251, productionBranch main. Gate 19/19; nenhuma mudança funcional ou de UI nesta etapa. Dados e segredos permanecem fora do Git.

## Ativação da agenda de produção — 2026-10-29

Usuária confirmou serviços/durações e delegou os horários iniciais. Configuração salva pelo núcleo validado e adaptador Postgres de produção, com a mesma trava transacional dos demais escritores. Backup anterior apenas em .vercel/, ignorado. Agenda ativa seg–sex 09h–18h, sem pausa fixa, antecedência 1h e janela 60 dias.

Verificação pública GET /api/config: enabled=true. Em 30/10/2026, disponibilidade conferida para os quatro serviços: mechas 09h–15h (13 inícios), cor 09h–16h (15), corte e terapia 09h–17h (17 cada); fim de atendimento sempre até 18h. Sábado sem horários. Não foi criada reserva fictícia, nem houve alteração de UI, schema, senha, clientes, anamnese ou financeiro.


## 2026-10-29 — Inclusão de serviços no painel (publicada)

Botão Adicionar serviço no painel Serviços e horários: nome, descrição, duração obrigatória de 15 a 480 min em passos de 15 e disponibilidade para agendamento. Limite existente de 12 serviços; cancelar rascunhos preserva outras edições; os serviços só ficam públicos ao salvar. Backend e migrações preservados.

Gate 19/19 e 29 testes offline aprovados; uma suíte remota ignorada. Em Chrome headless isolado, com SQLite exclusivo data/qa-services-20261029.sqlite na porta 4174, 14 verificações passaram: foco, campos obrigatórios, preservação de edições/cancelamento, publicação somente após salvar, persistência após recarregar, serviço no fluxo da cliente, desativação, limite de 12, cancelamento liberando inclusão, mobile 390 px sem rolagem horizontal e zero erros de JavaScript/console. Capturas inspecionadas: docs/qa/services-add-desktop.png, services-add-mobile.png, services-add-mobile-top.png e services-add-mobile-draft.png. Todos os dados de teste são fictícios e estão apenas em QA.

CUA e Computer Use continuam indisponíveis (failed to write kernel assets / os error 3). Após a retomada solicitada pela usuária, a inspeção foi concluída por testes e capturas de um Chrome headless separado, usando Playwright já disponível no runtime e Chrome já instalado; nenhum navegador ou sessão pessoal foi controlado. Essa alternativa resolveu a pendência visual, sem alterar a preferência por CUA para QA normal.

Publicado em https://babi-instituto.vercel.app/admin/ por GitHub main, commit funcional 1bb2d6c, deploy dpl_7WdDLwy3bN6u4ieahWt3J6QoTZGn READY e alias de produção confirmado. JS/CSS públicos correspondem à versão validada (normalizadas apenas quebras de linha CRLF/LF). API pública confirmou enabled=true e os mesmos quatro serviços; sessão pública sem privilégio/local e /api/admin/settings responde 403 sem login. Zero registros de erro no novo deploy durante a consulta inicial de 10 min. Nenhuma migração, dado ou credencial real foi alterado. Uso: Serviços e horários → Adicionar serviço → preencher nome/descrição/duração, marcar disponibilidade → Salvar configurações.


## 2026-10-29 — Valor padrão dos serviços e conclusão financeira

Cada serviço aceita priceCents opcional (inteiro de 0 a 100000000, null para não definido), salvo no JSON de configurações por validação e trava já existentes. No painel, o valor em reais é exibido em Serviços e horários e preenche o Valor recebido ao concluir. É o valor atual do catálogo carregado no painel, inclusive para reservas anteriores; pode ser ajustado para desconto/cortesia. Serviços sem preço mantêm o preenchimento manual obrigatório. Forma de pagamento e confirmação da conclusão continuam obrigatórias. A entrada recebida usa o valor confirmado, na transação existente, sem duplicação. Alterar o catálogo não altera lançamentos concluídos.

Valores de catálogo são privados: /api/config retorna apenas os campos públicos dos serviços; reserva/comprovante continuam sem preço. Preços existentes ficam não definidos, sem estimar valores reais. Sem alteração de schema, migração ou dados de produção; a estrutura JSON de settings já suporta o campo. Compatível com configurações antigas sem priceCents.

Validação: 32 testes offline aprovados, uma suíte remota ignorada no gate; 10 testes/casos/subtestes reais no Neon exclusivo de QA gentle-dawn-48537104 aprovados (schema descartável); 18 verificações interativas de navegador aprovadas em SQLite isolado data/qa-service-prices-20261029.sqlite, porta 4174. Cobertos formato/limite, reais para centavos, persistência, preço zero, ausência de preço, privacidade pública, pagamento obrigatório, conclusão para financeiro, reenvio, desconto e preservação de valores concluídos após editar catálogo. Zero erros de JavaScript/console. Capturas desktop e mobile 390 px inspecionadas: docs/qa/service-prices-desktop.png, service-prices-mobile.png, service-prices-completion-mobile.png e service-prices-finance.png. Valores, atendimentos e anamneses nas capturas são exclusivamente fictícios de QA. Chrome headless isolado usado como alternativa ao CUA, cuja falha de kernel já foi documentada na etapa anterior.

Publicado por main, commit funcional 6631126, deploy dpl_28M4rLYxMu1RW7XKdoNuP7JCJ4Xy READY, no domínio https://babi-instituto.vercel.app/admin/ e projeto Vercel autorizado. JS/CSS públicos correspondem ao código validado (normalizadas apenas quebras de linha). API pública manteve agenda ativa e os quatro serviços, sem preço; settings/financeiro exigem autenticação (403 sem login), sessão pública não é local/admin. Zero registros de erro na consulta inicial do novo deploy. Nenhum preço real foi atribuído; a usuária deve preencher Valor padrão (R$) em Serviços e horários e salvar. Não foram executadas migrações nem criados atendimentos/lançamentos fictícios na produção.


## 2026-10-29 — Recuperação assistida da senha administrativa

Usuária esclareceu que não lembra a senha atual. Implementada recuperação assistida pelo Better Auth existente: link emitido por manutenção autenticada exclusivamente para a única conta ADMIN_EMAIL, válido por 900 segundos e consumido atomicamente uma única vez. POST /api/auth/reset-password exige origem correta, token válido e senha de 12 a 128 caracteres; tentativas limitadas no banco. Revoga todas as sessões anteriores, sem alterar reservas, anamnese ou financeiro. Emissão pública de links, cadastro, troca de e-mail e vinculação de contas seguem fechados. Sem migração, provedor de e-mail ou gravação de senha/token real em arquivos.

A URL usa fragmento #recovery removido imediatamente do histórico; token fica somente em memória e é enviado no corpo do POST. Tela exige nova senha e confirmação, dispensa a antiga e retorna ao login após sucesso, sem guardar a senha. Trata também abertura do link na mesma aba com sessão já ativa. A senha real será digitada e enviada pela própria usuária; nenhum novo valor foi escolhido pelo agente.

Validação: gate 20/20, 32 testes offline aprovados e uma suíte remota ignorada nesse gate; suíte real Neon QA com 13 casos/subtestes aprovados em schema descartável, incluindo expiração, consumo concorrente único, tentativa inválida, CSRF, revogação de duas sessões, senha antiga recusada/nova aceita e limite persistente. Navegador isolado em outro schema descartável QA: 14 verificações aprovadas, sem erro JavaScript, inspeção desktop e 390 px. Capturas sem credenciais reais: docs/qa/admin-recovery-desktop.png, admin-recovery-mobile.png e admin-recovery-success-mobile.png. Schemas descartáveis removidos. CUA continua indisponível; Chrome headless isolado foi a alternativa já documentada. A primeira inspeção identificou a navegação por fragmento na mesma aba e motivou correção com hashchange; o fluxo corrigido passou.

Recuperação publicada no commit b0928de, deploy dpl_EkLvqz5NBZmzvDfmHdB6vRpD7otR READY, domínio https://babi-instituto.vercel.app/admin/ confirmado. JS publicado corresponde ao código testado (normalizadas quebras de linha); agenda ativa, quatro serviços preservados, admin protegido e emissão pública de links fechada. Link real de 15 min emitido por scripts/admin-recovery.mjs para a única conta configurada após verificar projeto/equipe/origem e recurso de produção. Não armazenar o URL/token na memória do projeto. A nova senha foi definida pessoalmente pela usuária; consumo do token, atualização da credencial e revogação de sessões antigas confirmados sem ler senha/hash. Recuperação concluída.

Usuária confirmou a definição da nova senha. Verificação somente de metadados em produção confirmou: token de recuperação consumido, credencial atualizada após a emissão do link e sessões anteriores revogadas. Nenhuma senha ou hash foi lido. Recuperação concluída; link transitório removido do estado operacional do agente, sem gravação em arquivos.


## 2026-10-29 — WhatsApp, tipografia da cliente e situação do pagamento

Número confirmado pela usuária após conferência do nono dígito: +55 73 98170-1666 (https://wa.me/5573981701666). Botão fixo no canto inferior direito da landing, agendamento e acompanhamento; rodapé, FAQ e chamadas de atendimento/conversa passam ao WhatsApp. Instagram permanece como referência de portfólio/origem das fotografias, sem direcionar a conversa para lá. Botão abre conversa para envio pela própria pessoa; a integração de avisos automáticos continua em standby.

Poppins já carregava corretamente na landing e no agendamento; família confirmada no navegador de produção. Alinhados os tamanhos, pesos 400/300, itálicos, cores café/champagne/off-white e hierarquia da página da cliente, com textos/controles mais legíveis, etapas em grade e comportamento responsivo. Estilos restritos à client-page; admin preservado.

A versão publicada anterior não continha o literal pago no comprovante, mas exibia a reserva como Confirmada sem distinguir pagamento. O comprovante agora separa Agendamento e Pagamento. Novo campo público paymentStatus é derivado no servidor: pending para confirmado, received apenas para concluído com entrada income/posted e valor positivo, courtesy para zero explícito, unrecorded para concluído antigo sem recebimento informado e not_applicable para cancelado. Valores, forma de pagamento, telefone, observações e anamnese continuam privados. Consulta de receipt e reenvio idempotente usam a mesma regra. Nova reserva não cria entrada financeira; nenhum registro real foi alterado ou classificado retroativamente por esta mudança.

Gate 20/20, 34 testes offline aprovados e uma suíte remota ignorada nesse gate; Neon QA gentle-dawn-48537104 com 13 casos/subtestes aprovados em schema descartável. Navegador isolado com 24 verificações aprovadas: número/posição/segurança dos links, ausência de CTA de conversa no Instagram, Poppins real e itálico, mobile 390 px sem rolagem horizontal, reserva completa com anamnese, pagamento pendente antes do recebimento, mudança somente após entrada financeira e privacidade do comprovante. Capturas inspecionadas em docs/qa/: whatsapp-landing-{desktop,mobile}.png, client-booking-{desktop,mobile}.png, client-calendar-mobile.png, client-receipt-pending-{desktop,mobile}.png e client-receipt-received-desktop.png. Dados, códigos e recebimentos das capturas são fictícios. CUA indisponível; Chrome headless isolado foi a alternativa já documentada. Porta 4174 estava ocupada por scripts/qa-server.mjs de outro projeto, preservado; QA desta frente usou 4177 e data/qa-client-contact-20261029.sqlite. Sem fixtures, capturas ou mutações no banco de produção.

Publicado por GitHub main no commit funcional c6b83fa, deploy dpl_6bHHkTfcsy2Z4YuYqvwGCf4UuJSa READY e domínio https://babi-instituto.vercel.app/ confirmado pelos seis arquivos públicos correspondentes ao código validado (normalizadas quebras de linha). Landing e agendamento de produção inspecionados em navegador isolado a 390 px: WhatsApp confirmado, Poppins carregada, sem rolagem horizontal. API pública preservou agenda ativa e os quatro serviços; admin exige autenticação; token de reserva inexistente retorna 404; zero registros de erro no deploy na consulta inicial. QA 4177 encerrado após conferir processo/caminho absoluto; outros servidores preservados. Sem migração ou alteração de reservas, pagamentos ou credenciais reais.


## 2026-10-29 — Correção do ícone de WhatsApp

Substituído o desenho aproximado do WhatsApp por SVG preenchido da Bootstrap Icons (viewBox 16 × 16), com stroke=none e fill=currentColor. Removido o contorno que se sobrepunha ao telefone; símbolo e botões da landing/agendamento usam a mesma geometria, dimensionada em 28 px e centralizada. Número, link, comportamento, textos, banco e funcionalidades preservados. Código nativo, sem dependência externa em tempo de execução.

Inspeção local em http://localhost:4176/ e /agendar/, sem mutações no banco: quatro combinações de página/viewport (1440 e 390 px), dispositivo 3×, cor branca/preenchimento e ausência de stroke conferidos, centro do SVG alinhado ao botão com tolerância de 1 px e URL correto preservado. Capturas inspecionadas docs/qa/whatsapp-icon-{landing,booking}-{1440,390}.png. Nenhuma nova fotografia ou dado fictício no banco real. Correção publicada no commit dc6c7f7, deploy dpl_3LtKTH9H9H4pwFFrnLCHEz6i8Nwx READY. Landing/agendamento e os dois CSS do domínio oficial correspondem aos arquivos locais validados. Servidor local 4176 permanece ativo. Sem alteração de dados ou serviços. Raia concluída e liberada.
