import { Request, Response } from "express";
import { storagePut } from "./storage";

export async function handleProfilePhotoUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileExtension = file.originalname.split('.').pop();
    const fileKey = `profile-photos/${userId}-${timestamp}-${randomSuffix}.${fileExtension}`;

    // Upload to S3
    const { url } = await storagePut(
      fileKey,
      file.buffer,
      file.mimetype
    );

    return res.json({ url });
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
