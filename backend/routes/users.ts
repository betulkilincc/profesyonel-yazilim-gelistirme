import express from "express";
import { getAuth } from "firebase-admin/auth";
import { admindb } from "../utils/Firebase/firebase.config";
import { BaseAuthRequest, UserExistsReq } from "../Types/requesttypes";
import { VResponse } from "../Types/responsetypes";
import { DBHandler } from "../Types/types";
import { FirebaseHandler } from "../Handlers/DBHandlers/FirebaseHandler";
const dbHandler: DBHandler = new FirebaseHandler();
const router = express.Router();
//This is an exceptional method to delete all of the users in the database. That's why it's not in the DBHandler.
router.get("/deleteallusers", async function (req, res) {
  var usersResult = await getAuth().listUsers();
  console.log(usersResult);
  console.log("Deleting users...");

  var userlist = usersResult.users.map((u) => {
    return { uid: u.uid, email: u.email };
  });
  console.log(userlist);
  var deleteResult = await getAuth().deleteUsers(userlist.map((u) => u.uid));
  console.log(deleteResult);
  console.log("Deleting user docs..");
  userlist.forEach(async function (user) {
    var res = await admindb
      .collection("user")
      .doc(user.uid)
      .delete()
      .then(() =>
        console.log("Doc for " + user.email + "(" + user.uid + ") is deleted")
      );
  });
  res.status(200).send();
});

router.post("/createuser", async function (req: BaseAuthRequest, res) {
  const uid = req.uid as string;
  await dbHandler
    .CreateUser(uid)
    .then(() => {
      res.json(new VResponse(true, "User created"));
    })
    .catch((error) => {
      res.jsonp(new VResponse(false, error.message));
    });
});

router.delete("/", async (req: BaseAuthRequest, res) => {
  const uid: string = req.uid as string;
  await dbHandler
    .DeleteUser(uid)
    .then(async () => {
      res.json(new VResponse(true,"User deleted"));
    })
    .catch((error) =>
      res.json(
        new VResponse(false, error.message)
      )
    );
});

router.post("/checkuser",async(req: UserExistsReq, res) => {
  const email: string = req.body.email as string;
  await dbHandler.CheckUserExists(email)
  .then((result) => {
    res.json(new VResponse(true, "", result));
  }).catch((error) => {
    res.json(new VResponse(false, error.message));
  });
});

export default router;
