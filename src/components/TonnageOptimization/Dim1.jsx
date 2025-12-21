import React, { useState, useMemo, useEffect } from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  Category,
  DataLabel,
  StripLine,
  Legend,
  Tooltip
} from "@syncfusion/ej2-react-charts";
import Dim1Grid from "./Dim1Grid";

/* ---------- COMPONENT ---------- */

const Dim1 = ({ sessionId }) => {
  const storageKey = sessionId ? `dim1Data_${sessionId}` : "dim1Data";

  // Convert data format: 2D array [tonnage, s1, s2, s3, avg, inc, perc]
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If old format (array of objects), convert to 2D array
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].tonnage !== undefined) {
          return parsed.map(row => [
            row.tonnage || "",
            row.s1 || "",
            row.s2 || "",
            row.s3 || "",
            row.avg || "",
            row.inc || "",
            row.perc || ""
          ]);
        }
        // If already 2D array, return as is
        return parsed;
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }
    return Array.from({ length: 10 }, () => Array(7).fill(""));
  });

  const [rowToBeDeleted, setRowToBeDeleted] = useState();
  const [ToPlotChart, setToPlotChart] = useState(true);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  /* ---------- CALCULATION ---------- */

  const recalcRow = (dataArray, index) => {
    const s1 = parseFloat(dataArray[index][1]) || 0;
    const s2 = parseFloat(dataArray[index][2]) || 0;
    const s3 = parseFloat(dataArray[index][3]) || 0;

    if (s1 || s2 || s3) {
      const avg = ((s1 + s2 + s3) / 3).toFixed(2);
      dataArray[index][4] = avg;

      if (index > 0 && dataArray[index - 1][4]) {
        const prev = parseFloat(dataArray[index - 1][4]);
        const inc = avg - prev;
        dataArray[index][5] = inc.toFixed(2);
        dataArray[index][6] = ((inc / prev) * 100).toFixed(2);
      } else {
        dataArray[index][5] = "";
        dataArray[index][6] = "";
      }
    } else {
      dataArray[index][4] = "";
      dataArray[index][5] = "";
      dataArray[index][6] = "";
    }
  };

  /* ---------- GET DATA FROM GRID ---------- */

  const getData = () => {
    const gridElement = document.querySelector("#Dim1_Sheet");
    if (!gridElement) {
      return;
    }

    const tdElements = document.querySelectorAll("#Dim1_Sheet .e-cell");
    
    // Create a temporary array to hold the grid data
    const gridData = [];
    let currentRow = [];
    
    tdElements.forEach((td, index) => {
      const colIndex = index % 7;
      const cellValue = td.textContent.trim();
      
      if (colIndex === 0) {
        // Start a new row
        if (currentRow.length > 0) {
          gridData.push(currentRow);
        }
        currentRow = [cellValue || ""];
      } else {
        currentRow.push(cellValue || "");
      }
    });
    
    // Push the last row
    if (currentRow.length > 0) {
      gridData.push(currentRow);
    }

    // Ensure all rows have 7 columns
    const updatedData = gridData.map(row => {
      while (row.length < 7) {
        row.push("");
      }
      return row.slice(0, 7);
    });

    // Recalculate all rows
    updatedData.forEach((row, index) => {
      if (row[1] || row[2] || row[3]) {
        recalcRow(updatedData, index);
      }
    });

    setData(updatedData);
  };

  /* ---------- CHART DATA ---------- */

  const chartData = useMemo(() => {
    return data
      .filter(row => row[0] && row[4] && !isNaN(parseFloat(row[0])) && !isNaN(parseFloat(row[4])))
      .map(row => ({
        tonnage: Number(row[0]),
        avgDim1: Number(row[4])
      }))
      .sort((a, b) => a.tonnage - b.tonnage);
  }, [data]);

  /* ---------- BUTTON ACTIONS ---------- */

  const handleCalculate = () => {
    getData();
    setShowChart(true);
  };

  const handleSave = () => {
    getData();
    alert("Dim1 data saved successfully");
  };

  const handleClose = () => {
    setShowChart(false);
  };

  const handlePrint = () => {
    window.print();
  };

  /* ---------- UI (Matching Image Layout) ---------- */

  return (
    <div className="card equipmentDash p-3 ml-2" style={{ backgroundColor: "#e4eae1" }}>
      <div className="b-primary b-r-4 mb-2">
        <section className="m-1">
          <div className="d-flex">
            {/* LEFT SIDE: Grid Table */}
            <div
              className="mt-2 mb-2 ml-2 mr-2"
                style={{
    width: "55%",
    maxWidth: "55%",
  }}
            >
              <div onClick={() => setToPlotChart(false)}>
                <Dim1Grid 
                  data={data} 
                  setData={setData} 
                  getData={getData}
                  setRowToBeDeleted={setRowToBeDeleted}
                />
              </div>
            </div>

            {/* RIGHT SIDE: Chart */}
            <div
              className="mt-2 mb-2 mr-2"
               style={{
    width: "45%",
    maxWidth: "45%",
  }}
            >
              {/* Chart Title and Print Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: "#5F6660",
                  color: "#ffffff",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "600" }}>
                  Tonnage Dim1 Chart
                </span>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#1E5D8C",
                    border: "1px solid #164A70",
                    color: "#ffffff",
                    padding: "4px 10px",
                    fontSize: "12px",
                  }}
                  onClick={handlePrint}
                >
                  Print
                </button>
              </div>

              {/* Chart Container */}
              <div
                style={{
                  border: "1px solid #ccc",
                  backgroundColor: "#ffffff",
                  padding: "8px",
                  minHeight: "400px",
                }}
              >
                {showChart && chartData.length > 0 ? (
                  <ChartComponent
                    className="equipmentChart"
                    width="50%"
                    height="400"
                    border={{ width: 1, color: "darkblue" }}
                    tooltip={{ enable: true }}
                    primaryXAxis={{
                      title: "Tonnage",
                      lineStyle: { color: "black" },
                      labelStyle: { color: "#000" },
                    }}
                    primaryYAxis={{
                      title: "Avg Dim1",
                      lineStyle: { color: "black" },
                      labelStyle: { color: "#000" },
                    }}
                  >
                    <Inject
                      services={[
                        LineSeries,
                        Category,
                        DataLabel,
                        StripLine,
                        Legend,
                        Tooltip,
                      ]}
                    />

                    <SeriesCollectionDirective>
                      <SeriesDirective
                        dataSource={chartData}
                        type="Line"
                        xName="tonnage"
                        yName="avgDim1"
                        marker={{ visible: true }}
                        fill="orange"
                        width={2.5}
                        name="Avg Dim1"
                      ></SeriesDirective>
                    </SeriesCollectionDirective>
                  </ChartComponent>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "400px",
                      color: "#666",
                    }}
                  >
                    Click "Calculate & Show Graph" to display chart
                  </div>
                )}
              </div>

              {/* Buttons Below Chart */}
             {/* ACTION BUTTONS – BELOW CHART (LEFT ALIGNED) */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    gap: "10px",
    marginTop: "10px",
    padding: "10px",
    borderTop: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
  }}
>
  <button
    className="btn btn-primary btn-air-primary"
    onClick={handleCalculate}
  >
    Calculate & Show Graph
  </button>

  <button
    className="btn btn-secondary btn-air-secondary"
    onClick={handleSave}
  >
    Save
  </button>

  <button
    className="btn btn-secondary btn-air-secondary"
    onClick={handlePrint}
  >
    Print
  </button>

  <button
    className="btn btn-secondary btn-air-secondary"
    onClick={handleClose}
  >
    Close
  </button>
</div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dim1;

