export interface Customer{
  id:string,
  name:string,
  phone:string,
  address:string,
  balance:number
}
  

interface TransactionsItem{
  id:string,
  name:string,
  quantity:number,
  unitPrice:number,
}

interface Payment {
  method: "Cash" | "UPI" | "Card" | "Bank Transfer",
  reference: string,
  receivedBy: string
}

interface ReturnInfo {
  reason: string |null;
}
 export interface Transaction{
  id:string,
  customerId:string,
  customerName:string,
  date:string,
  type: "SALE" | "PAYMENT" | "RETURN",
  amount:number,
  note:string,
  items:TransactionsItem[],
  payment:Payment|null,
  return:ReturnInfo|null
}
type TransactionType = "SALE" | "RETURN" | "PAYMENT";

 export interface NewTransactionInterface{
  id:string,
  customerId:string |undefined,
  customerName:string,
  date:string,
  type: TransactionType | undefined,
  amount:number,
  note:string,
  items:TransactionsItem[] ,
  payment:Payment|null,
  return:ReturnInfo|null
}
