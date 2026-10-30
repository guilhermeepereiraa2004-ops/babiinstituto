# Plano de execução

- [x] Consultar o perfil e selecionar fotos reais.
- [x] Criar a identidade editorial com Poppins e layout responsivo.
- [x] Implementar página completa, filtros, modal e serviços interativos.
- [x] Criar fundação e gate de qualidade.
- [x] Concluir inspeção visual e gate.
- [x] Sincronizar fonte e publicar o Site privado — succeeded confirmado pelo Sites.

## MVP de agendamento — 2026-10-18
- [x] Admin com agenda diária, filtros, busca, detalhes e configurações.
- [x] SQLite persistente e confirmação automática sem sobreposição.
- [x] Cliente com seleção de serviço, data, horário, dados e comprovante.
- [x] Gestão de cancelamento, conclusão, reagendamento e pausas.
- [x] Testes de comportamento, persistência e fluxo real no navegador.
- [x] Inspeção desktop e mobile de 390 px.
- [x] Preparar README e exclusão do banco e logs do Git.

Decisão da usuária: MVP local, sem deploy. A agenda inicia pausada até revisão dos horários reais. Memória acompanha o código.

## Conectar GitHub
- [x] Verificar o repositório informado, que está vazio.
- [x] Revisar arquivos e exclusão de banco, logs e credenciais.
- [x] Executar gate: 12 critérios e 12 testes aprovados.
- [x] Configurar origin e criar commit local do MVP.
- [x] Concluir envio à branch main depois da autenticação GitHub; HEAD remoto e local conferidos.

Decisão histórica substituída pelo novo pedido de 2026-10-22: preparar Neon e publicar na Vercel de Guilherme Pereira, conforme seção abaixo.

## Refinamento da landing — 2026-10-20
- [x] Preservar identidade, Poppins e fotografias com origem documentada.
- [x] Simplificar abertura e destacar Fabrícia Leão desde o início.
- [x] Melhorar leitura, espaçamento, apresentação, galeria e contato.
- [x] Conferir desktop 1280, tablet 768 e mobile 390/320 em CUA.
- [x] Validar menu, serviços, filtros, modal e FAQ; executar gate.
- [x] Remover página temporária de QA e manter resultado somente local.

## Foto principal escolhida — 2026-10-20
- [x] Usar a foto de blusa clara indicada pela usuária, a mesma de assets/fabricia-leao.jpg.
- [x] Concentrar fotos dos cabelos em Resultados e simplificar Especialidades.
- [x] Antecipar o retrato no mobile; conferir desktop e mobile 390/320.
- [x] Registrar limite de resolução e verificar gate; manter somente local.

## Correção de nitidez do retrato — 2026-10-20
- [x] Confirmar miniatura de 150 × 150 px e investigar versão maior no perfil público.
- Cancelado pelo rollback solicitado pela usuária: receber original e substituir a miniatura no hero.

Foto atual preservada enquanto aguarda o arquivo; não gerar detalhes do rosto para simular resolução original.

## Prévia de restauração autorizada — 2026-10-20
- [x] Usuária pediu melhorar a mesma foto sem alterar o rosto.
- [x] Criar tentativa com image_gen e restrições explícitas de identidade, expressão, pose e composição.
- [x] Inspecionar resultado e salvar prévia/prompt em output/imagegen/.
- [x] Informar limite: ganho de nitidez envolve reconstrução, sem garantia de detalhes faciais idênticos. Prévia não aplicada; original fotográfico continua sendo a solução fiel.

## Rollback do retrato principal — 2026-10-20
- [x] Reverter somente a etapa de retrato no hero, preservando o refinamento anterior.
- [x] Restaurar foto de cabelos no hero, avatar no cartão, imagem dinâmica em Especialidades e ordem mobile anterior.
- [x] Conferir visualmente e validar troca de imagem; gate 12/12 e 12 testes.
- [x] Encerrar pendência de resolução e preservar prévia de IA fora do site.

