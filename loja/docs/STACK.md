# Stack — Loja Babi

Atualizado: 2026-11-06. Execução local implementada. Destino de produção a confirmar.

| Superfície | Tecnologia | Evidência ou pendência |
|---|---|---|
| Vitrine e admin | HTML, CSS e JavaScript nativos; Poppins e identidade do Instituto | Compatibilidade e layout verificados no ambiente local. |
| Núcleo e desenvolvimento | Node 24, HTTP nativo e SQLite | Reusa a plataforma observada na agenda, com porta e arquivo de banco próprios. |
| Implantação proposta | Projeto Vercel separado, Node 24 e Postgres/Neon exclusivo da loja | Adaptadores implementados; teste em preview e aprovação do destino pendentes. |

O requisito eliminatório é persistir pedidos, fotos e estoque, com venda concorrente segura e painel protegido. Uma vitrine estática com armazenamento no navegador não atende. A variante proposta reusa a manutenção do Instituto e mantém independentes banco, acesso e domínio. Não há estimativa anual: domínio, planos e tráfego ainda não foram definidos. [Node SQLite](https://nodejs.org/api/sqlite.html), [Vercel Functions](https://vercel.com/docs/functions), [Neon](https://neon.com/docs/connect/connect-from-any-app).

Comandos locais: `npm start` e `npm run check` executados. `npm run db:setup -- --confirm-shop-database` é o procedimento futuro; nenhuma migração remota foi executada. Veja [arquitetura](arquitetura.md) e [implantação](deploy.md).
