
// const coinmarketcap : CryptoHandlerScore = {
//     remainingDailyApiCalls : 1,
//     remainingMonthlyApiCalls : 1,
//     singleCallLimit: 200,
//     succesfulCalls : new Map<string,number>(),
//     failedCalls : new Map<string,number>(),
// }
const cryptorank : CryptoHandlerScore = {
    remainingDailyApiCalls : 1,
    remainingMonthlyApiCalls : 1,
    singleCallLimit: 200,
    succesfulCalls : new Map<string,number>(),
    failedCalls : new Map<string,number>(),
}


export class CryptoHandlerScoreProvider {
    constructor(){
    }
    static HandlerScores =new  Map<string,CryptoHandlerScore>(
        [
            ['cryptorank',cryptorank]
        ]
    );
    
}

export interface CryptoHandlerScore
{
    remainingDailyApiCalls : number;
    remainingMonthlyApiCalls : number;
    singleCallLimit: number;
    succesfulCalls : Map<string,number>
    failedCalls : Map<string,number>
    lastFailedCall? : Date
}

