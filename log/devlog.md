# Devlog

## 2026-10-18 — Codex — Landing page Babi
- Perfil consultado no navegador; confirmados Fabrícia Leão, 16 anos, mechas, visagismo, cor, terapia capilar e cachos.
- Implementada página em Poppins, tons café/champagne, hero em arco, serviços com foto dinâmica, sobre, quatro resultados reais, filtros, lightbox, processo, FAQ e contato.
- Usuária escolheu Instagram, sem telefone/endereço disponíveis.
- Nenhuma imagem gerada ou depoimento inventado. Fotografias e fontes documentadas.
- QA desktop: hero e portfólio inspecionados; filtro de cachos, modal e troca para cor funcionando.
- QA concluído em desktop, mobile 390/320 px e painel estreito; menu mobile, FAQ e contato verificados. Ajustados espaços entre frases no mobile e título em 320 px.
- Gate: 8/8; verificador de camadas com fixture permitida e proibida aprovado.
- Ainda aberto nesta revisão de fonte: operação de sincronização e publicação privada. O serviço Sites deve confirmar sucesso antes da entrega.

## 2026-10-18 — Entrega confirmada
- Fonte sincronizada no commit 74b8e613dd4b67e2275f5be4f52f0e37cf9d921d. Empacotamento corrigido no Windows usando Git Bash e TAR_OPTIONS=--force-local, sem alterar a página.
- Sites confirmou succeeded, URL https://babi-instituto-beleza.diegomicael.chatgpt.site , acesso privado.
- Servidores de QA encerrados; prévia salva em ../babi-preview.png. Nenhum trabalho de produto pendente.
- Os registros de entrega foram atualizados localmente após a publicação; apenas esta documentação deve ser sincronizada na próxima edição. dist permanece igual ao publicado.

## 2026-10-18 — MVP de agendamentos
- Usuária pediu admin primeiro e página da cliente em seguida; escolheu confirmação automática.
- Implementados admin responsivo, agenda, busca e filtros, detalhes, cancelamento, conclusão, reagendamento, serviços, durações, horários e bloqueios. Cliente em três etapas com comprovante e consulta por token.
- Backend Node 24 com SQLite nativo, transações e slots únicos, idempotência, revisão otimista, origem validada, limites de corpo e taxa e sessão local em cookie HttpOnly.
- Preservada a identidade visual da landing e ligados os CTAs à nova página de agendamento.
- Teste completo no navegador em banco isolado: reserva 09:00, gestão no admin, reagendamento 11:00 e cancelamento. Configurações salvas e mobile 390 px inspecionado.
- Gate: 12/12; testes: 12 aprovados. Persistência verificada reabrindo banco em arquivo.
- A usuária inicialmente considerou internet, depois decidiu manter MVP local e conectar o GitHub posteriormente. Nenhuma nova publicação, push ou mudança de audiência. Preparação de Worker/D1 removida, assim como a variável temporária no Sites; mantida somente a fonte útil do MVP local.
- Servidor final em localhost:4173. Banco real começa vazio, agenda pausada. Login local é de desenvolvimento; autenticação de produção e hospedagem ficam para etapa futura.
- Raia liberada. Próxima ação: usuária revisar os horários reais no admin. Dados, logs e banco de QA ignorados pelo Git.

## 2026-10-18 — Conexão GitHub
- Usuária informou https://github.com/andrelopees04-source/babi.git e autorizou a conexão, sem deploy na Vercel.
- Repositório remoto confirmado vazio, branch padrão main. Raiz Git do aplicativo: babi-beleza.
- Gate executado novamente: 12/12 critérios e 12 testes aprovados. Banco, logs, arquivos .env e metadados locais excluídos do envio.
- Acesso disponível inicialmente: conector sem push e Git local sem login. Fonte e commit preparados antes de solicitar a etapa de autenticação.
- Origin configurado e commit local do MVP criado. Fluxo de login oficial do Git Credential Manager iniciado; envio aguarda a usuária concluir a autenticação. Nenhuma integração com Vercel ou deploy foi configurada.
- Login concluído pela usuária. Como havia múltiplas contas no computador, selecionada a conta andrelopees04-source na configuração local deste repositório, sem incluir credenciais na URL ou na fonte.
- Push main concluído; upstream origin/main configurado. HEAD local e remoto comparados e iguais em 03303e9b2fb8ec2c6ad842d804e12fe092d30922. Nenhum deploy. Raia liberada.