## Anamnese e financeiro — 2026-10-21/22
- [x] Confirmar com a usuária os campos iniciais e considerar todo serviço concluído como recebido.
- [x] Adicionar migração aditiva, sem substituir reservas/configurações existentes.
- [x] Agendamento em quatro etapas, consentimento específico e persistência atômica da anamnese.
- [x] Consulta da anamnese exclusivamente nos detalhes privados do admin.
- [x] Registrar entrada recebida junto à conclusão, exigindo valor e pagamento, com vínculo único e proteção contra concorrência.
- [x] Financeiro com período, totais em centavos, entradas/saídas manuais, correções, anulação e histórico.
- [x] Tratar registros antigos sem anamnese ou preço, sem inventar dados.
- [x] Testar API, privacidade, migração, falhas, persistência, concorrência e paginação: 25 testes.
- [x] Conferir fluxo CUA em banco isolado e mobile 390 px; gate ampliado para 16 critérios.
- [x] Iniciar versão real em 4173 preservando agenda ativa e quatro reservas já existentes, sem dados de QA.
- [x] Atualizar memória, encerrar QA e liberar raia. Sem deploy ou push.

## Neon e Vercel — 2026-10-22
- [x] Registrar novo pedido de deploy e escolha de banco vazio/agenda pausada; preservar SQLite local.
- [x] Localizar conta de Guilherme no navegador e CLI; plugin atual aponta para Diego.
- [x] Criar e vincular guilherme-pereiras-projects-5a38e3ba/babi-instituto, Node 24.x, sem deploy automático.
- [x] Consultar instruções Neon e verificar ausência de integração e variáveis no projeto.
- [x] Usuária concluir login da conta Neon existente; informar e-mail administrativo.
- [x] Conectar Neon ao destino confirmado e verificar variáveis privadas por ambiente; produção e QA em recursos separados.
- [x] Adaptar backend para Postgres e Functions, preservando desenvolvimento local SQLite.
- [x] Implementar autenticação fechada de produção; impedir acesso local em nuvem.
- [x] Migrar banco vazio, sem reservas/clientes de demonstração e com agenda pausada.
- [x] Gate 19/19, testes offline e Neon, privacidade, preview e CUA.
- [x] Publicar e verificar produção na conta solicitada; usuária definir senha e abrir painel.
- [x] Atualizar memória, preservar SQLite e liberar raia.

## GitHub na Vercel — 2026-10-29
- [x] Confirmar projeto e conta Vercel, repositório autorizado e versão remota anterior.
- [x] Gate 19/19, revisão de exclusão de dados privados e commit/push da versão atual (6ddb004).
- [x] Tentar conexão ao projeto existente e identificar bloqueio admin/write do GitHub.
- [x] Etapa substituída: usuária escolheu repositório próprio, pois colaboração em repositório pessoal não basta para conexão.
- [x] Concluir conexão ao repositório próprio, verificar main como branch de produção e confirmar vínculo por API.
- [x] Atualizar memória de conclusão da integração e liberar raia.

## Repositório próprio — 2026-10-29
- [x] Confirmar destino guilhermeepereiraa2004-ops/babiinstituto vazio.
- [x] Preservar repositório anterior como previous-origin e selecionar conta GitHub correta somente neste projeto.
- [x] Enviar main e histórico ao novo origin, sem bancos/ambientes/segredos.
- [x] Conectar ao mesmo projeto Vercel e confirmar productionBranch main por API.
- [x] Gate 19/19 antes do commit e atualização da documentação.

