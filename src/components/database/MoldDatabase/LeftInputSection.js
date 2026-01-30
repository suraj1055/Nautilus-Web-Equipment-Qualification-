import React, { useEffect, useState } from "react";
import { Table } from "reactstrap";

const LeftInputSection = ({
  SelectedMoldUnitData,
  MaterialData,
  handleChange,
  handleDropDownChange,
  ToggleImgModal,
  BaseUnitsArray,
  BaseUnits,
  Page,
}) => {
  return (
    <div>
      <Table
        className="table-bordernone table-responsive"
        style={{ background: "#e4eae1" }}
        cellPadding="0"
        cellSpacing="0"
        color="none"
      >
        <tbody>
          <tr>
            <td align="right" style={{ background: "#e4eae1", width: "160px" }}>
              Mold Number :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <input
                type="text"
                className="form-control b-b-primary"
                name="Mold_No"
                value={SelectedMoldUnitData.Mold_No.value}
                onChange={handleChange}
                style={{ width: 140 }}
                autoComplete="off"
                {...(Page === "View" ? { readOnly: true } : {})}
              />
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Material ID :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <select
                className="form-control b-b-primary"
                name="Material_Id"
                value={SelectedMoldUnitData.Material_Id.value}
                onChange={handleChange}
                style={{ width: 140 }}
                autoComplete="off"
                data-fieldname={"Material_Id"}
                disabled={Page === "View"}
              >
                <option value={null}> Select a material </option>
                {MaterialData.map((item, key) => (
                  <option value={item.id} key={key}>
                    {item.Material_Id}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Platen Orientation :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <select
                className="form-control b-b-primary"
                name="Platen_Orientation"
                value={SelectedMoldUnitData.Platen_Orientation.value}
                onChange={handleChange}
                style={{ width: 140 }}
                disabled={Page === "View"}
              >
                <option value="Horizontal">Horizontal</option>
                <option value="Vertical">Vertical</option>
              </select>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Number of Bases :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <input
                type="text"
                className="form-control b-b-primary"
                name="Number_of_Bases"
                value={SelectedMoldUnitData.Number_of_Bases.value}
                onChange={handleChange}
                style={{ width: 70 }}
                autoComplete="off"
                {...(SelectedMoldUnitData.Platen_Orientation.value === "Horizontal" ? { readOnly: true } : {})}
                {...(Page === "View" ? { readOnly: true } : {})}
              />
              <button
                type="button"
                className="form-control b-b-primary ml-1 text-center"
                style={{ width: 40, cursor: "pointer", display: "inline-block" }}
                onClick={ToggleImgModal}
              >
                ?
              </button>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Cycle Time :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control b-b-primary"
                  name="Cycle_Time"
                  value={SelectedMoldUnitData.Cycle_Time.value}
                  onChange={handleChange}
                  style={{ width: 70 }}
                  autoComplete="off"
                  {...(Page === "View" ? { readOnly: true } : {})}
                />
                <select
                  className="form-control b-b-primary ml-1"
                  name="Cycle_Time_Unit"
                  value={SelectedMoldUnitData.Cycle_Time.unit_id}
                  onChange={(e) => handleDropDownChange(e, "Cycle_Time", "Time")}
                  style={{ width: 70 }}
                  disabled={Page === "View"}
                >
                  {BaseUnitsArray.Time?.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
                  ))}
                </select>
              </div>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Mold Stack Height :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control b-b-primary"
                  name="Mold_Stack_Height"
                  value={SelectedMoldUnitData.Mold_Stack_Height.value}
                  onChange={handleChange}
                  style={{ width: 70 }}
                  autoComplete="off"
                  {...(Page === "View" ? { readOnly: true } : {})}
                />
                <select
                  className="form-control b-b-primary ml-1"
                  name="Mold_Stack_Height_Unit"
                  value={SelectedMoldUnitData.Mold_Stack_Height.unit_id}
                  onChange={(e) => handleDropDownChange(e, "Mold_Stack_Height", "Distance")}
                  style={{ width: 70 }}
                  disabled={Page === "View"}
                >
                  {BaseUnitsArray.Distance?.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
                  ))}
                </select>
              </div>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Mold Vertical Height :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control b-b-primary"
                  name="Mold_Vertical_Height"
                  value={SelectedMoldUnitData.Mold_Vertical_Height.value}
                  onChange={handleChange}
                  style={{ width: 70 }}
                  autoComplete="off"
                  {...(Page === "View" ? { readOnly: true } : {})}
                />
                <span className="ml-1" style={{ width: "70px" }}>
                  {BaseUnitsArray.Distance?.find(u => u.unit_id == SelectedMoldUnitData.Mold_Stack_Height.unit_id)?.unit_name || ""}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Mold Width :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control b-b-primary"
                  name="Mold_Width"
                  value={SelectedMoldUnitData.Mold_Width.value}
                  onChange={handleChange}
                  style={{ width: 70 }}
                  autoComplete="off"
                  {...(Page === "View" ? { readOnly: true } : {})}
                />
                <span className="ml-1" style={{ width: "70px" }}>
                  {BaseUnitsArray.Distance?.find(u => u.unit_id == SelectedMoldUnitData.Mold_Stack_Height.unit_id)?.unit_name || ""}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Number of Core Pulls :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <input
                type="text"
                className="form-control b-b-primary"
                name="Number_of_Core_Pulls"
                value={SelectedMoldUnitData.Number_of_Core_Pulls.value}
                onChange={handleChange}
                style={{ width: 70 }}
                autoComplete="off"
                {...(Page === "View" ? { readOnly: true } : {})}
              />
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Hot Runner Volume :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control b-b-primary"
                  name="Hot_Runner_Volume"
                  value={SelectedMoldUnitData.Hot_Runner_Volume.value}
                  onChange={handleChange}
                  style={{ width: 70 }}
                  autoComplete="off"
                  {...(Page === "View" ? { readOnly: true } : {})}
                />
                <select
                  className="form-control b-b-primary ml-1"
                  name="Hot_Runner_Volume_Unit"
                  value={SelectedMoldUnitData.Hot_Runner_Volume.unit_id}
                  onChange={(e) => handleDropDownChange(e, "Hot_Runner_Volume", "Volume")}
                  style={{ width: 70 }}
                  disabled={Page === "View"}
                >
                  {BaseUnitsArray.Volume?.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
                  ))}
                </select>
              </div>
            </td>
          </tr>

          <tr>
            <td align="right" style={{ background: "#e4eae1" }}>
              Req Mold Open Stroke :
            </td>
            <td align="left" style={{ background: "#e4eae1" }}>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control b-b-primary"
                  name="Req_Mold_Open_Stroke"
                  value={SelectedMoldUnitData.Req_Mold_Open_Stroke.value}
                  onChange={handleChange}
                  style={{ width: 70 }}
                  autoComplete="off"
                  {...(Page === "View" ? { readOnly: true } : {})}
                />
                <span className="ml-1" style={{ width: "70px" }}>
                  {BaseUnitsArray.Distance?.find(u => u.unit_id == SelectedMoldUnitData.Mold_Stack_Height.unit_id)?.unit_name || ""}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default LeftInputSection;
