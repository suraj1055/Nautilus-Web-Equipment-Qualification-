import React, { useState, useRef } from "react";
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

const ImportMachine = () => {
    const [gridData, setGridData] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [showStatusColumns, setShowStatusColumns] = useState(false);
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

    const columns = [
        { headerText: "Resul", template: resultTemplate, width: 70, textAlign: 'Center', field: "Resul", visible: showStatusColumns, allowEditing: false },
        { field: "Reason", headerText: "Reason", width: 180, visible: showStatusColumns, allowEditing: false },
        { field: "id", headerText: "ID", visible: false, isPrimaryKey: true },
        { field: "Machine_Number", headerText: "Machine No", width: 120 },
        { field: "Make", headerText: "Make", width: 100 },
        { field: "Type_Platen_Orientation", headerText: "Type", width: 100 },
        { field: "Tonnage", headerText: "Tonnage", width: 90, textAlign: 'Right', editType: 'numericedit' },
        { field: "Screw_Diameter", headerText: "Screw Dia", width: 90, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Screw_Rotation_Speed", headerText: "Max Screw Speed", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Screw_Rotation_Linear_Speed", headerText: "Max Screw Linear", width: 130, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Machine_Pressure", headerText: "Max Hyd Pressure", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Intensification_Ratio", headerText: "Int Ratio", width: 90, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Plastic_Pressure", headerText: "Max PL Press", width: 110, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_shot_Capacity_Wt", headerText: "Max Shot (Wt)", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Melt_Temperature", headerText: "Max Melt Temp", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Min_allowable_Mold_Stack_Height", headerText: "Min Stack Ht", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_allowable_Mold_Stack_Height", headerText: "Max Stack Ht", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Mold_Open_Daylight", headerText: "Max Daylight", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Tiebar_Clearance_Width", headerText: "Tiebar Width", width: 110, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Mold_Vertical_Height", headerText: "Max Mold V.Ht", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Max_Mold_Width", headerText: "Max Mold Width", width: 120, textAlign: 'Right', editType: 'numericedit' },
        { field: "Number_of_Core_Pulls", headerText: "Core Pulls", width: 100, textAlign: 'Right', editType: 'numericedit' },
    ];

    const validateRecord = (record, existingData = []) => {
        let result = "Pending";
        let reason = "";

        // Check for duplicates
        if (record.Machine_Number && existingData.some(ed => ed.Machine_Number === record.Machine_Number)) {
            result = "Error";
            reason = "Machine Number Already Exists.";
        }

        if (!record.Machine_Number || record.Machine_Number.toString().trim() === "") {
            result = "Error";
            reason = reason ? reason + " Machine Number mandatory." : "Machine Number mandatory.";
        }

        const numericFields = [
            { key: "Tonnage", name: "Tonnage" },
            { key: "Screw_Diameter", name: "Screw Diameter" },
            { key: "Max_Screw_Rotation_Speed", name: "Max Screw Speed" },
            { key: "Max_Screw_Rotation_Linear_Speed", name: "Max Screw Linear Speed" },
            { key: "Max_Machine_Pressure", name: "Max Pressure" },
            { key: "Intensification_Ratio", name: "Intensification Ratio" },
            { key: "Max_Plastic_Pressure", name: "Max Plastic Pressure" },
            { key: "Max_shot_Capacity_Wt", name: "Max Shot Capacity" },
            { key: "Max_Melt_Temperature", name: "Max Melt Temp" },
            { key: "Min_allowable_Mold_Stack_Height", name: "Min Stack Height" },
            { key: "Max_allowable_Mold_Stack_Height", name: "Max Stack Height" },
            { key: "Max_Mold_Open_Daylight", name: "Max Daylight" },
            { key: "Tiebar_Clearance_Width", name: "Tiebar Width" },
            { key: "Max_Mold_Vertical_Height", name: "Max Mold Vertical Ht" },
            { key: "Max_Mold_Width", name: "Max Mold Width" },
            { key: "Number_of_Core_Pulls", name: "Core Pulls" },
        ];

        numericFields.forEach(field => {
            if (!isNumeric(record[field.key])) {
                result = "Error";
                reason = reason ? reason + ` ${field.name} numeric.` : `${field.name} numeric.`;
            } else if (parseFloat(record[field.key]) < 0) {
                result = "Error";
                reason = reason ? reason + ` ${field.name} cannot be negative.` : `${field.name} cannot be negative.`;
            }
        });

        // Logical validations
        if (isNumeric(record.Min_allowable_Mold_Stack_Height) && isNumeric(record.Max_allowable_Mold_Stack_Height)) {
            if (parseFloat(record.Min_allowable_Mold_Stack_Height) > parseFloat(record.Max_allowable_Mold_Stack_Height) && record.Max_allowable_Mold_Stack_Height !== "") {
                result = "Error";
                reason = reason ? reason + " Min<=Max Stack Ht." : "Min<=Max Stack Ht.";
            }
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

            // Raw data mapping
            const parsedData = jsonData.map((row, index) => {
                if (row.length === 0) return null;
                return {
                    id: index + 1,
                    Machine_Number: row[0],
                    Make: row[1] || "",
                    Type_Platen_Orientation: row[2] || "",
                    Tonnage: row[3] || "",
                    Screw_Diameter: row[4] || "",
                    Max_Screw_Rotation_Speed: row[5] || "",
                    Max_Screw_Rotation_Linear_Speed: row[6] || "",
                    Max_Machine_Pressure: row[7] || "",
                    Intensification_Ratio: row[8] || "",
                    Max_Plastic_Pressure: row[9] || "",
                    Max_shot_Capacity_Wt: row[10] || "",
                    Max_Melt_Temperature: row[11] || "",
                    Min_allowable_Mold_Stack_Height: row[12] || "",
                    Max_allowable_Mold_Stack_Height: row[13] || "",
                    Max_Mold_Open_Daylight: row[14] || "",
                    Tiebar_Clearance_Width: row[15] || "",
                    Max_Mold_Vertical_Height: row[16] || "",
                    Max_Mold_Width: row[17] || "",
                    Number_of_Core_Pulls: row[18] || "",
                    Resul: "",
                    Reason: ""
                };
            }).filter(row => row !== null);

            setGridData(parsedData);
            setShowStatusColumns(false);
            toast.success("File loaded. Review data and click Import.");
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const baseUrl = window.location.origin;
        const templateUrl = baseUrl + process.env.PUBLIC_URL + "/templates/Machine_DB.xlsx";
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

        const existingData = JSON.parse(sessionStorage.getItem("MachineData")) || [];
        let nextId = existingData.length > 0 ? Math.max(...existingData.map(d => d.id)) + 1 : 1;
        let successCount = 0;
        let errorCount = 0;

        const updatedGridData = gridData.map(row => {
            if (row.Resul === "Success" || row.Resul === "Imported") {
                return row;
            }

            const validation = validateRecord(row, existingData);

            if (validation.resul === "Error") {
                errorCount++;
                return { ...row, Resul: "Error", Reason: validation.reason };
            }

            const newRecord = {
                ...row,
                id: nextId++,
                Tonnage: row.Tonnage ? parseFloat(row.Tonnage) : 0,
                Screw_Diameter: row.Screw_Diameter ? parseFloat(row.Screw_Diameter) : 0,
                Max_Screw_Rotation_Speed: row.Max_Screw_Rotation_Speed ? parseFloat(row.Max_Screw_Rotation_Speed) : 0,
                Max_Screw_Rotation_Linear_Speed: row.Max_Screw_Rotation_Linear_Speed ? parseFloat(row.Max_Screw_Rotation_Linear_Speed) : 0,
                Max_Machine_Pressure: row.Max_Machine_Pressure ? parseFloat(row.Max_Machine_Pressure) : 0,
                Intensification_Ratio: row.Intensification_Ratio ? parseFloat(row.Intensification_Ratio) : 0,
                Max_Plastic_Pressure: row.Max_Plastic_Pressure ? parseFloat(row.Max_Plastic_Pressure) : 0,
                // These keys need special handling for the DB format as seen before or just consistent usage
                // The previous code had mapping to "Type(Platen_Orientation)" etc. Let's maintain that structure for the DB
                "Type(Platen_Orientation)": row.Type_Platen_Orientation,
                "Max_shot_Capacity(Wt)": row.Max_shot_Capacity_Wt ? parseFloat(row.Max_shot_Capacity_Wt) : 0,
                Max_Melt_Temperature: row.Max_Melt_Temperature ? parseFloat(row.Max_Melt_Temperature) : 0,
                Min_allowable_Mold_Stack_Height: row.Min_allowable_Mold_Stack_Height ? parseFloat(row.Min_allowable_Mold_Stack_Height) : 0,
                Max_allowable_Mold_Stack_Height: row.Max_allowable_Mold_Stack_Height ? parseFloat(row.Max_allowable_Mold_Stack_Height) : 0,
                Max_Mold_Open_Daylight: row.Max_Mold_Open_Daylight ? parseFloat(row.Max_Mold_Open_Daylight) : 0,
                "Tiebar_Clearance-Width": row.Tiebar_Clearance_Width ? parseFloat(row.Tiebar_Clearance_Width) : 0,
                Max_Mold_Vertical_Height: row.Max_Mold_Vertical_Height ? parseFloat(row.Max_Mold_Vertical_Height) : 0,
                Max_Mold_Width: row.Max_Mold_Width ? parseFloat(row.Max_Mold_Width) : 0,
                Number_of_Core_Pulls: row.Number_of_Core_Pulls ? parseFloat(row.Number_of_Core_Pulls) : 0
            };

            // Clean up UI keys from the DB object if needed, but important are the added ones. 
            // In the previous code, keys resulted from mapping back and forth. 
            // We'll keep them consistent as they were added in previous code block.

            existingData.push(newRecord);
            successCount++;
            return { ...row, Resul: "Success", Reason: "Data Imported." };
        });

        sessionStorage.setItem("MachineData", JSON.stringify(existingData));
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

    const handleActionBegin = (args) => {
        if (args.requestType === 'beginEdit' || args.requestType === 'delete') {
            const row = args.rowData || args.data[0];
            if (row && (row.Resul === 'Success' || row.Resul === 'Imported')) {
                args.cancel = true;
                toast.info("Imported rows cannot be edited or deleted.");
            }
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
                }
            `}</style>

            <div className="d-flex justify-content-between ml-3 pt-3 pb-3">
                <BreadCrumb DB_Name={"Machine"} Current_Page={"Import"} />
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
                                key={showStatusColumns ? "post-import" : "pre-import"}
                                ref={gridRef}
                                dataSource={gridData}
                                height="400px"
                                gridLines="Both"
                                width="100%"
                                allowScrolling={true}
                                editSettings={{ allowEditing: true, allowDeleting: true, mode: 'Normal', showConfirmDialog: true }}
                                toolbar={['Delete', 'Update', 'Cancel']}
                                actionBegin={handleActionBegin}
                            >
                                <ColumnsDirective>
                                    {columns.map((col, idx) => (
                                        <ColumnDirective key={idx} {...col} />
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

export default ImportMachine;
