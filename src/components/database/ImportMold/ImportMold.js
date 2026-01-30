import React, { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
    GridComponent,
    ColumnsDirective,
    ColumnDirective,
    Inject,
    Edit,
    Toolbar,
} from "@syncfusion/ej2-react-grids";
import { Button, Input } from "reactstrap";
import { useHistory } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import BreadCrumb from "../CommonSections/BreadCrumb";

// Helper to check if value is numeric or empty
const isNumeric = (value) => {
    if (value === "" || value === null || value === undefined) return true;
    return !isNaN(parseFloat(value)) && isFinite(value);
};

// BaseUnitsArray - MUST be used exactly as provided
const BaseUnitsArray = {
    Area: [
        { unit_id: 1, decimals: 0.12, unit_name: "sq cm" },
        { unit_id: 2, decimals: 0.12, unit_name: "sq in" },
    ],
    Time: [
        { unit_id: 3, decimals: 0, unit_name: "sec" },
        { unit_id: 4, decimals: 0.1, unit_name: "min" },
        { unit_id: 5, decimals: 0.12, unit_name: "hrs" },
    ],
    Speed: [
        { unit_id: 6, decimals: 0.1, unit_name: "mm/sec" },
        { unit_id: 7, decimals: 0.12, unit_name: "inches/sec" },
        { unit_id: 21, decimals: 0.12, unit_name: "rpm" },
    ],
    Volume: [{ unit_id: 23, unit_name: "cm^3" }],
    Weight: [
        { unit_id: 8, decimals: 0.12, unit_name: "Gms" },
        { unit_id: 9, decimals: 0.12, unit_name: "oz" },
    ],
    Tonnage: [
        { unit_id: 18, unit_name: "US tons" },
        { unit_id: 19, unit_name: "metric ton" },
        { unit_id: 20, unit_name: "kN" },
    ],
    Distance: [
        { unit_id: 10, decimals: 0.12, unit_name: "mm" },
        { unit_id: 11, decimals: 0.12, unit_name: "in" },
        { unit_id: 22, decimals: 0.12, unit_name: "cm" },
    ],
    Pressure: [
        { unit_id: 12, decimals: 0.12, unit_name: "MPa" },
        { unit_id: 13, decimals: 0, unit_name: "psi" },
        { unit_id: 14, decimals: 0, unit_name: "bar" },
        { unit_id: 15, decimals: 0, unit_name: "kpsi" },
    ],
    Temperature: [
        { unit_id: 16, decimals: 0, unit_name: "deg C" },
        { unit_id: 17, decimals: 0, unit_name: "deg F" },
    ],
};

const PART_FIELDS = [
    { key: "Part_Description", name: "Part Description", width: 160 },
    { key: "Part_Number", name: "Part Number", width: 140 },
    { key: "Number_of_Cavities", name: "Number of Cavities", width: 140 },
    { key: "Starting_Cavity_Number", name: "Starting Cavity Number", width: 160 },
    { key: "Weight_of_one_Part", name: "Weight of one Part", width: 140 },
    { key: "Number_of_Runners", name: "Number of Runners", width: 140 },
    { key: "Runner_Weight", name: "Runner Weight", width: 140 },
    { key: "Part_Projected_Area", name: "Part Projected Area", width: 150 },
    { key: "Runner_Projected_Area", name: "Runner Projected Area", width: 160 },
];