## Ativar agenda pública — 2026-10-29
- [x] Ler configuração de produção sem expor dados de clientes ou credenciais.
- [x] Usuária confirmar quatro serviços e durações e delegar os horários ao agente.
- [x] Salvar/ativar seg–sex 09h–18h, sem pausa fixa, antecedência 1h e janela 60 dias.
- [x] Usar validação do núcleo e adaptador Postgres com trava transacional; guardar backup privado da configuração anterior.
- [x] Conferir enabled=true e disponibilidade dos quatro serviços no site público, incluindo duração/limite 18h e sábado fechado.
- [x] Atualizar memória e liberar raia, sem reserva fictícia em produção.


## 2026-10-29 — Inclusão de serviços no painel (publicada)

Botão Adicionar serviço no painel Serviços e horários: nome, descrição, duração obrigatória de 15 a 480 min em passos de 15 e disponibilidade para agendamento. Limite existente de 12 serviços; cancelar rascunhos preserva outras edições; os serviços só ficam públicos ao salvar. Backend e migrações preservados.

Gate 19/19 e 29 testes offline aprovados; uma suíte remota ignorada. Em Chrome headless isolado, com SQLite exclusivo data/qa-services-20261029.sqlite na porta 4174, 14 verificações passaram: foco, campos obrigatórios, preservação de edições/cancelamento, publicação somente após salvar, persistência após recarregar, serviço no fluxo da cliente, desativação, limite de 12, cancelamento liberando inclusão, mobile 390 px sem rolagem horizontal e zero erros de JavaScript/console. Capturas inspecionadas: docs/qa/services-add-desktop.png, services-add-mobile.png, services-add-mobile-top.png e services-add-mobile-draft.png. Todos os dados de teste são fictícios e estão apenas em QA.

CUA e Computer Use continuam indisponíveis (failed to write kernel assets / os error 3). Após a retomada solicitada pela usuária, a inspeção foi concluída por testes e capturas de um Chrome headless separado, usando Playwright já disponível no runtime e Chrome já instalado; nenhum navegador ou sessão pessoal foi controlado. Essa alternativa resolveu a pendência visual, sem alterar a preferência por CUA para QA normal.

- [x] Implementar e validar cadastro em ambiente isolado.
- [x] Enviar main ao GitHub e verificar publicação automática na Vercel autorizada.

Publicado em https://babi-instituto.vercel.app/admin/ por GitHub main, commit funcional 1bb2d6c, deploy dpl_7WdDLwy3bN6u4ieahWt3J6QoTZGn READY e alias de produção confirmado. JS/CSS públicos correspondem à versão validada (normalizadas apenas quebras de linha CRLF/LF). API pública confirmou enabled=true e os mesmos quatro serviços; sessão pública sem privilégio/local e /api/admin/settings responde 403 sem login. Zero registros de erro no novo deploy durante a consulta inicial de 10 min. Nenhuma migração, dado ou credencial real foi alterado. Uso: Serviços e horários → Adicionar serviço → preencher nome/descrição/duração, marcar disponibilidade → Salvar configurações.


## 2026-10-29 — Valor padrão dos serviços e conclusão financeira

Cada serviço aceita priceCents opcional (inteiro de 0 a 100000000, null para não definido), salvo no JSON de configurações por validação e trava já existentes. No painel, o valor em reais é exibido em Serviços e horários e preenche o Valor recebido ao concluir. É o valor atual do catálogo carregado no painel, inclusive para reservas anteriores; pode ser ajustado para desconto/cortesia. Serviços sem preço mantêm o preenchimento manual obrigatório. Forma de pagamento e confirmação da conclusão continuam obrigatórias. A entrada recebida usa o valor confirmado, na transação existente, sem duplicação. Alterar o catálogo não altera lançamentos concluídos.

Valores de catálogo são privados: /api/config retorna apenas os campos públicos dos serviços; reserva/comprovante continuam sem preço. Preços existentes ficam não definidos, sem estimar valores reais. Sem alteração de schema, migração ou dados de produção; a estrutura JSON de settings já suporta o campo. Compatível com configurações antigas sem priceCents.

