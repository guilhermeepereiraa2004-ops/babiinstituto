# Checklist de aceitação

Gerado por `node scripts/gate.mjs`. Fonte: `docs/acceptance.json`.

Total: 20 | Concluídos: 20 | Progresso dos critérios do gate: 100%

| ID | Critério | Status | Evidência |
| --- | --- | --- | --- |
| A01 | Documento em português com título, descrição e um h1 | OK | check document |
| A02 | Poppins e layout responsivo com redução de movimento | OK | check design |
| A03 | Fotografias locais disponíveis | OK | check assets |
| A04 | Links internos com destinos existentes | OK | check anchors |
| A05 | Contato pelo WhatsApp confirmado e links externos seguros | OK | check contact |
| A06 | JavaScript válido e dependências entre camadas respeitadas | OK | check syntax |
| A07 | Portfólio com filtros, fotos ampliáveis e diálogo acessível | OK | check portfolio |
| A08 | Serviços, apresentação, processo, FAQ e contato completos | OK | check sections |
| A09 | Admin com agenda, gestão e configurações, protegido no servidor | OK | check admin |
| A10 | Fluxo de cliente com serviço, calendário e comprovante integrado à landing | OK | check customer |
| A11 | SQLite com slots únicos e dados locais fora do Git | OK | check persistence |
| A12 | Testes de reserva, concorrência, autorização, cancelamento e reagendamento | OK | check runtime |
| A13 | Anamnese com autorização na confirmação final, persistência e consulta privada | OK | check intake |
| A14 | Financeiro com entradas, saídas, correções, anulações e saldo por período | OK | check finance |
| A15 | Conclusão e recebimento atômicos sem duplicação por atendimento | OK | check completion |
| A16 | Migração preserva reservas antigas e não inventa valores | OK | check migration |
| A17 | Postgres com transações e migrações separadas, preservando SQLite local | OK | check cloud |
| A18 | Login de produção com cadastro fechado e proteção da conta proprietária | OK | check authentication |
| A19 | Vercel publica apenas dist e executa backend na região do banco | OK | check hosting |
| A20 | Preço do catálogo visível no agendamento, em centavos, preenchendo conclusão sem alterar recebimentos anteriores | OK | check runtime |

A inspeção visual e os testes interativos são registrados em `docs/qa.md`. O percentual mede os critérios deste gate, sem representar autenticação para produção ou publicação.
