import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { composeImageAndUpload } from "./composeImage.function";
import { isAuthorized } from "./isAuthorized.function";

admin.initializeApp(functions.config().firebase);

const region = "europe-west1";

exports.isAuthorized = functions.region(region).https.onRequest(isAuthorized);
exports.composeImage = functions
  .region(region)
  .https.onRequest(composeImageAndUpload);
