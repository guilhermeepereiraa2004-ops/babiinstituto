# Sistema Babi: agenda e loja

Pedido confirmado em 07/11/2026: um painel/login, clientes e financeiro compartilhados; vitrine própria. Substitui a decisão anterior de publicar uma loja com banco e acesso independentes. Destino autorizado: projeto Vercel babi-instituto e seu Neon existente, na equipe de Guilherme. Recursos extras já criados para loja não serão usados nem excluídos automaticamente.

## Implementação

- Vitrine em /loja/, preparada a partir das fontes de loja/dist; continua possível mapear um subdomínio futuramente.
- API de comércio sob /api/shop/, protegida pela sessão da Babi no servidor. Nenhum segundo cadastro, senha ou sessão administrativa para loja.
- Produtos, mídia e pedidos em tabelas próprias no mesmo banco; toda escrita Postgres usa a trava transacional da agenda.
- Pedidos atualizam o cadastro comum pelo WhatsApp normalizado, preservando aniversário.
- Recebimentos e estornos de pedidos são registrados no financeiro comum na mesma transação da mudança do pedido, com origem identificada e chave única. Ajustes de pedidos passam pelo módulo Pedidos para não divergir do financeiro.
- Produtos e Pedidos entram no admin existente; financeiro único permite filtrar a origem; cadastro de clientes inclui compras e serviços.
- Migração aditiva 0004; produção só recebe estrutura e catálogo real aprovado, sem fixtures. Importação local conserva catálogo/custos/estoques reais, com backup privado.

## Verificação e publicação

1. Testes SQLite isolados da integração e regressão das duas aplicações.
2. Schema descartável no Neon QA gentle-dawn-48537104, nunca copiar cookies/credenciais de produção para testes.
3. CUA: login único, produto, pedido, cliente comum, recebimento/estorno e financeiro em desktop/celular.
4. Migração explícita e catálogo no Neon existente, seguida de publicação no projeto babi-instituto. Preservar reservas, usuários e histórico.
5. Verificar arquivos públicos, proteção de rotas e catálogo publicado. Nenhum pedido ou lançamento fictício em produção.

## Publicação verificada — 07/11/2026

Sistema unificado disponível em https://babi-instituto.vercel.app/loja/ e /admin/. Mesmo Neon e credencial Better Auth existentes; nenhuma nova senha definida. Migração 0004 e catálogo de 46 produtos aplicados explicitamente após QA/preview. Backup privado e comparação sob a trava da agenda confirmaram todos os dados de negócio existentes idênticos antes/depois. Nenhuma reserva, pedido ou lançamento fictício em produção.

Domínio oficial: nove arquivos públicos iguais ao código validado, 40 fotos JPEG 200, 39 produtos disponíveis (32 com preço, sete a combinar), custos ausentes da projeção pública. API da loja usa sessão unificada; admin comercial retorna 401 sem sessão, financeiro 403 e login local 404. Agenda preservada ativa com 16 serviços. CUA público confirmou catálogo carregado, links para o mesmo Instituto/admin e console sem erros/avisos; captura pública docs/qa/unified-production-store.jpg. GitHub main contém a implementação e a correção do pacote. O primeiro preview falhou porque loja/docs/acceptance.json havia sido excluído; regra de empacotamento corrigida antes da migração de produção.

Local: servidor integrado mantido em http://localhost:4180/, /loja/ e /admin/, usando data/appointments.sqlite. Cinco reservas, um lançamento anterior, catálogo e custos locais preservados; backup em data/backups/. Servidor antigo independente e QA 4177 encerrados. Viewports restaurados, abas de QA fechadas e loja publicada deixada como entrega no navegador. Bancos e projeto exclusivos loja-babi criados antes da mudança de escopo permanecem sem uso; nenhuma exclusão de recurso foi feita.
