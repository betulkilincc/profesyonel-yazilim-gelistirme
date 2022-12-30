import { defineStore } from "pinia";
import { SortType } from "../base/enums";
import { DBUserConnection, Holding } from "../vealthAPI/types";

export const useUserStore = defineStore("user", {
  state: () => ({
    userProfilePath:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    holdings: [] as Holding[],
    userConnections: [] as DBUserConnection[],
    totalBalance: 0,
    previousTotalBalance: 0,
    holdingSortType: SortType.Holdings,
  }),
  actions: {
    sortHoldings(requestedSortType: SortType = SortType.Holdings) {
      this.holdingSortType = requestedSortType;
      if (
        requestedSortType === SortType.Holdings ||
        requestedSortType === SortType.Allocation
      ) {
        this.holdings = this.holdings.sort((a, b) => b.value - a.value);
      } else if (requestedSortType === SortType.Name) {
        this.holdings = this.holdings.sort((a, b) =>
          a.asset.name.localeCompare(b.asset.name)
        );
      } else if (requestedSortType === SortType.Price) {
        this.holdings = this.holdings.sort(
          (a, b) => b.asset.price - a.asset.price
        );
      } else if (requestedSortType === SortType.PriceChange) {
        this.holdings = this.holdings.sort(
          (a, b) =>
            (b.asset.price - b.asset.previousPrice) / b.asset.previousPrice -
            (a.asset.price - a.asset.previousPrice) / a.asset.previousPrice
        );
      }
    },
  },
});
