# Pendências da loja

Verificação completa local em 07/11: troca de pedidos na mesma aba e exibição de pedido anterior após link inválido corrigidas. 20 testes e CUA aprovados; nenhum bloqueio funcional restante encontrado no escopo local exercitado. A certificação remota continua pendente. Detalhes: qa-completa-2026-11-07.md.

- Os sete itens públicos sem correspondência segura de preço continuam “A combinar”. O preço pode ser preenchido no painel.
- Sete itens/variações da lista sem foto correspondente ficaram inativos. Adicione foto e use “Voltar ao site”.
- Publicação inicial autorizada na equipe gratuita de Guilherme com endereço `.vercel.app`. Projeto loja-babi e bancos Neon exclusivos de produção e QA criados. Faltam configurar o acesso, inicializar bancos e testar preview antes de publicar. O subdomínio poderá ser conectado depois.
- Pagamento online e cálculo de frete não foram integrados. O pedido é registrado pela loja, e pagamento e entrega são combinados depois.


## Execução local — 2026-11-07

Loja iniciada por npm start em http://localhost:4180/, com SQLite local existente preservado. Vitrine, /admin/, /api/catalog e /api/admin/session responderam 200; local=true confirmado. Processo mantido ativo. Nenhuma alteração de estoque, pedido, preço ou credencial.


## 2026-11-07 — Vitrine e sacola fixa

Vitrine refinada com fotos verticais maiores, grade de três colunas no desktop e duas no celular, cartões com moldura suave, nome clicável e preço/estoque separados. Sacola fixa acima do WhatsApp, com contador sincronizado com o topo e abertura do mesmo diálogo; áreas seguras respeitadas. Categorias em faixa horizontal no celular. Banco e imagens originais preservados.

Gate 7/7 e oito testes aprovados. CUA conferiu a vitrine em 1440, 390 e 320 px, sem rolagem horizontal; botões fixos de 56 px separados por 12 px; adição/remoção da sacola sincronizou os dois contadores (0 → 1 → 0), sacola vazia e ficha pelo nome abriram corretamente. Nenhum erro de console ou pedido de teste criado. Capturas: docs/qa/vitrine-refinada-desktop.jpg e vitrine-refinada-mobile.jpg. Viewport restaurado. Atualização disponível localmente em 4180; publicação remota segue pendente.


## 2026-11-07 — Painel

Redesenho local concluído e verificado em desktop/celular; publicação remota continua pendente. Evidência em docs/qa.md.

## 2026-11-07 — Unificação confirmada

Publicação independente substituída por mesmo banco, painel, login, clientes e financeiro da Babi. Unificação completa implementada por pedido confirmado em 07/11/2026: vitrine em /loja/, Produtos/Pedidos no painel existente, sessão Better Auth única, clientes por celular normalizado e financeiro comum com filtros Tudo/Serviços/Loja/Manual. Recebimentos e estornos projetados na mesma transação do pedido, com a trava da agenda, vínculo único e auditoria; ajustes diretos desses lançamentos bloqueados. Migração aditiva 0004. Fontes da loja em loja/dist, saída dist/loja preparada no build, custos fora do Git.

Validação: 65 testes offline, gate principal 22/22 e gate da loja 7/7; 16 testes no schema descartável do Neon QA. CUA conferiu pedido, recebimento, estorno/cancelamento, cliente com uma reserva e um pedido, aniversário preservado e saldo líquido de R$ 125,00; UI desktop, 390/320 px e sessão compartilhada entre abas, sem erros/avisos de console. Fotos e dados reais não foram usados como operações de QA. Capturas exclusivamente fictícias: docs/qa/unified-*.jpg.

Catálogo local importado com backup privado para data/appointments.sqlite; cinco reservas e um lançamento financeiro existentes preservados, 46 produtos e nenhum pedido fictício importado. Publicada no projeto principal babi-instituto e no Neon existente. Commit funcional 453a5cc, produção dpl_2J6W68mDcLJnXGwcQaxbqBTyR4YH READY, preview dpl_By9dF9v4DhHx1ze8jUnawsE2tRnd validado. Os recursos loja-babi independentes não são usados e não foram apagados automaticamente.
