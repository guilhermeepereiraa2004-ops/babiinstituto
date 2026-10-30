# Arquitetura

HTML, CSS e módulos JavaScript nativos no navegador, com Node 24.x no backend. SQLite permanece no desenvolvimento local; produção Vercel usa Neon Postgres, pg, Better Auth e gerenciamento de pool da Vercel. A landing foi preservada e ligada ao agendamento. Operação em docs/deploy.md.

| Módulo | Pode depender de | Responsabilidade |
| --- | --- | --- |
| dist/assets | Nenhum módulo | Fotografias e favicon |
| dist/app.js | DOM | Interações da landing |
| dist/booking/shared.js | DOM e fetch | Formatação, cliente da API e feedback |
| dist/admin/admin.js | shared.js | Agenda, detalhes, configurações e bloqueios |
| dist/agendar/booking.js | shared.js | Serviço, calendário, dados e comprovante |
| server/core.mjs | APIs JavaScript padrão | Validação, disponibilidade, reserva e gestão |
| server/local.mjs | Node nativo e core.mjs | HTTP, sessão de desenvolvimento e SQLite |
| server/postgres.mjs | pg e @vercel/functions | Conexão TLS, parâmetros, transações e pool da nuvem |
| server/auth.mjs | Better Auth e pg | Cadastro fechado, sessão e limite de tentativas persistente |
| server/cloud.mjs e api/index.mjs | Adaptadores e core | HTTP de produção, origem e autorização administrativa |
| migrations/0001-bookings.sql | SQLite | Schema inicial aplicado no startup |
| migrations/0002-intake-finance.sql | SQLite | Anamnese, financeiro e histórico; legado sem preço inventado |
| scripts e tests | Node nativo e core | Gate e testes |

O servidor não importa a UI. A UI não importa Node ou o banco. check-layers.mjs valida imports e exercita fixtures permitidas e proibidas; a validação é lexical.

## API e ações

Públicas: GET /api/config, GET /api/availability, POST /api/bookings e GET /api/receipt/:token. O comprovante usa token aleatório de 192 bits e não retorna telefone ou observações. Não existe listagem pública de clientes.

Admin: GET/PUT /api/admin/settings, GET /api/admin/bookings, PATCH /api/admin/bookings/:id, GET /api/admin/availability e GET/POST/DELETE /api/admin/blocks. Exigem sessão gerada pelo adaptador local. POST /api/local-login e POST /api/local-logout são acessos de desenvolvimento. Cookies são isolados por porta, HttpOnly e SameSite=Strict. Cabeçalhos externos de identidade não concedem acesso.

Mutações exigem origem igual à aplicação e JSON; parâmetros e tamanho são validados no servidor. O servidor só escuta loopback e rejeita Host diferente de localhost ou 127.0.0.1. Estes controles não transformam o acesso local em autenticação de produção.

### Anamnese e financeiro

POST /api/bookings exige anamnesis: escolhas chemicalHistory/allergies (yes, no, unsure ou private), observações opcionais de até 500 caracteres e consent=true específico. Respostas, versão e horário da autorização são gravados em booking_anamnesis junto com a reserva/slots na mesma transação. O comprovante público e a listagem da agenda não incluem respostas. GET /api/admin/bookings/:id/anamnesis exige sessão administrativa; reservas antigas retornam null.

GET/POST /api/admin/finance e PATCH /api/admin/finance/:id são privados e usam a mesma validação de origem para mutações. Filtros de data aceitam até 366 dias, com paginação de 50 registros e totais calculados no banco para todo o período. Valores são inteiros em centavos, com limite de R$ 1.000.000 por lançamento. Entradas/saídas manuais exigem valor positivo; serviços permitem zero explícito para cortesia. Não existe cobrança bancária, cartão ou Pix por integração: os dados registram o recebimento informado.

