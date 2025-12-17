import React, { useEffect } from "react";
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  ColumnsDirective,
  ColumnDirective, focus
} from "@syncfusion/ej2-react-spreadsheet";
import "../../../assets/custom-stylesheet/grid_stylecss.css";

const InjGrid = ({
  rowCount,
  InjSpeedGridData,
  // setInjSpeedGridData,
  InjSpeedSpreadsheet,
  // setRowToBeDeleted,
  PopulateInjSpeedSheet,
  // Shot_Size,
  // Suck_Back,
  // TransferPosition, showAlert
  getData
}) => {
  const protectSettings = { selectCells: true };

  const scrollSettings = {
    isFinite: true,
    enableVirtualization: false,
  };

  let isPaste = false;

  const dialogBeforeOpen = (args) => {
    if (args.dialogName === "EditAlertDialog") {
      args.cancel = true;
      // args.content = 'This cell is read only';
    }

    // Edit the dialog content using the dialogBeforeOpen event.
    if (args.dialogName === "ValidationErrorDialog") {
      args.cancel = true;
    }
  };

  function onCreated() {
    //Applies data validation to specified range in the active sheet.
    InjSpeedSpreadsheet.current.addDataValidation(
      {
        type: "Decimal",
        operator: "Between",
        value1: "-10000.0",
        value2: "10000.0",
      },
      `A1:C${InjSpeedSpreadsheet.current.getActiveSheet().rowCount}`
    );

    InjSpeedSpreadsheet.current.lockCells(
      `A1:B${InjSpeedSpreadsheet.current.getActiveSheet().rowCount}`,
      false
    );

    PopulateInjSpeedSheet(InjSpeedGridData);

    focus(InjSpeedSpreadsheet.current.element);
  }

  const cellEditing = (args) => {
    if (args.value !== args.oldValue && !isNaN(args.value)) {
      InjSpeedSpreadsheet.current.updateCell(
        { value: args.value },
        args.address
      );

      getData();
    }
  };

  const UnlockCells = () => {
    InjSpeedSpreadsheet.current.lockCells(
      `A1:B${InjSpeedSpreadsheet.current.getActiveSheet().rowCount}`,
      false
    );

    InjSpeedSpreadsheet.current.getActiveSheet().rowCount =
      rowCount > 0 ? rowCount : 10;

    // PopulateInjSpeedSheet(InjSpeedGridData)
  };

  function beforeCellUpdate(args) {
    // Skip the cell update for paste action that contains characters, If you need you can skip this for all type of actions performed in the spreadsheet.
    if (isPaste) {
      let pastedValue = args.cell.value;

      // Match alphabets and special characters
      var regex = /[a-zA-Z]/g;

      if (pastedValue && pastedValue.toString().match(regex)) {
        args.cancel = true;
      }

      isPaste = false;
    }
  }

  function actionBegin(args) {
    if (args.args.eventArgs && args.args.eventArgs.requestType === "paste") {
      isPaste = true;
    }

    if (
      args.action === "clipboard" &&
      args.args.eventArgs.requestType === "paste"
    ) {
      //Set the type to 'Values' to paste only the values.
      args.args.eventArgs.type = "Values";
    }
  }

  const beforeCellRenderHandler = (args) => {
    // PopulateInjSpeedSheet(InjSpeedGridData);

    // Condition to check whether the rendered element is header cell.
    if (
      args.colIndex === 0 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = "Injection Speed (units/sec)";
      args.element.innerText = text;
    }
    if (
      args.colIndex === 1 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = "Displayed Fill Time (sec)";
      args.element.innerText = text;
    }
    if (
      args.colIndex === 2 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = "Actual Calculated Speed (units/sec)";
      args.element.innerText = text;
    }
    if (
      args.colIndex === 3 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = "Expected Calculated Fill Time (sec)";
      args.element.innerText = text;
    }
    if (
      args.colIndex === 4 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = "Variation in actual Speed from set Speed (%)";
      args.element.innerText = text;
    }
  };

  useEffect(() => {
    PopulateInjSpeedSheet(InjSpeedGridData);

    // eslint-disable-next-line
  }, [InjSpeedGridData]);

  return (
    <>
      <div
        className="spreadsheet"
        id="Inj_Speed_Sheet"
        onMouseEnter={UnlockCells}
        onMouseLeave={getData}
        onBlur={getData}
      >
        <SpreadsheetComponent
          className="equipmentInjGrid"
          onClick={getData}
          cellEdited={getData}
          cellEditing={cellEditing}
          ref={InjSpeedSpreadsheet}
          height={220}
          width={"100%"}
          showFormulaBar={false}
          showSheetTabs={false}
          showRibbon={false}
          dialogBeforeOpen={dialogBeforeOpen.bind(this)}
          scrollSettings={scrollSettings}
          allowAutoFill={false}
          created={onCreated}
          beforeCellRender={beforeCellRenderHandler}
          beforeCellUpdate={beforeCellUpdate.bind(this)}
          actionBegin={actionBegin.bind(this)}
          enableContextMenu={false}
          allowImage={false}
        >
          <SheetsDirective>
            <SheetDirective
              colCount={5}
              isProtected={true}
              protectSettings={protectSettings}
            >
              <ColumnsDirective>
                <ColumnDirective width={110}></ColumnDirective>
                <ColumnDirective width={110}></ColumnDirective>
                <ColumnDirective width={140}></ColumnDirective>
                <ColumnDirective width={140}></ColumnDirective>
                <ColumnDirective width={140}></ColumnDirective>
              </ColumnsDirective>
            </SheetDirective>
          </SheetsDirective>
        </SpreadsheetComponent>
      </div>
    </>
  );
};

export default InjGrid;
