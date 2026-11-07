import {readFileSync} from 'node:fs';

export const seedCatalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));
export function initialState({costs={}}={}) {
  return {
    products:seedCatalog.map(product=>({...product,costCents:Number.isSafeInteger(costs[product.id])?costs[product.id]:null,revision:0})),
    orders:[], ledger:[], sessions:{}, limits:{}
  };
}
