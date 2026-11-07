# Status — Loja Babi integrada

Atualizado: 2026-11-07.

Unificação completa implementada por pedido confirmado em 07/11/2026: vitrine em /loja/, Produtos/Pedidos no painel existente, sessão Better Auth única, clientes por celular normalizado e financeiro comum com filtros Tudo/Serviços/Loja/Manual. Recebimentos e estornos projetados na mesma transação do pedido, com a trava da agenda, vínculo único e auditoria; ajustes diretos desses lançamentos bloqueados. Migração aditiva 0004. Fontes da loja em loja/dist, saída dist/loja preparada no build, custos fora do Git.

Validação: 65 testes offline, gate principal 22/22 e gate da loja 7/7; 16 testes no schema descartável do Neon QA. CUA conferiu pedido, recebimento, estorno/cancelamento, cliente com uma reserva e um pedido, aniversário preservado e saldo líquido de R$ 125,00; UI desktop, 390/320 px e sessão compartilhada entre abas, sem erros/avisos de console. Fotos e dados reais não foram usados como operações de QA. Capturas exclusivamente fictícias: docs/qa/unified-*.jpg.

Catálogo local importado com backup privado para data/appointments.sqlite; cinco reservas e um lançamento financeiro existentes preservados, 46 produtos e nenhum pedido fictício importado. Publicada no projeto principal babi-instituto e no Neon existente. Commit funcional 453a5cc, produção dpl_2J6W68mDcLJnXGwcQaxbqBTyR4YH READY, preview dpl_By9dF9v4DhHx1ze8jUnawsE2tRnd validado. Os recursos loja-babi independentes não são usados e não foram apagados automaticamente.

Decisão atual substitui a publicação independente anterior. Documentação e operação principal em ../plan e ../docs/unificacao.md. npm start nesta pasta inicia o mesmo backend/banco da Babi em 4180; adaptador independente exige SHOP_DB_PATH de QA.

## Publicação verificada — 07/11/2026

Sistema unificado disponível em https://babi-instituto.vercel.app/loja/ e /admin/. Mesmo Neon e credencial Better Auth existentes; nenhuma nova senha definida. Migração 0004 e catálogo de 46 produtos aplicados explicitamente após QA/preview. Backup privado e comparação sob a trava da agenda confirmaram todos os dados de negócio existentes idênticos antes/depois. Nenhuma reserva, pedido ou lançamento fictício em produção.

Domínio oficial: nove arquivos públicos iguais ao código validado, 40 fotos JPEG 200, 39 produtos disponíveis (32 com preço, sete a combinar), custos ausentes da projeção pública. API da loja usa sessão unificada; admin comercial retorna 401 sem sessão, financeiro 403 e login local 404. Agenda preservada ativa com 16 serviços. CUA público confirmou catálogo carregado, links para o mesmo Instituto/admin e console sem erros/avisos; captura pública docs/qa/unified-production-store.jpg. GitHub main contém a implementação e a correção do pacote. O primeiro preview falhou porque loja/docs/acceptance.json havia sido excluído; regra de empacotamento corrigida antes da migração de produção.

Local: servidor integrado mantido em http://localhost:4180/, /loja/ e /admin/, usando data/appointments.sqlite. Cinco reservas, um lançamento anterior, catálogo e custos locais preservados; backup em data/backups/. Servidor antigo independente e QA 4177 encerrados. Viewports restaurados, abas de QA fechadas e loja publicada deixada como entrega no navegador. Bancos e projeto exclusivos loja-babi criados antes da mudança de escopo permanecem sem uso; nenhuma exclusão de recurso foi feita.
