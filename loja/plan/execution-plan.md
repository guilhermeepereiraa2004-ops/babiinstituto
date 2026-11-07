# Plano — Loja Babi

1. Catalogar fotos originais e cruzar a lista de preços/custos. Concluído.
2. Implementar API transacional, armazenamento, vitrine e administração. Concluído.
3. Verificar concorrência, isolamento, persistência e experiência desktop/mobile. Concluído localmente.
4. Validar o adaptador de nuvem em projeto e banco exclusivos. Projeto loja-babi e bancos exclusivos criados na equipe gratuita de Guilherme; configuração, inicialização e preview pendentes.
5. Publicar no endereço padrão `.vercel.app`. Pacote local preparado; publicação pendente.
6. Conectar um subdomínio ao mesmo projeto quando o domínio próprio estiver disponível.

## Verificação completa — 2026-11-07

- [x] Expandir cobertura para 20 testes e executar gate 7/7.
- [x] Percorrer catálogo, sacola, checkout e acompanhamento por CUA.
- [x] Percorrer todas as ações disponíveis de produtos, pedidos, financeiro e sessão do admin em QA isolado.
- [x] Corrigir troca de link do pedido na mesma aba e descarte do pedido anterior quando o link é inválido.
- [x] Conferir HTTP, 40 imagens, saldo, persistência após reinício e experiência móvel.
- [x] Registrar evidências em docs/qa-completa-2026-11-07.md e encerrar servidor/abas de QA.
- [ ] Certificar Vercel/Neon depois da configuração e publicação remota da loja.


## Execução local — 2026-11-07

Loja iniciada por npm start em http://localhost:4180/, com SQLite local existente preservado. Vitrine, /admin/, /api/catalog e /api/admin/session responderam 200; local=true confirmado. Processo mantido ativo. Nenhuma alteração de estoque, pedido, preço ou credencial.


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
