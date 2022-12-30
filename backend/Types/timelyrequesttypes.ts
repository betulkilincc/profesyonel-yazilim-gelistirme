import { Request } from "express";
import { Validations } from "./requesttypes";
import { Asset } from "./types";

export interface UpdateAssetsReq extends Request {
    body: {
      assets: Asset[];
    };
  }

  Validations.set("UpdateAssetsReq", {
    assets: "array|required" ,
 });