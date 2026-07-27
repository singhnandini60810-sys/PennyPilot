import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportExpense {
  title: any;
  category: any;
  amount: any;
  payment_method: any;
  date: any;
  notes?: any;
}

function fileName(ext: string) {
  const today = new Date().toISOString().split("T")[0];
  return `PennyPilot_Report_${today}.${ext}`;
}

export function exportCSV(expenses: ExportExpense[]) {
  const worksheet = XLSX.utils.json_to_sheet(expenses);

  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, fileName("csv"));
}

export function exportExcel(
  expenses: ExportExpense[],
) {
  const worksheet = XLSX.utils.json_to_sheet(expenses);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Expenses"
  );

  XLSX.writeFile(workbook, fileName("xlsx"));
}

export function exportPDF(
  expenses: ExportExpense[],
) {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("PennyPilot Expense Report", 14, 18);

  pdf.setFontSize(10);
  pdf.text(
    `Generated on ${new Date().toLocaleString()}`,
    14,
    28
  );

  autoTable(pdf, {
    startY: 36,
    head: [
      [
        "Title",
        "Category",
        "Amount",
        "Payment",
        "Date",
        "Notes",
      ],
    ],
    body: expenses.map((e) => [
      e.title,
      e.category,
      e.amount,
      e.payment_method,
      e.date,
      e.notes,
    ]),
  });

  pdf.save(fileName("pdf"));
}