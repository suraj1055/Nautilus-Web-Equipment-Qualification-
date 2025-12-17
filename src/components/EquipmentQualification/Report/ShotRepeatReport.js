import { Stimulsoft } from "stimulsoft-reports-js/Scripts/stimulsoft.reports";

import ReactDOM from "react-dom/client";
import Plot from "react-plotly.js";

async function captureShotRepeatabilityChart({
    ChartData,
    PrimaryYNumbers,
    SecondaryYNumbers
}) {
    return new Promise((resolve) => {
        try {
            const tempDiv = document.createElement("div");
            tempDiv.style.cssText = `
                position:absolute;
                left:-99999px;
                top:-99999px;
                width:2600px;
                height:1800px;
                background:white;
                z-index:-1;
                border: 1px solid darkblue;
            `;
            document.body.appendChild(tempDiv);

            const root = ReactDOM.createRoot(tempDiv);

            // Prepare data for Plotly
            // Remove (Col1), (Col2), (Col3) from x-axis labels
            const xValues = ChartData.map(item => {
                let label = String(item.col_header || '');
                // Remove patterns like (Col1), (Col2), (Col3), etc.
                label = label.replace(/\s*\(Col\d+\)/gi, '');
                return label;
            });
            const traces = [
                {
                    x: xValues,
                    y: ChartData.map(item => parseFloat(item.Average) || 0),
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Average',
                    marker: {
                        size: 30,  // Larger markers for scatter plot
                        color: 'blue',
                        symbol: 'circle'
                    },
                    showlegend: false
                },
                {
                    x: xValues,
                    y: ChartData.map(item => parseFloat(item.min) || 0),
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Min',
                    marker: {
                        size: 30,  // Larger markers for scatter plot
                        color: 'green',
                        symbol: 'triangle-up'
                    },
                    showlegend: false
                },
                {
                    x: xValues,
                    y: ChartData.map(item => parseFloat(item.max) || 0),
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Max',
                    marker: {
                        size: 30,  // Larger markers for scatter plot
                        color: 'orange',
                        symbol: 'diamond'
                    },
                    showlegend: false
                },
                {
                    x: xValues,
                    y: ChartData.map(item => parseFloat(item.Variation) || 0),
                    type: 'scatter',
                    mode: 'markers',
                    name: '% Variation',
                    yaxis: 'y2',
                    marker: {
                        size: 30,  // Larger markers for scatter plot
                        color: 'red',
                        symbol: 'square'
                    },
                    showlegend: false
                }
            ];

            // Create Plotly layout
            const layout = {
                title: {
                    text: 'Shot Repeatability Study',
                    font: {
                        size: 80,  // Big chart title
                        family: 'Verdana',
                        color: '#111'
                    }
                },
                width: 2600,
                height: 1800,
                xaxis: {
                    type: 'category',
                    title: {
                        text: '',
                        font: {
                            size: 70,  // Big axis title
                            family: 'Verdana',
                            color: '#111'
                        }
                    },
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
                        text: 'Part Weights',
                        font: {
                            size: 70,  // Big axis title
                            family: 'Verdana',
                            color: '#111'
                        }
                    },
                    range: [PrimaryYNumbers.min, PrimaryYNumbers.max],
                    dtick: PrimaryYNumbers.step,
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
                yaxis2: {
                    title: {
                        text: '% Variation',
                        font: {
                            size: 70,  // Big axis title
                            family: 'Verdana',
                            color: '#111'
                        }
                    },
                    overlaying: 'y',
                    side: 'right',
                    range: [SecondaryYNumbers.min, SecondaryYNumbers.max],
                    dtick: SecondaryYNumbers.step,
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
                    automargin: true
                },
                plot_bgcolor: 'white',
                paper_bgcolor: 'white',
                margin: { t: 200, r: 100, b: 280, l: 280 },
                showlegend: false,
                autosize: false
            };

            root.render(
                <Plot
                    data={traces}
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
                                width: 2600,
                                height: 1800,
                                scale: 1
                            });
                            
                            // Add border to the image
                            const img = new Image();
                            img.src = dataUrl;
                            img.onload = () => {
                                const canvas = document.createElement("canvas");
                                canvas.width = 2600;
                                canvas.height = 1800;
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

export async function generateShotRepeatabilitySection({
    report,
    ShotData,
    addPageHeader,
    addCommentsPage,
    selectedPrintSections,
    isCancelled,
    moldName = "",
    sessionName = ""
}) {
    if (!selectedPrintSections.ShotRepeatability ||
        !ShotData ||
        !ShotData.ShotGridData ||
        ShotData.ShotGridData.length === 0)
        return;

    // console.log(ShotData.Comment)

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

    const createPage = () => {
        const p = new Stimulsoft.Report.Components.StiPage(report);
        p.orientation = Stimulsoft.Report.Components.StiPageOrientation.Landscape;
        
        const scaleFactor = 1.89;
        p.pageWidth = 16.54 * scaleFactor;
        p.pageHeight = 11.69 * scaleFactor;
        p.margins = new Stimulsoft.Report.Components.StiMargins(
            0.3 * scaleFactor,
            0.3 * scaleFactor,
            0.3 * scaleFactor,
            0.3 * scaleFactor
        );
        report.pages.add(p);
        return p;
    };

    // ======================================================================
    // PAGE 1 – DESCRIPTION TABLE + DATA TABLE + CALC TABLE + CHART
    // ======================================================================

    const page1 = createPage();

    const headerBand = addPageHeader(
        page1,
        "Scientific Molding Worksheet – Shot Repeatability Study",
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
    const tableWidth = (page1.width - 1.0) * 0.48; // Same width for both panels
    const maxAvailableHeight = page1.pageHeight - (page1.margins.top + page1.margins.bottom) - panelStartTop - 0.3;

    const headers = [
        "Shot No",
        ShotData.Headers.Header1,
        ShotData.Headers.Header2,
        ShotData.Headers.Header3
    ];

    const keys = ["value1", "value2", "value3"];  // Mapping for ShotGridData
    const rowData = ShotData.ShotGridData;
    const colCount = headers.length;
    const rowCount = rowData.length + 1;

    // Calculate table dimensions
    const headerRowHeight = 0.7;
    const dataRowHeight = 0.45;
    const mainGridHeight = headerRowHeight + (rowData.length * dataRowHeight);
    
    // Calculation table details
    const calcRows = ["Average", "Min", "Max", "Range", "% Variation"];
    const calcValues = [
        ShotData.Average,
        ShotData.MinPart,
        ShotData.MaxPart,
        ShotData.Range,
        ShotData.Percentage.map(p => p[0])  // flatten [% variation]
    ];
    const calcHeaderHeight = 0.7;
    const calcRowHeight = 0.45;
    const calcTableHeight = calcHeaderHeight + (calcRows.length * calcRowHeight);
    const spacingBetweenTables = 0.3;
    
    // Calculate panel height to include main grid + spacing + calculation table
    const labelBandHeight = 0.5;
    const labelTop = 0.1;
    const calculationLabelHeight = 0.5;
    const totalContentInPanel = labelBandHeight + labelTop + mainGridHeight + spacingBetweenTables + calculationLabelHeight + calcTableHeight;
    const minContentHeight = 10;
    const actualContentHeight = Math.max(totalContentInPanel, minContentHeight);

    // Create left panel for tables
    const leftPanel = new Stimulsoft.Report.Components.StiPanel();
    leftPanel.left = 0.3;
    leftPanel.top = panelStartTop;
    leftPanel.width = tableWidth;
    leftPanel.height = actualContentHeight;
    page1.components.add(leftPanel);

    // Create right panel for chart
    const rightPanel = new Stimulsoft.Report.Components.StiPanel();
    rightPanel.left = leftPanel.left + leftPanel.width + 0.4;
    rightPanel.top = panelStartTop;
    rightPanel.width = tableWidth;
    rightPanel.height = actualContentHeight;
    page1.components.add(rightPanel);

    // ---------------------------
    // DATA TABLE IN LEFT PANEL
    // ---------------------------
    // Add "Data View" label above the main grid table (inside left panel)
    const labelBand = new Stimulsoft.Report.Components.StiDataBand();
    labelBand.height = labelBandHeight;
    labelBand.top = labelTop;
    leftPanel.components.add(labelBand);
    
    const dataViewLabel = new Stimulsoft.Report.Components.StiText();
    dataViewLabel.left = 0.15;
    dataViewLabel.top = 0;
    dataViewLabel.width = tableWidth - 0.3;
    dataViewLabel.height = labelBandHeight;
    dataViewLabel.text = "Data View";
    try {
        dataViewLabel.font = new Stimulsoft.System.Drawing.Font("Verdana", 10, Stimulsoft.System.Drawing.FontStyle.Bold);
    } catch (e) {
        dataViewLabel.font = new Stimulsoft.System.Drawing.Font("Arial", 10, Stimulsoft.System.Drawing.FontStyle.Bold);
    }
    dataViewLabel.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(Stimulsoft.System.Drawing.Color.black);
    dataViewLabel.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Left;
    labelBand.components.add(dataViewLabel);

    // Create table band for left panel - positioned below the label
    const mainGridBand = new Stimulsoft.Report.Components.StiDataBand();
    mainGridBand.height = mainGridHeight;
    mainGridBand.top = labelTop + labelBandHeight; // Position below the label
    leftPanel.components.add(mainGridBand);

    // Table width within panel
    const totalWidth = tableWidth - 0.3;
    const colWidth = totalWidth / colCount;

    // Create data table
    const table1 = new Stimulsoft.Report.Components.Table.StiTable();
    table1.left = 0.15;
    table1.top = 0;
    table1.width = totalWidth;
    table1.columnCount = colCount;
    table1.rowCount = rowCount;
    table1.headerRowsCount = 1;

    // Create cells
    for (let i = 0; i < rowCount * colCount; i++) {
        table1.components.add(new Stimulsoft.Report.Components.Table.StiTableCell());
    }

    // Calculate cell positions
    const columnLefts = [0];
    for (let i = 1; i < colCount; i++) {
        columnLefts[i] = columnLefts[i - 1] + colWidth;
    }
    
    const rowTops = [0];
    for (let row = 1; row <= rowData.length; row++) {
        if (row === 1) rowTops[row] = headerRowHeight;
        else rowTops[row] = rowTops[row - 1] + dataRowHeight;
    }

    // Fill rows
    for (let r = 0; r < rowCount; r++) {
        const isHeader = r === 0;

        for (let c = 0; c < colCount; c++) {
            const cell = table1.components.getByIndex(r * colCount + c);

            if (isHeader) {
                cell.text = headers[c];
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
            } else {
                const row = rowData[r - 1];

                if (c === 0) {
                    // Detect key like "Shot 1"
                    const key = Object.keys(row).find(k => k.startsWith("Shot"));
                    cell.text = row[key] || "";
                } else {
                    const key = keys[c - 1];
                    const val = row[key];
                    cell.text = val != null ? val.toString() : "";
                }
                
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
            cell.width = colWidth;
            cell.minWidth = colWidth;
            cell.maxWidth = colWidth;
            cell.left = columnLefts[c];
            cell.top = rowTops[r];
        }
    }

    table1.height = mainGridHeight;
    mainGridBand.components.add(table1);

    // ---------------------------
    // CALCULATION TABLE IN LEFT PANEL
    // ---------------------------
    // Add "Result View" label below main grid (inside left panel)
    const calculationLabelTop = mainGridBand.top + mainGridHeight + spacingBetweenTables;
    const summaryLabelBand = new Stimulsoft.Report.Components.StiDataBand();
    summaryLabelBand.height = calculationLabelHeight;
    summaryLabelBand.top = calculationLabelTop;
    leftPanel.components.add(summaryLabelBand);
    
    const summaryLabel = new Stimulsoft.Report.Components.StiText();
    summaryLabel.left = 0.15;
    summaryLabel.top = 0;
    summaryLabel.width = tableWidth - 0.3;
    summaryLabel.height = calculationLabelHeight;
    summaryLabel.text = "Result View";
    try {
        summaryLabel.font = new Stimulsoft.System.Drawing.Font("Verdana", 10, Stimulsoft.System.Drawing.FontStyle.Bold);
    } catch (e) {
        summaryLabel.font = new Stimulsoft.System.Drawing.Font("Arial", 10, Stimulsoft.System.Drawing.FontStyle.Bold);
    }
    summaryLabel.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(Stimulsoft.System.Drawing.Color.black);
    summaryLabel.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Left;
    summaryLabelBand.components.add(summaryLabel);

    // Create calculation table band inside left panel - positioned below the label
    const summaryTableBand = new Stimulsoft.Report.Components.StiDataBand();
    summaryTableBand.height = calcTableHeight;
    summaryTableBand.top = calculationLabelTop + calculationLabelHeight; // Position below the label
    leftPanel.components.add(summaryTableBand);

    // Create calculation table
    const totalWidth2 = tableWidth - 0.3;
    const colWidth2 = totalWidth2 / colCount;

    const table2 = new Stimulsoft.Report.Components.Table.StiTable();
    table2.left = 0.15;
    table2.top = 0;
    table2.width = totalWidth2;
    table2.columnCount = colCount;
    table2.rowCount = calcRows.length + 1;
    table2.headerRowsCount = 1;

    // Calculate cell positions for summary table
    const summaryColumnLefts = [0];
    for (let i = 1; i < colCount; i++) {
        summaryColumnLefts[i] = summaryColumnLefts[i - 1] + colWidth2;
    }
    
    const summaryRowTops = [0];
    for (let r = 1; r <= calcRows.length; r++) {
        if (r === 1) summaryRowTops[r] = calcHeaderHeight;
        else summaryRowTops[r] = summaryRowTops[r - 1] + calcRowHeight;
    }

    // Create cells
    for (let i = 0; i < (calcRows.length + 1) * colCount; i++) {
        table2.components.add(new Stimulsoft.Report.Components.Table.StiTableCell());
    }

    // Fill table
    for (let r = 0; r <= calcRows.length; r++) {
        const isHeader = r === 0;

        for (let c = 0; c < colCount; c++) {
            const cell = table2.components.getByIndex(r * colCount + c);

            if (isHeader) {
                cell.text = headers[c];
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
                cell.height = calcHeaderHeight;
            } else {
                if (c === 0) {
                    cell.text = calcRows[r - 1];
                } else {
                    const val = calcValues[r - 1][c - 1];
                    cell.text = val != null ? val.toString() : "";

                    // Red highlight for variation row
                    if (r === calcRows.length && Number(val) > ShotData.Acceptable_variation) {
                        cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                            Stimulsoft.System.Drawing.Color.fromArgb(220, 0, 0)
                        );
                    } else {
                        cell.textBrush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                            Stimulsoft.System.Drawing.Color.black
                        );
                    }
                }

                cell.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Center;
                cell.font = new Stimulsoft.System.Drawing.Font(
                    "Verdana",
                    8,  // Increased from 6 to 8
                    Stimulsoft.System.Drawing.FontStyle.Regular
                );
                cell.brush = new Stimulsoft.Base.Drawing.StiSolidBrush(
                    Stimulsoft.System.Drawing.Color.white
                );
                cell.height = calcRowHeight;
            }

            // Border
            cell.border = new Stimulsoft.Base.Drawing.StiBorder(
                Stimulsoft.Base.Drawing.StiBorderSides.All,
                Stimulsoft.System.Drawing.Color.black,
                1
            );

            // Width and position
            cell.width = colWidth2;
            cell.minWidth = colWidth2;
            cell.maxWidth = colWidth2;
            cell.left = summaryColumnLefts[c];
            cell.top = summaryRowTops[r];
        }
    }

    table2.height = calcTableHeight;
    summaryTableBand.components.add(table2);

    // ---------------------------
    // CHART IN RIGHT PANEL
    // ---------------------------
    const png = await captureShotRepeatabilityChart({
        ChartData: ShotData.ChartData,
        PrimaryYNumbers: ShotData.PrimaryYNumbers,
        SecondaryYNumbers: ShotData.SecondaryYNumbers
    });

    if (!isCancelled && png) {
        const clean = png.replace(/^data:image\/png;base64,/, "");

        const chartImg = new Stimulsoft.Report.Components.StiImage();
        chartImg.left = 0.15;
        chartImg.top = 0.15;
        chartImg.width = rightPanel.width - 0.3;
        chartImg.height = rightPanel.height - 0.3;
        chartImg.stretch = true;
        chartImg.aspectRatio = true;
        chartImg.imageData = clean;

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
        actualContentHeight + // Main grid, calculation table, and chart panels
        page1.margins.bottom +
        0.3; // bottom spacing

    // Update page height to fit content (with some buffer)
    const scaleFactor = 1.89;
    const calculatedPageHeight = totalContentHeight + 0.5; // Add small buffer
    page1.pageHeight = Math.min(calculatedPageHeight, 11.69 * scaleFactor); // Don't exceed original max

    // ======================================================================
    // COMMENTS PAGE (only if comments exist)
    // ======================================================================
    const commentText = ShotData.Comment || "";
    const hasComments = commentText &&
        typeof commentText === 'string' &&
        commentText.trim() !== '' &&
        commentText.trim() !== 'N/A' &&
        commentText.trim() !== 'null' &&
        commentText.trim() !== 'undefined';

    if (hasComments) {
        addCommentsPage(
            report,
            "Scientific Molding Worksheet – Shot Repeatability Study",
            "Comments",
            `${commentText}`
        );
    }
}
