import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import "../../App.css";
import { useHistory } from "react-router-dom";
import LeftInputSection from "./LeftInputSection";
import PartsSection from "./PartsSection";
import MoldCustomFields from "./MoldCustomFields";
import BreadCrumb from "../CommonSections/BreadCrumb";

const MoldNew = () => {
  const history = useHistory();

  const [SamePage, setSamePage] = useState(false);

  const [moldData, setMoldData] = useState({
    Mold_No: "",
    Material_Id: "",
    Platen_Orientation: "Horizontal",
    Number_of_Bases: "1",
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

  const [ModalStates, setModalStates] = useState({
    MoldIdConfirm: { visibility: false, title: "Confirm Mold No", message: "Mold No is mandatory." },
    MoldIdUnique: { visibility: false, title: "Duplicate Mold No", message: "Mold No should be unique." },
  });

  const ToggleModalStates = (ModalKey) => {
    setModalStates({
      ...ModalStates,
      [ModalKey]: { ...ModalStates[ModalKey], visibility: !ModalStates[ModalKey].visibility },
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMoldData({ ...moldData, [name]: value });
    setMoldUnitData({ ...moldUnitData, [name]: { ...moldUnitData[name], value: value } });
  };

  const handleDropDownChange = (event, field, category) => {
    const { value } = event.target;
    setMoldUnitData({ ...moldUnitData, [field]: { ...moldUnitData[field], unit_id: value } });
  };

  const handleSetParts = () => {
    const num = moldData.Number_of_Parts;
    const newPartCols = Array.from({ length: num }, (_, i) => `Part${i + 1}`);
    setPartColumn(newPartCols);

    const newPartData = partData.map(row => {
      const updatedRow = { ...row };
      newPartCols.forEach(col => {
        if (updatedRow[col] === undefined) updatedRow[col] = "";
      });
      return updatedRow;
    });
    setPartData(newPartData);
  };

  const handlePartDataChange = (rowIndex, colName, value) => {
    const newData = [...partData];
    newData[rowIndex][colName] = value;
    setPartData(newData);
  };

  const handlePartUnitChange = (field, unitId, category) => {
    setMoldUnitData({ ...moldUnitData, [field]: { ...moldUnitData[field], unit_id: unitId } });
  };

  const handleCustomFieldChange = (index, value) => {
    const newFields = [...customFields];
    newFields[index].value = value;
    setCustomFields(newFields);
  };

  const SaveData = () => {
    const StoredMoldData = JSON.parse(sessionStorage.getItem("MoldData")) || [];
    const newId = StoredMoldData.length > 0 ? Math.max(...StoredMoldData.map(m => m.id)) + 1 : 1;

    const finalParts = partColumn.map(col => {
      const partObj = {};
      partData.forEach(row => {
        partObj[row.field] = row[col];
      });
      return partObj;
    });

    const finalMold = {
      ...moldData,
      id: newId,
      Parts: finalParts,
      CustomFields: customFields
    };

    Object.keys(moldUnitData).forEach(key => {
      if (moldUnitData[key].unit_id) {
        finalMold[`${key}_Unit`] = moldUnitData[key].unit_id;
      }
    });

    StoredMoldData.push(finalMold);
    sessionStorage.setItem("MoldData", JSON.stringify(StoredMoldData));

    if (SamePage) {
      history.push(`/database/Options/${btoa(newId)}/MoldView`);
    } else {
      history.push({ pathname: "/databases", TabIdx: 1 });
    }
  };

  const SubmitData = () => {
    if (!moldData.Mold_No) {
      ToggleModalStates("MoldIdConfirm");
      return;
    }

    const StoredMoldData = JSON.parse(sessionStorage.getItem("MoldData")) || [];
    const exists = StoredMoldData.some(
      (m) => String(m.Mold_No).toLowerCase() === String(moldData.Mold_No).toLowerCase()
    );

    if (exists) {
      ToggleModalStates("MoldIdUnique");
      return;
    }

    SaveData();
  };

  return (
    <>
      <Modal isOpen={ModalStates.MoldIdConfirm.visibility} centered={true} style={{ width: "400px" }}>
        <ModalHeader>{ModalStates.MoldIdConfirm.title}</ModalHeader>
        <ModalBody>{ModalStates.MoldIdConfirm.message}</ModalBody>
        <ModalFooter><Button color="primary" onClick={() => ToggleModalStates("MoldIdConfirm")}>Close</Button></ModalFooter>
      </Modal>

      <Modal isOpen={ModalStates.MoldIdUnique.visibility} centered={true} style={{ width: "400px" }}>
        <ModalHeader>{ModalStates.MoldIdUnique.title}</ModalHeader>
        <ModalBody>{ModalStates.MoldIdUnique.message}</ModalBody>
        <ModalFooter><Button color="primary" onClick={() => ToggleModalStates("MoldIdUnique")}>Close</Button></ModalFooter>
      </Modal>

      <div className="container-fluid">
        <div className="d-flex justify-content-between ml-3 pt-3 pb-3">
          <BreadCrumb DB_Name={"Mold"} Current_Page={"New"} />
        </div>

        <div className="container-fluid">
          <div className="card p-3 ml-2" style={{ background: "#e4eae1" }}>
            <div className="d-flex col-md-12">
              <div className="pt-2 pb-2">
                <button className="btn btn-info btn-air-info mr-2" onClick={SubmitData}>
                  {SamePage ? "Save and View" : "Save and Exit"}
                </button>
              </div>
              <div className="pt-2 pb-2">
                <button className="btn btn-secondary btn-air-secondary mr-2" onClick={() => history.push("/databases")}>Cancel</button>
              </div>
              <div className="pt-2 pb-2">
                <label className="ml-3">
                  <input type="checkbox" checked={SamePage} onChange={(e) => setSamePage(e.target.checked)} /> View after save
                </label>
              </div>
            </div>

            <div className="d-flex col-md-12 p-0">
              <div className="col-md-3">
                <LeftInputSection
                  SelectedMoldUnitData={moldUnitData}
                  handleChange={handleChange}
                  handleDropDownChange={handleDropDownChange}
                  BaseUnitsArray={BaseUnitsArray}
                  MaterialData={JSON.parse(sessionStorage.getItem("MaterialData")) || []}
                  Page={"New"}
                />
              </div>
              <div className="col-md-6 border-left border-right">
                <PartsSection
                  isFamilyMold={moldData.Is_Family_Mold}
                  numberOfParts={moldData.Number_of_Parts}
                  partData={partData}
                  partColumn={partColumn}
                  setIsFamilyMold={(val) => setMoldData({ ...moldData, Is_Family_Mold: val })}
                  setNumberOfParts={(val) => setMoldData({ ...moldData, Number_of_Parts: val })}
                  handlePartDataChange={handlePartDataChange}
                  handleSetParts={handleSetParts}
                  BaseUnitsArray={BaseUnitsArray}
                  handlePartUnitChange={handlePartUnitChange}
                  moldUnitData={moldUnitData}
                  Page={"New"}
                />
              </div>
              <div className="col-md-3">
                <MoldCustomFields
                  customFields={customFields}
                  handleCustomFieldChange={handleCustomFieldChange}
                  Page={"New"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MoldNew;