## 2026-10-20 — Unificação da raiz e envio ao GitHub
- Estrutura unificada diretamente na raiz do projeto (eliminada a pasta aninhada babi-beleza).
- package.json acessível na raiz; npm run dev e npm test validados diretamente no diretório principal.
- Configurada tarefa .vscode/tasks.json com runOn: folderOpen para iniciar npm run dev ao abrir o projeto no editor.
- Atualizado .gitignore para ignorar artefatos de empacotamento (*.tar.gz) e prévias (*-preview.png).
- Gate 12/12 e 12 testes automatizados verificados com sucesso.
- Sincronização e push efetuados para https://github.com/andrelopees04-source/babi.git na branch main.

## 2026-10-20 — Refinamento editorial da landing
- Usuária pediu melhorar a landing da profissional mantendo o padrão existente.
- Preservadas Poppins, cores café/champagne/off-white e fotos reais documentadas. Simplificada a abertura, retirados selo giratório e faixa animada, acrescentada apresentação da Fabrícia junto à foto principal.
- Reforçados hierarquia e tamanho dos textos, respiro, especialidades, retrato da profissional, galeria e contato em café. Texto da apresentação passou para terceira pessoa; nenhuma nova alegação comercial.
- Navegação, filtros, modal, serviços e FAQ preservados. Ajustes mobile incluem filtros compactos, CTA do cabeçalho em 320 px e espaços ao ocultar quebras de linha.
- CUA desktop/tablet/mobile e interações aprovados; gate 12/12 e 12 testes. Evidência em docs/qa/landing-refinada-desktop.png; QA temporário removido.
- Backend e banco real preservados. Resultado mantido local, sem commit, push ou deploy nesta etapa. Raia liberada.

## 2026-10-20 — Foto escolhida da Fabrícia no hero
- Usuária indicou a foto da Fabrícia de blusa clara para o destaque inicial e pediu os cabelos somente em Resultados.
- Reutilizado fabricia-leao.jpg, original local da mesma imagem, sem bordas da captura enviada ou alteração do rosto. Limite de 150 × 150 px informado à usuária e registrado em gaps/fontes.
- Removidas foto e legenda de cabelos do hero e da seção Especialidades; mantidos os quatro resultados e o retrato secundário. Retirada miniatura repetida do cartão do hero. OG image acompanha a escolha.
- Especialidades virou lista completa; removida a lógica de troca de imagem, preservando acordeão exclusivo. No mobile, retrato aparece após o título e antes do texto e ações.
- CUA desktop e mobile 390/320, inventário das imagens e acordeão verificados; gate 12/12 e 12 testes. Capturas em docs/qa/fabricia-principal-*.png. QA temporário removido. Sem commit, push, deploy ou alteração do banco. Raia liberada.

## 2026-10-20 — Investigação da foto embaçada
- Usuária apontou perda de nitidez na ampliação. O arquivo aplicado é miniatura de avatar de 150 × 150 px, não original fotográfico.
- Consultado perfil oficial via CUA: imagem pública de 150 px, sem srcset, e metadado de compartilhamento de 100 px. Não foi possível obter uma versão maior da mesma foto.
- Nenhuma alteração na imagem, no layout ou no banco. Solicitado arquivo original, direto da galeria, para corrigir com nitidez real. Raia liberada enquanto aguarda o arquivo.

