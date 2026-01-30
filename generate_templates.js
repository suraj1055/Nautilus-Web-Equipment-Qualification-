const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'public', 'templates');

// Ensure directory exists
if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
}

const createTemplate = (filename, headers) => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create data array. 
    // We want headers to be at Row 13 (index 12) so data starts at Row 14 (index 13).
    // So we need 12 empty rows before the header.
    const data = [];
    for (let i = 0; i < 12; i++) {
        data.push([]);
    }
    data.push(headers);
    // Add a few empty rows for user to fill
    for (let i = 0; i < 5; i++) {
        data.push([]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths for better visibility
    const wscols = headers.map(h => ({ wch: Math.max(h.length + 2, 12) }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const filePath = path.join(templatesDir, filename);
    XLSX.writeFile(wb, filePath);
    console.log(`Created ${filePath}`);
};

// Machine Database Headers
// Based on ImportMachine.js parsing logic
const machineHeaders = [
    "Machine Number",
    "Make",
    "Type(Platen_Orientation)",
    "Tonnage",
    "Screw Diameter",
    "Max Screw Rotation Speed",
    "Max Screw Rotation Linear Speed",
    "Max Hydraulic Pressure",
    "Intensification Ratio",
    "Max Plastic Pressure",
    "Max Shot Capacity(Wt)",
    "Max Melt Temperature",
    "Min Allowable Mold Stack Height",
    "Max Allowable Mold Stack Height",
    "Max Mold Open Daylight",
    "Tiebar Clearance-Width",
    "Max Mold Vertical Height",
    "Max Mold Width",
    "Number of Core Pulls"
];

// Mold Database Headers
// Based on ImportMold.js parsing logic with dynamic parts support
const moldHeaders = [
    // Mold Details (11 columns)
    "Mold Number",
    "Material ID",
    "Platen Orientation",
    "Number of Bases",
    "Hot Runner Volume",
    "Cycle Time",
    "Mold Stack Height",
    "Mold Vertical Height",
    "Req Mold Open Stroke",
    "Mold Width",
    "Number of Core Pulls",
    // Part 1 (9 columns)
    "Part Description",
    "Part Number",
    "No Of Cavities",
    "Starting Cavity Number",
    "Weight of one Part",
    "Number of Runners",
    "Runner Weight",
    "Part Projected Area",
    "Runner Projected Area",
    // Part 2 (9 columns)
    "Part Description",
    "Part Number",
    "No Of Cavities",
    "Starting Cavity Number",
    "Weight of one Part",
    "Number of Runners",
    "Runner Weight",
    "Part Projected Area",
    "Runner Projected Area"
];

try {
    createTemplate('Machine_DB.xlsx', machineHeaders);
    createTemplate('Mold_DB.xlsx', moldHeaders);
    console.log("Templates generated successfully.");
} catch (error) {
    console.error("Error generating templates:", error);
}
