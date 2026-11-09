# Neon e Vercel

Publicação autorizada em 2026-10-22. Aplicação: https://babi-instituto.vercel.app/ . Painel: https://babi-instituto.vercel.app/admin/ . Conta: Guilherme Pereira's projects, slug guilherme-pereiras-projects-5a38e3ba. Projeto babi-instituto, prj_zw4UHlBR6UJaS6KXY6PENJELAbg9, equipe team_NseDl6bHKTOowzX904mmIj0U.

## Ambientes

| Ambiente | Recurso Neon | Uso |
| --- | --- | --- |
| Produção | babi-instituto-db, store_qnrpepCsU1JnXhXE | Reservas reais futuras; iniciou vazio e pausado |
| Preview e Development | babi-instituto-qa, store_BIyT19q9b6CQTP8N, projeto gentle-dawn-48537104 | Dados fictícios e testes, sem dados de produção |
| Local 4173 | data/appointments.sqlite | Base anterior preservada; quatro reservas confirmadas, sem sincronização com a nuvem |

Ambos os recursos usam o plano Free e região São Paulo. Não conectar preview ao recurso de produção. Functions Node 24.x em gru1. Somente dist/ é público; o adaptador em api/index.mjs atende /api/*, com regras compartilhadas em server/core.mjs.

## Acesso administrativo

Better Auth 1.7.12, executado no próprio backend, usa as tabelas babi_user, babi_session, babi_account, babi_verification e babi_auth_rate_limit no Postgres. Escolha necessária para o cadastro fechado com hook de criação e configuração inicial única, sem provedor de e-mail adicional. O recurso Neon também provisionou Managed Auth, mas seus endpoints/SDKs não são usados pela aplicação. Não há migração de usuários do Managed Auth.

ADMIN_EMAIL é definido por ambiente. A proprietária informou o e-mail autorizado e concluiu pessoalmente a criação da senha em produção. Nenhuma senha da conta real foi definida, lida ou guardada pelo agente. Login usa cookie HttpOnly/Secure em HTTPS, sessão persistida no Postgres, limite de tentativas compartilhado e validação de origem. Não há login ChatGPT, confiança em cabeçalhos externos de identidade, cadastro público ou /api/local-login em produção.

O POST /api/setup exige chave aleatória privada, e-mail autorizado e ausência de qualquer usuário; o hook do Better Auth repete as verificações. Depois de criado o proprietário, não permite repetir a configuração. A chave inicial foi transportada no fragmento da URL, removido imediatamente do histórico pelo cliente, e não aparece em links públicos. Senhas exigem 12 a 128 caracteres. Recuperação por e-mail não foi configurada. Recuperação assistida pode emitir link de uso único por scripts/admin-recovery.mjs --production, somente com contexto Vercel/Neon autorizado e credenciais de manutenção já disponíveis. O script exige projeto/equipe/origem corretos, recusa QA em modo produção e confirma a única conta proprietária. O link expira em 15 minutos; não guardar, versionar ou publicar o link. A usuária preenche a nova senha no painel. POST /api/auth/reset-password é a única nova rota pública de autenticação e exige esse token; solicitação pública de links e cadastro seguem bloqueados.

## Manutenção

Use a CLI autenticada na conta de Guilherme. O plugin Vercel conectado neste chat retornou a conta de Diego; não usar esse escopo para este projeto.

1. Conferir destino: vercel project inspect --non-interactive --scope guilherme-pereiras-projects-5a38e3ba.
2. npm ci. Conferir os nomes das variáveis com vercel env ls, sem imprimir valores.
3. vercel env pull .env.local --yes --scope guilherme-pereiras-projects-5a38e3ba baixa Development, ligado exclusivamente ao QA.
4. npm run db:migrate aplica SQLs versionados de migrations/postgres/ e migrações do Better Auth, usando conexão direta. Nunca roda automaticamente em build/requisições. Testar novas migrações em QA antes de produção.
5. npm run check e npm run test:postgres. O teste remoto é protegido pelo ID do projeto QA e usa schema aleatório, removido ao terminar. O gate offline não acessa Neon.
6. vercel deploy --target preview --yes --scope guilherme-pereiras-projects-5a38e3ba. Validar com vercel curl e CUA.
7. vercel deploy --prod --skip-domain --yes --scope guilherme-pereiras-projects-5a38e3ba. Verificar a versão de produção e então vercel promote URL --yes --scope guilherme-pereiras-projects-5a38e3ba.

Variáveis necessárias: DATABASE_URL, DATABASE_URL_UNPOOLED para migração, AUTH_SECRET, BABI_SETUP_KEY, ADMIN_EMAIL e BABI_APP_ORIGIN (domínio canônico em produção). Preview admite somente URLs da própria implantação/branch informadas pela Vercel. Segredos ficam na Vercel e arquivos locais privados ignorados. Não versionar .env*, .vercel/, banco, credenciais, cookies ou respostas privadas. O template .env.example é a exceção sem valores.

## Evidência da publicação

Produção READY: dpl_Dyi3CigVpe3NVDB2xyKE6Ga9rezj. URL imutável: https://babi-instituto-qwzm04ms6-guilherme-pereiras-projects-5a38e3ba.vercel.app . Promovida para o domínio público após verificar config, sessão e negação do financeiro sem login.

Preview verificado: dpl_8vAdUcz58mX6UEbFSof73tecJe9T. O primeiro build falhou porque a Vercel não envia .gitignore; corrigido com build-cloud.mjs, que verifica sintaxe e comportamento sem depender de metadados Git. O gate completo continua obrigatório localmente. A primeira publicação foi feita por CLI. Em 2026-10-29, a usuária escolheu o repositório próprio https://github.com/guilhermeepereiraa2004-ops/babiinstituto.git . Histórico/código enviados ao repositório vazio, agora origin, e conectado ao projeto Vercel existente. API confirmou repoId 1438468251 e productionBranch main. Novos pushes em main iniciam deploy automático; conexão, banco Neon, variáveis e domínio permanecem no mesmo projeto. O repositório anterior ficou em previous-origin, sem alteração de propriedade.

## GitHub principal — 2026-10-29

A Vercel exige que a conta conectada seja proprietária de um repositório pessoal; ser colaborador não basta. Por isso a usuária escolheu um repositório próprio, em vez de alterar o acesso ao anterior. Fonte: https://vercel.com/docs/git/vercel-for-github#personal-account-repositories . A credencial GCM de Guilherme já existia e foi selecionada por credential.https://github.com.username no Git local deste checkout, sem salvar senha/token no repositório.

## Publicação verificada — 07/11/2026

Sistema unificado disponível em https://babi-instituto.vercel.app/loja/ e /admin/. Mesmo Neon e credencial Better Auth existentes; nenhuma nova senha definida. Migração 0004 e catálogo de 46 produtos aplicados explicitamente após QA/preview. Backup privado e comparação sob a trava da agenda confirmaram todos os dados de negócio existentes idênticos antes/depois. Nenhuma reserva, pedido ou lançamento fictício em produção.

Domínio oficial: nove arquivos públicos iguais ao código validado, 40 fotos JPEG 200, 39 produtos disponíveis (32 com preço, sete a combinar), custos ausentes da projeção pública. API da loja usa sessão unificada; admin comercial retorna 401 sem sessão, financeiro 403 e login local 404. Agenda preservada ativa com 16 serviços. CUA público confirmou catálogo carregado, links para o mesmo Instituto/admin e console sem erros/avisos; captura pública docs/qa/unified-production-store.jpg. GitHub main contém a implementação e a correção do pacote. O primeiro preview falhou porque loja/docs/acceptance.json havia sido excluído; regra de empacotamento corrigida antes da migração de produção.

Local: servidor integrado mantido em http://localhost:4180/, /loja/ e /admin/, usando data/appointments.sqlite. Cinco reservas, um lançamento anterior, catálogo e custos locais preservados; backup em data/backups/. Servidor antigo independente e QA 4177 encerrados. Viewports restaurados, abas de QA fechadas e loja publicada deixada como entrega no navegador. Bancos e projeto exclusivos loja-babi criados antes da mudança de escopo permanecem sem uso; nenhuma exclusão de recurso foi feita.


A loja usa as variáveis DATABASE_URL/AUTH_SECRET/ADMIN_EMAIL já existentes; não exige novas credenciais. O arquivo de ambiente temporário usado nesta manutenção foi mantido privado e removido ao finalizar. O catálogo inicial de custos veio exclusivamente do arquivo privado informado pela usuária.

## Notificações do painel

As migrações 0005 e 0006 criam a fila transacional e o cadastro de até dez aparelhos ativos. A atualização preserva os aparelhos e avisos já enfileirados. A Vercel envia os avisos no fim da requisição que confirma o pedido ou agendamento. Um cron diário autenticado em /api/internal/push-retry retenta avisos pendentes. Os gatilhos incluem só novas inserções, sem reprocessar o histórico. A mensagem não inclui nome, celular, serviço, valores ou identificadores de cliente.

Configure BABI_PUSH_PUBLIC_KEY, BABI_PUSH_PRIVATE_KEY e CRON_SECRET apenas no ambiente pretendido. A chave privada e o segredo do cron são segredos do servidor. Gere um par VAPID exclusivo por ambiente e preserve-o entre deploys. Trocar o par exige nova ativação no aparelho. A porta local de QA usa chaves descartáveis e banco separado.

Em Módulos → Notificações, o painel permite ativar o aparelho atual, remover inscrições e gerar convites de uso único com validade de 24 horas. O convidado abre o link, aceita os avisos e pode testar ou desativar o próprio aparelho. No iPhone com iOS 16.4 ou superior, adicione a página aberta à Tela de Início pelo Safari e entre pelo ícone. Se o convite não aparecer ao abrir o ícone, cole o código. Ativar outro aparelho mantém os cadastros existentes e usa uma das dez vagas.