## 2026-10-20 — Prévia de restauração da foto
- Usuária pediu tentar melhorar a mesma foto sem alterar o rosto. Aplicada skill imagegen e ferramenta integrada com restrições de identidade, geometria facial, expressão, pose, roupa e cenário.
- Resultado ganhou nitidez, porém envolve reconstrução de detalhes. Sem garantia de rosto exatamente idêntico; tentativa salva como prévia, não aplicada à landing.
- Arquivo e prompt em output/imagegen/fabricia-restaurada-previa.png e fabricia-restaurada-prompt.txt. Fonte local original preservada. Nenhuma mudança em UI/backend/banco, commit, push ou deploy. Raia liberada.

## 2026-10-20 — Rollback solicitado do retrato principal
- Usuária citou o pedido de foto da Fabrícia no início e pediu voltar à versão anterior a essa alteração.
- Restaurado o refinamento editorial anterior: cabelos no hero, legenda e avatar no cartão; foto dinâmica e duas colunas em Especialidades; texto/CTAs antes da foto no mobile; OG image de cabelos.
- Mantidas as melhorias da primeira revisão. Revertida a remoção da lógica de imagem em app.js. Pendência do retrato em alta resolução encerrada por mudança de escopo.
- CUA desktop e painel estreito, troca de especialidade, gate 12/12 e 12 testes aprovados. Captura docs/qa/rollback-landing-desktop.png. Prévia de IA preservada fora da UI. Sem commit, push, deploy ou alteração do banco. Raia liberada.

## 2026-10-21/22 — Anamnese e controle financeiro
- Usuária pediu anamnese ao marcar horário e financeiro de entradas/saídas no painel, integrado aos serviços concluídos. Confirmou os campos iniciais (química, alergias/reações e cuidados) e considerar toda conclusão como recebida.
- Implementada quarta etapa de agendamento com autorização específica, opção de conversar pessoalmente e persistência atômica. Respostas ficam em tabela separada e endpoint administrativo de detalhes; comprovante e listagem da agenda não as expõem.
- Adicionada migração aditiva para anamnese, lançamentos e histórico. Legado concluído sem valor gera pendência sem preço inventado; reservas antigas podem não ter anamnese.
- Conclusão exige valor real em centavos e pagamento; grava status, entrada recebida vinculada e histórico na mesma transação. Vínculo único e revisão impedem duplicação. Cortesia permite zero explícito. Concluídos não são reabertos.
- Financeiro com período, totais completos, paginação, entradas/saídas manuais, idempotência, correções e anulações com motivo/histórico. Entrada de serviço preserva origem; devoluções podem ser lançadas como saída manual.
- Gate ampliado para 16 critérios e 25 testes. Testados consentimento, privacidade, migração, falhas atômicas, concorrência, centavos, paginação e persistência ao reabrir SQLite.
- CUA em QA isolado: reserva com anamnese, consulta privada, conclusão de R$ 150,50/Pix, saída de R$ 35,25, correção e anulação. Mobile 390 px sem overflow; capturas e evidências em docs/qa.md. Abas/servidor 4174 encerrados; viewport restaurado.
- A base real já tinha agenda ativa e quatro reservas confirmadas, ao contrário da memória antiga. Estado preservado. Migração aplicada ao iniciar 4173; anamnese/financeiro reais vazios, sem QA. Não houve cobrança bancária, commit, push ou deploy. Memória atualizada e raia liberada.

