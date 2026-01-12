const { cloudinary } = require("../global_config/cloudinary_config");

class cloudinary_service {
  constructor() {
    console.log("FILE: cloudinary.service.js | constructor | Service initialized");
  }

  /**
   * Upload image to Cloudinary
   * @param {Buffer|String} file - Image file buffer or base64 string
   * @param {String} folder - Folder name in Cloudinary (e.g., 'products', 'categories')
   * @param {String} public_id - Optional public ID for the image
   * @returns {Promise<Object>} Upload result with secure_url
   */
  async upload_image(file, folder = "grocery_store", public_id = null) {
    try {
      console.log(`FILE: cloudinary.service.js | upload_image | Uploading image to folder: ${folder}`);

      const upload_options = {
        folder: folder,
        resource_type: "image",
        overwrite: true,
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      };

      // If public_id is provided, add it to options
      if (public_id) {
        upload_options.public_id = public_id;
      }

      let upload_result;

      // Check if file is a buffer (from multer) or base64 string
      if (Buffer.isBuffer(file)) {
        // Upload from buffer using Promise wrapper
        upload_result = await new Promise((resolve, reject) => {
          const upload_stream = cloudinary.uploader.upload_stream(
            upload_options,
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          upload_stream.end(file);
        });
      } else if (typeof file === "string") {
        // Upload from base64 string or URL
        upload_result = await cloudinary.uploader.upload(file, upload_options);
      } else {
        throw new Error("Invalid file format. Expected Buffer or String.");
      }

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          url: upload_result.secure_url,
          public_id: upload_result.public_id,
          width: upload_result.width,
          height: upload_result.height,
          format: upload_result.format,
          bytes: upload_result.bytes,
        },
      };
    } catch (error) {
      console.error(`FILE: cloudinary.service.js | upload_image | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01601",
        ERROR_DESCRIPTION: error.message || "Failed to upload image to Cloudinary",
      };
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {String} public_id - Public ID of the image to delete
   * @returns {Promise<Object>} Deletion result
   */
  async delete_image(public_id) {
    try {
      console.log(`FILE: cloudinary.service.js | delete_image | Deleting image: ${public_id}`);

      const result = await cloudinary.uploader.destroy(public_id);

      if (result.result === "ok") {
        return {
          STATUS: "SUCCESSFUL",
          ERROR_CODE: "",
          ERROR_FILTER: "",
          ERROR_DESCRIPTION: "",
          DB_DATA: {
            deleted: true,
            public_id: public_id,
          },
        };
      } else {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "NOT_FOUND",
          ERROR_CODE: "VTAPP-01602",
          ERROR_DESCRIPTION: "Image not found in Cloudinary",
        };
      }
    } catch (error) {
      console.error(`FILE: cloudinary.service.js | delete_image | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01603",
        ERROR_DESCRIPTION: error.message || "Failed to delete image from Cloudinary",
      };
    }
  }

  /**
   * Upload video to Cloudinary
   * @param {Buffer|String} file - Video file buffer or base64 string
   * @param {String} folder - Folder name in Cloudinary (e.g., 'videos')
   * @param {String} public_id - Optional public ID for the video
   * @returns {Promise<Object>} Upload result with secure_url
   */
  async upload_video(file, folder = "pay_videos", public_id = null) {
    try {
      console.log(`FILE: cloudinary.service.js | upload_video | Uploading video to folder: ${folder}`);

      const upload_options = {
        folder: folder,
        resource_type: "video",
        overwrite: true,
        chunk_size: 6000000, // 6MB chunks for large videos
        eager: [
          {
            format: "jpg",
            width: 640,
            height: 360,
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
            start_offset: "1" // Extract frame at 1 second
          }
        ],
        eager_async: false, // Set to false to wait for thumbnail generation
      };

      // If public_id is provided, add it to options
      if (public_id) {
        upload_options.public_id = public_id;
      }

      let upload_result;

      // Check if file is a buffer (from multer) or base64 string
      if (Buffer.isBuffer(file)) {
        // Upload from buffer using Promise wrapper
        upload_result = await new Promise((resolve, reject) => {
          const upload_stream = cloudinary.uploader.upload_stream(
            upload_options,
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          upload_stream.end(file);
        });
      } else if (typeof file === "string") {
        // Upload from file path or URL
        upload_result = await cloudinary.uploader.upload(file, upload_options);
      } else {
        throw new Error("Invalid file format. Expected Buffer or String.");
      }

      // Generate thumbnail URL from video public_id
      // Cloudinary can generate thumbnails on-the-fly using transformations
      let thumbnail_url = null;
      
      // First, try to use eager transformation if available
      if (upload_result.eager && upload_result.eager.length > 0) {
        thumbnail_url = upload_result.eager[0].secure_url;
      }
      
      // If no eager thumbnail, generate one from public_id
      if (!thumbnail_url && upload_result.public_id) {
        // Generate thumbnail URL by extracting a frame from the video
        thumbnail_url = cloudinary.url(upload_result.public_id, {
          resource_type: "video",
          format: "jpg",
          transformation: [
            {
              width: 640,
              height: 360,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto"
            },
            {
              start_offset: "1" // Get frame at 1 second
            }
          ]
        });
      }
      
      // Final fallback: extract from secure_url
      if (!thumbnail_url && upload_result.secure_url) {
        // Extract public_id from secure_url
        const public_id_match = upload_result.secure_url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        if (public_id_match && public_id_match[1]) {
          const extracted_public_id = public_id_match[1].replace(/\.[^.]+$/, ''); // Remove extension
          thumbnail_url = cloudinary.url(extracted_public_id, {
            resource_type: "video",
            format: "jpg",
            transformation: [
              {
                width: 640,
                height: 360,
                crop: "fill",
                quality: "auto",
                fetch_format: "auto"
              },
              {
                start_offset: "1"
              }
            ]
          });
        }
      }

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          url: upload_result.secure_url,
          public_id: upload_result.public_id,
          duration: upload_result.duration || 0,
          width: upload_result.width,
          height: upload_result.height,
          format: upload_result.format,
          bytes: upload_result.bytes,
          thumbnail_url: thumbnail_url,
        },
      };
    } catch (error) {
      console.error(`FILE: cloudinary.service.js | upload_video | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01604",
        ERROR_DESCRIPTION: error.message || "Failed to upload video to Cloudinary",
      };
    }
  }

  /**
   * Delete video from Cloudinary
   * @param {String} public_id - Public ID of the video to delete
   * @returns {Promise<Object>} Deletion result
   */
  async delete_video(public_id) {
    try {
      console.log(`FILE: cloudinary.service.js | delete_video | Deleting video: ${public_id}`);

      const result = await cloudinary.uploader.destroy(public_id, { resource_type: "video" });

      if (result.result === "ok") {
        return {
          STATUS: "SUCCESSFUL",
          ERROR_CODE: "",
          ERROR_FILTER: "",
          ERROR_DESCRIPTION: "",
          DB_DATA: {
            deleted: true,
            public_id: public_id,
          },
        };
      } else {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "NOT_FOUND",
          ERROR_CODE: "VTAPP-01605",
          ERROR_DESCRIPTION: "Video not found in Cloudinary",
        };
      }
    } catch (error) {
      console.error(`FILE: cloudinary.service.js | delete_video | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01606",
        ERROR_DESCRIPTION: error.message || "Failed to delete video from Cloudinary",
      };
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param {String} url - Cloudinary image URL
   * @returns {String|null} Public ID or null if invalid URL
   */
  extract_public_id(url) {
    try {
      if (!url || typeof url !== "string") {
        return null;
      }

      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      console.error(`FILE: cloudinary.service.js | extract_public_id | Error:`, error);
      return null;
    }
  }
}

module.exports = new cloudinary_service();

