import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Response } from "./types";

const validateHeader = (req: functions.https.Request) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split("Bearer ")[1];
  }

  return false;
};

const decodeAuthToken = (authToken: string) => {
  return admin.auth().verifyIdToken(authToken);
};

const checkAuth = async (req: functions.https.Request) => {
  return new Promise(async (resolve, reject) => {
    const authToken = validateHeader(req);
    if (!authToken) {
      reject();
    } else {
      decodeAuthToken(authToken)
        .then((decodedToken: any) => {
          resolve(decodedToken.uid);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

export function isAuthorized(
  req: functions.https.Request,
  res: functions.Response<any>
) {
  checkAuth(req)
    .then((uid) => {
      res.status(200).send({
        data: {
          userId: uid,
        },
      });
    })
    .catch(() => {
      const responseObject: Response = {
        errorMessage: "Not authorized",
      };
      res.status(403).send(responseObject);
    });
}
