# Status — Loja Babi integrada

Atualizado: 2026-11-07.

Unificação completa implementada por pedido confirmado em 07/11/2026: vitrine em /loja/, Produtos/Pedidos no painel existente, sessão Better Auth única, clientes por celular normalizado e financeiro comum com filtros Tudo/Serviços/Loja/Manual. Recebimentos e estornos projetados na mesma transação do pedido, com a trava da agenda, vínculo único e auditoria; ajustes diretos desses lançamentos bloqueados. Migração aditiva 0004. Fontes da loja em loja/dist, saída dist/loja preparada no build, custos fora do Git.

Validação: 65 testes offline, gate principal 22/22 e gate da loja 7/7; 16 testes no schema descartável do Neon QA. CUA conferiu pedido, recebimento, estorno/cancelamento, cliente com uma reserva e um pedido, aniversário preservado e saldo líquido de R$ 125,00; UI desktop, 390/320 px e sessão compartilhada entre abas, sem erros/avisos de console. Fotos e dados reais não foram usados como operações de QA. Capturas exclusivamente fictícias: docs/qa/unified-*.jpg.

Catálogo local importado com backup privado para data/appointments.sqlite; cinco reservas e um lançamento financeiro existentes preservados, 46 produtos e nenhum pedido fictício importado. Publicação no projeto principal babi-instituto e Neon existente em preparação; recursos loja-babi independentes não serão usados nem apagados automaticamente.

Decisão atual substitui a publicação independente anterior. Documentação e operação principal em ../plan e ../docs/unificacao.md. npm start nesta pasta inicia o mesmo backend/banco da Babi em 4180; adaptador independente exige SHOP_DB_PATH de QA.
