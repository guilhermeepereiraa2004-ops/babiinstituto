# Status — Babi Instituto de Beleza

Atualizado: 2026-10-22.

Marco atual: aplicação publicada na Vercel de Guilherme Pereira, com Neon separado para produção e QA. Anamnese integrada ao agendamento e financeiro no admin, com conclusão/recebimento atômicos. Login fechado por Better Auth; a usuária definiu a senha e abriu o painel. Gate 19/19, 27 testes offline aprovados e suíte Neon com nove casos/subtestes aprovados. UI inspecionada em desktop/mobile. Landing preservada após rollback anterior.

Links locais: http://localhost:4173/admin/ e http://localhost:4173/agendar/ . Servidor atualizado em segundo plano, loopback, banco real em data/appointments.sqlite. Na verificação, a base existente já tinha agenda ativa e quatro reservas confirmadas; preservadas. Sem anamnese ou financeiro de demonstração no banco real. Novas bases continuam iniciando pausadas.

Novo pedido em 2026-10-22: conectar Neon e publicar na Vercel da conta de Guilherme Pereira. A autorização substitui a decisão anterior de manter somente local. Usuária escolheu iniciar a nuvem com banco vazio e agenda pausada, sem transferir as quatro reservas ou configurações locais.

Nuvem concluída: https://babi-instituto.vercel.app/ e /admin/ . Destino guilherme-pereiras-projects-5a38e3ba/babi-instituto, projeto prj_zw4UHlBR6UJaS6KXY6PENJELAbg9, equipe team_NseDl6bHKTOowzX904mmIj0U. Produção READY dpl_Dyi3CigVpe3NVDB2xyKE6Ga9rezj, promovida e domínio confirmado por alias. Functions Node 24.x em gru1. Neon Free/São Paulo: babi-instituto-db (produção) e babi-instituto-qa (Preview/Development). Migrações aplicadas nos dois recursos. Produção sem reservas/anamneses/lançamentos, agenda pausada e somente a conta proprietária criada pela usuária. Documentação em docs/deploy.md.

CLI/navegador acessam a conta correta; plugin Vercel retorna Diego e não deve ser usado para este destino. Arquivos de ambiente, vínculo, chaves e dados são privados/ignorados. O email administrativo está em ADMIN_EMAIL; senha nunca passou pelo agente. Cadastro inicial agora está fechado. Não há recuperação automática por e-mail ou cobrança bancária.

GitHub conectado: https://github.com/andrelopees04-source/babi.git , branch main rastreando origin/main. Refinamento e funcionalidades novas permanecem locais, sem commit/push nesta etapa.

Próxima ação de uso: no painel publicado, revisar serviços/durações/semana e salvar antes de abrir a agenda. Não importar as quatro reservas locais sem novo pedido. QA nunca usa produção: PostgreSQL automatizado em schema descartável no projeto gentle-dawn-48537104; teste de navegador também neste recurso, com dados fictícios e agenda novamente pausada. SQLite 4173 permanece independente. Publicação foi por CLI; código continua local sem novo commit/push, e deploy automático por Git não foi configurado. Prévia de IA permanece fora da UI.
