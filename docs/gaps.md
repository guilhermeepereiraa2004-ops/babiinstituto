# Lacunas

| Lacuna | Estado | Evidência |
| --- | --- | --- |
| Sem telefone ou endereço confirmados | Resolvida por escopo | Usuária escolheu Instagram como contato |
| Fotos de alta resolução | Limite da fonte | Fotografias disponíveis no Instagram, 360 a 512 px de largura |
| QA visual e interações | Verificado | docs/qa.md, desktop e mobile |
| Publicação privada | Concluída | Sites retornou succeeded com URL |

Não foram acrescentados dados comerciais não verificados.

## MVP de agendamento

| Item | Estado | Evidência |
| --- | --- | --- |
| Admin e página da cliente | Concluído localmente | Fluxo de reserva, comprovante, reagendamento e cancelamento verificado |
| Horários e durações para reservas | Configurados e ativados em 2026-10-29 | Usuária confirmou quatro serviços/durações e delegou os horários iniciais; seg–sex 09h–18h, sem pausa fixa |
| Acesso administrativo de produção | Resolvido em 2026-10-22 | Adaptador separado e Better Auth no Neon, com cadastro fechado; sessão local permanece apenas loopback |
| GitHub | Conectado | main rastreia origin/main; refinamento de 20/10 permanece local |
| Publicação do MVP e do refinamento | Fora do escopo atual | Etapa local, sem novo deploy |
| Notificações e pagamentos | Não implementados | Não fazem parte do fluxo atual |

## Refinamento da landing — 2026-10-20

Leitura e composição revisadas, sem novas lacunas funcionais identificadas. QA responsivo realizado em iframes de 1280, 768, 390 e 320 px; não equivale a teste em aparelho físico. A resolução das fotografias continua limitada à fonte original. Nenhuma nova foto foi adicionada.

Foto principal escolhida pela usuária: fabricia-leao.jpg, 150 × 150 px. A ampliação perde nitidez; uma versão original de maior resolução pode substituí-la futuramente. A mesma foto foi aplicada sem reconstruir detalhes ou mudar a aparência da profissional.

A usuária apontou explicitamente o desfoque em 2026-10-20. Consulta CUA ao perfil oficial confirmou a miniatura de 150 px, sem srcset; o metadado público de compartilhamento usa 100 px. Não foi possível recuperar uma versão maior. Correção pendente do arquivo original enviado pela usuária. Nenhuma imagem foi substituída nesta investigação.

Tentativa posterior autorizada com image_gen: prévia mais nítida salva em output/imagegen/, com reconstrução de detalhes faciais. Não aplicada à página devido ao requisito de não alterar o rosto. O arquivo fotográfico de maior resolução permanece necessário para assegurar fidelidade real.

Situação atual após rollback de 2026-10-20: retrato ampliado removido do hero; fabricia-leao.jpg voltou a ser apenas avatar pequeno. A pendência de resolução do retrato principal foi encerrada por mudança de escopo. Restauradas imagens de cabelos na abertura e nas especialidades; prévia de IA continua fora do site.

## Anamnese e financeiro — 2026-10-22

| Item | Estado | Evidência |
| --- | --- | --- |
| Histórico químico, reações e cuidados | Implementado | Etapa de anamnese, autorização própria e consulta privada |
| Recebimento de serviço concluído | Implementado | Valor informado na conclusão; entrada única atômica |
| Entradas e saídas manuais, saldo e período | Implementado | Financeiro no admin, valores em centavos e paginação |
| Correções e anulações | Implementado | Revisões e histórico persistente; sem exclusão do registro |
| Dados antigos sem preço/anamnese | Compatível | Campo não informado, sem preço fictício; dados anteriores preservados |
| Cobrança ou conciliação bancária automática | Fora do escopo | Apenas controle dos valores informados, sem movimentação financeira real |
| Produção, autenticação e hospedagem | Resolvido em 2026-10-22 | Neon e Vercel na conta de Guilherme; login persistente e primeiro acesso concluído |

QA isolado validou o fluxo completo e mobile 390 px. Banco real já estava ativo e continha quatro reservas confirmadas; nenhuma delas foi alterada ou concluída durante QA. Financeiro real iniciou vazio.

## Nuvem — encerramento em 2026-10-22

Neon e Vercel publicados na conta solicitada, com cadastro administrativo fechado e senha definida pela usuária. Produção confirmou zero reservas, anamneses e lançamentos, uma conta proprietária e agenda pausada. Situação inicial superada em 2026-10-29: agenda ativa após confirmação dos serviços/durações e delegação expressa dos horários iniciais. Recuperação de senha por e-mail e deploy automático por Git não foram configurados; operação documentada em docs/deploy.md.

