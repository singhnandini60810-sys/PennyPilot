import {
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react";

import { useContext } from "react";

import { ExpenseContext } from "../context/ExpenseContext";

import {
  exportCSV,
  exportExcel,
  exportPDF,
} from "../services/exportService";

import "../components/export/export.css";

export default function ExportPage() {
  const expenseContext =
    useContext(ExpenseContext);

  if (!expenseContext) return null;

  const { expenses } = expenseContext;

  return (
    <section className="export-page">
      <h1>Export Center</h1>

      <p>
        Download all your expenses in different
        formats.
      </p>

      <div className="export-grid">
        <button
          onClick={() => exportCSV(expenses)}
        >
          <FileText size={26} />
          Export CSV
        </button>

        <button
          onClick={() => exportExcel(expenses)}
        >
          <FileSpreadsheet size={26} />
          Export Excel
        </button>

        <button
          onClick={() => exportPDF(expenses)}
        >
          <FileType size={26} />
          Export PDF
        </button>
      </div>

      <div className="export-total">
        <Download />

        <span>
          {expenses.length} expenses ready to export
        </span>
      </div>
    </section>
  );
}