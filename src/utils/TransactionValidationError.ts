import type { NewTransactionInterface, Transaction } from "../types";
type ValidationError =
  | { type: "NO_ITEMS"; message: string }
  | { type: "ITEM_NAME"; itemId: string; message: string }
  | { type: "PAYMENT_AMOUNT"; message: string }
  | { type: "UNIT_PRICE"; itemId: string; message: string };
export function hasTransactionValidationError(transaction:Transaction |NewTransactionInterface):ValidationError|null {
  const isSaleOrReturn =
    transaction?.type === "SALE" ||
    transaction?.type === "RETURN";

  const isPayment = transaction?.type === "PAYMENT";

  
  const noItems =
    isSaleOrReturn &&
    (transaction?.items?.length ?? 0) === 0;

  if (noItems) {
    return {
      type: "NO_ITEMS",
      message: "Please add at least one item.",
    };
  }

  
  const invalidItem = isSaleOrReturn && (transaction?.items?.find(
    (item) => item?.name?.trim() === "")
  );

  if (invalidItem) {
    return {
      type: "ITEM_NAME",
      itemId: invalidItem.id,
      message: "Please enter the item name.",
    };
  }

  if (isPayment && Number(transaction?.amount) <= 0) {
    return {
      type: "PAYMENT_AMOUNT",
      message: "Please enter a payment amount.",
    };
  }

  if (transaction?.type === "RETURN") {
    const invalidUnitPrice = transaction?.items?.find(
      (item) => Number(item?.unitPrice) <= 0
    );

    if (invalidUnitPrice) {
      return {
        type: "UNIT_PRICE",
        itemId: invalidUnitPrice.id,
        message: "Return item price must be greater than 0.",
      };
    }
  }

  return null;
}