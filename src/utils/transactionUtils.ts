
import { Transaction } from "@/components/TransactionItem";

/**
 * Save a new transaction to the user's transaction history
 */
export const saveTransaction = (userId: string, transaction: Transaction): void => {
  try {
    // Get existing transactions
    const storageKey = `gcoin-transactions-${userId}`;
    const existingTransactionsJson = localStorage.getItem(storageKey);
    const existingTransactions = existingTransactionsJson 
      ? JSON.parse(existingTransactionsJson) 
      : [];
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, transaction];
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error("Failed to save transaction:", error);
  }
};

/**
 * Update an existing transaction (e.g., to change status from pending to completed)
 */
export const updateTransaction = (userId: string, transactionId: string, updates: Partial<Transaction>): void => {
  try {
    // Get existing transactions
    const storageKey = `gcoin-transactions-${userId}`;
    const existingTransactionsJson = localStorage.getItem(storageKey);
    
    if (!existingTransactionsJson) return;
    
    const existingTransactions = JSON.parse(existingTransactionsJson);
    
    // Find and update the specified transaction
    const updatedTransactions = existingTransactions.map((tx: Transaction) => {
      if (tx.id === transactionId) {
        return { ...tx, ...updates };
      }
      return tx;
    });
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error("Failed to update transaction:", error);
  }
};

/**
 * Integrate the sendMoney function with transaction tracking
 */
export const sendMoney = (
  userId: string,
  senderWallet: string,
  recipientWallet: string,
  amount: number,
  fee: number,
  note?: string
): Promise<{
  success: boolean;
  transactionId: string;
  status: "completed" | "pending" | "failed" | "refunded";
  message?: string;
}> => {
  return new Promise((resolve) => {
    // Generate transaction ID
    const transactionId = `TX${Date.now().toString().substring(5)}`;
    
    // Create transaction object
    const transaction: Transaction = {
      id: transactionId,
      type: "send",
      amount: amount,
      recipient: recipientWallet,
      sender: senderWallet,
      timestamp: new Date(),
      status: "pending",
      description: note,
      fee: fee
    };
    
    // Save the initial pending transaction
    saveTransaction(userId, transaction);
    
    // Simulate processing
    setTimeout(() => {
      // Check if recipient wallet exists (mock implementation)
      const registeredWallets = [
        "gCoin8272xrt92", 
        "gCoin7391xdq83", 
        "gCoin5137xpz64"
      ];
      
      const isRegisteredWallet = registeredWallets.includes(recipientWallet);
      
      if (isRegisteredWallet) {
        // Update transaction to completed
        const updatedTransaction = {
          ...transaction,
          status: "completed" as const
        };
        
        updateTransaction(userId, transactionId, { status: "completed" });
        
        // Resolve with success
        resolve({
          success: true,
          transactionId,
          status: "completed"
        });
      } else {
        // This would be the refund flow in a real system
        // Update transaction to refunded
        updateTransaction(userId, transactionId, { status: "refunded" });
        
        // Resolve with refunded status
        resolve({
          success: false,
          transactionId,
          status: "refunded",
          message: "Recipient wallet address does not exist. Your GCoins have been refunded."
        });
      }
    }, 1500); // Simulate processing time (1.5 seconds for demo)
  });
};
