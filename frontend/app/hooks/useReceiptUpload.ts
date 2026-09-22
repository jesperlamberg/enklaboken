"use client";

import { useState } from "react";
import { attachReceiptToTransaction } from "../actions/transactionActions";

export function useReceiptUpload() {
  const [uploadingTxId, setUploadingTxId] = useState<number | null>(null);

  async function handleReceiptUpload(txId: number, file: File) {
    try {
      setUploadingTxId(txId);
      const formData = new FormData();
      formData.set("receipt", file);
      await attachReceiptToTransaction(txId, formData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Kunde inte ladda upp kvitto");
    } finally {
      setUploadingTxId(null);
    }
  }

  return { uploadingTxId, handleReceiptUpload };
}