## Integração GitHub/Vercel — 2026-10-29

Código atual sincronizado no GitHub, main, 6ddb004. Site e Neon continuam publicados por CLI. A Vercel recusou conectar o repositório porque a conta GitHub usada nela não possui acesso de admin/Escrita em andrelopees04-source/babi. A usuária precisa liberar e aceitar esse acesso antes da conexão. O banco e as credenciais permanecem privados; nenhuma configuração de agenda ou de banco foi alterada nesta etapa.

## Repositório próprio conectado — 2026-10-29

Pendência anterior resolvida pela escolha da usuária: https://github.com/guilhermeepereiraa2004-ops/babiinstituto.git . origin/main recebeu código e histórico; Vercel confirmou esse repositório e main no projeto já publicado. Colaborador em repositório pessoal não basta para conectar na Vercel; o novo destino pertence à conta apropriada. previous-origin preserva a referência anterior. Sem alteração de banco, credenciais, domínio ou configuração de agenda.

## Agenda pública ativa — 2026-10-29

Usuária confirmou os quatro serviços e durações e autorizou o agente a escolher os horários. Salvo em produção: segunda a sexta, 09:00–18:00, sem pausa fixa; sábado/domingo fechados; America/Bahia. Mechas/loiros 3h, cor/visagismo 2h, cortes/cachos 1h e terapia capilar 1h; antecedência de 1h e janela de 60 dias. A configuração é editável no painel. Nenhum preço ou dado de cliente foi inventado e nenhuma reserva fictícia foi criada.


## 2026-10-29 — Inclusão de serviços no painel (publicada)

Pendência visual resolvida por inspeção das capturas e 14 verificações interativas em navegador isolado de QA. CUA e Computer Use continuam indisponíveis (failed to write kernel assets / os error 3). Após a retomada solicitada pela usuária, a inspeção foi concluída por testes e capturas de um Chrome headless separado, usando Playwright já disponível no runtime e Chrome já instalado; nenhum navegador ou sessão pessoal foi controlado. Essa alternativa resolveu a pendência visual, sem alterar a preferência por CUA para QA normal.

Publicado em https://babi-instituto.vercel.app/admin/ por GitHub main, commit funcional 1bb2d6c, deploy dpl_7WdDLwy3bN6u4ieahWt3J6QoTZGn READY e alias de produção confirmado. JS/CSS públicos correspondem à versão validada (normalizadas apenas quebras de linha CRLF/LF). API pública confirmou enabled=true e os mesmos quatro serviços; sessão pública sem privilégio/local e /api/admin/settings responde 403 sem login. Zero registros de erro no novo deploy durante a consulta inicial de 10 min. Nenhuma migração, dado ou credencial real foi alterado. Uso: Serviços e horários → Adicionar serviço → preencher nome/descrição/duração, marcar disponibilidade → Salvar configurações.


## 2026-10-29 — Valor padrão dos serviços e conclusão financeira

Funcionalidade pronta e validada em SQLite e Neon QA; preço padrão interno preenche conclusão, com ajuste e pagamento obrigatório. Publicado por main, commit funcional 6631126, deploy dpl_28M4rLYxMu1RW7XKdoNuP7JCJ4Xy READY, no domínio https://babi-instituto.vercel.app/admin/ e projeto Vercel autorizado. JS/CSS públicos correspondem ao código validado (normalizadas apenas quebras de linha). API pública manteve agenda ativa e os quatro serviços, sem preço; settings/financeiro exigem autenticação (403 sem login), sessão pública não é local/admin. Zero registros de erro na consulta inicial do novo deploy. Nenhum preço real foi atribuído; a usuária deve preencher Valor padrão (R$) em Serviços e horários e salvar. Não foram executadas migrações nem criados atendimentos/lançamentos fictícios na produção. Valores de catálogo são privados: /api/config retorna apenas os campos públicos dos serviços; reserva/comprovante continuam sem preço. Preços existentes ficam não definidos, sem estimar valores reais. Sem alteração de schema, migração ou dados de produção; a estrutura JSON de settings já suporta o campo. Compatível com configurações antigas sem priceCents.


## 2026-10-29 — Recuperação assistida da senha administrativa

