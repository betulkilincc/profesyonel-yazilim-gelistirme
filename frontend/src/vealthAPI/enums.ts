export enum VAssetType {
  Crypto = "Crypto",
  Equity = "Equity",
  Commodity = "Commodity",
  FixedIncome = "Fixed Income",
  RealEstate = "Real Estate",
  Cash = "Cash",
  Other = "Other",
}

export enum VConnectionType {
  EthereumWallet,
  AvalancheWallet,
  AvalaunchIDOContract,
  BinanceAccount,
  IBKR,
}

export enum VTransactionType {
  Buy = "Buy",
  Sell = "Sell",
}
