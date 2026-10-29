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
