import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import "../../App.css";
import LeftInputSection from "./LeftInputSection";
import PartsSection from "./PartsSection";
import MoldCustomFields from "./MoldCustomFields";
import BreadCrumb from "../CommonSections/BreadCrumb";

const MoldView = () => {
  const history = useHistory();
  const { RowId } = useParams();

  const [moldData, setMoldData] = useState({
    Mold_No: "",
    Material_Id: "",
    Platen_Orientation: "",
    Number_of_Bases: "",
    Hot_Runner_Volume: "",
    Cycle_Time: "",
    Mold_Stack_Height: "",
    Mold_Vertical_Height: "",
    Req_Mold_Open_Stroke: "",
    Mold_Width: "",
    Number_of_Core_Pulls: "",
    Is_Family_Mold: "No",
    Number_of_Parts: 1,
  });

  const [moldUnitData, setMoldUnitData] = useState({
    Mold_No: { value: "", unit_id: "" },
    Material_Id: { value: "", unit_id: "" },
    Platen_Orientation: { value: "Horizontal", unit_id: "" },
    Number_of_Bases: { value: "1", unit_id: "" },
    Hot_Runner_Volume: { value: "", unit_id: 23 },
    Cycle_Time: { value: "", unit_id: 3 },
    Mold_Stack_Height: { value: "", unit_id: 10 },
    Mold_Vertical_Height: { value: "", unit_id: 10 },
    Req_Mold_Open_Stroke: { value: "", unit_id: 10 },
    Mold_Width: { value: "", unit_id: 10 },
    Number_of_Core_Pulls: { value: "", unit_id: "" },
    Weight_of_one_Part: { value: "", unit_id: 8 },
    Runner_Weight: { value: "", unit_id: 8 },
    Part_Projected_Area: { value: "", unit_id: 1 },
    Runner_Projected_Area: { value: "", unit_id: 1 },
  });

  const [partColumn, setPartColumn] = useState(["Part1"]);
  const [partData, setPartData] = useState([
    { label: "Part Description", field: "Part_Description" },
    { label: "Part Number *", field: "Part_Number" },
    { label: "Number of Cavities *", field: "Number_of_Cavities" },
    { label: "Starting Cavity Number *", field: "Starting_Cavity_Number" },
    { label: "Weight of one Part", field: "Weight_of_one_Part", unitCategory: "Weight" },
    { label: "Number Of Runners", field: "Number_of_Runners" },
    { label: "Runner Weight", field: "Runner_Weight", unitCategory: "Weight" },
    { label: "Part Projected Area", field: "Part_Projected_Area", unitCategory: "Area" },
    { label: "Runner Projected Area", field: "Runner_Projected_Area", unitCategory: "Area" },
  ]);

  const [customFields, setCustomFields] = useState([
    { name: "Ej Str Reqd", value: "" },
    { name: "No of Mold WL", value: "" },
    { name: "Mold Core Pull", value: "" },
  ]);

  // Base units organized by category
  const [BaseUnitsArray] = useState({
    Area: [
      { unit_id: 1, decimals: 0.12, unit_name: "sq cm" },
      { unit_id: 2, decimals: 0.12, unit_name: "sq in" },
    ],
    Time: [
      { unit_id: 3, decimals: 0, unit_name: "sec" },
      { unit_id: 4, decimals: 0.1, unit_name: "min" },
      { unit_id: 5, decimals: 0.12, unit_name: "hrs" },
    ],
    Volume: [{ unit_id: 23, unit_name: "cm^3" }],
    Weight: [
      { unit_id: 8, decimals: 0.12, unit_name: "Gms" },
      { unit_id: 9, decimals: 0.12, unit_name: "oz" },
    ],
    Distance: [
      { unit_id: 10, decimals: 0.12, unit_name: "mm" },
      { unit_id: 11, decimals: 0.12, unit_name: "in" },
      { unit_id: 22, decimals: 0.12, unit_name: "cm" },
    ],
  });

  useEffect(() => {
    if (RowId) {
      const decodedId = parseInt(atob(RowId));
      const StoredMoldData = JSON.parse(sessionStorage.getItem("MoldData")) || [];
      const mold = StoredMoldData.find((m) => m.id === decodedId);

      if (mold) {
        setMoldData({ ...moldData, ...mold });

        // Populate parts if they exist
        if (mold.Parts && mold.Parts.length > 0) {
          const newPartCols = mold.Parts.map((_, i) => `Part${i + 1}`);
          setPartColumn(newPartCols);

          const newPartData = partData.map(row => {
            const updatedRow = { ...row };
            mold.Parts.forEach((part, i) => {
              updatedRow[`Part${i + 1}`] = part[row.field];
            });
            return updatedRow;
          });
          setPartData(newPartData);
        }

        // Populate custom fields if they exist
        if (mold.CustomFields) {
          setCustomFields(mold.CustomFields);
        }

        const unitData = {};
        Object.keys(moldData).forEach((key) => {
          unitData[key] = { value: mold[key] || "", unit_id: mold[`${key}_Unit`] || moldUnitData[key]?.unit_id || "" };
        });
        setMoldUnitData(prev => ({ ...prev, ...unitData }));
      }
    }
  }, [RowId]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between ml-3 pt-3 pb-3">
        <BreadCrumb DB_Name={"Mold"} Current_Page={"View"} />
      </div>

      <div className="container-fluid">
        <div className="card p-3 ml-2" style={{ background: "#e4eae1" }}>
          <div className="pt-2 pb-2">
            <button className="btn btn-primary btn-air-primary mr-2" onClick={() => history.push(`/database/Options/${RowId}/MoldEdit`)}>
              Edit
            </button>
            <button className="btn btn-secondary btn-air-secondary mr-2" onClick={() => history.push("/databases")}>
              Back to List
            </button>
          </div>

          <div className="d-flex col-md-12 p-0">
            <div className="col-md-3">
              <LeftInputSection
                SelectedMoldUnitData={moldUnitData}
                BaseUnitsArray={BaseUnitsArray}
                MaterialData={JSON.parse(sessionStorage.getItem("MaterialData")) || []}
                Page={"View"}
              />
            </div>
            <div className="col-md-6 border-left border-right">
              <PartsSection
                isFamilyMold={moldData.Is_Family_Mold || "No"}
                numberOfParts={moldData.Number_of_Parts || 1}
                partData={partData}
                partColumn={partColumn}
                moldUnitData={moldUnitData}
                BaseUnitsArray={BaseUnitsArray}
                Page={"View"}
              />
            </div>
            <div className="col-md-3">
              <MoldCustomFields
                customFields={customFields}
                Page={"View"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoldView;