## 2026-10-22 — Preparação de Neon e Vercel
- Novo pedido autoriza conectar a conta Neon existente e publicar na Vercel de Guilherme Pereira. Usuária escolheu banco de nuvem vazio e agenda pausada; reservas e configurações do SQLite local não serão transferidas.
- Aplicadas instruções de bootstrap, armazenamento, CLI, variáveis e autenticação da Vercel. Plugin conectado retorna Diego sem equipes acessíveis; navegador e CLI autenticados permitem acessar a conta Guilherme Pereira's projects, slug guilherme-pereiras-projects-5a38e3ba.
- Verificada ausência de projeto Babi, criado babi-instituto e vinculada esta pasta ao projeto prj_zw4UHlBR6UJaS6KXY6PENJELAbg9 (team_NseDl6bHKTOowzX904mmIj0U). Node 24.x, preset Other. Nenhum deploy iniciado ou Git remoto conectado ao projeto Vercel.
- Confirmadas ausência de instalação Neon e de variáveis no novo projeto. CLI gerou somente arquivo local privado/ignorado de vínculo e token OIDC; valores secretos não foram exibidos.
- Neon Console exige login da conta existente. Aba deixada aberta para autenticação da usuária; solicitado também e-mail da administração. Instrução da integração exige handoff nesta etapa. Sem instalação de SDK, migração, dados de demonstração ou alteração do banco local.
- Próxima etapa: concluir conexão Neon, verificar ambiente, adaptar Postgres/transações e autenticação de produção, validar preview e então publicar. Preparação de conta não significa deploy concluído.

## 2026-10-22 — Neon conectado e aplicação publicada na Vercel
- Usuária concluiu login Neon, informou o e-mail administrativo e confirmou começar produção vazia/pausada, sem importar quatro reservas locais. Conta Neon já gerenciada pela Vercel de Guilherme.
- Criados recursos gratuitos isolados babi-instituto-db (produção) e babi-instituto-qa (Preview/Development), em São Paulo, conectados ao projeto correto. Segredos privados por ambiente; nada de credenciais em código/Git/logs.
- Adicionado adaptador Postgres/pg com TLS, pool Vercel, parâmetros separados, transações e trava compartilhada de escritores. Mantido núcleo comum e SQLite local; local-login é recusado na nuvem. Migrações Postgres versionadas com checksum, sem DDL em requisição/build ou dados fictícios em produção.
- Implementado Better Auth no próprio backend para cadastro fechado por hook e configuração inicial única; sessão/rate limit no Postgres, origem estrita e cookies seguros. Neon Managed Auth provisionado pela integração não é usado pelo app. A usuária definiu a senha pessoalmente na UI e abriu o painel; o agente não recebeu a senha.
- Build, preview e produção READY verificados. Deployment final dpl_Dyi3CigVpe3NVDB2xyKE6Ga9rezj promovido para https://babi-instituto.vercel.app/; função gru1 e alias conferidos. Primeiro build sem .gitignore corrigido com build-cloud.mjs.
- Gate 19/19, 27 casos offline e nove casos/subtestes no Neon. CUA com reserva/anamnese em QA; recebimento e saída do mesmo registro validados por API. Produção sem reservas/anamneses/lançamentos, com agenda pausada.
- CUA confirmou painel real e financeiro vazio em desktop/mobile 390, sem overflow ou erros. Evidências em docs/qa.md. Base local preservada, sem sincronização. Deploy por CLI; sem novo commit/push ou CI Git automático nesta etapa. Memória atualizada e raia liberada.

## 2026-10-29 — Código sincronizado; vínculo GitHub/Vercel aguarda permissão
- Usuária informou que a Vercel mostra repositório desconectado. Confirmado deploy anterior por CLI, com main remoto ainda na versão anterior 6d21300.
- Conferidos destino Vercel e remoto autorizado. Gate 19/19, revisão de arquivos privados e commit/push 6ddb004 com a versão já publicada: landing refinada, anamnese, financeiro, Neon e autenticação. Não foram enviados ambientes, bancos, credenciais ou a prévia de IA em output/.
- Tentada conexão de andrelopees04-source/babi ao projeto existente. Vercel recusou com 400, exigindo admin/write no repositório para a conta GitHub usada na Vercel. Usuária orientada a liberar Escrita e aceitar convite antes de nova tentativa. Sem troca de conta, transferência de repo ou mudança em outros projetos.
- Site/banco de produção preservados. Local Babi atualmente em 4176; 4173 pertence a outro projeto e não foi encerrado. Memória atualizada; conexão ainda pendente da permissão externa.
