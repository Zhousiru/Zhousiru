const fs = require("fs");
const path = require("path");

exports.update = (base64) => {
  const bannerPath = path.join(__dirname, "../../template/banner.svg");

  bannerStr = fs.readFileSync(bannerPath).toString();
  bannerStr = bannerStr.replace("{{AVATAR_BASE64}}", base64);

  fs.writeFileSync(path.join(__dirname, "../../dist/banner.svg"), bannerStr);
};