Validação: 32 testes offline aprovados, uma suíte remota ignorada no gate; 10 testes/casos/subtestes reais no Neon exclusivo de QA gentle-dawn-48537104 aprovados (schema descartável); 18 verificações interativas de navegador aprovadas em SQLite isolado data/qa-service-prices-20261029.sqlite, porta 4174. Cobertos formato/limite, reais para centavos, persistência, preço zero, ausência de preço, privacidade pública, pagamento obrigatório, conclusão para financeiro, reenvio, desconto e preservação de valores concluídos após editar catálogo. Zero erros de JavaScript/console. Capturas desktop e mobile 390 px inspecionadas: docs/qa/service-prices-desktop.png, service-prices-mobile.png, service-prices-completion-mobile.png e service-prices-finance.png. Valores, atendimentos e anamneses nas capturas são exclusivamente fictícios de QA. Chrome headless isolado usado como alternativa ao CUA, cuja falha de kernel já foi documentada na etapa anterior.

- [x] Implementar cadastro, validação em centavos, projeção pública e preenchimento da conclusão.
- [x] Verificar cenários positivos/negativos, Neon, financeiro e UI desktop/mobile.
- [x] Publicar via GitHub main e confirmar Vercel/alias/API sem mutar produção.

Publicado por main, commit funcional 6631126, deploy dpl_28M4rLYxMu1RW7XKdoNuP7JCJ4Xy READY, no domínio https://babi-instituto.vercel.app/admin/ e projeto Vercel autorizado. JS/CSS públicos correspondem ao código validado (normalizadas apenas quebras de linha). API pública manteve agenda ativa e os quatro serviços, sem preço; settings/financeiro exigem autenticação (403 sem login), sessão pública não é local/admin. Zero registros de erro na consulta inicial do novo deploy. Nenhum preço real foi atribuído; a usuária deve preencher Valor padrão (R$) em Serviços e horários e salvar. Não foram executadas migrações nem criados atendimentos/lançamentos fictícios na produção.


## 2026-10-29 — Recuperação assistida da senha administrativa

Usuária esclareceu que não lembra a senha atual. Implementada recuperação assistida pelo Better Auth existente: link emitido por manutenção autenticada exclusivamente para a única conta ADMIN_EMAIL, válido por 900 segundos e consumido atomicamente uma única vez. POST /api/auth/reset-password exige origem correta, token válido e senha de 12 a 128 caracteres; tentativas limitadas no banco. Revoga todas as sessões anteriores, sem alterar reservas, anamnese ou financeiro. Emissão pública de links, cadastro, troca de e-mail e vinculação de contas seguem fechados. Sem migração, provedor de e-mail ou gravação de senha/token real em arquivos.

A URL usa fragmento #recovery removido imediatamente do histórico; token fica somente em memória e é enviado no corpo do POST. Tela exige nova senha e confirmação, dispensa a antiga e retorna ao login após sucesso, sem guardar a senha. Trata também abertura do link na mesma aba com sessão já ativa. A senha real será digitada e enviada pela própria usuária; nenhum novo valor foi escolhido pelo agente.

Validação: gate 20/20, 32 testes offline aprovados e uma suíte remota ignorada nesse gate; suíte real Neon QA com 13 casos/subtestes aprovados em schema descartável, incluindo expiração, consumo concorrente único, tentativa inválida, CSRF, revogação de duas sessões, senha antiga recusada/nova aceita e limite persistente. Navegador isolado em outro schema descartável QA: 14 verificações aprovadas, sem erro JavaScript, inspeção desktop e 390 px. Capturas sem credenciais reais: docs/qa/admin-recovery-desktop.png, admin-recovery-mobile.png e admin-recovery-success-mobile.png. Schemas descartáveis removidos. CUA continua indisponível; Chrome headless isolado foi a alternativa já documentada. A primeira inspeção identificou a navegação por fragmento na mesma aba e motivou correção com hashchange; o fluxo corrigido passou.

