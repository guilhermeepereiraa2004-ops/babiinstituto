# Verificação funcional completa — Loja Babi

Data: 07/11/2026. Escopo: aplicação local atual da loja, sem modificar o banco real de 4180 ou a agenda do Instituto. Navegador CUA e HTTP utilizaram exclusivamente SQLite isolado em 4181. Capturas contêm apenas nomes, contatos e valores fictícios de QA.

## Resultado

Gate 7/7 e 20 testes automatizados aprovados. Fluxos principais e todas as ações disponíveis no admin foram percorridos no navegador. Duas falhas do acompanhamento foram reproduzidas e corrigidas em `dist/shop.js`:

1. Mudar o fragmento `#pedido=...` na mesma aba não carregava o outro pedido. Agora o evento `hashchange` carrega o pedido solicitado, com proteção contra respostas atrasadas de outro link.
2. Um link inexistente mostrava aviso, mas mantinha o pedido anterior aberto. Agora há estado de carregamento e tela de erro própria, sem dados do pedido anterior.

Regressão CUA: concluído → cancelado → concluído na mesma aba, sem atualizar; link inexistente → erro próprio → link válido; repetido em celular. Nenhum erro/aviso de console capturado nas três abas de teste. Os testes do servidor também foram repetidos após a correção.

## Vitrine e cliente

| Verificação | Evidência / resultado |
|---|---|
| Catálogo e fotos | 39 itens públicos iniciais, 46 no admin; GET das 40 fotos retornou 200, MIME JPEG e conteúdo. |
| Busca e categorias | Busca sem acento `oleo`: 10 itens; categoria Cronograma Capilar: um; busca inexistente: estado vazio. |
| Ficha do produto | Nome, descrição, preço, estoque, adicionar e acesso à sacola; kit Teia mostrou duas fotos. |
| Sacola do topo e fixa | Abriram a mesma sacola; contadores sincronizados; adição duplicada além do estoque bloqueada; remoção e sacola vazia conferidas. |
| Quantidade e persistência | Teclado nativo alterou uma para duas unidades, subtotal R$ 50,25 → R$ 100,50; nome/contato preservados ao recalcular; sacola persistiu após recarga. |
| Formulário | Campos obrigatórios bloquearam envio vazio; telefone inválido retornou erro sem pedido; nome, WhatsApp e observação fictícios enviados com autorização. |
| Pedido com preço | Duas unidades, R$ 100,50; confirmado no banco, inicialmente Novo/Pendente; sacola limpa e produto esgotado removido da vitrine. |
| Pedido a combinar | Criado sem total inventado; total R$ 120,00 combinado no admin apareceu no acompanhamento. |
| Link da cliente | Copiar link retornou o endereço correto; recarga e reinício do servidor conservaram pedido, valores e situação. |
| Conclusão e cancelamento | Cliente viu Concluído/Recebido no primeiro pedido e Cancelado/Estornado no segundo. Cancelar devolveu a unidade à vitrine. |
| Privacidade | API de acompanhamento não inclui nome, telefone, observação privada, custos ou dados internos; token inexistente/código sem token retornam 404. |
| Contato e telas pequenas | WhatsApp aponta ao número confirmado; botões fixos de 56 px separados por 12 px. Checkout e acompanhamento conferidos a 390/320 px, sem rolagem horizontal. Fechar e Escape funcionaram. |

A área da cliente existente é o acompanhamento pelo link privado; não há cadastro, senha ou painel com histórico de compras de uma conta.

## Administração

| Módulo | Ações verificadas |
|---|---|
| Acesso | Login local, carregamento protegido, saída, recarga após sair e novo acesso após reiniciar. Testes automatizados verificam e-mail/senha no modo de produção, sessão expirada, cookies seguros e limite de tentativas. |
| Visão geral | Indicadores, pedidos recentes, Ver todos, Cadastrar produto, Organizar catálogo e Registrar movimento. |
| Cadastrar produto | Nome, categoria, descrição, preço R$ 45,50, custo privado R$ 10,25, duas unidades e upload real pela interface; ativação sem foto bloqueada. |
| Editar produto | Alterados nome, preço para R$ 50,25 e custo para R$ 12,50; substituída a foto por outro arquivo; dados persistidos. |
| Inativar / voltar | Produto saiu da vitrine, ficou Inativo e voltou ao site após reativar. Rascunho sem foto foi salvo inativo e não pôde voltar sem imagem. |
| Buscar / filtrar | Nome e situação: Todos, No site, Inativos e Esgotados; estado vazio conferido. |
| Apagar | Bloqueado enquanto o produto tinha pedido em aberto; permitido após concluir, mantendo nome, preço e quantidades no acompanhamento histórico. Rascunho fictício também apagado. |
| Pedidos | Busca por cliente; filtros Concluído/Cancelado e estado vazio; estados Novo/Confirmado acompanhados nas transições; detalhes privados, observação, contato WhatsApp, custo, confirmar, editar total, receber, concluir, estornar com motivo e cancelar. |
| Financeiro | Recebimentos automáticos, estorno correspondente, entrada manual R$ 100,10 e saída manual R$ 25,05; filtro por data, período invertido e período sem lançamentos. |
| Mobile | Navegação fixa e financeiro a 390 px, sem rolagem horizontal; formulários e checkout em telas pequenas. |

## Integridade e HTTP

O estado final de QA tinha 46 produtos, dois pedidos e cinco lançamentos: entradas R$ 320,60, saídas R$ 145,05, saldo R$ 175,55. Os cadastros adicionais de QA foram excluídos; os 39 produtos originais voltaram a ter uma unidade disponível. Comparação SHA-256 do conteúdo administrativo antes/depois de reiniciar o servidor confirmou dados idênticos, incluindo os históricos.

Os testes automatizados cobrem também concorrência pela última unidade, reenvio idempotente e conflito com dados diferentes, pedido de vários itens atômico, revisão desatualizada, todas as seis formas de pagamento, cortesia com valor zero, conclusão imutável, estorno único, cancelamento único, validações de estoque/preço/custo, exclusão de upload antigo e GET/HEAD de mídia.

HTTP conferiu admin sem sessão (401), origem externa em escrita (403), recursos privados fora da pasta pública (404), API pública sem custos e imagens servidas corretamente. Testes exercitam corpo JSON, tamanho máximo, rotas inexistentes e limites de tentativas. Nenhuma confirmação foi simulada sem persistência.

## Evidências e limites

- `npm run check`: 7/7, 20 testes; relatório em `checklist-paridade.md`.
- Capturas em `qa/full-client-completed.jpg`, `full-client-cancelled.jpg`, `full-client-mobile.jpg`, `full-client-invalid-mobile.jpg`, `full-checkout-320.jpg`, `full-tracking-corrected-320.jpg` e `full-finance-mobile.jpg`.
- Viewport restaurado; abas temporárias fechadas; servidor QA encerrado ao terminar. Prévia real da loja em 4180 preservada.
- Esta verificação não certifica Vercel/Neon: a publicação e inicialização remotas da loja ainda estão pendentes. O modo de autenticação de produção foi testado com credenciais fictícias em SQLite, não com acesso real da proprietária.
- Pagamento online, frete automático e notificações automáticas por WhatsApp não fazem parte da implementação atual. Recebimentos são registros manuais de pagamentos realizados fora do site; nenhum pagamento ou mensagem real foi disparado.
