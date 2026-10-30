# Babi Instituto de Beleza

Landing page de Fabrícia Leão e agendamento com anamnese/financeiro. HTML, CSS e JavaScript nativos; Node 24.x, SQLite local e Neon Postgres na Vercel. Fonte Poppins, fotografias reais e contato pelo WhatsApp.

## Comece aqui
Leia `plan/STATUS.md`, `plan/execution-plan.md`, `ROADMAP.md` e a última entrada em `log/devlog.md`. Registre a frente em `plan/LANES.md` antes de editar. Uma única frente por arquivo. A memória acompanha o código para permitir futuras edições do Site em outro checkout.

## Regras
- Preserve a identidade editorial em café, champagne e off-white, e a fonte Poppins.
- Não invente telefone, endereço, preços, depoimentos, certificados ou resultados. Dados confirmados: `docs/fontes.md`.
- Use o WhatsApp confirmado em docs/fontes.md para dúvidas e conversas, com botão fixo no canto inferior direito. Não direcionar atendimento ao Instagram; links de origem das fotografias/portfólio permanecem como referência. O formulário de reserva chama o backend e confirma automaticamente; nunca simule confirmação sem persistência.
- A usuária autorizou o repositório próprio https://github.com/guilhermeepereiraa2004-ops/babiinstituto.git em 2026-10-29, substituindo andrelopees04-source/babi como destino principal. origin aponta para o novo repositório; previous-origin preserva o anterior como referência. Em 2026-10-22 autorizou Neon e Vercel somente no projeto guilherme-pereiras-projects-5a38e3ba/babi-instituto. Não publicar em outros destinos sem pedido. O manifesto Sites preservado identifica a landing estática anterior.
- A agenda inicia pausada: horários e durações sugeridos só passam a valer depois de revisados e salvos no admin. Não adicione dados de demonstração ao banco real.
- Preserve acessibilidade, redução de movimento e funcionamento sem dependências JavaScript externas.
- Nunca grave credenciais. Registre a origem de novas fotografias.
- Execute `node scripts/gate.mjs` antes de commits. Mudanças de UI exigem inspeção visual.

## Arquitetura e ações
Mapa em docs/arquitetura.md e operação em docs/deploy.md. UI em dist/; regras em server/core.mjs; HTTP/sessão local/SQLite em server/local.mjs. Nuvem em api/index.mjs, server/cloud.mjs, auth.mjs e postgres.mjs. data/ é privado e ignorado. Acesso local não funciona em produção; Better Auth protege a nuvem. Manter cadastro fechado ao e-mail autorizado e sessão/limite de tentativas persistidos no banco.

## Rodar e verificar
Rode `npm start`, em `http://localhost:4173`. Um servidor puramente estático não suporta agendamentos. `npm run check` verifica sintaxe, referências, camadas e testes de comportamento; gera `docs/checklist-paridade.md`. Browser QA usa CUA; mobile pode usar iframe temporário de 390 px, removido ao terminar. QA manual usa banco separado na porta 4174, sem configurar o banco real.

Catálogo: docs/acceptance.json (20 critérios). Evidência: docs/qa.md. Atualize STATUS, gaps, roadmap e devlog e libere a raia. A publicação na Vercel foi autorizada e concluída em 2026-10-22. Produção iniciou vazia/pausada por escolha da usuária, com SQLite local preservado.

Neon QA e produção são recursos separados. npm run test:postgres usa exclusivamente gentle-dawn-48537104, schema descartável e dados fictícios. Para UI com Postgres, node --env-file=.env.local scripts/serve-cloud-qa.mjs usa QA em 4175. Não copiar credenciais/cookies de produção para testes. Variáveis e .vercel/ são privadas e ignoradas; nunca versionar ou exibir seus valores. Migrações de nuvem são explícitas e versionadas, nunca executadas automaticamente em build/requisições. Todo escritor da agenda/financeiro usa a mesma trava transacional Postgres.

Anamnese exige autorização específica vinculada à confirmação final, com aviso visível junto ao botão e sem checkbox extra por pedido da usuária; só aparece nos detalhes privados do admin. Não exponha respostas no comprovante ou na listagem da agenda. Ao concluir um serviço, o valor e a forma de pagamento informados geram uma única entrada recebida no financeiro, na mesma transação. Não invente valores para registros antigos. Preserve histórico de correções e anulações; dados pessoais e financeiros reais não entram no Git nem em capturas de QA.
