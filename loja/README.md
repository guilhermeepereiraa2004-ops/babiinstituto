# Loja Babi

Catálogo de produtos com sacola, pedidos e painel independente da agenda do Instituto. Use Node.js 24:

```powershell
cd loja
npm start
```

- Vitrine: http://localhost:4180/
- Painel: http://localhost:4180/admin/ → **Acessar painel local**.
- Verificação: `npm run check`.

No painel, **Produtos** permite mudar foto, preço de venda, custo, estoque, nome, categoria e descrição; cadastrar, inativar, reativar ou apagar. Use **Inativos → Voltar ao site** depois de inserir uma foto. Com estoque zero, o produto só volta a aparecer após reposição.

A cliente envia o pedido pela sacola. A unidade é reservada na hora; cancelar um pedido em aberto devolve a reserva ao estoque. Para itens sem preço, use **Editar total** após combinar o valor. Registre o pagamento já recebido em **Pedidos** e acompanhe a entrada em **Financeiro**. A loja não envia mensagens automaticamente, não cobra cartão e não executa estornos bancários.

O SQLite em `data/shop.sqlite` é a base de trabalho local. Não apague a base para atualizar o código. Para testes use outra porta e `SHOP_DB_PATH` apontando para outro SQLite. O catálogo inicial é importado só quando a base está vazia. A lista privada de custos não entra no Git.

Publicação pendente: veja [docs/deploy.md](docs/deploy.md).
