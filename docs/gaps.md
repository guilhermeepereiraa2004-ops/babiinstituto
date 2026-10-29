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
| Horários reais e durações | A revisar pela usuária | Agenda inicial pausada; sugestões editáveis no admin |
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

Neon e Vercel publicados na conta solicitada, com cadastro administrativo fechado e senha definida pela usuária. Produção confirmou zero reservas, anamneses e lançamentos, uma conta proprietária e agenda pausada. Horários reais ainda precisam ser revisados/salvos pela administradora antes de ativação. Recuperação de senha por e-mail e deploy automático por Git não foram configurados; operação documentada em docs/deploy.md.
