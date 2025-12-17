import { Stimulsoft } from "stimulsoft-reports-js/Scripts/stimulsoft.reports";

import ReactDOM from "react-dom/client";
import Plot from "react-plotly.js";

// Calculate nice numbers for axis ticks
function calculateNiceNumbers(min, max, numTicks = 8) {
    const range = max - min;
    if (range === 0) {
        return { min: min - 0.1, max: max + 0.1, step: 0.1 };
    }
    
    const roughStep = range / numTicks;
    const magnitude = Math.floor(Math.log10(roughStep));
    const magnitudePow = Math.pow(10, magnitude);
    const mantissa = roughStep / magnitudePow;
    let niceStep;

    if (mantissa <= 1.0) {
        niceStep = 1 * magnitudePow;
    } else if (mantissa <= 2.0) {
        niceStep = 2 * magnitudePow;
    } else if (mantissa <= 5.0) {
        niceStep = 5 * magnitudePow;
    } else {
        niceStep = 10 * magnitudePow;
    }

    const niceMin = Math.floor(min / niceStep) * niceStep;
    const niceMax = Math.ceil(max / niceStep) * niceStep;

    return {
        min: niceMin,
        max: niceMax,
        step: niceStep,
    };
}

async function captureLoadSensitivityChart({ data, layout }) {
    return new Promise((resolve) => {
        try {
            const tempDiv = document.createElement("div");
            tempDiv.style.cssText = `
                position:absolute;
                left:-99999px;
                top:-99999px;
                width:2400px;
                height:1600px;
                background:white;
                z-index:-1;
                border: 1px solid darkblue;
            `;
            document.body.appendChild(tempDiv);

            const root = ReactDOM.createRoot(tempDiv);

            root.render(
                <Plot
                    data={data}
                    layout={layout}
                    config={{
                        displayModeBar: false,
                        staticPlot: true
                    }}
                    useResizeHandler={false}
                />
            );

            // Wait for Plotly to render with retry mechanism
            let attempts = 0;
            const maxAttempts = 40;
            const checkInterval = setInterval(async () => {
                attempts++;
                try {
                    const plotlyDiv = tempDiv.querySelector('.js-plotly-plot');
                    if (!plotlyDiv) {
                        if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            root.unmount();
                            tempDiv.remove();
                            resolve("");
                        }
                        return;
                    }

                    // Try Plotly's toImage method
                    if (window.Plotly && plotlyDiv._fullLayout) {
                        clearInterval(checkInterval);
                        try {
                            const dataUrl = await window.Plotly.toImage(plotlyDiv, {
                                format: 'png',
                                width: 2400,
                                height: 1600,
                                scale: 1
                            });
                            
                            // Add border to the image
                            const img = new Image();
                            img.src = dataUrl;
                            img.onload = () => {
                                const canvas = document.createElement("canvas");
                                canvas.width = 2400;
                                canvas.height = 1600;
                                const ctx = canvas.getContext("2d");

                                ctx.fillStyle = "white";
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0);

                                // Draw border around the chart
                                ctx.strokeStyle = "darkblue";
                                ctx.lineWidth = 2;
                                ctx.strokeRect(0, 0, canvas.width, canvas.height);

                                const pngWithBorder = canvas.toDataURL("image/png");
                                root.unmount();
                                tempDiv.remove();
                                resolve(pngWithBorder);
                            };
                            img.onerror = () => {
                                root.unmount();
                                tempDiv.remove();
                                resolve("");
                            };
                        } catch (error) {
                            console.error("Plotly toImage error:", error);
                            root.unmount();
                            tempDiv.remove();
                            resolve("");
                        }
                    }
                } catch (error) {
                    if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        root.unmount();
                        tempDiv.remove();
                        resolve("");
                    }
                }
            }, 100);
        } catch (error) {
            resolve("");
        }
    });
}

