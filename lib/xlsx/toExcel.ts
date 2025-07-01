import xlsx from "json-as-xlsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function downloadFile(sheetName: string, columns: any[], content: any[]) {
  const data = [
    {
      sheet: sheetName,
      columns: columns,
      content: content,
    },
  ];

  const settings = {
    fileName: sheetName,
  };
  return xlsx(data, settings);
}