const ImportMold = () => {
    const [gridData, setGridData] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [showStatusColumns, setShowStatusColumns] = useState(false);
    const [materialOptions, setMaterialOptions] = useState([]);
    const [maxParts, setMaxParts] = useState(0);
    const gridRef = useRef(null);
    const history = useHistory();

    const hasImportResults =
        showStatusColumns && gridData.some((r) => r.Resul === "Error" || r.Resul === "Pending");

    const resultTemplate = (props) => {
        if (props.Resul === "Error" || props.Resul === "Fail") {
            return (
                <div className="text-center">
                    <i className="fa fa-times-circle text-danger" style={{ fontSize: "16px" }}></i>
                </div>
            );
        } else if (props.Resul === "Imported" || props.Resul === "Success") {
            return (
                <div className="text-center">
                    <i className="fa fa-check-circle text-success" style={{ fontSize: "16px" }}></i>
                </div>
            );
        }
        return null;
    };

    // Load material options on mount
    useEffect(() => {
        const materials = JSON.parse(sessionStorage.getItem("MaterialData")) || [];
        setMaterialOptions(materials);
    }, []);

    // Memoize Material ID dropdown edit configuration to ensure stable reference for Syncfusion
    const materialEditParams = useMemo(() => ({
        params: {
            dataSource: materialOptions,
            fields: { text: "Material_Id", value: "Material_Id" },
            allowFiltering: true,
            placeholder: "Select Material"
        }
    }), [materialOptions]);

    const handleActionBegin = (args) => {
        if (args.requestType === 'save') {
            // Update gridData state with the edited row data
            // This ensures the generic 'gridData' state reflects changes made in the grid
            const updatedRow = args.data;
            setGridData(prevData => prevData.map(row =>
                row.id === updatedRow.id ? updatedRow : row
            ));
        }
        if (args.requestType === 'beginEdit' || args.requestType === 'delete') {
            const row = args.rowData || args.data[0];
            if (row && (row.Resul === 'Success' || row.Resul === 'Imported')) {
                args.cancel = true;
                toast.info("Imported rows cannot be edited or deleted.");
            }
        }
    };

    // Final columns assembly
    let assembledColumns = [];

    // Add Result and Reason columns at the BEGINNING ONLY if import has been triggered
    if (showStatusColumns) {
        assembledColumns.push(
            { headerText: "Result", template: resultTemplate, width: 100, textAlign: 'Center', field: "Resul", allowEditing: false },
            { field: "Reason", headerText: "Reason", width: 300, allowEditing: false }
        );
    }

    // Add base columns
    const columns = [
        ...assembledColumns,
        { field: "id", headerText: "ID", visible: false, isPrimaryKey: true },
        { field: "Mold_No", headerText: "Mold Number", width: 150 },
        {
            field: "Material_Id",
            headerText: "Material ID",
            width: 180,
            editType: 'dropdownedit',
            edit: materialEditParams
        },
        { field: "Platen_Orientation", headerText: "Platen Orientation", width: 150 },
        { field: "Number_of_Bases", headerText: "Number of Bases", width: 140, textAlign: 'Right', editType: 'numericedit' },
        { field: "Hot_Runner_Volume", headerText: "Hot Runner Volume", width: 150, textAlign: 'Right', editType: 'numericedit' },
        { field: "Cycle_Time", headerText: "Cycle Time (sec)", width: 140, textAlign: 'Right', editType: 'numericedit' },
        { field: "Mold_Stack_Height", headerText: "Mold Stack Height", width: 150, textAlign: 'Right', editType: 'numericedit' },
        { field: "Mold_Vertical_Height", headerText: "Mold Vertical Height", width: 160, textAlign: 'Right', editType: 'numericedit' },
        { field: "Req_Mold_Open_Stroke", headerText: "Required Mold Open Stroke", width: 180, textAlign: 'Right', editType: 'numericedit' },
        { field: "Mold_Width", headerText: "Mold Width", width: 140, textAlign: 'Right', editType: 'numericedit' },
        { field: "Number_of_Core_Pulls", headerText: "Number of Core Pulls", width: 160, textAlign: 'Right', editType: 'numericedit' },
        { field: "Parts_Count", headerText: "Total Parts", width: 100, textAlign: 'Center', allowEditing: false },
    ];

    // Add Part columns dynamically
    for (let i = 1; i <= maxParts; i++) {
        PART_FIELDS.forEach(pf => {
            columns.push({
                field: `Part${i}_${pf.key}`,
                headerText: `Part ${i} ${pf.name}`,
                width: pf.width,
                textAlign: pf.editType === 'numericedit' ? 'Right' : 'Left',
                editType: pf.editType || 'stringedit'
            });
        });
    }



    /**
     * Parse dynamic parts from Excel row
     * Each part has 9 fields starting from column 11
     */
    const parsePartsFromRow = (row) => {
        const parts = [];
        const PART_FIELD_COUNT = 9;
        const MOLD_FIELDS_COUNT = 11;

        let partIndex = 1;
        let startCol = MOLD_FIELDS_COUNT;

        while (startCol < row.length) {
            const partData = {
                Part_Description: row[startCol] || "",
                Part_Number: row[startCol + 1] || "",
                Number_of_Cavities: row[startCol + 2] || "",
                Starting_Cavity_Number: row[startCol + 3] || "",
                Weight_of_one_Part: row[startCol + 4] || "",
                Number_of_Runners: row[startCol + 5] || "",
                Runner_Weight: row[startCol + 6] || "",
                Part_Projected_Area: row[startCol + 7] || "",
                Runner_Projected_Area: row[startCol + 8] || "",
            };

            // Check if this part has any data
            const hasData = Object.values(partData).some(val => val !== "" && val !== null && val !== undefined);
            if (hasData) {
                parts.push({ ...partData, Part_Index: partIndex });
            } else {
                // Stop if we hit an empty part block
                break;
            }

            partIndex++;
            startCol += PART_FIELD_COUNT;
        }

        return parts;
    };

    const validateRecord = (record, existingData = [], allMaterials = []) => {
        let result = "Pending";
        let reason = "";

        // A. Mold-level validations

        // Mandatory: Mold No
        if (!record.Mold_No || record.Mold_No.toString().trim() === "") {
            result = "Error";
            reason = reason ? reason + " Mold No mandatory." : "Mold No mandatory.";
        }

        // Check for duplicates
        if (record.Mold_No && existingData.some(ed => ed.Mold_No === record.Mold_No)) {
            result = "Error";
            reason = reason ? reason + " Mold No exists." : "Mold No already exists.";
        }

        // Mandatory: Material ID
        if (!record.Material_Id || record.Material_Id.toString().trim() === "") {
            result = "Error";
            reason = reason ? reason + " Material ID mandatory." : "Material ID is mandatory.";
        } else {
            // Validate Material exists in database
            const materialExists = allMaterials.some(m => m.Material_Id === record.Material_Id);
            if (!materialExists) {
                result = "Error";
                reason = reason ? reason + " Material ID not found." : "Material ID not found in database.";
            }
        }

        // Numeric validations
        const numericFields = [
            { key: "Number_of_Bases", name: "Number of Bases" },
            { key: "Cycle_Time", name: "Cycle Time" },
            { key: "Mold_Stack_Height", name: "Mold Stack Height" },
            { key: "Mold_Vertical_Height", name: "Mold Vertical Height" },
            { key: "Mold_Width", name: "Mold Width" },
            { key: "Number_of_Core_Pulls", name: "Number of Core Pulls" },
            { key: "Hot_Runner_Volume", name: "Hot Runner Volume" },
            { key: "Req_Mold_Open_Stroke", name: "Required Mold Open Stroke" },
        ];

        numericFields.forEach(field => {
            if (!isNumeric(record[field.key])) {
                result = "Error";
                reason = reason ? reason + ` ${field.name} numeric.` : `${field.name} must be numeric.`;
            } else if (record[field.key] !== "" && record[field.key] !== null && record[field.key] !== undefined && parseFloat(record[field.key]) < 0) {
                result = "Error";
                reason = reason ? reason + ` ${field.name} negative.` : `${field.name} cannot be negative.`;
            }
        });

        // B. Part-level validations
        if (record.Parts && record.Parts.length > 0) {
            record.Parts.forEach((part, idx) => {
                const partNum = idx + 1;

                // Cavities > 0
                if (part.Number_of_Cavities !== "" && part.Number_of_Cavities !== null && part.Number_of_Cavities !== undefined) {
                    if (!isNumeric(part.Number_of_Cavities)) {
                        result = "Error";
                        reason = reason ? reason + ` Part${partNum} Cavities numeric.` : `Part ${partNum}: Cavities must be numeric.`;
                    } else if (parseFloat(part.Number_of_Cavities) <= 0) {
                        result = "Error";
                        reason = reason ? reason + ` Part${partNum} Cavities>0.` : `Part ${partNum}: Cavities must be > 0.`;
                    }
                }

                // Numeric validations for part fields
                const partNumericFields = [
                    { key: "Starting_Cavity_Number", name: "Starting Cavity" },
                    { key: "Weight_of_one_Part", name: "Part Weight" },
                    { key: "Number_of_Runners", name: "Runners" },
                    { key: "Runner_Weight", name: "Runner Weight" },
                    { key: "Part_Projected_Area", name: "Part Area" },
                    { key: "Runner_Projected_Area", name: "Runner Area" },
                ];

                partNumericFields.forEach(field => {
                    if (!isNumeric(part[field.key])) {
                        result = "Error";
                        reason = reason ? reason + ` Part${partNum} ${field.name} numeric.` : `Part ${partNum}: ${field.name} must be numeric.`;
                    } else if (part[field.key] !== "" && part[field.key] !== null && part[field.key] !== undefined && parseFloat(part[field.key]) < 0) {
                        result = "Error";
                        reason = reason ? reason + ` Part${partNum} ${field.name} negative.` : `Part ${partNum}: ${field.name} cannot be negative.`;
                    }
                });
            });
        }

        return { resul: result, reason: reason };
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 13 });

            // Load material options for dropdown
            const materials = JSON.parse(sessionStorage.getItem("MaterialData")) || [];
            setMaterialOptions(materials);

            let overallMaxParts = 0;

            // Parse data with dynamic parts
            const parsedData = jsonData.map((row, index) => {
                if (!row || row.length === 0) return null;

                const parts = parsePartsFromRow(row);
                if (parts.length > overallMaxParts) overallMaxParts = parts.length;

                const rowObj = {
                    id: index + 1,
                    Mold_No: row[0] || "",
                    Material_Id: row[1] || "", // Try taking from template
                    Platen_Orientation: row[2] || "",
                    Number_of_Bases: row[3] || "",
                    Hot_Runner_Volume: row[4] || "",
                    Cycle_Time: row[5] || "",
                    Mold_Stack_Height: row[6] || "",
                    Mold_Vertical_Height: row[7] || "",
                    Req_Mold_Open_Stroke: row[8] || "",
                    Mold_Width: row[9] || "",
                    Number_of_Core_Pulls: row[10] || "",
                    Parts: parts,
                    Parts_Count: parts.length,
                    Number_of_Parts: parts.length,
                    Is_Family_Mold: parts.length > 1 ? "Yes" : "No",
                    Resul: "",
                    Reason: ""
                };

                // Flatten parts for grid display
                parts.forEach((p, i) => {
                    const pIdx = i + 1;
                    rowObj[`Part${pIdx}_Part_Description`] = p.Part_Description;
                    rowObj[`Part${pIdx}_Part_Number`] = p.Part_Number;
                    rowObj[`Part${pIdx}_Number_of_Cavities`] = p.Number_of_Cavities;
                    rowObj[`Part${pIdx}_Starting_Cavity_Number`] = p.Starting_Cavity_Number;
                    rowObj[`Part${pIdx}_Weight_of_one_Part`] = p.Weight_of_one_Part;
                    rowObj[`Part${pIdx}_Number_of_Runners`] = p.Number_of_Runners;
                    rowObj[`Part${pIdx}_Runner_Weight`] = p.Runner_Weight;
                    rowObj[`Part${pIdx}_Part_Projected_Area`] = p.Part_Projected_Area;
                    rowObj[`Part${pIdx}_Runner_Projected_Area`] = p.Runner_Projected_Area;
                });

                return rowObj;
            }).filter(row => row !== null);

            setMaxParts(overallMaxParts);
            setGridData(parsedData);
            setShowStatusColumns(false);
            toast.success(`File loaded with ${overallMaxParts} parts. Select Material ID and click Import.`);
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const baseUrl = window.location.origin;
        const templateUrl = baseUrl + process.env.PUBLIC_URL + "/templates/Mold_DB.xlsx";
        const officeUri = `ms-excel:ofv|u|${templateUrl}`;
        window.location.href = officeUri;
    };

    const handleImport = () => {
        if (!gridData || gridData.length === 0) {
            toast.warning("No data to import.");
            return;
        }

        setIsImporting(true);
        setShowStatusColumns(true);

        const existingData = JSON.parse(sessionStorage.getItem("MoldData")) || [];
        const allMaterials = JSON.parse(sessionStorage.getItem("MaterialData")) || [];
        let nextId = existingData.length > 0 ? Math.max(...existingData.map(d => d.id)) + 1 : 1;
        let successCount = 0;
        let errorCount = 0;

        const updatedGridData = gridData.map(row => {
            if (row.Resul === "Success" || row.Resul === "Imported") {
                return row;
            }

            // Sync Parts array from flattened fields before validation
            const syncedParts = [];
            for (let i = 1; i <= maxParts; i++) {
                if (row[`Part${i}_Part_Number`] || row[`Part${i}_Part_Description`]) {
                    syncedParts.push({
                        Part_Description: row[`Part${i}_Part_Description`] || "",
                        Part_Number: row[`Part${i}_Part_Number`] || "",
                        Number_of_Cavities: row[`Part${i}_Number_of_Cavities`] || "",
                        Starting_Cavity_Number: row[`Part${i}_Starting_Cavity_Number`] || "",
                        Weight_of_one_Part: row[`Part${i}_Weight_of_one_Part`] || "",
                        Number_of_Runners: row[`Part${i}_Number_of_Runners`] || "",
                        Runner_Weight: row[`Part${i}_Runner_Weight`] || "",
                        Part_Projected_Area: row[`Part${i}_Part_Projected_Area`] || "",
                        Runner_Projected_Area: row[`Part${i}_Runner_Projected_Area`] || "",
                        Part_Index: i
                    });
                }
            }

            const recordToValidate = { ...row, Parts: syncedParts };
            const validation = validateRecord(recordToValidate, existingData, allMaterials);

            if (validation.resul === "Error") {
                errorCount++;
                return { ...row, Resul: "Error", Reason: validation.reason };
            }

            // Assign units using BaseUnitsArray
            const moldWithUnits = {
                ...recordToValidate,
                id: nextId++,
                // Numeric conversions
                Number_of_Bases: row.Number_of_Bases ? parseFloat(row.Number_of_Bases) : 0,
                Cycle_Time: row.Cycle_Time ? parseFloat(row.Cycle_Time) : 0,
                Cycle_Time_Unit: BaseUnitsArray.Time ? BaseUnitsArray.Time[0].unit_id : 3, // Default to seconds
                Mold_Stack_Height: row.Mold_Stack_Height ? parseFloat(row.Mold_Stack_Height) : 0,
                Mold_Stack_Height_Unit: BaseUnitsArray.Distance ? BaseUnitsArray.Distance[0].unit_id : 10,
                Mold_Vertical_Height: row.Mold_Vertical_Height ? parseFloat(row.Mold_Vertical_Height) : 0,
                Mold_Vertical_Height_Unit: BaseUnitsArray.Distance ? BaseUnitsArray.Distance[0].unit_id : 10,
                Mold_Width: row.Mold_Width ? parseFloat(row.Mold_Width) : 0,
                Mold_Width_Unit: BaseUnitsArray.Distance ? BaseUnitsArray.Distance[0].unit_id : 10,
                Number_of_Core_Pulls: row.Number_of_Core_Pulls ? parseFloat(row.Number_of_Core_Pulls) : 0,
                Hot_Runner_Volume: row.Hot_Runner_Volume ? parseFloat(row.Hot_Runner_Volume) : 0,
                Hot_Runner_Volume_Unit: BaseUnitsArray.Volume ? BaseUnitsArray.Volume[0].unit_id : 23,
                Req_Mold_Open_Stroke: row.Req_Mold_Open_Stroke ? parseFloat(row.Req_Mold_Open_Stroke) : 0,
                Req_Mold_Open_Stroke_Unit: BaseUnitsArray.Distance ? BaseUnitsArray.Distance[0].unit_id : 10,
                Number_of_Parts: recordToValidate.Parts.length,
                Is_Family_Mold: recordToValidate.Parts.length > 1 ? "Yes" : "No",
            };

            // Process parts with units
            if (moldWithUnits.Parts && moldWithUnits.Parts.length > 0) {
                moldWithUnits.Parts = moldWithUnits.Parts.map(part => ({
                    ...part,
                    Number_of_Cavities: part.Number_of_Cavities ? parseFloat(part.Number_of_Cavities) : 0,
                    Starting_Cavity_Number: part.Starting_Cavity_Number ? parseFloat(part.Starting_Cavity_Number) : 0,
                    Weight_of_one_Part: part.Weight_of_one_Part ? parseFloat(part.Weight_of_one_Part) : 0,
                    Weight_of_one_Part_Unit: BaseUnitsArray.Weight ? BaseUnitsArray.Weight[0].unit_id : 8,
                    Number_of_Runners: part.Number_of_Runners ? parseFloat(part.Number_of_Runners) : 0,
                    Runner_Weight: part.Runner_Weight ? parseFloat(part.Runner_Weight) : 0,
                    Runner_Weight_Unit: BaseUnitsArray.Weight ? BaseUnitsArray.Weight[0].unit_id : 8,
                    Part_Projected_Area: part.Part_Projected_Area ? parseFloat(part.Part_Projected_Area) : 0,
                    Part_Projected_Area_Unit: BaseUnitsArray.Area ? BaseUnitsArray.Area[0].unit_id : 1,
                    Runner_Projected_Area: part.Runner_Projected_Area ? parseFloat(part.Runner_Projected_Area) : 0,
                    Runner_Projected_Area_Unit: BaseUnitsArray.Area ? BaseUnitsArray.Area[0].unit_id : 1,
                }));
            }

            // Remove UI-only fields before saving
            const recordToSave = { ...moldWithUnits };
            delete recordToSave.Resul;
            delete recordToSave.Reason;
            delete recordToSave.Parts_Count;
            // Also remove flattened Part fields
            for (let i = 1; i <= maxParts; i++) {
                PART_FIELDS.forEach(pf => {
                    delete recordToSave[`Part${i}_${pf.key}`];
                });
            }

            existingData.push(recordToSave);
            successCount++;
            return { ...row, Resul: "Success", Reason: "Data Imported." };
        });

        sessionStorage.setItem("MoldData", JSON.stringify(existingData));
        setGridData(updatedGridData);
        setIsImporting(false);

        if (errorCount > 0) {
            toast.warning(`Import finished: ${successCount} imported, ${errorCount} failed.`);
        } else {
            toast.success(`Import successful: ${successCount} rows imported.`);
        }
    };

    const handleRemoveImportedRows = () => {
        if (!gridData || gridData.length === 0) return;

        const hasImportedRows = gridData.some((row) => row.Resul === "Success" || row.Resul === "Imported");
        if (!hasImportedRows) {
            toast.info("No imported rows to remove.");
            return;
        }

        const confirmed = window.confirm("Imported records will be removed. You can continue editing the incorrect data.");
        if (!confirmed) return;

        const keptRows = gridData.filter((row) => row.Resul !== "Success" && row.Resul !== "Imported");
        const removedCount = gridData.length - keptRows.length;

        setGridData(keptRows);
        toast.info(removedCount > 0 ? `Removed ${removedCount} imported row(s).` : "No imported rows to remove.");
    };

    const backToDatabases = () => {
        history.push("/databases");
    };

    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef(null);

    const handleFileBrowse = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            handleFileUpload(e);
        }
    };



    const handleCellEdit = (args) => {
        // Allow editing of Material_Id dropdown even after validation
        if (args.columnName === 'Material_Id') {
            return;
        }
    };

    return (
        <div className="container-fluid">
            <ToastContainer />
            <style>{`
                /* Syncfusion Grid Toolbar Styling */
                .e-grid .e-toolbar {
                    background-color: #e4eae1 !important;
                    border-bottom: 1px solid #ccc !important;
                }
                .e-grid .e-toolbar-items {
                    background-color: #e4eae1 !important;
                }
                .e-grid .e-toolbar .e-tbar-btn {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .e-grid .e-toolbar .e-tbar-btn .e-tbar-btn-text {
                    color: #555 !important;
                    font-size: 13px !important;
                }
                .e-grid .e-toolbar .e-toolbar-item.e-overlay {
                    opacity: 0.5 !important;
                }
                
                /* Grid Header Styling */
                .e-grid .e-gridheader {
                    background-color: #e4eae1 !important;
                    border-bottom: 1px solid #ccc !important;
                }
                .e-grid .e-headercell {
                    background-color: #e4eae1 !important;
                    border-right: 1px solid #999 !important;
                }
                .e-grid .e-headertext {
                    color: #333 !important;
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    white-space: normal !important;
                    line-height: normal !important;
                }
                .e-grid .e-headercell {
                    background-color: #e4eae1 !important;
                    border-right: 1px solid #999 !important;
                    height: auto !important;
                    vertical-align: middle !important;
                }
            `}</style>

            <div className="d-flex justify-content-between ml-3 pt-3 pb-3">
                <BreadCrumb DB_Name={"Mold"} Current_Page={"Import"} />
            </div>

            <div className="card p-3 ml-2" style={{ background: "#e4eae1" }}>
                <div style={{ padding: "20px", flexGrow: 1, overflowY: "auto" }}>
                    {/* Top Row: File Input and Browse */}
                    <div className="row mb-2">
                        <div className="col-10">
                            <Input
                                type="text"
                                readOnly
                                value={fileName}
                                style={{ background: "white", height: "30px", fontSize: "13px" }}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept=".xlsx"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="col-2">
                            <Button
                                size="sm"
                                outline
                                color="secondary"
                                style={{ width: "100%", height: "30px", background: "white", color: "black", borderColor: "#ccc" }}
                                onClick={handleFileBrowse}
                            >
                                Browse
                            </Button>
                        </div>
                    </div>

                    {/* Second Row: Template Help and Button */}
                    <div className="row mb-3 align-items-center">
                        <div className="col-10 text-right">
                            <span style={{ fontSize: "13px", color: "#333" }}>Please use default template provided by software.</span>
                        </div>
                        <div className="col-2">
                            <Button
                                size="sm"
                                outline
                                color="secondary"
                                style={{ width: "100%", height: "30px", background: "white", color: "black", borderColor: "#ccc" }}
                                onClick={downloadTemplate}
                            >
                                Template
                            </Button>
                        </div>
                    </div>

                    {/* Grid Area */}
                    <div style={{
                        background: "#b0b0b0",
                        border: "1px solid #777",
                        height: "400px",
                        position: "relative"
                    }}>
                        {hasImportResults && (
                            <div style={{ padding: "8px 8px 0 8px", display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    size="sm"
                                    outline
                                    color="secondary"
                                    style={{ background: "white", color: "black", borderColor: "#ccc" }}
                                    onClick={handleRemoveImportedRows}
                                    disabled={isImporting}
                                >
                                    Remove Imported Data Rows
                                </Button>
                            </div>
                        )}
                        {gridData.length > 0 && (
                            <GridComponent
                                key={`mold-import-grid-${maxParts}-${showStatusColumns}-${materialOptions.length}`}
                                ref={gridRef}
                                dataSource={gridData}
                                height="400px"
                                gridLines="Both"
                                width="100%"
                                allowScrolling={true}
                                allowResizing={true}
                                allowTextWrap={true}
                                textWrapSettings={{ wrapMode: 'Both' }}
                                editSettings={{ allowEditing: true, allowDeleting: true, mode: 'Normal', showConfirmDialog: true }}
                                toolbar={['Delete', 'Update', 'Cancel']}
                                actionBegin={handleActionBegin}
                                cellEdit={handleCellEdit}
                            >
                                <ColumnsDirective>
                                    {columns.map((col, idx) => (
                                        <ColumnDirective key={`${col.field}-${idx}`} {...col} />
                                    ))}
                                </ColumnsDirective>
                                <Inject services={[Edit, Toolbar]} />
                            </GridComponent>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div style={{
                    padding: "10px 15px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                }}>
                    <Button
                        size="sm"
                        outline
                        color="secondary"
                        style={{ background: "white", color: "black", borderColor: "#ccc", width: "80px" }}
                        onClick={handleImport}
                        disabled={isImporting}
                    >
                        {isImporting ? "..." : "Import"}
                    </Button>
                    <Button
                        size="sm"
                        outline
                        color="secondary"
                        style={{ background: "white", color: "black", borderColor: "#ccc", width: "80px" }}
                        onClick={backToDatabases}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportMold;
