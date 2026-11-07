import {randomUUID} from 'node:crypto';
import {clock} from './core.mjs';

const phoneKey=phone=>[10,11].includes(phone.length)?'55'+phone:phone;
const methods={pix:'pix',dinheiro:'cash',cartao:'credit',transferencia:'transfer',outro:'other',cortesia:'other'};
// Pure statement construction: the caller commits the state, customer, order and
// ledger projection together, under the same writer lock as the agenda.
export function projectShopChanges(before,after){
  const statements=[],orders=new Map(before.orders.map(o=>[o.id,o]));
  for(const order of [...after.orders].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))){
    const old=orders.get(order.id);
    if(old&&JSON.stringify(old)===JSON.stringify(order))continue;
    const phone=phoneKey(order.phone);
    if(!old)statements.push({sql:`INSERT INTO customers(phone,name,updated_at) VALUES(?,?,?)
      ON CONFLICT(phone) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at
      WHERE customers.updated_at<=excluded.updated_at`,args:[phone,order.name,order.createdAt]});
    statements.push({sql:`INSERT INTO shop_orders(id,customer_phone,customer_name,status,payment,total_cents,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,payment=excluded.payment,
      total_cents=excluded.total_cents,updated_at=excluded.updated_at`,
      args:[order.id,phone,order.name,order.status,order.payment,order.totalCents,order.createdAt,order.updatedAt]});
  }
  const previous=new Map(before.ledger.map(entry=>[entry.id,entry]));
  for(const old of before.ledger){
    const entry=after.ledger.find(e=>e.id===old.id);
    if(!entry||JSON.stringify(old)!==JSON.stringify(entry))throw Error('O histórico financeiro da loja é imutável.');
  }
  for(const entry of after.ledger){
    if(previous.has(entry.id))continue;
    const order=entry.orderId?after.orders.find(o=>o.id===entry.orderId):null;
    if(entry.orderId&&!order)throw Error('Pedido do lançamento não encontrado.');
    const value={kind:entry.kind==='entrada'?'income':'expense',category:order?'Produtos':'Loja',
      description:entry.description,amount_cents:entry.amountCents,date:clock(new Date(entry.at)).date,
      payment_method:methods[entry.method]||'other',shopOrderId:order?.id||null};
    statements.push({sql:`INSERT INTO finance_entries(id,idempotency_key,kind,category,description,amount_cents,date,payment_method,operation_key,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`,args:[entry.id,'shop:'+entry.id,value.kind,value.category,value.description,value.amount_cents,value.date,value.payment_method,'shop:'+entry.id,entry.at,entry.at]});
    statements.push({sql:'INSERT INTO shop_finance_links(entry_id,shop_entry_id,order_id,customer_phone) VALUES(?,?,?,?)',
      args:[entry.id,entry.id,order?.id||null,order?phoneKey(order.phone):null]});
    statements.push({sql:'INSERT INTO finance_audit(id,entry_id,action,previous_value,new_value,created_at) VALUES(?,?,?,NULL,?,?)',
      args:[randomUUID(),entry.id,entry.kind==='entrada'?'shop_received':'shop_expense',JSON.stringify(value),entry.at]});
  }
  return statements;
}
