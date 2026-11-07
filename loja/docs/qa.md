# Verificação — Loja Babi

## Rodada completa — 07/11/2026

[Relatório funcional completo](qa-completa-2026-11-07.md): 20 testes aprovados, gate 7/7 e fluxos reais CUA em SQLite isolado. Produtos/fotos/estoque, cliente, pedidos até conclusão ou estorno/cancelamento, lançamentos, datas, sessão, HTTP e reinício verificados. Corrigidos dois comportamentos do acompanhamento (troca de link e token inexistente). Capturas full-* em qa/. Sem dados reais alterados, pagamentos reais ou mensagens enviadas. Produção Vercel/Neon ainda não verificada.

- Gate 7/7; oito testes passaram. Testes locais: autenticação, isolamento dos custos, concorrência pela última unidade, reenvio, cancelamento/estorno, cadastro com imagem e edição, inativação/retorno/exclusão e persistência após reinício.
- CUA em 06/11/2026: navegação, filtros/busca, ficha de cronograma, sacola, pedido fictício em banco separado na porta 4181, produto removido após esgotar, entrada só após registrar recebimento fictício e ação “Voltar ao site” após inativação. Painel e vitrine inspecionados também a 390 px, sem rolagem horizontal.
- Capturas: `qa/catalogo-desktop.jpg`, `qa/catalogo-mobile.jpg`, `qa/admin-produtos-desktop.jpg`, `qa/admin-produtos-mobile.jpg`. Painel capturado apenas com banco de QA, sem custos reais ou dados de clientes reais.
- Preview cloud e DNS ainda não verificados.


## 2026-11-07 — Vitrine e sacola fixa

Vitrine refinada com fotos verticais maiores, grade de três colunas no desktop e duas no celular, cartões com moldura suave, nome clicável e preço/estoque separados. Sacola fixa acima do WhatsApp, com contador sincronizado com o topo e abertura do mesmo diálogo; áreas seguras respeitadas. Categorias em faixa horizontal no celular. Banco e imagens originais preservados.

Gate 7/7 e oito testes aprovados. CUA conferiu a vitrine em 1440, 390 e 320 px, sem rolagem horizontal; botões fixos de 56 px separados por 12 px; adição/remoção da sacola sincronizou os dois contadores (0 → 1 → 0), sacola vazia e ficha pelo nome abriram corretamente. Nenhum erro de console ou pedido de teste criado. Capturas: docs/qa/vitrine-refinada-desktop.jpg e vitrine-refinada-mobile.jpg. Viewport restaurado. Atualização disponível localmente em 4180; publicação remota segue pendente.


## 2026-11-07 — Redesenho do painel

Admin redesenhado mantendo Poppins, café, champagne e off-white. Menu lateral no computador e navegação fixa de quatro módulos no rodapé do celular; visão geral com métricas e atalhos; produtos em cartões com foto, venda/custo/estoque e ações agrupadas; pedidos e financeiro com hierarquia clara. Formulários adaptados ao celular e saída no cabeçalho. Estilos exclusivos em dist/admin/admin.css, sem alterar a vitrine.

Gate 7/7 e oito testes aprovados. CUA conferiu 1440, 390 e 320 px, sem rolagem horizontal. Na base isolada em 4181, edição de descrição persistiu, busca por Miniatura retornou cinco itens e filtro de inativos um; pedido fictício iniciou pendente e o recebimento gerou uma única entrada de R$ 90,00, visível no financeiro. Saída e novo acesso local conferidos; nenhum aviso/erro de console. Dados e custos reais preservados. Capturas em docs/qa/admin-redesign-{desktop,mobile,products-mobile,editor-mobile,orders-mobile,finance-mobile,products-desktop}.jpg, somente com QA. Viewport restaurado, aba temporária fechada e servidor QA encerrado. Painel 4180 respondeu 200 e segue ativo. Alteração local; publicação remota pendente.

## 2026-11-07 — Unificação confirmada

Publicação independente substituída por mesmo banco, painel, login, clientes e financeiro da Babi. Unificação completa implementada por pedido confirmado em 07/11/2026: vitrine em /loja/, Produtos/Pedidos no painel existente, sessão Better Auth única, clientes por celular normalizado e financeiro comum com filtros Tudo/Serviços/Loja/Manual. Recebimentos e estornos projetados na mesma transação do pedido, com a trava da agenda, vínculo único e auditoria; ajustes diretos desses lançamentos bloqueados. Migração aditiva 0004. Fontes da loja em loja/dist, saída dist/loja preparada no build, custos fora do Git.

Validação: 65 testes offline, gate principal 22/22 e gate da loja 7/7; 16 testes no schema descartável do Neon QA. CUA conferiu pedido, recebimento, estorno/cancelamento, cliente com uma reserva e um pedido, aniversário preservado e saldo líquido de R$ 125,00; UI desktop, 390/320 px e sessão compartilhada entre abas, sem erros/avisos de console. Fotos e dados reais não foram usados como operações de QA. Capturas exclusivamente fictícias: docs/qa/unified-*.jpg.

Catálogo local importado com backup privado para data/appointments.sqlite; cinco reservas e um lançamento financeiro existentes preservados, 46 produtos e nenhum pedido fictício importado. Publicada no projeto principal babi-instituto e no Neon existente. Commit funcional 453a5cc, produção dpl_2J6W68mDcLJnXGwcQaxbqBTyR4YH READY, preview dpl_By9dF9v4DhHx1ze8jUnawsE2tRnd validado. Os recursos loja-babi independentes não são usados e não foram apagados automaticamente.

## Publicação verificada — 07/11/2026

Sistema unificado disponível em https://babi-instituto.vercel.app/loja/ e /admin/. Mesmo Neon e credencial Better Auth existentes; nenhuma nova senha definida. Migração 0004 e catálogo de 46 produtos aplicados explicitamente após QA/preview. Backup privado e comparação sob a trava da agenda confirmaram todos os dados de negócio existentes idênticos antes/depois. Nenhuma reserva, pedido ou lançamento fictício em produção.

Domínio oficial: nove arquivos públicos iguais ao código validado, 40 fotos JPEG 200, 39 produtos disponíveis (32 com preço, sete a combinar), custos ausentes da projeção pública. API da loja usa sessão unificada; admin comercial retorna 401 sem sessão, financeiro 403 e login local 404. Agenda preservada ativa com 16 serviços. CUA público confirmou catálogo carregado, links para o mesmo Instituto/admin e console sem erros/avisos; captura pública docs/qa/unified-production-store.jpg. GitHub main contém a implementação e a correção do pacote. O primeiro preview falhou porque loja/docs/acceptance.json havia sido excluído; regra de empacotamento corrigida antes da migração de produção.

Local: servidor integrado mantido em http://localhost:4180/, /loja/ e /admin/, usando data/appointments.sqlite. Cinco reservas, um lançamento anterior, catálogo e custos locais preservados; backup em data/backups/. Servidor antigo independente e QA 4177 encerrados. Viewports restaurados, abas de QA fechadas e loja publicada deixada como entrega no navegador. Bancos e projeto exclusivos loja-babi criados antes da mudança de escopo permanecem sem uso; nenhuma exclusão de recurso foi feita.
