# Arquitetura

| Camada | Arquivos | Responsabilidade |
|---|---|---|
| Ações | `server/actions.mjs` | Validação e transições de produtos, pedidos, estoque e caixa. |
| Persistência | `server/store.mjs`, `sqlite.mjs`, `postgres.mjs` | Catálogo inicial, leitura, escrita transacional e fotos enviadas pelo admin. |
| API | `server/api.mjs` | Origem, corpo, sessão, limite de tentativas, projeções públicas e invocação das ações. |
| Transporte | `server/local.mjs`, `api/index.mjs` | Servidor em loopback e adaptador candidato para nuvem. |
| Interfaces | `dist/` | Catálogo, sacola e gestão. Chamam a API e não importam servidor. |

SQLite bloqueia a escrita com `BEGIN IMMEDIATE`. Postgres usa `SELECT … FOR UPDATE` no registro de estado antes de executar as mesmas ações; fotos ficam em tabela separada e são atualizadas na mesma transação. Este modelo serializa mutações e serve ao catálogo inicial. Crescimento relevante de pedidos exigirá paginação e possível migração para tabelas de pedidos e caixa.

Cada pedido guarda uma cópia de nomes, quantidades, preços e custos para preservar o histórico quando o catálogo é editado. A chave de envio evita descontar a mesma sacola duas vezes. A revisão de produto impede salvar estoque a partir de uma versão anterior à venda. Produtos ligados a pedidos em aberto não podem ser apagados. A vitrine só recebe os campos públicos e produtos ativos com foto e estoque positivo.

O comprovante acessível por link aleatório mostra itens e situação, sem nome, telefone, observação, custo ou meio de pagamento. O caixa guarda entradas e saídas separadas, inclusive recebimentos e registros de estorno. Valores armazenados em centavos. O registro de pagamento não inicia cobrança.
