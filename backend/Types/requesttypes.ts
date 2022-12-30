import { Request } from "express";
import { VAssetType, VTransactionType } from "./enums";
import ValClass from "validatorjs";
import { VResponse } from "./responsetypes";
import { Response } from "express";

export const Validations = new Map<string, ValClass.Rules>();
export const Validate = function (requestTypeName: string): any {
  return (req: BaseAuthRequest, res: Response, next: any) => {
    var validatorRules = Validations.get(requestTypeName);
    if (validatorRules) {
      var validator = new ValClass(req.body, validatorRules);
      if (validator.passes()) {
        next();
      } else {
        res.json(new VResponse(false,validator.errors));
      }
    } else next();
  };
};
//Account requests
export interface UserSigninRequest extends Request {
  body: {
    email?: string;
    password?: string;
  };
}
Validations.set("UserSigninRequest", {
   password: "min:6|required" ,
   email : "required|email"
});

export interface CreateUserRequest extends Request {
  body: {
    email?: string;
    password?: string;
  };
}
Validations.set("CreateUserRequest", {
	password: "min:6|required" ,
  email : "required|email"
 });
//Authorization requests
export interface BaseAuthRequest extends Request {
  headers: {
    authorization?: string;
  };
  uid?: string;
  body: object;
}

export interface UserExistsReq extends Request {
  body: {
    email: string;
  };
}
Validations.set("UserExistsReq", {
  email: "required|email"
});

export interface GetAssetPricesReq extends BaseAuthRequest {
  body: {
    assetUids: string[];
  };
}
Validations.set("GetAssetPricesReq", {
	assetUids: "array|required" ,
	'assetUids.*' : 'required',
 });

export interface GetAllAssetsOfTypeReq extends BaseAuthRequest {
  body: {
    assetType: VAssetType;
  };
}
Validations.set("GetAllAssetsOfTypeReq", {
	assetType : 'in:Crypto,Equity,Commodity,Fixed Income,Real Estate,Cash,Other|required',
 });

export interface GetTransactionsForAssetReq extends BaseAuthRequest {
  body: {
    assetuid: string;
  };
}
Validations.set("GetTransactionsForAssetReq", {
	assetuid : 'required',
 });
 export interface AddTransactionReq extends BaseAuthRequest {
  body: {
    transactionUid?: string; //will be provided by backend, do not send
    type: VTransactionType;
    assetuid: string, //reference to asset's uid, that the transaction is type of 
    quantity: number;
    pricePerLot: number;
    timeStamp : number //will be provided by backend, do not send
  };
}

Validations.set("AddTransactionReq", {
  type : 'required|in:Buy,Sell',
  quantity : 'required|numeric',
  pricePerLot : 'required|numeric',
  assetuid: 'required'
 });

export interface UpdateTransactionReq extends BaseAuthRequest {
  body: {
    transactionUid: string;
    newType?: VTransactionType;
    newQuantity?: number;
    newPricePerLot?: number;
  };
}
Validations.set("UpdateTransactionReq", {
  transactionUid : 'required',
  newType : 'required_without_all:newQuantity,newPricePerLot|in:Buy,Sell',
  newQuantity : 'required_without_all:newType,newPricePerLot|numeric',
  newPricePerLot : 'required_without_all:newQuantity,newType|numeric'
 });
 export interface AddConnectionReq extends BaseAuthRequest {
  body: {
    name: string,
    publicKey: string;
    secretKey: string;
    connectionUid?: string; //should be sent for locating the connection
  };
}
Validations.set("AddConnectionReq", {
  publicKey : 'required',
  connectionUid : 'required',
 });


export interface UpdateConnectionReq extends BaseAuthRequest {
  body: {
    uid: string; //This is the identifier and can not be updated. Other parameters will be updated
    newName?: string;
    newPublicKey?: string;
    newSecretKey?: string;
  };
}

Validations.set("UpdateConnectionReq", {
  uid : 'required',
  newName : 'required_without_all:newPublicKey,newSecretKey',
  newPublicKey : 'required_without_all:newName,newSecretKey',
  newSecretKey: 'required_without_all:newName,newPublicKey'
 });
 export interface DeleteConnectionReq extends BaseAuthRequest {
  body: {
    uid: string;
  };
}

Validations.set("DeleteConnectionReq", {
  uid : 'required',
 });


export interface DeleteTransactionReq extends BaseAuthRequest {
  body: {
    transactionUid: string;
  };
}

Validations.set("DeleteTransactionReq", {
  transactionUid : 'required',
 });
