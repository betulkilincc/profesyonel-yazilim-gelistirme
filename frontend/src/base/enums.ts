export enum ConnectionType {
  BitcoinWallet = "Bitcoin Wallet",
  EthereumWallet = "Ethereum Wallet",
  BinanceAccount = "Binance Account",
  PolkadotWallet = "Polkadot Wallet",
}

export enum ChangeType {
  Increase,
  Decrease,
  None,
}

export enum SortType {
  Name,
  Price,
  PriceChange,
  Holdings,
  Allocation,
}

export enum Status {
  Development,
  Production,
}