export async function generateLoadSensitivitySection({
    report,
    LoadData,
    addPageHeader,
    addCommentsPage,
    selectedPrintSections,
    isCancelled,
    moldName = "",
    sessionName = ""
}) {

    // console.log(LoadData.Comment)

    if (!selectedPrintSections.LoadSensitivity ||
        !LoadData ||
        !LoadData.LoadGridData ||
        !Array.isArray(LoadData.LoadGridData[0]) ||
        LoadData.LoadGridData[0].length === 0) {
        return;
    }

    // -------------------------
    // RAW ROWS
    // -------------------------
    const rows = LoadData.LoadGridData[0];

    // -------------------------
    // REMOVE EMPTY ROWS
    // -------------------------
    const filteredRows = rows.filter(r =>
        r["Injection Speed"] !== "" &&
        r["Injection Speed"] !== undefined &&
        r["Injection Speed"] !== null
    );

    // -----------------------------------
    // HEADERS (fixed order)
    // -----------------------------------
    const headers = [
        "No",
        "Injection Speed",
        "Fill Time - In Mold (sec)",
        "Peak Press at Transfer - In Mold",
        "Fill Time - Air Shot (sec)",
        "Peak Press at Transfer - Air Shot",
        "Load Sensitivity"
    ];

    const colCount = headers.length;

    // ---------------------------
    // HELPER FUNCTIONS
    // ---------------------------
    const getCurrentDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // -----------------------------------
    // PAGE CREATOR (Portrait with scaling)
    // -----------------------------------
    const createPage = (customHeight = null) => {
        const p = new Stimulsoft.Report.Components.StiPage(report);
        p.orientation = Stimulsoft.Report.Components.StiPageOrientation.Portrait;
        
        const scaleFactor = 1.89;
        p.pageWidth = 16.54 * scaleFactor;
        p.pageHeight = customHeight != null ? customHeight : (11.69 * scaleFactor);
        p.margins = new Stimulsoft.Report.Components.StiMargins(
            0.3 * scaleFactor,
            0.3 * scaleFactor,
            0.3 * scaleFactor,
            0.3 * scaleFactor
        );
        report.pages.add(p);
        return p;
    };

    const page1 = createPage();

    const headerBand = addPageHeader(
        page1,
        "Equipment Qualification – Load Sensitivity",
        ""
    );

    // ---------------------------
    // DESCRIPTION TABLE
    // ---------------------------
    const infoTableBand = new Stimulsoft.Report.Components.StiDataBand();
    infoTableBand.height = 1.0;
    infoTableBand.top = headerBand.height + 0.3;
    page1.components.add(infoTableBand);

    const infoTable = new Stimulsoft.Report.Components.Table.StiTable();
    infoTable.left = 0.3;
    infoTable.width = page1.width - 0.6;
    infoTable.rowCount = 1;
    infoTable.columnCount = 3;
    infoTable.headerRowsCount = 0;

    for (let i = 0; i < 1 * 3; i++) {
        infoTable.components.add(
            new Stimulsoft.Report.Components.Table.StiTableCell()
        );
    }

    const infoData = [
        { label: "Date", value: String(getCurrentDate() || "") },
        { label: "Session Name", value: String(sessionName || "Default Session") },
        { label: "Mold No", value: String(moldName || "Sample Mold") },
    ];

    const infoCellWidth = (page1.width - 0.6) / 3;
    const infoCellHeight = 0.5;

    for (let c = 0; c < 3; c++) {
        const cell = infoTable.components.getByIndex(c);
        const dataItem = infoData[c];

        cell.left = c * infoCellWidth;
        cell.top = 0;
        cell.width = infoCellWidth;
        cell.height = infoCellHeight;

        try {
            cell.font = new Stimulsoft.System.Drawing.Font(
                String("Verdana"),
                6,
                Stimulsoft.System.Drawing.FontStyle.Regular
            );
        } catch (e) {
            cell.font = new Stimulsoft.System.Drawing.Font(
                "Arial",
                6,
                Stimulsoft.System.Drawing.FontStyle.Regular
            );
        }

        cell.wordWrap = true;
        cell.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Left;

        if (dataItem) {
            const labelValue = dataItem.label;
            const value = dataItem.value;
            cell.text = (labelValue != null ? String(labelValue) : "") + ": " + (value != null ? String(value) : "");
            cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                Stimulsoft.System.Drawing.Color.black
            );
        } else {
            cell.text = "";
        }

        cell.border = new Stimulsoft.Base.Drawing.StiBorder(
            Stimulsoft.Base.Drawing.StiBorderSides.All,
            Stimulsoft.System.Drawing.Color.black,
            0.5
        );
    }

    infoTable.height = infoCellHeight;
    infoTableBand.height = infoCellHeight;
    infoTableBand.components.add(infoTable);

    // Calculate positions cumulatively from top
    let currentTop = headerBand.height + 0.3; // Start after header
    currentTop += infoTableBand.height; // Add description table height
    
    // Spacing between Desc Table and Panels
    const spacingAfterDesc = 0.5;
    // Add explicit spacer band for spacing
    const spacer1 = new Stimulsoft.Report.Components.StiDataBand();
    spacer1.height = spacingAfterDesc;
    spacer1.top = currentTop;
    page1.components.add(spacer1);
    currentTop += spacingAfterDesc;
    
    const panelStartTop = currentTop;

    // Calculate panel dimensions for side-by-side layout
    const tablePanelWidth = (page1.width - 1.0) * 0.58; // Increased from 0.48 to 0.58 for more table space
    const chartPanelWidth = (page1.width - 1.0) * 0.40; // Decreased from 0.48 to 0.40 for chart
    const maxAvailableHeight = page1.pageHeight - (page1.margins.top + page1.margins.bottom) - panelStartTop - 0.3;

    // -----------------------------------
    // COLUMN WIDTHS
    // -----------------------------------
    // FIXED TOTAL WIDTH (inside panel)
    const totalWidth = tablePanelWidth - 0.3;

    // COLUMN WIDTHS (100% EXACT)
    const columnWidths = [
        totalWidth * 0.07,  // No
        totalWidth * 0.12,  // Injection Speed
        totalWidth * 0.17,  // Fill Time - Mold
        totalWidth * 0.17,  // Peak Press - Mold
        totalWidth * 0.17,  // Fill Time - Air
        totalWidth * 0.17,  // Peak Press - Air
        totalWidth * 0.13   // Load Sensitivity
    ];
    // SUM = 0.07+0.12+0.17+0.17+0.17+0.17+0.13 = 1.00 EXACTLY ✔

    const headerRowHeight = 1.2;
    const dataRowHeight = 0.45;

    // Calculate table height
    const totalRows = filteredRows.length;
    const tableHeight = headerRowHeight + (totalRows * dataRowHeight);
    
    // Calculate panel height to fit table
    const minContentHeight = 10;
    const actualContentHeight = Math.max(tableHeight + 0.3, minContentHeight);

    // Create left panel for table
    const leftPanel = new Stimulsoft.Report.Components.StiPanel();
    leftPanel.left = 0.3;
    leftPanel.top = panelStartTop;
    leftPanel.width = tablePanelWidth;
    leftPanel.height = actualContentHeight;
    page1.components.add(leftPanel);

    // Create right panel for chart (shifted further right)
    const rightPanel = new Stimulsoft.Report.Components.StiPanel();
    rightPanel.left = leftPanel.left + leftPanel.width + 0.3; // Reduced spacing from 0.4 to 0.3
    rightPanel.top = panelStartTop;
    rightPanel.width = chartPanelWidth;
    rightPanel.height = actualContentHeight;
    page1.components.add(rightPanel);

    // -----------------------------------
    // DATA TABLE IN LEFT PANEL
    // -----------------------------------
    const rowCount = totalRows + 1; // + header

    const table = new Stimulsoft.Report.Components.Table.StiTable();
    table.left = 0.15;
    table.top = 0.1;
    table.width = totalWidth;
    table.columnCount = colCount;
    table.rowCount = rowCount;
    table.headerRowsCount = 1;

    // Create cells
    for (let i = 0; i < rowCount * colCount; i++) {
        table.components.add(
            new Stimulsoft.Report.Components.Table.StiTableCell()
        );
    }

    // Calculate cell positions
    const columnLefts = [0];
    for (let i = 1; i < colCount; i++) {
        columnLefts[i] = columnLefts[i - 1] + columnWidths[i - 1];
    }
    
    const rowTops = [0];
    for (let row = 1; row <= totalRows; row++) {
        if (row === 1) rowTops[row] = headerRowHeight;
        else rowTops[row] = rowTops[row - 1] + dataRowHeight;
    }

    // Populate table
    for (let r = 0; r < rowCount; r++) {
        const isHeader = r === 0;

        for (let c = 0; c < colCount; c++) {
            const cell = table.components.getByIndex(r * colCount + c);
            cell.wordWrap = true;

            // ---------------- HEADER ----------------
            if (isHeader) {
                const unitSuffix =
                    LoadData.Pressure_Units === "psi" ? "%/Kpsi" : "";

                cell.text = c === 6 ? "Load Sensitivity" + unitSuffix : headers[c];

                cell.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Center;
                cell.font = new Stimulsoft.System.Drawing.Font(
                    "Verdana",
                    8,
                    Stimulsoft.System.Drawing.FontStyle.Bold
                );
                cell.brush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                    Stimulsoft.System.Drawing.Color.fromArgb(28, 148, 210)
                );
                cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                    Stimulsoft.System.Drawing.Color.white
                );
                cell.height = headerRowHeight;
            }
            // ---------------- DATA ----------------
            else {
                const row = filteredRows[r - 1];

                const colValues = [
                    r, // Row number (1-indexed)
                    row["Injection Speed"],
                    row["Fill Time - In Mold (sec)"],
                    row["Peak Press at Transfer - In Mold"],
                    row["Fill Time - Air Shot (sec)"],
                    row["Peak Press at Transfer - Air Shot"],
                    row["Load Sensitivity"]
                ];

                cell.text = colValues[c] != null ? colValues[c].toString() : "";
                cell.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Center;
                cell.font = new Stimulsoft.System.Drawing.Font(
                    "Verdana",
                    8,  // Increased from 6 to 8
                    Stimulsoft.System.Drawing.FontStyle.Regular
                );
                cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                    Stimulsoft.System.Drawing.Color.black
                );
                cell.brush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                    Stimulsoft.System.Drawing.Color.white
                );
                cell.height = dataRowHeight;
            }

            // Border
            cell.border = new Stimulsoft.Base.Drawing.StiBorder(
                Stimulsoft.Base.Drawing.StiBorderSides.All,
                Stimulsoft.System.Drawing.Color.black,
                1
            );

            // Width and position
            cell.width = columnWidths[c];
            cell.minWidth = columnWidths[c];
            cell.maxWidth = columnWidths[c];
            cell.left = columnLefts[c];
            cell.top = rowTops[r];
        }
    }

    table.height = tableHeight;

    // Add table to left panel
    const tableBand = new Stimulsoft.Report.Components.StiDataBand();
    tableBand.height = actualContentHeight;
    leftPanel.components.add(tableBand);
    tableBand.components.add(table);

    // Calculate nice numbers for Y-axis from actual Load Sensitivity data
    let loadNiceNumbers = LoadData.LoadNiceNumbers;
    if (LoadData.InjSpeedArray && LoadData.InjSpeedArray.length > 0) {
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        LoadData.InjSpeedArray.forEach(item => {
            const value = parseFloat(item["Load Sensitivity"]);
            if (!isNaN(value)) {
                minValue = Math.min(minValue, value);
                maxValue = Math.max(maxValue, value);
            }
        });
        
        // If we have valid data, recalculate nice numbers
        if (minValue !== Infinity && maxValue !== -Infinity) {
            // Check if existing nice numbers have too small interval (less than 0.5)
            const existingStep = LoadData.LoadNiceNumbers?.step || 0;
            if (existingStep < 0.5 || !LoadData.LoadNiceNumbers) {
                loadNiceNumbers = calculateNiceNumbers(minValue, maxValue, 8);
            } else {
                // Use existing nice numbers but ensure they encompass the data
                const existingMin = LoadData.LoadNiceNumbers.min || minValue;
                const existingMax = LoadData.LoadNiceNumbers.max || maxValue;
                if (existingMin > minValue || existingMax < maxValue) {
                    loadNiceNumbers = calculateNiceNumbers(minValue, maxValue, 8);
                } else {
                    loadNiceNumbers = LoadData.LoadNiceNumbers;
                }
            }
        }
    }
    
    // Fallback if no data or calculation failed
    if (!loadNiceNumbers || !loadNiceNumbers.step) {
        loadNiceNumbers = { min: 0, max: 10, step: 1 };
    }

    // ---------------------------
    // CHART IN RIGHT PANEL
    // ---------------------------
    // Prepare Plotly chart data
    const chartData = LoadData.InjSpeedArray || [];
    const xValues = chartData.map(item => parseFloat(item["Injection Speed"]) || 0);
    const yValues = chartData.map(item => parseFloat(item["Load Sensitivity"]) || 0);

    const plotlyData = [{
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Load Sensitivity',
        line: {
            color: 'orange',
            width: 8  // Thick line
        },
        marker: {
            size: 20,
            color: 'orange'
        },
        showlegend: false
    }];

    const plotlyLayout = {
        title: {
            text: 'Load Sensitivity',
            font: {
                size: 80,  // Big chart title
                family: 'Verdana',
                color: '#111'
            }
        },
        width: 2400,
        height: 1600,
        xaxis: {
            title: {
                text: 'Injection Speed',
                font: {
                    size: 70,  // Big axis title
                    family: 'Verdana',
                    color: '#111'
                }
            },
            range: [
                LoadData.InjectionniceNumbers?.min || 0,
                LoadData.InjectionniceNumbers?.max || 80
            ],
            dtick: LoadData.InjectionniceNumbers?.step || 20,
            showline: true,
            linewidth: 3,
            linecolor: '#111',
            mirror: true,
            tickfont: {
                size: 56,  // Big tick size
                family: 'Verdana',
                color: '#111'
            },
            tickwidth: 3,
            tickcolor: '#111',
            gridcolor: '#c7c7c7',
            gridwidth: 2,
            showgrid: true,
            automargin: true
        },
        yaxis: {
            title: {
                text: 'Load Sensitivity',
                font: {
                    size: 70,  // Big axis title
                    family: 'Verdana',
                    color: '#111'
                }
            },
            range: [loadNiceNumbers.min, loadNiceNumbers.max],
            dtick: loadNiceNumbers.step,
            showline: true,
            linewidth: 3,
            linecolor: '#111',
            mirror: true,
            tickfont: {
                size: 56,  // Big tick size
                family: 'Verdana',
                color: '#111'
            },
            tickwidth: 3,
            tickcolor: '#111',
            gridcolor: '#c7c7c7',
            gridwidth: 2,
            showgrid: true,
            automargin: true
        },
        plot_bgcolor: 'white',
        paper_bgcolor: 'white',
        margin: { t: 200, r: 100, b: 280, l: 280 },
        showlegend: false,
        autosize: false
    };

    // Capture PNG
    const loadChartPng = await captureLoadSensitivityChart({
        data: plotlyData,
        layout: plotlyLayout
    });

    if (!isCancelled && loadChartPng) {
        const chartImg = new Stimulsoft.Report.Components.StiImage();
        chartImg.left = 0.15;
        chartImg.top = 0.15;
        chartImg.width = rightPanel.width - 0.3;
        chartImg.height = rightPanel.height - 0.3;
        chartImg.stretch = true;
        chartImg.aspectRatio = true;
        chartImg.imageData = loadChartPng.replace(/^data:image\/png;base64,/, "");

        const chartBand = new Stimulsoft.Report.Components.StiDataBand();
        chartBand.height = rightPanel.height;
        rightPanel.components.add(chartBand);
        chartBand.components.add(chartImg);
    }

    // Calculate total content height and adjust page height to fit
    const totalContentHeight =
        page1.margins.top +
        headerBand.height +
        0.3 + // spacing after header
        infoTableBand.height +
        spacingAfterDesc + // spacing below description table
        actualContentHeight + // Main table and chart panels
        page1.margins.bottom +
        0.3; // bottom spacing

    // Update page height to fit content (with some buffer)
    const scaleFactor = 1.89;
    const calculatedPageHeight = totalContentHeight + 0.5; // Add small buffer
    page1.pageHeight = Math.min(calculatedPageHeight, 11.69 * scaleFactor); // Don't exceed original max

    // -----------------------------------
    // COMMENTS PAGE (only if comments exist)
    // -----------------------------------
    const commentText = LoadData.Comment || "";
    const hasComments = commentText &&
        typeof commentText === 'string' &&
        commentText.trim() !== '' &&
        commentText.trim() !== 'N/A' &&
        commentText.trim() !== 'null' &&
        commentText.trim() !== 'undefined';

    if (hasComments) {
        addCommentsPage(
            report,
            "Equipment Qualification – Load Sensitivity",
            "Comments",
            `${commentText}`
        );
    }
}