PATCH de conclusão de reserva exige amountCents e paymentMethod. A atualização do atendimento, a entrada de income recebida na data de conclusão em America/Bahia e o histórico são uma única transação. booking_id UNIQUE e guarda de operação/revisão evitam duplicação. Serviços concluídos não podem ser reabertos/cancelados via API. A entrada vinculada permite corrigir valor/data/pagamento, preservando origem e descrição; devoluções podem ser registradas como saídas manuais.

Lançamentos manuais usam chave de idempotência; correções e anulações usam revisão otimista e guardam snapshots em finance_audit. Anular preserva a linha e o motivo, retirando-a dos totais. Uma entrada vinculada a serviço não pode ser anulada isoladamente.

O startup executa os SQLs aditivos/idempotentes ordenados numa transação. Conclusões antigas sem lançamento são vinculadas ao financeiro com amount_cents=NULL e pagamento não informado; aparecem como pendência sem somar valores fictícios. Não são criados clientes ou serviços de demonstração. Dados reais e capturas com informações reais de clientes não devem ser versionados.

## Consistência

Reservas são confirmadas imediatamente. Cada intervalo de 15 minutos tem chave única (data, minuto); todos os slots e a reserva são salvos em transação. Inícios aparecem em passos de 30 minutos. Duração e nome do serviço são gravados para preservar histórico após mudanças nos serviços.

Idempotência evita duplicação no reenvio. Revisões e chave de operação protegem mudanças administrativas concorrentes. Cancelar libera slots; concluir preserva histórico e ocupação. Bloqueios conflitantes com atendimento são rejeitados. Verificação dentro da transação protege contra bloqueios ou configurações alteradas depois da consulta de disponibilidade.

Configuração inicial: agenda pausada, durações e semana sugeridas, sem reserva real. Fuso America/Bahia, comparação UTC-03:00 para Salvador. Antecedência e horizonte configuráveis.

## Execução e limites

npm start mantém API e arquivos em localhost:4173, com dados privados em data/appointments.sqlite. PORT e BABI_DB_PATH permitem QA separado. server/local.mjs recusa VERCEL/NODE_ENV=production. Os dados locais não são sincronizados com a nuvem.

## Produção Neon/Vercel — 2026-10-22

