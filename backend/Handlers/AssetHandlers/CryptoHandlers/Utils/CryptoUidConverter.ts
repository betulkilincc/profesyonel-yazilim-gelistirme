export class CryptoUidConverter {
  static UidMap = new Map<string, string>();
  static BackUidMap = new Map<string, string>();

  static GetConverter(provider: string) {
    if (provider === "cryptorank")
      return (originalUid: string) => originalUid.substring(3);
    else return (originalUid: string) => this.UidMap.get(originalUid);
  }
}
