import {Request,Response} from "express"

async function UrlToBodyParameters(
  req: Request,
  res: Response ,
  next: () => void | any,
) {
    req.body = {
        ...req.query,
        ...req.body
    }
    next();
}

export default UrlToBodyParameters;
