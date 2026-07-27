import { useContext, useMemo, useState } from "react";
import { ExpenseContext } from "../context/ExpenseContext";

import ExportSummary from "../components/export/ExportSummary";
import ExportContents from "../components/export/ExportContents";
import ExportFilters from "../components/export/ExportFilters";
import ExportFormat from "../components/export/ExportFormat";
import ReportPreview from "../components/export/ReportPreview";

import {
  exportCSV,
  exportExcel,
  exportPDF,
} from "../services/exportService";

import "../components/export/export.css";

export type ExportFormatType = "pdf" | "excel" | "csv";

export interface ExportColumns {
  title: boolean;
  category: boolean;
  amount: boolean;
  payment: boolean;
  date: boolean;
  notes: boolean;
}

export default function ExportPage() {
  const expenseContext = useContext(ExpenseContext);

  if (!expenseContext) {
    throw new Error("ExportPage must be used inside ExpenseProvider.");
  }

  const { expenses } = expenseContext;

  const [format, setFormat] =
    useState<ExportFormatType>("pdf");

  const [columns, setColumns] =
    useState<ExportColumns>({
      title: true,
      category: true,
      amount: true,
      payment: true,
      date: true,
      notes: true,
    });

  const categories = useMemo(
    () =>
      [...new Set(expenses.map((expense) => expense.category))]
        .filter(Boolean)
        .sort(),
    [expenses]
  );

  const paymentMethods = useMemo(
    () =>
      [
        ...new Set(
          expenses.map((expense) => expense.payment_method)
        ),
      ]
        .filter(Boolean)
        .sort(),
    [expenses]
  );

  const handleExport = () => {
    const exportData = expenses.map((expense) => {
      const row: any = {};

      if (columns.title) row.title = expense.title;
      if (columns.category) row.category = expense.category;
      if (columns.amount) row.amount = expense.amount;
      if (columns.payment)
        row.payment_method = expense.payment_method;
      if (columns.date) row.date = expense.date;
      if (columns.notes)
        row.notes = expense.notes ?? "";

      return row;
    });

    switch (format) {
      case "csv":
        exportCSV(exportData);
        break;

      case "excel":
        exportExcel(exportData);
        break;

      case "pdf":
        exportPDF(exportData);
        break;
    }
  };

  return (
    <main className="export-page">
      <div className="export-background-decoration export-decoration-one" />
      <div className="export-background-decoration export-decoration-two" />
      <div className="export-background-decoration export-decoration-three" />

      <div className="export-page-content">
        <ExportSummary
          totalRecords={expenses.length}
          totalCategories={categories.length}
          format={format}
        />

        <ExportContents
          columns={columns}
          setColumns={setColumns}
        />

        <ExportFilters
          categories={categories}
          paymentMethods={paymentMethods}
        />

        <ExportFormat
          format={format}
          setFormat={setFormat}
        />

        <ReportPreview
          expenses={expenses}
          columns={columns}
          format={format}
          onDownload={handleExport}
        />
      </div>
    </main>
  );
}