Autorizada a publicação em babi-instituto.vercel.app, na conta de Guilherme. Somente dist/ é público; /api/* vai para api/index.mjs. Functions usam Node 24.x em gru1, junto do Neon em São Paulo. Produção começou vazia e pausada, sem importar quatro reservas locais. Preview/Development usam outro recurso Neon, exclusivo de QA.

server/postgres.mjs mantém o contrato get/all/run/batch do núcleo. Traduz parâmetros SQL de código confiável; valores continuam separados. Aliases financeiros são citados para preservar camelCase, contadores/somas int8 são convertidos com verificação de inteiros seguros. Datas continuam textuais ISO, mantendo o fuso do núcleo. O pool verifica TLS e é anexado ao ciclo de vida das Functions.

run e batch abrem transação e tomam pg_advisory_xact_lock(19027,4173). Todos os escritores de agenda/caixa usam a mesma trava, preservando a consistência SQLite entre reservas, bloqueios e mudanças de configuração. Guardas de revisão/operação e slots únicos continuam ativos. Falhas desfazem todas as linhas da transação. Índices adicionais cobrem FKs de slots e histórico financeiro.

Migrações em migrations/postgres/ são aplicadas explicitamente por scripts/migrate-postgres.mjs, com conexão direta, transação e checksum em babi_schema_migrations. Depois o programa aplica as migrações da versão instalada do Better Auth. Build e requisições não executam DDL. O build Vercel verifica sintaxe e testes offline; o gate completo local também verifica identidade e referências da UI.

O login de produção é Better Auth no próprio backend, sem provedor de e-mail. O hook de criação exige o e-mail autorizado, chave privada e ausência de usuários. A API pública de autenticação só expõe sign-in/email, sign-out e get-session. A configuração inicial exige origem, JSON limitado e chave privada, e deixa de funcionar após criar o proprietário. A usuária definiu a senha diretamente na UI; o agente não a recebeu.

Cookies são HttpOnly/Secure em HTTPS; sessões e limites vivem no Postgres, com restrição de origem a domínio canônico e URLs da própria implantação informadas pela Vercel. Cabeçalhos de identidade externos não concedem acesso. /api/local-* retorna 404 na nuvem. Cada rota privada compara o usuário da sessão com ADMIN_EMAIL. O IP para limites usa o cabeçalho que a Vercel sobrescreve. Não há confiança em host arbitrário, cadastro público ou fallback SQLite na nuvem.


## 2026-10-29 — Valor padrão dos serviços e conclusão financeira

Cada serviço aceita priceCents opcional (inteiro de 0 a 100000000, null para não definido), salvo no JSON de configurações por validação e trava já existentes. No painel, o valor em reais é exibido em Serviços e horários e preenche o Valor recebido ao concluir. É o valor atual do catálogo carregado no painel, inclusive para reservas anteriores; pode ser ajustado para desconto/cortesia. Serviços sem preço mantêm o preenchimento manual obrigatório. Forma de pagamento e confirmação da conclusão continuam obrigatórias. A entrada recebida usa o valor confirmado, na transação existente, sem duplicação. Alterar o catálogo não altera lançamentos concluídos.

Valores de catálogo são privados: /api/config retorna apenas os campos públicos dos serviços; reserva/comprovante continuam sem preço. Preços existentes ficam não definidos, sem estimar valores reais. Sem alteração de schema, migração ou dados de produção; a estrutura JSON de settings já suporta o campo. Compatível com configurações antigas sem priceCents.


## 2026-10-29 — Recuperação assistida da senha administrativa

Usuária esclareceu que não lembra a senha atual. Implementada recuperação assistida pelo Better Auth existente: link emitido por manutenção autenticada exclusivamente para a única conta ADMIN_EMAIL, válido por 900 segundos e consumido atomicamente uma única vez. POST /api/auth/reset-password exige origem correta, token válido e senha de 12 a 128 caracteres; tentativas limitadas no banco. Revoga todas as sessões anteriores, sem alterar reservas, anamnese ou financeiro. Emissão pública de links, cadastro, troca de e-mail e vinculação de contas seguem fechados. Sem migração, provedor de e-mail ou gravação de senha/token real em arquivos.

A URL usa fragmento #recovery removido imediatamente do histórico; token fica somente em memória e é enviado no corpo do POST. Tela exige nova senha e confirmação, dispensa a antiga e retorna ao login após sucesso, sem guardar a senha. Trata também abertura do link na mesma aba com sessão já ativa. A senha real será digitada e enviada pela própria usuária; nenhum novo valor foi escolhido pelo agente.


## 2026-10-29 — WhatsApp, tipografia da cliente e situação do pagamento

Número confirmado pela usuária após conferência do nono dígito: +55 73 98170-1666 (https://wa.me/5573981701666). Botão fixo no canto inferior direito da landing, agendamento e acompanhamento; rodapé, FAQ e chamadas de atendimento/conversa passam ao WhatsApp. Instagram permanece como referência de portfólio/origem das fotografias, sem direcionar a conversa para lá. Botão abre conversa para envio pela própria pessoa; a integração de avisos automáticos continua em standby.

A versão publicada anterior não continha o literal pago no comprovante, mas exibia a reserva como Confirmada sem distinguir pagamento. O comprovante agora separa Agendamento e Pagamento. Novo campo público paymentStatus é derivado no servidor: pending para confirmado, received apenas para concluído com entrada income/posted e valor positivo, courtesy para zero explícito, unrecorded para concluído antigo sem recebimento informado e not_applicable para cancelado. Valores, forma de pagamento, telefone, observações e anamnese continuam privados. Consulta de receipt e reenvio idempotente usam a mesma regra. Nova reserva não cria entrada financeira; nenhum registro real foi alterado ou classificado retroativamente por esta mudança.
