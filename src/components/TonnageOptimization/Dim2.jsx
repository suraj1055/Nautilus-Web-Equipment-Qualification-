import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  Category,
  Tooltip
} from "@syncfusion/ej2-react-charts";

const EMPTY_ROW = {
  tonnage: "",
  s1: "",
  s2: "",
  s3: "",
  avg: "",
  inc: "",
  perc: ""
};

const Dim2 = ({ sessionId }) => {
  const storageKey = sessionId ? `dim2Data_${sessionId}` : "dim2Data";
  
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved
      ? JSON.parse(saved)
      : Array.from({ length: 10 }, () => ({ ...EMPTY_ROW }));
  });

  const [showChart, setShowChart] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(rows));
  }, [rows, storageKey]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    const s1 = parseFloat(updated[index].s1) || 0;
    const s2 = parseFloat(updated[index].s2) || 0;
    const s3 = parseFloat(updated[index].s3) || 0;

    if (s1 || s2 || s3) {
      const avg = ((s1 + s2 + s3) / 3).toFixed(2);
      updated[index].avg = avg;

      if (index > 0 && updated[index - 1].avg) {
        const prev = parseFloat(updated[index - 1].avg);
        const inc = avg - prev;
        updated[index].inc = inc.toFixed(2);
        updated[index].perc = ((inc / prev) * 100).toFixed(2);
      }
    }

    setRows(updated);
  };

  const chartData = useMemo(() => {
    return rows
      .filter(r => r.tonnage && r.avg)
      .map(r => ({
        tonnage: Number(r.tonnage),
        avgDim2: Number(r.avg)
      }))
      .sort((a, b) => b.tonnage - a.tonnage);
  }, [rows]);

  return (
    <div className="study-container">
      <div className="study-table">
        <table>
          <thead>
            <tr>
              <th>Tonnage</th>
              <th>Sample 1</th>
              <th>Sample 2</th>
              <th>Sample 3</th>
              <th className="gray">Avg Dim2</th>
              <th className="gray">Actual Increase</th>
              <th className="gray">% Increase</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {["tonnage", "s1", "s2", "s3"].map(field => (
                  <td key={field}>
                    <input
                      value={row[field]}
                      onChange={e =>
                        handleChange(i, field, e.target.value)
                      }
                    />
                  </td>
                ))}
                <td className="gray">{row.avg}</td>
                <td className="gray">{row.inc}</td>
                <td className="gray">{row.perc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="study-chart">
        <div className="chart-title">
          <span>Tonnage Dim2 Chart</span>
          <button onClick={() => window.print()}>Print</button>
        </div>

        <div className="chart-box">
          {showChart && chartData.length > 0 && (
            <ChartComponent
              ref={chartRef}
              primaryXAxis={{
                title: "Tonnage",
                valueType: "Category"
              }}
              primaryYAxis={{
                title: "Avg Dim2"
              }}
              tooltip={{ enable: true }}
              height="100%"
            >
              <Inject services={[LineSeries, Category, Tooltip]} />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={chartData}
                  xName="tonnage"
                  yName="avgDim2"
                  type="Line"
                  marker={{ visible: true }}
                  width={2}
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          )}
        </div>
      </div>

      <div className="study-footer">
        <button onClick={() => setShowChart(true)}>
          Calculate & Show Graph
        </button>
        <button onClick={() => alert("Dim2 data saved")}>Save</button>
        <button onClick={() => setShowChart(false)}>Close</button>
      </div>
    </div>
  );
};

export default Dim2;
