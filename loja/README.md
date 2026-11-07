# Loja Babi integrada

A loja faz parte do sistema Babi: mesmo banco, login, painel, clientes e financeiro da agenda. Publicada em https://babi-instituto.vercel.app/loja/. Administração em https://babi-instituto.vercel.app/admin/.

Use Node.js 24. Nesta pasta, `npm start` inicia o backend principal em 4180: vitrine em http://localhost:4180/loja/ e painel em http://localhost:4180/admin/. O banco local é ../data/appointments.sqlite. Não use o antigo data/shop.sqlite para novas operações reais; ele foi preservado como origem da importação e backup.

Produtos permite cadastrar/editar nome, foto, preço público, custo privado, categoria, descrição e estoque; inativar, voltar ao site ou apagar quando não há pedido em aberto. Estoque zero retira o item da vitrine. Pedidos permite revisar, combinar total, registrar recebimento, concluir, estornar e cancelar. Recebimentos/estornos aparecem no financeiro comum na mesma transação do pedido; estornos bancários e mensagens não são executados pelo sistema.

As fontes públicas continuam em dist/ e são preparadas na saída ../dist/loja/ pelo build principal. Os adaptadores independentes em server/local.mjs e api/ são históricos/QA; o servidor independente exige SHOP_DB_PATH explícito. `npm run check` verifica o módulo; `npm run check` na raiz verifica o sistema inteiro.

Leia AGENTS.md e ../docs/unificacao.md para arquitetura, evidências e operação.
