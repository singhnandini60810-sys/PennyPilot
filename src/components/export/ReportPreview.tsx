import {
  Download,
  Eye,
} from "lucide-react";

import type {
  ExportColumns,
  ExportFormatType,
} from "../../pages/ExportPage";

interface Props {
  expenses: any[];
  columns: ExportColumns;
  format: ExportFormatType;
}

export default function ReportPreview({
  expenses,
  columns,
  format,
}: Props) {
  const selectedColumns = Object.values(columns).filter(Boolean).length;

  return (
    <section className="export-card">

      <h2>Report Preview</h2>

      <div className="preview-grid">

        <div className="preview-item">
          <Eye size={22} />
          <div>
            <span>Records</span>
            <strong>{expenses.length}</strong>
          </div>
        </div>

        <div className="preview-item">
          <Eye size={22} />
          <div>
            <span>Columns</span>
            <strong>{selectedColumns}</strong>
          </div>
        </div>

        <div className="preview-item">
          <Eye size={22} />
          <div>
            <span>Format</span>
            <strong>{format.toUpperCase()}</strong>
          </div>
        </div>

      </div>

      <button className="download-button">

        <Download size={20} />

        Download Report

      </button>

    </section>
  );
}