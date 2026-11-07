# Loja Babi

Atualização de 07/11/2026: usuária confirmou unificar agenda e loja no sistema principal, compartilhando Neon, autenticação, clientes e financeiro. A decisão substitui banco/login/publicação independentes abaixo. Vitrine em /loja/, gestão de Produtos/Pedidos no admin principal e API em /api/shop/. Usar npm start na raiz para o sistema integrado. Os adaptadores independentes da loja ficam como referência e QA; não usar a base antiga para novos dados reais. Destino remoto: babi-instituto na equipe de Guilherme; recursos loja-babi criados antes permanecem sem uso. Ver ../docs/unificacao.md.

Vitrine, pedidos, estoque e caixa do Babi Instituto, separados da agenda. Leia `plan/STATUS.md`, `plan/execution-plan.md`, `ROADMAP.md` e a última entrada em `log/devlog.md`. Registre a frente em `plan/LANES.md` antes de editar. Memória acompanha o código; não versione `data/` ou configuração privada.

- Preserve Poppins, a marca da Babi e as cores café, champagne e off-white. Use as fotos entregues e registre novas fontes.
- Preço público e custo privado são campos diferentes. Não invente preços, quantidades, frete ou disponibilidade.
- Pedido e reserva de estoque são atômicos. Cancelar só devolve estoque uma vez. Recebimentos e estornos não disparam transações financeiras reais.
- Nunca expor contatos, custos ou detalhes de caixa na vitrine ou no acompanhamento. Nunca versionar base, credenciais ou capturas de operações reais.
- Use `npm run check` antes de commits. Para UI, faça inspeção CUA e registre evidência em `docs/qa.md`. Use apenas base isolada e clientes fictícios nos testes.
- Em 07/11/2026 o usuário autorizou publicar a loja em projeto separado na equipe gratuita Guilherme Pereira’s Projects, sem upgrades ou contratação paga. O subdomínio fica para depois. O acesso local existe apenas em loopback. Não reutilize a base ou a sessão da agenda na implantação da loja.

O [mapa de camadas](docs/arquitetura.md) é verificado por `scripts/check-layers.mjs`. O catálogo de aceitação está em `docs/acceptance.json`. Ao concluir, atualize STATUS, gaps, roadmap, devlog e libere a raia.
