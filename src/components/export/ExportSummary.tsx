import { FileSpreadsheet } from "lucide-react";
import type { ExportFormatType } from "../../pages/ExportPage";

interface Props {
  totalRecords: number;
  totalCategories: number;
  format: ExportFormatType;
}

export default function ExportSummary({
  totalRecords,
  totalCategories,
  format,
}: Props) {
  return (
    <section className="export-hero">

      <div>

        <h1>Export Center</h1>

        <p>
          Generate professional reports from your expense history.
        </p>

      </div>

      <div className="hero-icon">

        <FileSpreadsheet size={48} />

      </div>

      <div className="summary-grid">

        <div className="summary-card">
          <span>Records</span>
          <strong>{totalRecords}</strong>
        </div>

        <div className="summary-card">
          <span>Categories</span>
          <strong>{totalCategories}</strong>
        </div>

        <div className="summary-card">
          <span>Format</span>
          <strong>{format.toUpperCase()}</strong>
        </div>

      </div>

    </section>
  );
}