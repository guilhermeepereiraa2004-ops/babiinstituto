# Roadmap

Atualizado: 2026-10-22. Estágio: landing, agendamento, anamnese e financeiro locais concluídos.

| Marco | Estado | Evidência |
| --- | --- | --- |
| Fundação estática e documentação | Implementado | AGENTS.md, scripts/gate.mjs |
| Landing page completa | Implementado | dist/index.html, styles.css, app.js |
| Verificação visual e interações | Verificado | docs/qa.md; gate 8/8 |
| Refinamento editorial da landing | Concluído localmente | Abertura, profissional, leitura, galeria e contato revisados; CUA desktop/tablet/mobile e gate 12/12 |
| Retrato escolhido como imagem principal | Revertido a pedido da usuária | Restaurado refinamento anterior: cabelos no hero e foto dinâmica em Especialidades |
| Publicação privada | Concluída | Sites: succeeded, versão aeda5047068c8191992242a642c703e7 |
| MVP admin e cliente | Concluído localmente | dist/admin, dist/agendar, server, migrations |
| Confirmação automática e persistência | Verificado | 12 testes e fluxo de QA no navegador |
| Anamnese no agendamento | Concluído localmente | Quatro etapas, autorização específica, persistência e consulta privada no admin |
| Controle financeiro | Concluído localmente | Entradas/saídas, saldo por período, correções e anulações com histórico |
| Conclusão integrada ao caixa | Verificado | Recebimento único e atômico com valor informado; concorrência e falhas cobertas |
| Verificação do escopo ampliado | Verificado | Gate 16/16, 25 testes e CUA em banco isolado desktop/mobile |
| Publicação do MVP | Concluída em 2026-10-22 | babi-instituto.vercel.app, na conta de Guilherme, com Neon e Functions em São Paulo |
| Login de produção | Concluído e usado pela usuária | Better Auth, cadastro fechado, senha definida diretamente pela proprietária |
| Verificação de nuvem | Concluída | Gate 19/19, testes no Neon, fluxo de reserva de QA, produção vazia/pausada e CUA desktop/mobile |
| Agenda pública | Ativa em 2026-10-29 | Quatro serviços, segunda a sexta 09h–18h, antecedência 1h e janela 60 dias; disponibilidade pública conferida |
| Conexão ao GitHub/Vercel | Concluída em 2026-10-29 | Código em guilhermeepereiraa2004-ops/babiinstituto, main conectada ao projeto Vercel existente |

Aceitação do gate atual: 19/19. Aplicação publicada na Vercel, com backend Neon e login de produção. Produção começou vazia e pausada; quatro reservas locais preservadas em SQLite, sem importação. GitHub principal agora é guilhermeepereiraa2004-ops/babiinstituto, conectado à Vercel em main. Primeira publicação foi por CLI; atualizações passam a usar Git. Agenda ativada em 2026-10-29, com serviços/durações confirmados e horários iniciais definidos pelo agente por delegação expressa da usuária.


## 2026-10-29 — Inclusão de serviços no painel (publicada)

- [x] Implementar Adicionar serviço, campos obrigatórios, cancelamento e limite de 12.
- [x] Gate 19/19, 29 testes offline e 14 verificações de navegador.
- [x] Inspecionar desktop e mobile 390 px em QA isolado.
- [x] Concluir push e confirmar deploy e API pública.

Publicado em https://babi-instituto.vercel.app/admin/ por GitHub main, commit funcional 1bb2d6c, deploy dpl_7WdDLwy3bN6u4ieahWt3J6QoTZGn READY e alias de produção confirmado. JS/CSS públicos correspondem à versão validada (normalizadas apenas quebras de linha CRLF/LF). API pública confirmou enabled=true e os mesmos quatro serviços; sessão pública sem privilégio/local e /api/admin/settings responde 403 sem login. Zero registros de erro no novo deploy durante a consulta inicial de 10 min. Nenhuma migração, dado ou credencial real foi alterado. Uso: Serviços e horários → Adicionar serviço → preencher nome/descrição/duração, marcar disponibilidade → Salvar configurações.


## 2026-10-29 — Valor padrão dos serviços e conclusão financeira

- [x] Valor padrão opcional e privado por serviço, preenchendo o recebimento na conclusão.
- [x] Testes offline, Neon QA e UI desktop/mobile, incluindo desconto/cortesia e histórico.
- [x] Publicação e verificação final no domínio oficial.

