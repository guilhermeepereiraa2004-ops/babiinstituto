# Publicação atual — sistema Babi integrado

Desde 07/11/2026, publicar pela raiz do repositório, no projeto babi-instituto de Guilherme, com seu Neon já existente. A loja é /loja/ e seu admin é o mesmo /admin/ da agenda. Não publicar esta pasta no projeto separado loja-babi nem configurar outro acesso/SHOP_DATABASE_URL para a operação atual.

O build principal prepara os assets e verifica as duas suítes. Push em main inicia a publicação automática. Migrações do banco são explícitas; a migração aditiva 0004 foi aplicada antes da publicação inicial integrada. scripts/setup-shared-shop.mjs inicializa somente catálogo ausente; scripts/publish-shared-database.mjs é manutenção protegida para a primeira implantação vazia, não um comando de rotina após receber pedidos. Custos privados, bancos, ambientes e backups nunca entram no Git ou no bundle público.

A validação remota usa o Neon QA gentle-dawn-48537104 e schemas descartáveis; a produção preservou integralmente reservas, cadastro e financeiro anteriores. O preview é protegido e pode ser verificado com vercel curl autenticado, sem desligar a proteção.

Um futuro subdomínio pode apontar para o mesmo projeto, com roteamento da vitrine e origens configurados quando o domínio for definido. Não precisa de outro banco. Recursos loja-babi separados criados anteriormente não estão em uso nem foram apagados.

Referências: ../../docs/unificacao.md e ../../docs/deploy.md.
