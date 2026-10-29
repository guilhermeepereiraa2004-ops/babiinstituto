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
| Conexão ao GitHub | Concluída | Código enviado a andrelopees04-source/babi, main com upstream origin/main |

Aceitação do gate atual: 19/19. Aplicação publicada na Vercel, com backend Neon e login de produção. Produção começou vazia e pausada; quatro reservas locais preservadas em SQLite, sem importação. GitHub permanece conectado, porém alterações desta conversa continuam sem novo commit/push; publicação atual foi por CLI, sem deploy automático por Git. Revisar horários reais no painel antes de ativar a agenda.
