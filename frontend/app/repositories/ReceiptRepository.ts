import { promises as fs } from "node:fs";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "receipts");

export async function saveReceiptFile(
  file: File | null
): Promise<{ receiptUrl?: string; receiptFileName?: string }> {
  if (!file || !(file instanceof File) || file.size === 0 || !file.name) {
    return {};
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${safeName}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return {
    receiptUrl: `/uploads/receipts/${fileName}`,
    receiptFileName: file.name,
  };
}
