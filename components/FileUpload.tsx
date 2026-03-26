"use client";

import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function FileUpload({ sendMessage }: any) {

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // 🔥 Parse File (CSV + Excel)
  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {

      const name = file.name.toLowerCase();

      // ✅ CSV
      if (name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (err) => reject(err),
        });
      }

      // ✅ Excel
      else if (name.endsWith(".xlsx")) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(sheet);

          resolve(jsonData);
        };

        reader.readAsArrayBuffer(file);
      }

      // ❌ Unsupported
      else {
        reject("Only CSV or Excel files allowed");
      }
    });
  };

  // 🔥 Upload Handler
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    try {
      setLoading(true);

      const jsonData = await parseFile(file);

      const res = await fetch("http://localhost:8000/api/upload-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file_name: file.name,
          data: jsonData
        })
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();

      console.log("Upload:", result);

      sendMessage(`File uploaded: ${file.name} ✅`);

    } catch (err: any) {
      console.error(err);
      sendMessage(err.message || "Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

      {/* FILE NAME */}
      {fileName && (
        <span style={{ fontSize: "12px", color: "#666" }}>
          📁 {fileName}
        </span>
      )}

      {/* FILE INPUT */}
      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleUpload}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      />

      {/* LOADING */}
      {loading && (
        <span style={{ fontSize: "12px", color: "#999" }}>
          Uploading & processing...
        </span>
      )}

    </div>
  );
}