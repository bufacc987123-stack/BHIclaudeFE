import Papa from "papaparse";
import * as XLSX from "xlsx";

export const useFileParser = () => {

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {

      const name = file.name.toLowerCase();

      if (name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (err) => reject(err),
        });
      }

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

      else {
        reject("Only CSV or Excel allowed");
      }
    });
  };

  return { parseFile };
};