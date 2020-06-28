import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as Jimp from "jimp";
import { ImgProps, Response } from "./types";

import Tempfile = require("tempfile");

const composeImageTemp = async (props: ImgProps) => {
  if (props) {
    const template = __dirname + "/template.png";
    const image = await Jimp.read(template);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    const height = image.getHeight();
    const width = image.getWidth();

    image.print(
      font,
      0,
      height / 2,
      {
        text: props.text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      width,
      height
    );

    const outputFile = Tempfile(`.${props.extension || "png"}`);
    return image.writeAsync(outputFile).then(() => {
      return outputFile;
    });
  }

  return "";
};

export function composeImageAndUpload(
  req: functions.https.Request,
  res: functions.Response<any>
) {
  const imgProps: ImgProps = req?.body?.data;

  composeImageTemp(imgProps)
    .then((tmp) => {
      const options = {
        destination: `${imgProps.folder || "images"}/${tmp.replace(
          "/tmp/",
          ""
        )}`,
        public: true,
        gzip: true,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      };

      if (imgProps.upload) {
        const bucket = admin.storage().bucket();
        bucket
          .upload(tmp, options)
          .then((data) => {
            const url = data[0]?.metadata?.mediaLink;
            const responseObject: Response = {
              data: {
                imgUrl: url,
              },
            };
            res.status(200).send(responseObject);
          })
          .catch((error) => {
            const responseObject: Response = {
              error,
              errorMessage: "Error uploading image to the bucket",
            };
            res.status(500).send(responseObject);
          });
      } else {
        res.status(200).sendFile(tmp);
      }
    })
    .catch((error) => {
      const responseObject: Response = {
        error,
        errorMessage: "Error generating image",
      };
      res.status(500).send(responseObject);
    });
}