Publicado por main, commit funcional 6631126, deploy dpl_28M4rLYxMu1RW7XKdoNuP7JCJ4Xy READY, no domínio https://babi-instituto.vercel.app/admin/ e projeto Vercel autorizado. JS/CSS públicos correspondem ao código validado (normalizadas apenas quebras de linha). API pública manteve agenda ativa e os quatro serviços, sem preço; settings/financeiro exigem autenticação (403 sem login), sessão pública não é local/admin. Zero registros de erro na consulta inicial do novo deploy. Nenhum preço real foi atribuído; a usuária deve preencher Valor padrão (R$) em Serviços e horários e salvar. Não foram executadas migrações nem criados atendimentos/lançamentos fictícios na produção.


## 2026-10-29 — Recuperação assistida da senha administrativa

- [x] Fluxo de recuperação assistida sem senha atual, com token de uso único e revogação de sessões.
- [x] Testes de segurança no Neon QA e inspeção desktop/mobile.
- [x] Publicação e entrega privada do link de 15 minutos.

Recuperação publicada no commit b0928de, deploy dpl_EkLvqz5NBZmzvDfmHdB6vRpD7otR READY, domínio https://babi-instituto.vercel.app/admin/ confirmado. JS publicado corresponde ao código testado (normalizadas quebras de linha); agenda ativa, quatro serviços preservados, admin protegido e emissão pública de links fechada. Link real de 15 min emitido por scripts/admin-recovery.mjs para a única conta configurada após verificar projeto/equipe/origem e recurso de produção. Não armazenar o URL/token na memória do projeto. A nova senha foi definida pessoalmente pela usuária; consumo do token, atualização da credencial e revogação de sessões antigas confirmados sem ler senha/hash. Recuperação concluída.
- [x] Usuária definir a nova senha.

Usuária confirmou a definição da nova senha. Verificação somente de metadados em produção confirmou: token de recuperação consumido, credencial atualizada após a emissão do link e sessões anteriores revogadas. Nenhuma senha ou hash foi lido. Recuperação concluída; link transitório removido do estado operacional do agente, sem gravação em arquivos.


## 2026-10-29 — WhatsApp, tipografia da cliente e situação do pagamento

- [x] Contato por WhatsApp com botão fixo e número confirmado.
- [x] Tipografia editorial da cliente alinhada à landing e mais legível.
- [x] Pagamento separado da reserva e recebido somente conforme financeiro.
- [x] Gate, Neon QA e navegador desktop/mobile aprovados.
- [x] Publicar e conferir produção.

Publicado por GitHub main no commit funcional c6b83fa, deploy dpl_6bHHkTfcsy2Z4YuYqvwGCf4UuJSa READY e domínio https://babi-instituto.vercel.app/ confirmado pelos seis arquivos públicos correspondentes ao código validado (normalizadas quebras de linha). Landing e agendamento de produção inspecionados em navegador isolado a 390 px: WhatsApp confirmado, Poppins carregada, sem rolagem horizontal. API pública preservou agenda ativa e os quatro serviços; admin exige autenticação; token de reserva inexistente retorna 404; zero registros de erro no deploy na consulta inicial. QA 4177 encerrado após conferir processo/caminho absoluto; outros servidores preservados. Sem migração ou alteração de reservas, pagamentos ou credenciais reais.


## 2026-10-29 — Projeto rodando localmente

Execução local reiniciada por npm start em http://localhost:4176/ , /admin/ e /agendar/, com PORT=4176 e SQLite existente data/appointments.sqlite. Porta 4173 responde por outro projeto (ZM Exclusiva), preservado. Landing, admin, agendamento, /api/session e /api/config responderam HTTP 200; sessão local=true e configuração existente ativa, sem alterar horários, cadastrar fixtures ou criar reservas. Banco Neon e produção preservados. Processo mantido ativo; sem mudança de UI/código ou novo deploy.


## 2026-10-29 — Correção do ícone de WhatsApp

- [x] Corrigir desenho e inspecionar botão em desktop/mobile.
- [x] Confirmar publicação da correção.

Correção publicada no commit dc6c7f7, deploy dpl_3LtKTH9H9H4pwFFrnLCHEz6i8Nwx READY. Landing/agendamento e os dois CSS do domínio oficial correspondem aos arquivos locais validados. Servidor local 4176 permanece ativo. Sem alteração de dados ou serviços. Raia concluída e liberada.


## 2026-10-29 — Autorização na confirmação, sem checkboxes

