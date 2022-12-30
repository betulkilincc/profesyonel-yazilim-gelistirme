import logosHtml from "./logos";
import { JSDOM } from "jsdom";

import { DBAsset } from "../../../../Types/DBTypes";
import { AssetLogoHandler } from "../../../../Types/HandlerTypes";

export class CryptoLogosCC implements AssetLogoHandler {
  constructor() { }
  async fillLogos(assets: DBAsset[]): Promise<void> {
    const baseAddress = "https://cryptologos.cc/logos/";

    let dictionary = new Map<string, AssetWOLogo>();
    assets.forEach((element, index) => {
      var dashedName = element.name?.toLowerCase().replace(" ", "-") as string;
      dictionary.set(dashedName, {
        indexNumber: index,
        lowerTicker: element.ticker?.toLowerCase() as string,
      });
    });
    const dom = new JSDOM(logosHtml);
    dom.window.document
      .querySelectorAll("div.flex-grid > div > div > a")
      .forEach((a) => {
        var shortName = a.getAttribute("href")?.substring(1) as string;
        
        var asset = dictionary.get(shortName);
        
        if ( asset) {
          dictionary.set(shortName, {
            lowerTicker: asset.lowerTicker,
            logoUrl: baseAddress + shortName + "-" + asset.lowerTicker + "-logo.svg",
            indexNumber: asset.indexNumber,
          });
        }
      });

    dictionary.forEach((value: AssetWOLogo) => {
      if (value.logoUrl)
        assets[value.indexNumber].logoURL = value.logoUrl;
    });
  }
}

interface AssetWOLogo {
  indexNumber: number;
  lowerTicker: string;
  logoUrl?: string;
}