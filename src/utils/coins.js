function formatCoinTransactions(transactions = []) {
  if (transactions.length === 0) return 'Ainda não tem movimentações no cofrinho.';

  return transactions.map((transaction) => {
    const sign = transaction.amount > 0 ? '+' : '';
    return `**${sign}${transaction.amount}** — ${transaction.reason} (${transaction.type})`;
  }).join('\n');
}

module.exports = { formatCoinTransactions };
