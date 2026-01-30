import React from "react";
import { Table, Button } from "reactstrap";

const MoldCustomFields = ({ customFields, handleCustomFieldChange, ToggleEditModal, Page }) => {
    return (
        <div className="mt-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <label>Custom Fields</label>
                {Page !== "View" && (
                    <Button color="light" size="sm" className="border" onClick={ToggleEditModal}>Edit</Button>
                )}
            </div>

            <div className="table-responsive" style={{ border: "1px solid #ccc", width: "300px" }}>
                <Table bordered size="sm" style={{ background: "white", marginBottom: 0 }}>
                    <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                            <th className="text-center">Name</th>
                            <th className="text-center">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customFields.map((field, index) => (
                            <tr key={index}>
                                <td style={{ background: "#f8f9fa" }}>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm border-0"
                                        value={field.name}
                                        readOnly
                                        style={{ background: "transparent" }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm border-0"
                                        value={field.value}
                                        onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                                        readOnly={Page === "View"}
                                        autoComplete="off"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default MoldCustomFields;
