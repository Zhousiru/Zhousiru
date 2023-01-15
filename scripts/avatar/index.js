require("dotenv").config();

const axios = require("axios");
const sharp = require("sharp");
const crypto = require("crypto");
const { Client } = require("minio");
const fs = require("fs");
const path = require("path");

async function work() {
  console.log("Fetch image...");

  const imageData = Buffer.from(
    (
      await axios.get(process.env.AVATAR_URL, {
        responseType: "arraybuffer",
      })
    ).data
  );

  const hash = crypto.createHash("md5").update(imageData).digest("hex");

  const hashPath = path.join(__dirname, "hash");

  let currentHash = "";
  if (fs.existsSync(hashPath)) {
    currentHash = fs.readFileSync(hashPath).toString();
  }

  if (currentHash === hash && !process.env.SKIP_HASH) {
    console.log("Image unchanged. There's nothing to do");
    return;
  }

  console.log("Image changed. Processing image...");

  const processedImage = await sharp(imageData)
    .resize(250)
    .toFormat("webp")
    .toBuffer();

  var client = new Client({
    endPoint: process.env.ENDPOINT,
    useSSL: true,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY,
    region: process.env.REGION,
  });

  console.log("Upload to object storage...");

  client.putObject(process.env.BUCKET_NAME, "qavatar.webp", processedImage, {
    "Cache-Control": "public, max-age=604800",
  });

  // Additional
  require("./update_banner").update(processedImage.toString("base64"));

  console.log("Save hash...");
  fs.writeFileSync(hashPath, hash);

  console.log("All done.");
}

work();
