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
