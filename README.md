# Babi Instituto de Beleza

Landing page e MVP de agendamentos, em Poppins e tons café/champagne.

Publicado em https://babi-instituto.vercel.app/ . Painel em https://babi-instituto.vercel.app/admin/ . Neon e Vercel na conta de Guilherme Pereira, conforme pedido de 2026-10-22. Produção começou sem reservas, com agenda pausada; acesso inicial definido pela usuária. Detalhes em docs/deploy.md.

Repositório de destino: https://github.com/andrelopees04-source/babi . A raiz do projeto Git é esta pasta. O deploy atual foi realizado por CLI. Código atualizado em main em 2026-10-29; a conexão Vercel/GitHub aguarda acesso de Escrita da conta GitHub usada na Vercel ao repositório.

## Rodar

Requisito: Node.js 24.x. Interface HTML/CSS/JS nativa, sem dependência de bibliotecas via CDN. O backend de nuvem usa pg, Better Auth e o gerenciamento de pool da Vercel.

```powershell
npm ci
npm start
```

- Site: http://localhost:4173/
- Administração: http://localhost:4173/admin/
- Cliente: http://localhost:4173/agendar/

No admin, clique em **Acessar painel local**. Abra **Serviços e horários**, revise durações e dias de atendimento, marque **Ativar agendamento online** e salve. As reservas serão confirmadas automaticamente e aparecerão na agenda. A versão inicial começa pausada porque os horários reais do salão ainda não foram fornecidos.

O painel permite buscar clientes e serviços, consultar datas, concluir, cancelar e reagendar. É possível bloquear dias ou intervalos, desde que não haja atendimento no período. A cliente recebe uma página de confirmação com link para consultar a reserva.

## Anamnese e financeiro

Ao reservar, a cliente escolhe serviço e horário, informa seus dados e preenche a anamnese: histórico químico, alergias/reações a produtos e cuidados dos fios. Pode optar por conversar pessoalmente. Há autorização específica para armazenar as respostas, que aparecem somente nos detalhes privados do atendimento no admin, sem constar no comprovante público.

Para concluir um atendimento, abra os detalhes, clique em **Concluir**, informe o valor recebido e a forma de pagamento e confirme. O sistema marca o serviço como concluído e cria uma única entrada recebida no **Financeiro**, conforme a preferência da usuária. Zero é permitido para cortesia. Concluídos não são reabertos; correções de valor/pagamento são feitas no lançamento vinculado.

No Financeiro, selecione o período para ver entradas, saídas e saldo. **Novo lançamento** registra outras entradas e despesas. Abra um lançamento para corrigir os dados; lançamentos manuais podem ser anulados com motivo, preservando o histórico. O saldo considera os registros do período, não um extrato bancário. Valores de serviços não são inventados ou publicados.

As migrações são aplicadas automaticamente ao iniciar. Reservas antigas não ganham anamneses fictícias. Serviços concluídos antigos sem valor aparecem como **Valor a informar**, sem alterar os totais até a informação ser preenchida.

## Dados e testes

Os dados persistem em `data/appointments.sqlite`, fora do Git. Para copiar o banco, utilize um backup SQLite ou encerre o servidor antes da cópia. Nome, telefone, observações, anamnese e dados financeiros reais não devem ser enviados ao repositório ou incluídos em capturas versionadas.

```powershell
npm run check
npm test
```

O gate reúne 19 critérios e executa os testes offline: 27 aprovados e uma suíte remota explicitamente omitida. O catálogo está em docs/acceptance.json. Testes reais no Neon são executados por npm run test:postgres após baixar o ambiente Development; usam somente o recurso QA protegido por ID e schema descartável. A execução remota verificou nove casos/subtestes. QA SQLite usa data/qa-*.sqlite/porta 4174; QA com backend de nuvem usa scripts/serve-cloud-qa.mjs/porta 4175. Nunca configure produção para testes fictícios.

## Limite deste MVP

O servidor local continua atendendo apenas 127.0.0.1 com SQLite e sessão de desenvolvimento. Ele rejeita execução em Vercel ou NODE_ENV=production. Na nuvem, o adaptador separado usa Neon, HTTPS e login por e-mail/senha com cadastro fechado. As duas bases são independentes: as quatro reservas locais não foram importadas.

Não há cobrança online, SMS, e-mail ou envio automático de mensagens. O financeiro apenas registra valores informados pela administradora; não movimenta dinheiro. Valores e local de atendimento são consultados pelo Instagram oficial. `.openai/hosting.json` identifica a landing anterior; não use seu deploy estático para hospedar a nova API.
