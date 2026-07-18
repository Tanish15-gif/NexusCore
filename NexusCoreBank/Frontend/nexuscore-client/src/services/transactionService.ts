import { authorizedRequest } from "./apiService";

export interface CustomerTransaction {
  transactionId: number;
  accountId: number;
  transactionType: string;
  amount: number;
  status: string;
  description?: string;
  transactionDate: string;
}

export async function getCustomerTransactions(): Promise<
  CustomerTransaction[]
> {
  const data = await authorizedRequest<unknown>("/Account/transactions", {
    method: "GET",
  });

  if (Array.isArray(data)) {
    return data as CustomerTransaction[];
  }

  if (
    data &&
    typeof data === "object" &&
    "transactions" in data &&
    Array.isArray((data as { transactions?: unknown[] }).transactions)
  ) {
    return (data as { transactions: CustomerTransaction[] }).transactions;
  }

  return [];
}
