import React, { useEffect } from "react";
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  ColumnsDirective,
  ColumnDirective, focus
} from "@syncfusion/ej2-react-spreadsheet";
import { getRangeIndexes } from "@syncfusion/ej2-spreadsheet";
import "../../../assets/custom-stylesheet/grid_stylecss.css";

const ShotGrid = ({
  rowCount,
  ShotGridData,
  setShotGridData,
  ShotSpreadsheet,
  setRowToBeDeleted,
  PopulateShotSheet,
  Header1,
  Header2,
  Header3,
  setArgs,
  RenderHeaders,
  setAverage,
  setRange,
  setMaxPart,
  setMinPart,
  setPercentage
}) => {
  const protectSettings = { selectCells: true };

  const scrollSettings = {
    isFinite: true,
    enableVirtualization: false,
  };

  let isPaste = false;

  useEffect(() => {
    const Total_Average = () => {
      const calculateAverage = (arr) => {
        if (arr.length === 0) {
          return 0;
        }

        const sum = arr.reduce((acc, num) => acc + num, 0);
        return sum;
      };

      let columnAverage = [],
        columnRange = [],
        columnMaxPart = [],
        columnMinPart = [],
        columnPercent = [];

      for (let i = 1; i <= 3; i++) {
        let total = 0,
          average = 0,
          range,
          Range_Array = [],
          max,
          min;

        for (let j = 1; j <= ShotGridData.length; j++) {
          if (ShotGridData[j - 1][`value${i}`] !== null) {
            Range_Array.push(parseFloat(ShotGridData[j - 1][`value${i}`]));
          }

          total = calculateAverage(Range_Array);

          average = Number(
            parseFloat(total) / parseInt(Range_Array.length)
          ).toFixed(3);

          range = Number(
            Math.max(...Range_Array) - Math.min(...Range_Array)
          ).toFixed(2);

          max = Math.max(...Range_Array);

          min = Math.min(...Range_Array);
        }

        let percent = [];

        percent.push(
          parseFloat(
            Number(
              ((parseFloat(max) - parseFloat(min)) / parseFloat(max)) * 100
            ).toFixed(3)
          )
        );

        // console.log(Range_Array);

        columnPercent[i - 1] = isNaN(percent) ? "" : percent;
        setPercentage(columnPercent);

        columnAverage[i - 1] = parseFloat(average);
        setAverage(columnAverage);

        columnRange[i - 1] = parseFloat(range);
        setRange(columnRange);

        columnMaxPart[i - 1] = max;
        setMaxPart(columnMaxPart);

        columnMinPart[i - 1] = min;
        setMinPart(columnMinPart);
      }
    };

    Total_Average();

    // eslint-disable-next-line
  }, [
    ShotGridData,
    setAverage,
    setMaxPart,
    setMinPart,
    setRange,
    setPercentage,
  ]);

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

  const GetValues = () => {
    return new Promise((resolve, reject) => {
      let TempArray = [];

      // JavaScript
      const tdElements = document.querySelectorAll("#Shot_Sheet .e-cell");

      tdElements.forEach((td) => {
        const cellValue = td.textContent;

        if (cellValue) {
          TempArray.push(cellValue);
        } else {
          TempArray.push(null);
        }
      });

      resolve(TempArray);

      // console.log(TempArray)
    });
  };

  const ConvertToJson = (DataArray) => {
    return new Promise((resolve, reject) => {
      let TempArray = [];

      let NumberOfRow = 0;

      for (let i = 0; i < Math.ceil(DataArray.length / 4); i++) {
        TempArray.push({
          [`Shot ${i + 1}`]: `Shot ${i + 1}`,
          value1: DataArray[1 + NumberOfRow]
            ? parseFloat(DataArray[1 + NumberOfRow])
            : null,
          value2: DataArray[2 + NumberOfRow]
            ? parseFloat(DataArray[2 + NumberOfRow])
            : null,
          value3: DataArray[3 + NumberOfRow]
            ? parseFloat(DataArray[3 + NumberOfRow])
            : null,
        });

        NumberOfRow = NumberOfRow + 4;
      }

      resolve(TempArray);

      // console.log(TempArray)
    });
  };

  const getData = () => {
    // Getting the index of the selected row and storing in a variable
    let cell = ShotSpreadsheet.current.getActiveSheet().activeCell;

    let cellIdx = getRangeIndexes(cell);

    setRowToBeDeleted(cellIdx[0]);

    GetValues().then((DataArray) => {
      ConvertToJson(DataArray).then((TabelObjData) => {
        PopulateShotSheet(TabelObjData);

        setShotGridData(TabelObjData);

        // console.log(TabelObjData)
      });
    });
  };

  const cellEditing = (args) => {
    if (args.value !== args.oldValue && !isNaN(args.value)) {
      ShotSpreadsheet.current.updateCell({ value: args.value }, args.address);

      getData();
    }
  };

  function onCreated() {
    //Applies data validation to specified range in the active sheet.
    ShotSpreadsheet.current.addDataValidation(
      {
        type: "Decimal",
        operator: "Between",
        value1: "-1000.0",
        value2: "1000.0",
      },
      `A1:C${ShotSpreadsheet.current.getActiveSheet().rowCount}`
    );

    ShotSpreadsheet.current.lockCells(
      `B1:D${ShotSpreadsheet.current.getActiveSheet().rowCount}`,
      false
    );

    PopulateShotSheet(ShotGridData);

    focus(ShotSpreadsheet.current.element);
  }

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
    PopulateShotSheet(ShotGridData);

    setArgs(args);

    // Condition to check whether the rendered element is header cell.
    if (
      args.colIndex === 0 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = "Shot";
      args.element.innerText = text;
    }
    if (
      args.colIndex === 1 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = Header1;
      args.element.innerText = text;
    }
    if (
      args.colIndex === 2 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = Header2;
      args.element.innerText = text;
    }
    if (
      args.colIndex === 3 &&
      args.element.classList.contains("e-header-cell")
    ) {
      const text = Header3;
      args.element.innerText = text;
    }
  };

  useEffect(() => {
    for (let i = 1; i <= rowCount; i++) {
      let value = i;

      ShotSpreadsheet.current.updateCell({ value: `Shot ${value}` }, `A${i}`);
    }
  }, [rowCount, ShotSpreadsheet]);

  return (
    <>
      <div className="spreadsheet" id="Shot_Sheet" onMouseEnter={RenderHeaders} onBlur={getData}>
        <SpreadsheetComponent
          onBlur={getData}
          cellEdited={getData}
          className="equipmentShortGrid"
          cellEditing={cellEditing}
          ref={ShotSpreadsheet}
          width={"100%"}
          height={250}
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
              rowCount={rowCount}
              colCount={4}
              isProtected={true}
              protectSettings={protectSettings}
            >
              <ColumnsDirective>
                <ColumnDirective width={70}></ColumnDirective>
                <ColumnDirective width={110}></ColumnDirective>
                <ColumnDirective width={125}></ColumnDirective>
                <ColumnDirective width={110}></ColumnDirective>
              </ColumnsDirective>
            </SheetDirective>
          </SheetsDirective>
        </SpreadsheetComponent>
      </div>
    </>
  );
};

export default ShotGrid;
