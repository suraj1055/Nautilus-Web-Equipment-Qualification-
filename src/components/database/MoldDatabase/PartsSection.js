import React from "react";
import { Table, Button } from "reactstrap";

const PartsSection = ({
    isFamilyMold,
    numberOfParts,
    partData,
    partColumn,
    setIsFamilyMold,
    setNumberOfParts,
    handlePartDataChange,
    handleSetParts,
    BaseUnitsArray,
    handlePartUnitChange,
    moldUnitData,
    Page
}) => {
    return (
        <div className="mt-2">
            <div className="d-flex align-items-center mb-2">
                <label className="mr-2" style={{ width: "150px", textAlign: "right" }}>Is This a Family Mold :</label>
                <select
                    className="form-control"
                    style={{ width: "150px" }}
                    value={isFamilyMold}
                    onChange={(e) => setIsFamilyMold(e.target.value)}
                    disabled={Page === "View"}
                >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>

            <div className="d-flex align-items-center mb-2">
                <label className="mr-2" style={{ width: "150px", textAlign: "right" }}>Number Of Parts :</label>
                <input
                    type="number"
                    className="form-control"
                    style={{ width: "70px" }}
                    value={numberOfParts}
                    onChange={(e) => setNumberOfParts(parseInt(e.target.value) || 1)}
                    min="1"
                    readOnly={Page === "View"}
                />
                {Page !== "View" && (
                    <Button color="light" className="ml-2 border" onClick={handleSetParts}>Set</Button>
                )}
            </div>

            <div className="mt-3">
                <label>Parts</label>
                <p className="text-danger mb-1" style={{ fontSize: "12px" }}>* Fields can not be edited once saved.</p>
                <div className="table-responsive" style={{ border: "1px solid #ccc", maxHeight: "400px" }}>
                    <Table bordered size="sm" style={{ background: "white", marginBottom: 0 }}>
                        <thead>
                            <tr style={{ background: "#f0f0f0" }}>
                                <th style={{ minWidth: "200px", position: "sticky", left: 0, background: "#f0f0f0", zIndex: 1 }}></th>
                                {partColumn.map((col, index) => (
                                    <th key={index} className="text-center" style={{ minWidth: "120px" }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {partData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td style={{ fontWeight: "bold", background: "#f8f9fa", position: "sticky", left: 0, zIndex: 1 }}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            {row.label}
                                            {row.unitCategory && (
                                                <select
                                                    className="form-control form-control-sm ml-1"
                                                    style={{ width: "70px", height: "auto", padding: "0 2px" }}
                                                    value={moldUnitData[row.field]?.unit_id || (BaseUnitsArray[row.unitCategory] ? BaseUnitsArray[row.unitCategory][0].unit_id : "")}
                                                    onChange={(e) => handlePartUnitChange(row.field, e.target.value, row.unitCategory)}
                                                    disabled={Page === "View"}
                                                >
                                                    {BaseUnitsArray[row.unitCategory]?.map(unit => (
                                                        <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    {partColumn.map((col, colIndex) => (
                                        <td key={colIndex}>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm border-0"
                                                value={row[col] || ""}
                                                onChange={(e) => handlePartDataChange(rowIndex, col, e.target.value)}
                                                readOnly={Page === "View"}
                                                autoComplete="off"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default PartsSection;
