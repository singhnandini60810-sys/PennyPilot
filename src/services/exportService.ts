import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportExpense {
  title: string;
  category: string;
  amount: number;
  payment_method: string;
  date: string;
  notes?: string;
}

const FILE_NAME = "PennyPilot-Expenses";

export function exportCSV(expenses: ExportExpense[]) {
  const worksheet = XLSX.utils.json_to_sheet(expenses);

  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, `${FILE_NAME}.csv`);
}

export function exportExcel(expenses: ExportExpense[]) {
  const worksheet = XLSX.utils.json_to_sheet(expenses);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Expenses",
  );

  XLSX.writeFile(workbook, `${FILE_NAME}.xlsx`);
}

export function exportPDF(expenses: ExportExpense[]) {
  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.text("PennyPilot Expense Report", 14, 20);

  pdf.setFontSize(11);

  pdf.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    14,
    30,
  );

  autoTable(pdf, {
    startY: 40,

    head: [
      [
        "Title",
        "Category",
        "Amount",
        "Payment",
        "Date",
      ],
    ],

    body: expenses.map((expense) => [
      expense.title,
      expense.category,
      `₹${expense.amount}`,
      expense.payment_method,
      expense.date,
    ]),
  });

  pdf.save(`${FILE_NAME}.pdf`);
}