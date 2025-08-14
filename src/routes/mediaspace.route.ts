import express, { Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { generateSign } from "../utils/sign";
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from "../config";
import { BaseResponse } from "../types/data.type";

const router = express.Router();

// =================== TYPES ===================
interface ShopeeUploadResponse extends BaseResponse {
  response: {
    image_info: {
      image_id: 'sg-11134201-7r98o-mdef4gdgfltvd0',
      image_url_list: []
    },
    image_info_list: []
  };
}

interface UploadImageRequest extends Request {
  file: Express.Multer.File;
}

// =================== MULTER ===================
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// =================== ROUTE ===================
// @ts-ignore
router.post("/upload-image", upload.single("file"), async (req: UploadImageRequest, res: Response) => {
  console.log("UPLOAD IMAGE")
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;

    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));

    // Replace these with your Shopee credentials
    // const access_token = "ACCESS_TOKEN";
    const partner_id = SHOPEE_PARTNER_ID;
    const timestamp = Math.floor(Date.now() / 1000);
    const urlPath = "/api/v2/media_space/upload_image";

    const sign = generateSign({ urlPath, timestamp, });

    const response = await axios.post<ShopeeUploadResponse>(
      `${SHOPEE_BASE_URL}${urlPath}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          // Authorization: `Bearer ${access_token}`,
        },
        params: { partner_id, timestamp, sign },
      }
    );

    if (response.data.error || response.data.message) {
      console.error('Shopee API Error:', response.data.error);
      return res.status(500).json({
        message: response.data.message,
        error: response.data.error
      });
    }

    // if (response)
    //   ata: {
    //   error: '',
    //   message: '',
    //   warning: '',
    //   request_id: 'e3e3e7f33c4f533dcc4a17cb0196d101',
    //   response: { image_info: [Object], image_info_list: [Array] }
    // }
    console.log({ data: response.data })
    console.log({ response: response.data.response })

    // Hapus file sementara
    fs.unlinkSync(filePath);

    return res.json({
      data: response.data.response
    });
  } catch (error: any) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      error: "Upload to Shopee failed",
      details: error.response?.data || error,
    });
  }
});

export { router as mediaspaceRoute }
