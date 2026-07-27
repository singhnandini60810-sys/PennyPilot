import {
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react";

import type { ExportFormatType } from "../../pages/ExportPage";

interface Props {
  format: ExportFormatType;
  setFormat: (format: ExportFormatType) => void;
}

export default function ExportFormat({
  format,
  setFormat,
}: Props) {
  return (
    <section className="export-card">

      <h2>Export Format</h2>

      <div className="format-grid">

        <button
          className={`format-card ${
            format === "pdf" ? "active" : ""
          }`}
          onClick={() => setFormat("pdf")}
        >
          <FileText size={34} />
          <strong>PDF</strong>
          <small>Professional report</small>
        </button>

        <button
          className={`format-card ${
            format === "excel" ? "active" : ""
          }`}
          onClick={() => setFormat("excel")}
        >
          <FileSpreadsheet size={34} />
          <strong>Excel</strong>
          <small>Spreadsheet</small>
        </button>

        <button
          className={`format-card ${
            format === "csv" ? "active" : ""
          }`}
          onClick={() => setFormat("csv")}
        >
          <FileType size={34} />
          <strong>CSV</strong>
          <small>Simple data</small>
        </button>

      </div>

    </section>
  );
}