- [x] Implementar emissão assistida, consumo único, revogação e formulário de recuperação.
- [x] Validar banco e UI com dados descartáveis, preservando produção.
- [x] Publicar e verificar domínio, assets e rotas.
- [x] Emitir link temporário privado após deploy.

Recuperação publicada no commit b0928de, deploy dpl_EkLvqz5NBZmzvDfmHdB6vRpD7otR READY, domínio https://babi-instituto.vercel.app/admin/ confirmado. JS publicado corresponde ao código testado (normalizadas quebras de linha); agenda ativa, quatro serviços preservados, admin protegido e emissão pública de links fechada. Link real de 15 min emitido por scripts/admin-recovery.mjs para a única conta configurada após verificar projeto/equipe/origem e recurso de produção. Não armazenar o URL/token na memória do projeto. A nova senha foi definida pessoalmente pela usuária; consumo do token, atualização da credencial e revogação de sessões antigas confirmados sem ler senha/hash. Recuperação concluída.
- [x] Usuária definir pessoalmente a nova senha no painel.

Usuária confirmou a definição da nova senha. Verificação somente de metadados em produção confirmou: token de recuperação consumido, credencial atualizada após a emissão do link e sessões anteriores revogadas. Nenhuma senha ou hash foi lido. Recuperação concluída; link transitório removido do estado operacional do agente, sem gravação em arquivos.


## 2026-10-29 — WhatsApp, tipografia da cliente e situação do pagamento

