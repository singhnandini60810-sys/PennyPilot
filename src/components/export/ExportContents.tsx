import type { ExportColumns } from "../../pages/ExportPage";

interface Props {
  columns: ExportColumns;
  setColumns: React.Dispatch<React.SetStateAction<ExportColumns>>;
}

const options = [
  {
    key: "title",
    label: "Expense Title",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "amount",
    label: "Amount",
  },
  {
    key: "payment",
    label: "Payment Method",
  },
  {
    key: "date",
    label: "Date",
  },
  {
    key: "notes",
    label: "Notes",
  },
] as const;

export default function ExportContents({
  columns,
  setColumns,
}: Props) {
  return (
    <section className="export-card">

      <h2>What to Include</h2>

      <p className="section-description">
        Choose which information should appear in your exported report.
      </p>

      <div className="checkbox-grid">

        {options.map((item) => (

          <label
            key={item.key}
            className="checkbox-card"
          >

            <input
              type="checkbox"
              checked={columns[item.key]}
              onChange={() =>
                setColumns((prev) => ({
                  ...prev,
                  [item.key]: !prev[item.key],
                }))
              }
            />

            <span>{item.label}</span>

          </label>

        ))}

      </div>

    </section>
  );
}