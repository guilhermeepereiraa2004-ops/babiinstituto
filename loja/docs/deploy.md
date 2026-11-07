# Publicação futura

O site local usa SQLite e roda na porta 4180. A primeira publicação foi autorizada para um projeto Vercel **separado**, com endereço padrão `.vercel.app`. Não use o projeto Vercel nem a URL de banco da agenda. A equipe atual da Babi está no Hobby; para publicar a loja comercial, é preciso que o responsável ative o Pro ou autorize uma equipe que já o use.

1. Confirmar a equipe Pro, o destino do código, o banco exclusivo da loja e o e-mail autorizado. Reservar o nome do projeto `loja-babi` se disponível.
2. Configurar o projeto Vercel com raiz `loja/`, Node 24 e as variáveis privadas `SHOP_ORIGIN` (origem HTTPS canônica sem barra final), `SHOP_DATABASE_URL`, `SHOP_ADMIN_EMAIL` e `SHOP_ADMIN_HASH`. A senha é definida pela responsável; o hash tem formato `sal hexadecimal de 16 bytes:hash scrypt hexadecimal de 64 bytes`. Nunca gravar senha ou URL com credenciais em arquivo versionado, logs ou conversas.
3. Inicializar somente a base da loja com `npm run db:setup -- --confirm-shop-database`. O script não substitui um catálogo existente. Se for autorizado importar os custos, usar o arquivo privado local na inicialização a partir do computador; custos não integram o repositório nem o pacote publicado.
4. Validar credenciais, painel, upload, proteção de rotas, concorrência e fluxo de pedido em preview com banco de QA independente. O adaptador Postgres da loja não foi testado em recurso remoto nesta etapa.
5. Publicar no destino aprovado e testar HTTPS, vitrine e painel no endereço `.vercel.app`.
6. Quando houver domínio próprio, adicionar o subdomínio em **Settings → Domains** nesse mesmo projeto. Criar o CNAME informado pela Vercel, aguardar validação e atualizar `SHOP_ORIGIN` para o endereço canônico antes de testar pedidos e login no novo endereço.

Pagamento, retirada e entrega são combinados com o Instituto. Se houver interesse em pagamento online ou frete calculado, definir provedor e operação antes de habilitar.
