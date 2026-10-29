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

Recuperação assistida pronta e validada; falta publicação, emissão privada de link temporário e definição da nova senha pela usuária. Não equivale a recuperação automática por e-mail. Usuária esclareceu que não lembra a senha atual. Implementada recuperação assistida pelo Better Auth existente: link emitido por manutenção autenticada exclusivamente para a única conta ADMIN_EMAIL, válido por 900 segundos e consumido atomicamente uma única vez. POST /api/auth/reset-password exige origem correta, token válido e senha de 12 a 128 caracteres; tentativas limitadas no banco. Revoga todas as sessões anteriores, sem alterar reservas, anamnese ou financeiro. Emissão pública de links, cadastro, troca de e-mail e vinculação de contas seguem fechados. Sem migração, provedor de e-mail ou gravação de senha/token real em arquivos.
