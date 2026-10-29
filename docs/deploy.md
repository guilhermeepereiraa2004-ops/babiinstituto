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

O POST /api/setup exige chave aleatória privada, e-mail autorizado e ausência de qualquer usuário; o hook do Better Auth repete as verificações. Depois de criado o proprietário, não permite repetir a configuração. A chave inicial foi transportada no fragmento da URL, removido imediatamente do histórico pelo cliente, e não aparece em links públicos. Senhas exigem 12 a 128 caracteres. Recuperação por e-mail não foi configurada; uma futura recuperação exige manutenção assistida. Não abrir cadastros ou expor rotas extras de autenticação como solução para isso.

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

Preview verificado: dpl_8vAdUcz58mX6UEbFSof73tecJe9T. O primeiro build falhou porque a Vercel não envia .gitignore; corrigido com build-cloud.mjs, que verifica sintaxe e comportamento sem depender de metadados Git. O gate completo continua obrigatório localmente. A publicação foi feita por CLI; integração Git/deploy automático não foi configurada.
