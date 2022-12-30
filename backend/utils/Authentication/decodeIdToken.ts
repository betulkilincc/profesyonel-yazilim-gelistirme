import { auth } from "firebase-admin";
import app from "../../src";
import { BaseAuthRequest } from "../../Types/requesttypes";
import { VResponse } from "../../Types/responsetypes";

async function decodeIDToken(
	req: BaseAuthRequest | any,
	res: Response | any,
	next: () => void | any
) {
	if (app.settings.env === "development" && process.env.DEV_PILOT_USER_UID !== undefined) {
		req["uid"] = process.env.DEV_PILOT_USER_UID as string;
		next();
		return;
	}
	try {
		if (req.headers?.authorization?.startsWith("Bearer ")) {
			const idToken = req.headers.authorization.split("Bearer ")[1];
			const decodedToken = await auth().verifyIdToken(idToken);
			req["uid"] = decodedToken.uid;
		} else throw new Error();
		next();
	} catch (err) {
		res.status(401).send(new VResponse(false, "Authorization Error"));
	}
}

export default decodeIDToken;