Número confirmado pela usuária após conferência do nono dígito: +55 73 98170-1666 (https://wa.me/5573981701666). Botão fixo no canto inferior direito da landing, agendamento e acompanhamento; rodapé, FAQ e chamadas de atendimento/conversa passam ao WhatsApp. Instagram permanece como referência de portfólio/origem das fotografias, sem direcionar a conversa para lá. Botão abre conversa para envio pela própria pessoa; a integração de avisos automáticos continua em standby.

Poppins já carregava corretamente na landing e no agendamento; família confirmada no navegador de produção. Alinhados os tamanhos, pesos 400/300, itálicos, cores café/champagne/off-white e hierarquia da página da cliente, com textos/controles mais legíveis, etapas em grade e comportamento responsivo. Estilos restritos à client-page; admin preservado.

A versão publicada anterior não continha o literal pago no comprovante, mas exibia a reserva como Confirmada sem distinguir pagamento. O comprovante agora separa Agendamento e Pagamento. Novo campo público paymentStatus é derivado no servidor: pending para confirmado, received apenas para concluído com entrada income/posted e valor positivo, courtesy para zero explícito, unrecorded para concluído antigo sem recebimento informado e not_applicable para cancelado. Valores, forma de pagamento, telefone, observações e anamnese continuam privados. Consulta de receipt e reenvio idempotente usam a mesma regra. Nova reserva não cria entrada financeira; nenhum registro real foi alterado ou classificado retroativamente por esta mudança.

Gate 20/20, 34 testes offline aprovados e uma suíte remota ignorada nesse gate; Neon QA gentle-dawn-48537104 com 13 casos/subtestes aprovados em schema descartável. Navegador isolado com 24 verificações aprovadas: número/posição/segurança dos links, ausência de CTA de conversa no Instagram, Poppins real e itálico, mobile 390 px sem rolagem horizontal, reserva completa com anamnese, pagamento pendente antes do recebimento, mudança somente após entrada financeira e privacidade do comprovante. Capturas inspecionadas em docs/qa/: whatsapp-landing-{desktop,mobile}.png, client-booking-{desktop,mobile}.png, client-calendar-mobile.png, client-receipt-pending-{desktop,mobile}.png e client-receipt-received-desktop.png. Dados, códigos e recebimentos das capturas são fictícios. CUA indisponível; Chrome headless isolado foi a alternativa já documentada. Porta 4174 estava ocupada por scripts/qa-server.mjs de outro projeto, preservado; QA desta frente usou 4177 e data/qa-client-contact-20261029.sqlite. Sem fixtures, capturas ou mutações no banco de produção.

- [x] Confirmar WhatsApp com a usuária e substituir contato/CTA.
- [x] Alinhar tipografia e inspecionar desktop/mobile.
- [x] Distinguir pagamento no acompanhamento com dados reais do financeiro.
- [x] Verificar testes, privacidade e fluxo completo com fixtures de QA.
- [x] Publicar via main e confirmar domínio/assets/API.

Publicado por GitHub main no commit funcional c6b83fa, deploy dpl_6bHHkTfcsy2Z4YuYqvwGCf4UuJSa READY e domínio https://babi-instituto.vercel.app/ confirmado pelos seis arquivos públicos correspondentes ao código validado (normalizadas quebras de linha). Landing e agendamento de produção inspecionados em navegador isolado a 390 px: WhatsApp confirmado, Poppins carregada, sem rolagem horizontal. API pública preservou agenda ativa e os quatro serviços; admin exige autenticação; token de reserva inexistente retorna 404; zero registros de erro no deploy na consulta inicial. QA 4177 encerrado após conferir processo/caminho absoluto; outros servidores preservados. Sem migração ou alteração de reservas, pagamentos ou credenciais reais.


## 2026-10-29 — Projeto rodando localmente

Execução local reiniciada por npm start em http://localhost:4176/ , /admin/ e /agendar/, com PORT=4176 e SQLite existente data/appointments.sqlite. Porta 4173 responde por outro projeto (ZM Exclusiva), preservado. Landing, admin, agendamento, /api/session e /api/config responderam HTTP 200; sessão local=true e configuração existente ativa, sem alterar horários, cadastrar fixtures ou criar reservas. Banco Neon e produção preservados. Processo mantido ativo; sem mudança de UI/código ou novo deploy.


## 2026-10-29 — Correção do ícone de WhatsApp

Substituído o desenho aproximado do WhatsApp por SVG preenchido da Bootstrap Icons (viewBox 16 × 16), com stroke=none e fill=currentColor. Removido o contorno que se sobrepunha ao telefone; símbolo e botões da landing/agendamento usam a mesma geometria, dimensionada em 28 px e centralizada. Número, link, comportamento, textos, banco e funcionalidades preservados. Código nativo, sem dependência externa em tempo de execução.

Inspeção local em http://localhost:4176/ e /agendar/, sem mutações no banco: quatro combinações de página/viewport (1440 e 390 px), dispositivo 3×, cor branca/preenchimento e ausência de stroke conferidos, centro do SVG alinhado ao botão com tolerância de 1 px e URL correto preservado. Capturas inspecionadas docs/qa/whatsapp-icon-{landing,booking}-{1440,390}.png. Nenhuma nova fotografia ou dado fictício no banco real. Correção publicada no commit dc6c7f7, deploy dpl_3LtKTH9H9H4pwFFrnLCHEz6i8Nwx READY. Landing/agendamento e os dois CSS do domínio oficial correspondem aos arquivos locais validados. Servidor local 4176 permanece ativo. Sem alteração de dados ou serviços. Raia concluída e liberada.

- [x] Substituir SVG e conferir desktop/mobile nas duas páginas.
- [x] Publicar e confirmar arquivos no domínio oficial.

Correção publicada no commit dc6c7f7, deploy dpl_3LtKTH9H9H4pwFFrnLCHEz6i8Nwx READY. Landing/agendamento e os dois CSS do domínio oficial correspondem aos arquivos locais validados. Servidor local 4176 permanece ativo. Sem alteração de dados ou serviços. Raia concluída e liberada.


## 2026-10-29 — Autorização na confirmação, sem checkboxes

Por solicitação da usuária, removidos os checkboxes de autorização nos dados pessoais e na anamnese. Aviso específico e visível junto ao botão Confirmar meu horário explica o uso de nome/contato/observações e das respostas da anamnese que a cliente optar por informar. Botão associado ao aviso por aria-describedby. Os dois sinais de autorização são enviados apenas no submit final; avançar entre etapas não envia reserva nem autorização ao backend. Mantidos os campos obrigatórios e a opção Prefiro conversar pessoalmente. Contrato, validação, autorização específica/timestamp e privacidade do backend preservados; sem migração.

Gate 20/20, 34 testes offline aprovados e uma suíte remota ignorada. Sem necessidade de nova execução da suíte remota: backend e contrato não foram modificados. Navegador isolado de QA 4177/data/qa-authorization-20261029.sqlite com 16 verificações aprovadas: nenhuma caixa nas duas etapas, continuidade/retorno preservando dados, aviso e associação acessível, nenhuma reserva antes do clique final, campos válidos/opção privada, payload com as autorizações no submit, reserva persistida com pagamento pendente, anamnese e consentedAt privados no banco, sem erro JS ou rolagem horizontal em 390 px. Capturas inspecionadas: docs/qa/authorization-data-desktop.png e authorization-intake-mobile.png, exclusivamente com dados fictícios. CUA indisponível; Chrome headless isolado usado como alternativa documentada. Produção e SQLite real não receberam dados fictícios.

- [x] Remover checkboxes e vincular aviso ao submit final.
- [x] Validar persistência/privacidade e inspecionar UI desktop/mobile em QA.
- [x] Publicar e confirmar arquivos do domínio oficial.

Publicado no commit funcional 1e6781c, deploy dpl_Hg3btuXikXJ5R7dVnqBgDMxyqv3h READY. JS do agendamento e CSS do domínio oficial correspondem ao código validado (normalizadas quebras de linha). Servidor local 4176 atualizado; QA isolado 4177 encerrado. Nenhuma alteração de banco, migração, cliente ou credencial real. Raia concluída e liberada.


## 2026-10-29 — Almoço recorrente

Almoço recorrente configurável por dia em Serviços e horários → Dias e horários. Campo weekly[].lunch opcional/null (sem pausa) ou {start,end}; início/fim dentro do expediente, em passos de 15 minutos. A disponibilidade, criação e reagendamento consideram toda a duração do serviço; permitem terminar no início da pausa ou começar no fim. Reservas existentes preservadas, com aviso no painel. Nenhuma pausa foi ativada nas bases reais. Sem migração; compatível com settings antigos.

Gate 20/20, 36 testes offline e 14 casos/subtestes Neon QA aprovados, schema descartável removido. CUA voltou a funcionar: QA isolado em 4177/data/qa-lunch-20261029.sqlite confirmou campos opcionais, foco, salvar, persistência após reload, rejeição de intervalo invertido, ocultação/desabilitação dos campos ao desativar, retirada dos horários 11:30/12:00 e preservação de 11:00/13:00 para serviço de 1h com almoço 12h–13h; remoção da pausa restaurou 12:00. Inspeção 1440 e 390 px sem rolagem horizontal, nenhum erro de console. Capturas exclusivamente de QA: docs/qa/lunch-desktop.jpg e lunch-mobile.jpg. Viewport restaurado e abas temporárias fechadas.

Publicado no GitHub main, commit funcional 9b1fceb, deploy dpl_8tDe3pvKZutjcHz2saDARXVpqx6f READY em https://babi-instituto.vercel.app/. JS/CSS públicos conferidos contra os arquivos validados, agenda ativa com os quatro serviços e admin protegido (403 sem sessão). Servidor local 4176 reiniciado com o backend atualizado e banco existente; QA 4177 encerrado. Nenhum almoço ativado em bases reais: a profissional deve marcar os dias, informar início/fim e salvar. Raia concluída e liberada.
