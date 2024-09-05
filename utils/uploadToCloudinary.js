const cloudinary = require("./cloudinary");
const fs = require("fs");
const path = require("path");

async function uploadToCloudinary(fileOrFiles, fileType = "image") {
  try {
    let uploadPreset = "";
    if (fileType === "file") {
      uploadPreset = process.env.UPLOAD_PRESET; // Set your preset here if needed
    }

    if (typeof fileOrFiles === "string") {
      const fileProps = await cloudinary.v2.uploader.upload(fileOrFiles, {
        folder: uploadPreset,
      });
      return fileProps;
    } else if (Array.isArray(fileOrFiles)) {
      const filesProps = [];
      for (let i = 0; i < fileOrFiles.length; i++) {
        filesProps.push(
          await cloudinary.v2.uploader.upload(fileOrFiles[i], {
            folder: uploadPreset,
          })
        );
      }
      return filesProps;
    }
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    const files = fs.readdirSync("public");
    files
      .filter((f) => fs.statSync(path.join("public", f)).isFile())
      .forEach((file) => {
        const filePath = path.join("public", file);
        fs.unlinkSync(filePath);
      });
  }
}

module.exports = uploadToCloudinary;
