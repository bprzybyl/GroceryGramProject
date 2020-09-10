const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Multer = require("multer");
const CLOUD_BUCKET = "grocerygramapi_bucket";
const { format } = require("util");
const shortid = require("shortid");
var sizeOf = require("buffer-image-size");
const sharp = require("sharp");

const THUMB_WIDTH = 600;
const THUMB_HEIGHT = 600;

// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Creates a client from a Google service account key
const storage = new Storage({ keyFilename: "gcloud_storage.json" });

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

// A bucket is a container for objects (files).
const bucket = storage.bucket(CLOUD_BUCKET);

// modified from https://medium.com/@olamilekan001/image-upload-with-google-cloud-storage-and-node-js-a1cf9baa1876
const uploadImageToGCS = (file, fileName) =>
  new Promise((resolve, reject) => {
    const { originalname, buffer } = file;

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream
      .on("finish", () => {
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        resolve(publicUrl);
      })
      .on("error", () => {
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });

// Modified from GCloud Example: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/appengine/storage/standard/app.js
// Process the file upload and upload to Google Cloud Storage.
router.post("/", [auth, multer.single("file")], async function (
  req,
  res,
  next
) {
  let outputJson = {
    fullsizeHeight: "",
    fullsizeUrl: "",
    fullsizeWidth: "",
    thumbHeight: "",
    thumbUrl: "",
    thumbWidth: "",
  };

  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  var fullsizeDimensions = sizeOf(req.file.buffer);
  outputJson.fullsizeWidth = fullsizeDimensions.width;
  outputJson.fullsizeHeight = fullsizeDimensions.height;

  const fullsizeFileName =
    shortid.generate() +
    "_" +
    Date.now() +
    "." +
    req.file.originalname.split(".").pop();

  try {
    outputJson.fullsizeUrl = await uploadImageToGCS(req.file, fullsizeFileName);
  } catch (error) {
    next(error);
  }

  console.log("File uploaded to " + outputJson.fullsizeUrl);

  await sharp(req.file.buffer)
    .resize(THUMB_WIDTH, THUMB_HEIGHT)
    .toBuffer()
    .then((buffer) => {
      req.file.buffer = buffer;
    });

  let thumbDimensions = sizeOf(req.file.buffer);
  outputJson.thumbWidth = thumbDimensions.width;
  outputJson.thumbHeight = thumbDimensions.height;

  const thumbFileName =
    shortid.generate() +
    "_thumb_" +
    Date.now() +
    "." +
    req.file.originalname.split(".").pop();

  try {
    outputJson.thumbUrl = await uploadImageToGCS(req.file, thumbFileName);
  } catch (error) {
    next(error);
  }

  console.log("File uploaded to " + outputJson.thumbUrl);

  res.status(200).json(outputJson);
});

module.exports = router;
