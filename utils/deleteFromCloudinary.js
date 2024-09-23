const cloudinary = require("./cloudinary");

async function deleteFromCloudinary(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.v2.uploader.destroy(
      process.env.UPLOAD_PRESET + "/" + publicId,
      { resource_type: resourceType }
    );
    return result.result;
  } catch (error) {
    console.log(error);
    return "An error occurred";
  }
}

module.exports = deleteFromCloudinary;
