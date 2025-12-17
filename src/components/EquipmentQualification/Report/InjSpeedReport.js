import { Stimulsoft } from "stimulsoft-reports-js/Scripts/stimulsoft.reports";

import ReactDOM from "react-dom/client";
import Plot from "react-plotly.js";

async function captureInjSpeedChart({ data, layout }) {
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

export async function generateInjectionSpeedSection({
    report,
    InjectionData,
    addPageHeader,
    addCommentsPage,
    selectedPrintSections,
    isCancelled,
    moldName = "",
    sessionName = ""
}) {

    // console.log(InjectionData.Comment)

    if (!selectedPrintSections.InjSpeed ||
        !InjectionData.InjSpeedGridData ||
        !Array.isArray(InjectionData.InjSpeedGridData) ||
        InjectionData.InjSpeedGridData.length === 0)
        return;

    const data = InjectionData.InjSpeedGridData;

    // ---------------------------
    // FILTER OUT EMPTY ROWS
    // ---------------------------
    // Helper function to check if a value is meaningful
    const hasValue = (val) => {
        if (val === null || val === undefined || val === "") return false;
        const str = String(val).trim();
        if (str === "--" || str === "-") return false;
        const num = parseFloat(str);
        return !isNaN(num);
    };

    // Filter out rows that don't have a valid Injection Speed value
    const filtered = data.filter(row => {
        const injectionSpeed = row["Injection Speed (units/sec)"];
        return hasValue(injectionSpeed) && parseFloat(injectionSpeed) > 0;
    });

    // ---------------------------
    // SORT BY INJECTION SPEED
    // ---------------------------
    const sorted = [...filtered].sort(
        (a, b) => Number(a["Injection Speed (units/sec)"]) - Number(b["Injection Speed (units/sec)"])
    );

    // ---------------------------
    // FILTER CHART DATA - Remove rows with zero/invalid values
    // ---------------------------
    // Filter for first chart (Fill Time chart) - need valid Injection Speed and both Fill Times
    const chartData1 = sorted.filter(row => {
        const injSpeed = row["Injection Speed (units/sec)"];
        const displayedFillTime = row["Displayed Fill Time (sec)"];
        const expectedFillTime = row["Expected Calculated Fill Time (sec)"];
        
        const hasValidInjSpeed = hasValue(injSpeed) && parseFloat(injSpeed) > 0;
        const hasValidDisplayedFillTime = hasValue(displayedFillTime) && parseFloat(displayedFillTime) > 0;
        const hasValidExpectedFillTime = hasValue(expectedFillTime) && parseFloat(expectedFillTime) > 0;
        
        // Include row only if it has valid injection speed AND both fill times are valid (not zero)
        return hasValidInjSpeed && hasValidDisplayedFillTime && hasValidExpectedFillTime;
    });

    // Filter for second chart (Actual vs Set Velocity) - need valid Injection Speed and Actual Speed
    const chartData2 = sorted.filter(row => {
        const injSpeed = row["Injection Speed (units/sec)"];
        const actualSpeed = row["Actual Calculated Speed (units/sec)"];
        
        const hasValidInjSpeed = hasValue(injSpeed) && parseFloat(injSpeed) > 0;
        const hasValidActualSpeed = hasValue(actualSpeed) && parseFloat(actualSpeed) > 0;
        
        // Include row only if it has valid injection speed AND actual speed (not zero)
        return hasValidInjSpeed && hasValidActualSpeed;
    });

    // ---------------------------
    // HEADERS (fixed order)
    // ---------------------------
    const headers = [
        "Sr. No",
        "Injection Speed (units/sec)",
        "Displayed Fill Time (sec)",
        "Actual Calculated Speed (units/sec)",
        "Expected Calculated Fill Time (sec)",
        "Variation in actual Speed from set Speed (%)",
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

    // ---------------------------
    // PAGE 1 - DESCRIPTION TABLE + DATA TABLE
    // ---------------------------
    const page1 = createPage();

    const headerBand = addPageHeader(
        page1,
        "Equipment Qualification – Injection Speed Linearity",
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
    
    // Spacing between Desc Table and Data Table
    const spacingAfterDesc = 0.5;
    // Add explicit spacer band for spacing
    const spacer1 = new Stimulsoft.Report.Components.StiDataBand();
    spacer1.height = spacingAfterDesc;
    spacer1.top = currentTop;
    page1.components.add(spacer1);
    currentTop += spacingAfterDesc;
    
    const dataTableStartTop = currentTop;

    // ---------------------------
    // COLUMN WIDTHS (same style as Viscosity)
    // ---------------------------
    const totalWidth = page1.width - 0.4;

    const columnWidths = [
        totalWidth * 0.07,
        totalWidth * 0.18,
        totalWidth * 0.18,
        totalWidth * 0.18,
        totalWidth * 0.18,
        totalWidth * 0.21,
    ];

    const headerRowHeight = 0.7;
    const dataRowHeight = 0.5;
    
    const availableHeight =
        page1.pageHeight -
        (page1.margins.top + page1.margins.bottom) -
        dataTableStartTop;

    const rowsPerPage = Math.floor(
        (availableHeight - headerRowHeight) / dataRowHeight
    );

    const totalRows = sorted.length;
    const pageCount = Math.ceil(totalRows / rowsPerPage);

    // ---------------------------
    // PREPARE CHARTS (before rendering pages) - Using Plotly
    // ---------------------------
    
    // Prepare data for Chart 1 - Fill Time Chart
    const chart1XValues = chartData1.map(row => parseFloat(row["Injection Speed (units/sec)"]) || 0);
    const chart1YExpected = chartData1.map(row => parseFloat(row["Expected Calculated Fill Time (sec)"]) || 0);
    const chart1YDisplayed = chartData1.map(row => parseFloat(row["Displayed Fill Time (sec)"]) || 0);

    const chart1Data = [
        {
            x: chart1XValues,
            y: chart1YExpected,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Expected Calculated Fill Time',
            line: {
                color: 'orange',
                width: 8  // Thick line
            },
            marker: {
                size: 16,
                color: 'orange'
            },
            showlegend: false
        },
        {
            x: chart1XValues,
            y: chart1YDisplayed,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Displayed Fill Time',
            line: {
                color: 'blue',
                width: 8  // Thick line
            },
            marker: {
                size: 16,
                color: 'blue'
            },
            showlegend: false
        }
    ];

    const chart1Layout = {
        title: {
            text: 'Fill Time vs Injection Speed',
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
                text: 'Injection Speed (units/sec)',
                font: {
                    size: 70,  // Big axis title
                    family: 'Verdana',
                    color: '#111'
                }
            },
            range: [InjectionData.PrintData.InjectionniceNumbers.min, InjectionData.PrintData.InjectionniceNumbers.max],
            dtick: InjectionData.PrintData.InjectionniceNumbers.step,
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
                text: 'Fill Time (sec)',
                font: {
                    size: 70,  // Big axis title
                    family: 'Verdana',
                    color: '#111'
                }
            },
            range: [InjectionData.PrintData.FillTimeNiceNumbers.min, InjectionData.PrintData.FillTimeNiceNumbers.max],
            dtick: InjectionData.PrintData.FillTimeNiceNumbers.step,
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
        margin: { t: 200, r: 60, b: 280, l: 280 },
        showlegend: false,
        autosize: false
    };

    // Prepare data for Chart 2 - Actual Vs Set Velocity
    const chart2XValues = chartData2.map(row => parseFloat(row["Injection Speed (units/sec)"]) || 0);
    const chart2YActual = chartData2.map(row => parseFloat(row["Actual Calculated Speed (units/sec)"]) || 0);
    const chart2YSet = chartData2.map(row => parseFloat(row["Injection Speed (units/sec)"]) || 0);

    const chart2Data = [
        {
            x: chart2XValues,
            y: chart2YActual,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Actual Calculated Speed',
            line: {
                color: 'blue',
                width: 8  // Thick line
            },
            marker: {
                size: 16,
                color: 'blue'
            },
            showlegend: false
        },
        {
            x: chart2XValues,
            y: chart2YSet,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Set Velocity',
            line: {
                color: 'orange',
                width: 8  // Thick line
            },
            marker: {
                size: 16,
                color: 'orange'
            },
            showlegend: false
        }
    ];

    const chart2Layout = {
        title: {
            text: 'Actual Vs. Set Velocities',
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
                text: 'Injection Velocity Setpoint',
                font: {
                    size: 70,  // Big axis title
                    family: 'Verdana',
                    color: '#111'
                }
            },
            range: [InjectionData.PrintData.InjectionniceNumbers.min, InjectionData.PrintData.InjectionniceNumbers.max],
            dtick: InjectionData.PrintData.InjectionniceNumbers.step,
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
                text: 'Actual Velocity',
                font: {
                    size: 70,  // Big axis title
                    family: 'Verdana',
                    color: '#111'
                }
            },
            range: [InjectionData.PrintData.ActualSpeedNiceNumbers.min, InjectionData.PrintData.ActualSpeedNiceNumbers.max],
            dtick: InjectionData.PrintData.ActualSpeedNiceNumbers.step,
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
        margin: { t: 200, r: 60, b: 280, l: 280 },
        showlegend: false,
        autosize: false
    };

    // Capture both charts
    const chart1Png = await captureInjSpeedChart({ data: chart1Data, layout: chart1Layout });
    const chart2Png = await captureInjSpeedChart({ data: chart2Data, layout: chart2Layout });

    // ---------------------------
    // BUILD TABLE (paginated)
    // ---------------------------
    const buildTable = (pageRows, startIndex) => {
        const rowCount = pageRows.length + 1;

        const table = new Stimulsoft.Report.Components.Table.StiTable();
        table.left = 0.2;
        table.top = 0;
        table.width = totalWidth;
        table.columnCount = colCount;
        table.rowCount = rowCount;
        table.headerRowsCount = 1;

        // Create cells
        for (let i = 0; i < rowCount * colCount; i++) {
            table.components.add(new Stimulsoft.Report.Components.Table.StiTableCell());
        }

        // Fill data
        for (let r = 0; r < rowCount; r++) {
            const isHeader = r === 0;

            for (let c = 0; c < colCount; c++) {
                const cell = table.components.getByIndex(r * colCount + c);
                cell.wordWrap = true;

                cell.font = new Stimulsoft.System.Drawing.Font(
                    "Verdana",
                    isHeader ? 7 : 6,
                    isHeader
                        ? Stimulsoft.System.Drawing.FontStyle.Bold
                        : Stimulsoft.System.Drawing.FontStyle.Regular
                );

                if (isHeader) {
                    cell.text = headers[c];
                    cell.brush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                        Stimulsoft.System.Drawing.Color.fromArgb(28, 148, 210)
                    );
                    cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                        Stimulsoft.System.Drawing.Color.white
                    );
                    cell.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Center;

                } else {
                    const row = pageRows[r - 1];
                    const globalIndex = startIndex + (r - 1);

                    const colValues = [
                        globalIndex + 1,
                        row["Injection Speed (units/sec)"],
                        row["Displayed Fill Time (sec)"],
                        row["Actual Calculated Speed (units/sec)"],
                        row["Expected Calculated Fill Time (sec)"],
                        row["Variation in actual Speed from set Speed (%)"],
                    ];

                    let val = colValues[c];
                    cell.text = val != null ? val.toString() : "";

                    // RED highlight logic
                    if (c === 5 && Number(val) > Number(InjectionData.Acceptable_variation)) {
                        cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                            Stimulsoft.System.Drawing.Color.red
                        );
                    } else {
                        cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                            Stimulsoft.System.Drawing.Color.black
                        );
                    }
                }

                // Borders
                cell.border = new Stimulsoft.Base.Drawing.StiBorder(
                    Stimulsoft.Base.Drawing.StiBorderSides.All,
                    Stimulsoft.System.Drawing.Color.black,
                    1
                );

                cell.height = isHeader ? headerRowHeight : dataRowHeight;
            }
        }

        // Apply column widths
        const lefts = [0];
        for (let i = 1; i < colCount; i++) {
            lefts[i] = lefts[i - 1] + columnWidths[i - 1];
        }

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < colCount; c++) {
                const cell = table.components.getByIndex(r * colCount + c);
                cell.left = lefts[c];
                cell.width = columnWidths[c];
            }
        }

        table.height = headerRowHeight + (rowCount - 1) * dataRowHeight;
        return table;
    };

    // ---------------------------
    // RENDER DATA TABLE PAGES
    // ---------------------------
    for (let p = 0; p < pageCount; p++) {
        const start = p * rowsPerPage;
        const end = Math.min(start + rowsPerPage, totalRows);
        const pageRows = sorted.slice(start, end);

        const page = p === 0 ? page1 : createPage();

        // Add continuation header
        if (p > 0) {
            addPageHeader(
                page,
                "Equipment Qualification – Injection Speed Linearity",
                "Data View"
            );
        }

        const topOffset = p === 0 ? dataTableStartTop : 1.2;
        const table = buildTable(pageRows, start);

        const band = new Stimulsoft.Report.Components.StiDataBand();
        band.height = table.height;
        band.top = topOffset;
        page.components.add(band);
        band.components.add(table);

        // Add charts below data table on Page 1 only
        if (p === 0 && !isCancelled && chart1Png && chart2Png) {
            // Calculate position after data table
            const spacingAfterTable = 0.6;
            const chartsStartTop = topOffset + table.height + spacingAfterTable;
            
            // Calculate panel dimensions for side-by-side layout - maximum size
            const panelSpacing = 0.3;
            const totalChartsWidth = page1.width - 0.4; // Use almost full page width
            const panelWidth = (totalChartsWidth - panelSpacing) / 2; // Two panels with spacing
            const availableHeight = page1.pageHeight - chartsStartTop - (page1.margins.bottom + 0.2);
            const panelHeight = availableHeight; // Use all available height
            
            // Center the charts horizontally
            const totalChartsAreaWidth = (panelWidth * 2) + panelSpacing;
            const chartsLeftOffset = (page1.width - totalChartsAreaWidth) / 2;

            // Left Panel - Fill Time Chart
            const leftPanel = new Stimulsoft.Report.Components.StiPanel();
            leftPanel.left = chartsLeftOffset;
            leftPanel.top = chartsStartTop;
            leftPanel.width = panelWidth;
            leftPanel.height = panelHeight;
            page1.components.add(leftPanel);

            const chartBand1 = new Stimulsoft.Report.Components.StiDataBand();
            chartBand1.height = panelHeight;
            leftPanel.components.add(chartBand1);

            const img1 = new Stimulsoft.Report.Components.StiImage();
            img1.left = 0.05; // Minimal margin for maximum chart size
            img1.top = 0.05; // Minimal margin for maximum chart size
            img1.width = panelWidth - 0.1; // Maximum chart width
            img1.height = panelHeight - 0.1; // Maximum chart height
            img1.stretch = true;
            img1.aspectRatio = true;
            img1.imageData = chart1Png.replace(/^data:image\/png;base64,/, "");

            chartBand1.components.add(img1);

            // Right Panel - Actual Vs Set Velocity Chart
            const rightPanel = new Stimulsoft.Report.Components.StiPanel();
            rightPanel.left = chartsLeftOffset + panelWidth + panelSpacing;
            rightPanel.top = chartsStartTop;
            rightPanel.width = panelWidth;
            rightPanel.height = panelHeight;
            page1.components.add(rightPanel);

            const chartBand2 = new Stimulsoft.Report.Components.StiDataBand();
            chartBand2.height = panelHeight;
            rightPanel.components.add(chartBand2);

            const img2 = new Stimulsoft.Report.Components.StiImage();
            img2.left = 0.05; // Minimal margin for maximum chart size
            img2.top = 0.05; // Minimal margin for maximum chart size
            img2.width = panelWidth - 0.1; // Maximum chart width
            img2.height = panelHeight - 0.1; // Maximum chart height
            img2.stretch = true;
            img2.aspectRatio = true;
            img2.imageData = chart2Png.replace(/^data:image\/png;base64,/, "");

            chartBand2.components.add(img2);
        }
    }

    // ---------------------------------------------------
    // COMMENTS PAGE (only if comments exist)
    // ---------------------------------------------------
    const commentText = InjectionData.Comment || "";
    const hasComments = commentText &&
        typeof commentText === 'string' &&
        commentText.trim() !== '' &&
        commentText.trim() !== 'N/A' &&
        commentText.trim() !== 'null' &&
        commentText.trim() !== 'undefined';

    if (hasComments) {
        addCommentsPage(
            report,
            "Equipment Qualification – Injection Speed Linearity",
            "Comments",
            `${commentText}`
        );
    }
}

