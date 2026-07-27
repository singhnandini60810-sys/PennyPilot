import { useState } from "react";

interface Props {
  categories: string[];
  paymentMethods: string[];
}

export default function ExportFilters({
  categories,
  paymentMethods,
}: Props) {
  const [dateRange, setDateRange] = useState("all");

  return (
    <section className="export-card">

      <h2>Filters</h2>

      <div className="filter-group">

        <h3>Date Range</h3>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="export-select"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>

      </div>

      <div className="filter-group">

        <h3>Categories</h3>

        <div className="tag-container">

          {categories.map((category) => (

            <span
              key={category}
              className="tag"
            >
              {category}
            </span>

          ))}

        </div>

      </div>

      <div className="filter-group">

        <h3>Payment Methods</h3>

        <div className="tag-container">

          {paymentMethods.map((method) => (

            <span
              key={method}
              className="tag"
            >
              {method}
            </span>

          ))}

        </div>

      </div>

    </section>
  );
}