Recuperação assistida concluída; nova senha definida pela usuária e metadados verificados. Não equivale a recuperação automática por e-mail. Usuária esclareceu que não lembra a senha atual. Implementada recuperação assistida pelo Better Auth existente: link emitido por manutenção autenticada exclusivamente para a única conta ADMIN_EMAIL, válido por 900 segundos e consumido atomicamente uma única vez. POST /api/auth/reset-password exige origem correta, token válido e senha de 12 a 128 caracteres; tentativas limitadas no banco. Revoga todas as sessões anteriores, sem alterar reservas, anamnese ou financeiro. Emissão pública de links, cadastro, troca de e-mail e vinculação de contas seguem fechados. Sem migração, provedor de e-mail ou gravação de senha/token real em arquivos.

Usuária confirmou a definição da nova senha. Verificação somente de metadados em produção confirmou: token de recuperação consumido, credencial atualizada após a emissão do link e sessões anteriores revogadas. Nenhuma senha ou hash foi lido. Recuperação concluída; link transitório removido do estado operacional do agente, sem gravação em arquivos.


## 2026-10-29 — WhatsApp, tipografia da cliente e situação do pagamento

Contato, fontes e distinção de pagamento publicados e verificados em produção. Publicado por GitHub main no commit funcional c6b83fa, deploy dpl_6bHHkTfcsy2Z4YuYqvwGCf4UuJSa READY e domínio https://babi-instituto.vercel.app/ confirmado pelos seis arquivos públicos correspondentes ao código validado (normalizadas quebras de linha). Landing e agendamento de produção inspecionados em navegador isolado a 390 px: WhatsApp confirmado, Poppins carregada, sem rolagem horizontal. API pública preservou agenda ativa e os quatro serviços; admin exige autenticação; token de reserva inexistente retorna 404; zero registros de erro no deploy na consulta inicial. QA 4177 encerrado após conferir processo/caminho absoluto; outros servidores preservados. Sem migração ou alteração de reservas, pagamentos ou credenciais reais. A versão publicada anterior não continha o literal pago no comprovante, mas exibia a reserva como Confirmada sem distinguir pagamento. O comprovante agora separa Agendamento e Pagamento. Novo campo público paymentStatus é derivado no servidor: pending para confirmado, received apenas para concluído com entrada income/posted e valor positivo, courtesy para zero explícito, unrecorded para concluído antigo sem recebimento informado e not_applicable para cancelado. Valores, forma de pagamento, telefone, observações e anamnese continuam privados. Consulta de receipt e reenvio idempotente usam a mesma regra. Nova reserva não cria entrada financeira; nenhum registro real foi alterado ou classificado retroativamente por esta mudança.


## 2026-10-29 — Projeto rodando localmente

Execução local reiniciada por npm start em http://localhost:4176/ , /admin/ e /agendar/, com PORT=4176 e SQLite existente data/appointments.sqlite. Porta 4173 responde por outro projeto (ZM Exclusiva), preservado. Landing, admin, agendamento, /api/session e /api/config responderam HTTP 200; sessão local=true e configuração existente ativa, sem alterar horários, cadastrar fixtures ou criar reservas. Banco Neon e produção preservados. Processo mantido ativo; sem mudança de UI/código ou novo deploy.


## 2026-10-29 — Correção do ícone de WhatsApp

Desenho deformado corrigido e publicado. Correção publicada no commit dc6c7f7, deploy dpl_3LtKTH9H9H4pwFFrnLCHEz6i8Nwx READY. Landing/agendamento e os dois CSS do domínio oficial correspondem aos arquivos locais validados. Servidor local 4176 permanece ativo. Sem alteração de dados ou serviços. Raia concluída e liberada. Substituído o desenho aproximado do WhatsApp por SVG preenchido da Bootstrap Icons (viewBox 16 × 16), com stroke=none e fill=currentColor. Removido o contorno que se sobrepunha ao telefone; símbolo e botões da landing/agendamento usam a mesma geometria, dimensionada em 28 px e centralizada. Número, link, comportamento, textos, banco e funcionalidades preservados. Código nativo, sem dependência externa em tempo de execução.


## 2026-10-29 — Autorização na confirmação, sem checkboxes

Caixas removidas e fluxo validado. A autorização está vinculada à confirmação final com aviso específico, sem controles extras. Publicado no commit funcional 1e6781c, deploy dpl_Hg3btuXikXJ5R7dVnqBgDMxyqv3h READY. JS do agendamento e CSS do domínio oficial correspondem ao código validado (normalizadas quebras de linha). Servidor local 4176 atualizado; QA isolado 4177 encerrado. Nenhuma alteração de banco, migração, cliente ou credencial real. Raia concluída e liberada.


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
