const XLSX = require('xlsx');
const path = require('path');

// Create a test Mold import file with sample data
const createTestMoldData = () => {
    const wb = XLSX.utils.book_new();

    // Create data array with 12 empty rows, then headers at row 13
    const data = [];
    for (let i = 0; i < 12; i++) {
        data.push([]);
    }

    // Headers at row 13
    const headers = [
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
    data.push(headers);

    // Sample data rows (starting at row 14)
    // Row 1: Mold with 2 parts - all valid
    data.push([
        "MOLD-001",           // Mold Number
        "",                   // Material ID (will be selected from dropdown)
        "Horizontal",         // Platen Orientation
        "1",                  // Number of Bases
        "50",                 // Hot Runner Volume
        "30",                 // Cycle Time
        "300",                // Mold Stack Height
        "250",                // Mold Vertical Height
        "400",                // Req Mold Open Stroke
        "500",                // Mold Width
        "2",                  // Number of Core Pulls
        // Part 1
        "Cap",                // Part Description
        "CAP-001",            // Part Number
        "4",                  // No Of Cavities
        "1",                  // Starting Cavity Number
        "25",                 // Weight of one Part
        "1",                  // Number of Runners
        "10",                 // Runner Weight
        "150",                // Part Projected Area
        "50",                 // Runner Projected Area
        // Part 2
        "Base",               // Part Description
        "BASE-001",           // Part Number
        "4",                  // No Of Cavities
        "5",                  // Starting Cavity Number
        "30",                 // Weight of one Part
        "1",                  // Number of Runners
        "12",                 // Runner Weight
        "180",                // Part Projected Area
        "50",                 // Runner Projected Area
    ]);

    // Row 2: Mold with 1 part only
    data.push([
        "MOLD-002",
        "",
        "Vertical",
        "2",
        "75",
        "45",
        "350",
        "300",
        "450",
        "550",
        "4",
        // Part 1
        "Container",
        "CONT-001",
        "2",
        "1",
        "50",
        "1",
        "15",
        "200",
        "60",
        // Part 2 - empty
        "", "", "", "", "", "", "", "", ""
    ]);

    // Row 3: Invalid - missing Mold Number
    data.push([
        "",                   // Missing Mold Number - should error
        "",
        "Horizontal",
        "1",
        "40",
        "25",
        "280",
        "220",
        "380",
        "480",
        "1",
        "Lid",
        "LID-001",
        "8",
        "1",
        "15",
        "1",
        "8",
        "120",
        "40",
        "", "", "", "", "", "", "", "", ""
    ]);

    // Row 4: Invalid - negative values
    data.push([
        "MOLD-004",
        "",
        "Horizontal",
        "-1",                 // Negative Number of Bases - should error
        "50",
        "30",
        "300",
        "250",
        "400",
        "500",
        "2",
        "Handle",
        "HAND-001",
        "-2",                 // Negative cavities - should error
        "1",
        "20",
        "1",
        "10",
        "140",
        "45",
        "", "", "", "", "", "", "", "", ""
    ]);

    // Row 5: Invalid - non-numeric values
    data.push([
        "MOLD-005",
        "",
        "Vertical",
        "ABC",                // Non-numeric - should error
        "60",
        "35",
        "320",
        "270",
        "420",
        "520",
        "3",
        "Spout",
        "SPOUT-001",
        "XYZ",                // Non-numeric cavities - should error
        "1",
        "18",
        "1",
        "9",
        "130",
        "42",
        "", "", "", "", "", "", "", "", ""
    ]);

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    const wscols = headers.map(h => ({ wch: Math.max(h.length + 2, 12) }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const filePath = path.join(__dirname, 'public', 'templates', 'Mold_Test_Data.xlsx');
    XLSX.writeFile(wb, filePath);
    console.log(`Created test file: ${filePath}`);
    console.log('\nTest Data Summary:');
    console.log('- Row 1 (MOLD-001): Valid mold with 2 parts');
    console.log('- Row 2 (MOLD-002): Valid mold with 1 part');
    console.log('- Row 3: Invalid - Missing Mold Number');
    console.log('- Row 4 (MOLD-004): Invalid - Negative values');
    console.log('- Row 5 (MOLD-005): Invalid - Non-numeric values');
    console.log('\nNote: Material ID must be selected from dropdown after loading');
};

try {
    createTestMoldData();
} catch (error) {
    console.error('Error creating test file:', error);
}