- [x] Remover caixas extras de autorização no agendamento.
- [x] Aviso visível na confirmação, validação do fluxo e UI desktop/mobile.
- [x] Publicar e verificar a versão final.

Publicado no commit funcional 1e6781c, deploy dpl_Hg3btuXikXJ5R7dVnqBgDMxyqv3h READY. JS do agendamento e CSS do domínio oficial correspondem ao código validado (normalizadas quebras de linha). Servidor local 4176 atualizado; QA isolado 4177 encerrado. Nenhuma alteração de banco, migração, cliente ou credencial real. Raia concluída e liberada.


## 2026-10-29 — Almoço recorrente

Almoço recorrente configurável por dia em Serviços e horários → Dias e horários. Campo weekly[].lunch opcional/null (sem pausa) ou {start,end}; início/fim dentro do expediente, em passos de 15 minutos. A disponibilidade, criação e reagendamento consideram toda a duração do serviço; permitem terminar no início da pausa ou começar no fim. Reservas existentes preservadas, com aviso no painel. Nenhuma pausa foi ativada nas bases reais. Sem migração; compatível com settings antigos.

Gate 20/20, 36 testes offline e 14 casos/subtestes Neon QA aprovados, schema descartável removido. CUA voltou a funcionar: QA isolado em 4177/data/qa-lunch-20261029.sqlite confirmou campos opcionais, foco, salvar, persistência após reload, rejeição de intervalo invertido, ocultação/desabilitação dos campos ao desativar, retirada dos horários 11:30/12:00 e preservação de 11:00/13:00 para serviço de 1h com almoço 12h–13h; remoção da pausa restaurou 12:00. Inspeção 1440 e 390 px sem rolagem horizontal, nenhum erro de console. Capturas exclusivamente de QA: docs/qa/lunch-desktop.jpg e lunch-mobile.jpg. Viewport restaurado e abas temporárias fechadas.

Publicado no GitHub main, commit funcional 9b1fceb, deploy dpl_8tDe3pvKZutjcHz2saDARXVpqx6f READY em https://babi-instituto.vercel.app/. JS/CSS públicos conferidos contra os arquivos validados, agenda ativa com os quatro serviços e admin protegido (403 sem sessão). Servidor local 4176 reiniciado com o backend atualizado e banco existente; QA 4177 encerrado. Nenhum almoço ativado em bases reais: a profissional deve marcar os dias, informar início/fim e salvar. Raia concluída e liberada.


## 2026-10-29 — Almoço ativado em produção

Por pedido explícito da usuária, almoço ativado na produção das 12:00 às 13:00, de segunda a sexta, America/Bahia. Alteração somente de weekly[].lunch desses cinco dias; demais configurações e todas as reservas preservadas. Aplicação com validação do núcleo, mesma trava transacional Postgres e backup privado da configuração anterior em .vercel/. Persistência relida e comparada. API pública verificada em 20 combinações (quatro serviços × cinco dias, 02–06/11): nenhum serviço oferecido atravessa 12h–13h. Agenda segue ativa. Sem mudança de código, migração ou necessidade de deploy; banco SQLite local preservado.


## 2026-10-29 — Preços no agendamento da cliente

Por solicitação da usuária, o preço cadastrado passa a aparecer para a cliente na seleção do serviço e no resumo durante o agendamento, em reais. /api/config expõe priceCents apenas dos serviços ativos, mantendo projeção explícita dos campos públicos. Null/ausente aparece como Valor a consultar; zero aparece R$ 0,00. Texto do admin informa a visibilidade pública. Pagamento continua no atendimento; recebimentos individuais, forma de pagamento e dados pessoais permanecem privados. Não há snapshot de orçamento na reserva: esta mudança exibe o catálogo atual carregado, sem alterar valores históricos ou o comprovante. Sem migração ou mudança nos preços cadastrados.

Gate 20/20, 36 testes offline e 14 casos/subtestes Neon QA aprovados em schema descartável. CUA em SQLite separado data/qa-public-prices-20261029.sqlite/4177 confirmou formato monetário, zero, null/ausente, preço no resumo, atualização ao trocar serviço e continuidade ao avançar para calendário. Layout inspecionado a 1440 e 390 px, sem rolagem horizontal e sem erros de console. Capturas exclusivamente fictícias: docs/qa/public-prices-desktop.jpg e public-prices-mobile.jpg. Viewport restaurado e aba QA encerrada.

Publicação em andamento.
