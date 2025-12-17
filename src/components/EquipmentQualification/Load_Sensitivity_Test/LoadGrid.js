import React from 'react';
import { SpreadsheetComponent, SheetsDirective, SheetDirective, ColumnsDirective, ColumnDirective, focus } from '@syncfusion/ej2-react-spreadsheet';
import { getRangeIndexes } from '@syncfusion/ej2-spreadsheet';
import '../../../assets/custom-stylesheet/grid_stylecss.css';

const LoadGrid = ({ rowCount, LoadGridData, setLoadGridData, LoadSpreadsheet, setRowToBeDeleted, PopulateLoadSheet, Pressure_Units }) => {

    const protectSettings = { selectCells: true };

    const scrollSettings = {
        isFinite: true,
        enableVirtualization: false,
    };

    let isPaste = false;

    const dialogBeforeOpen = (args) => {

        if (args.dialogName === 'EditAlertDialog') {
            args.cancel = true
            // args.content = 'This cell is read only';
        }

        // Edit the dialog content using the dialogBeforeOpen event.
        if (args.dialogName === 'ValidationErrorDialog') {
            args.cancel = true
        }

    }

    const GetValues = () => {

        return new Promise((resolve, reject) => {

            let TempArray = []

            // JavaScript
            const tdElements = document.querySelectorAll('#Load_Sheet .e-cell');

            tdElements.forEach(td => {

                const cellValue = td.textContent;

                if (cellValue) {
                    TempArray.push(cellValue);
                } else {
                    TempArray.push('');
                }

            });

            resolve(TempArray)

            // console.log(TempArray)

        })

    }

    const ConvertToJson = (DataArray) => {

        return new Promise((resolve, reject) => {

            let TempArray = [];

            let NumberOfRow = 0;

            for (let i = 0; i < Math.ceil(DataArray.length / 6); i++) {

                TempArray.push({

                    "Injection Speed": DataArray[0 + NumberOfRow] ? parseFloat(DataArray[0 + NumberOfRow]) : '',
                    "Fill Time - In Mold (sec)": DataArray[1 + NumberOfRow] ? parseFloat(DataArray[1 + NumberOfRow]) : '',
                    "Peak Press at Transfer - In Mold": DataArray[2 + NumberOfRow] ? parseFloat(DataArray[2 + NumberOfRow]) : '',
                    "Fill Time - Air Shot (sec)": DataArray[3 + NumberOfRow] ? parseFloat(DataArray[3 + NumberOfRow]) : '',
                    "Peak Press at Transfer - Air Shot": DataArray[4 + NumberOfRow] ? parseFloat(DataArray[4 + NumberOfRow]) : '',
                    "Load Sensitivity": '',

                })

                NumberOfRow = NumberOfRow + 6

            }

            resolve(TempArray)

            // console.log(TempArray)

        })

    }

    const PerformCalcs = (TabelObjData) => {

        return new Promise((resolve, reject) => {

            let TempArray = [];

            for (let i = 0; i < TabelObjData.length; i++) {

                TempArray.push({

                    "Injection Speed": TabelObjData[i]["Injection Speed"] ? TabelObjData[i]["Injection Speed"] : '',

                    "Fill Time - In Mold (sec)": TabelObjData[i]["Fill Time - In Mold (sec)"] ? TabelObjData[i]["Fill Time - In Mold (sec)"] : '',

                    "Peak Press at Transfer - In Mold": TabelObjData[i]["Peak Press at Transfer - In Mold"] ? TabelObjData[i]["Peak Press at Transfer - In Mold"] : '',

                    "Fill Time - Air Shot (sec)": TabelObjData[i]["Fill Time - Air Shot (sec)"] ? TabelObjData[i]["Fill Time - Air Shot (sec)"] : '',

                    "Peak Press at Transfer - Air Shot": TabelObjData[i]["Peak Press at Transfer - Air Shot"] ? TabelObjData[i]["Peak Press at Transfer - Air Shot"] : '',

                    "Load Sensitivity": isNaN((TabelObjData[i]["Fill Time - In Mold (sec)"] - TabelObjData[i]["Fill Time - Air Shot (sec)"]) / TabelObjData[i]["Fill Time - In Mold (sec)"] * 100) / ((TabelObjData[i]["Peak Press at Transfer - In Mold"] - TabelObjData[i]["Peak Press at Transfer - Air Shot"]) / 1000) ?
                        '-'
                        :
                        parseFloat(Number(((TabelObjData[i]["Fill Time - In Mold (sec)"] - TabelObjData[i]["Fill Time - Air Shot (sec)"])
                            /
                            TabelObjData[i]["Fill Time - In Mold (sec)"] * 100) / ((TabelObjData[i]["Peak Press at Transfer - In Mold"] - TabelObjData[i]["Peak Press at Transfer - Air Shot"]) / 1000)).toFixed(5)),

                })

            }

            resolve(TempArray)

            // console.log(TempArray)

        })

    }

    const ConvertUnits = (CalcData) => {

        return new Promise((resolve, reject) => {

            for (let i = 0; i < CalcData.length; i++) {

                if (Pressure_Units === "ppsi (Plastic Pressure)") {

                    CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(Number(10 * parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(6))) ? '-' : parseFloat(Number(10 * parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(4))

                }
                else if (Pressure_Units === "Bar") {

                    CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(6))) ? '-' : parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"]) / 1000).toFixed(4))

                }
                else if (Pressure_Units === "Mpa") {

                    CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"])).toFixed(6))) ? '-' : parseFloat(Number(parseFloat(CalcData[i]["Load Sensitivity"]) / 1000).toFixed(4))

                }
                else {

                    CalcData[i]["Load Sensitivity"] = isNaN(parseFloat(CalcData[i]["Load Sensitivity"])) ? '-' : parseFloat(CalcData[i]["Load Sensitivity"])

                }

            }

            resolve(CalcData)

        })

    }

    function onCreated() {

        //Applies data validation to specified range in the active sheet.
        LoadSpreadsheet.current.addDataValidation(
            {
                type: 'Decimal',
                operator: 'Between',
                value1: '-10000.0',
                value2: '10000.0',
            },
            `A1:C${LoadSpreadsheet.current.getActiveSheet().rowCount}`
        );

        LoadSpreadsheet.current.lockCells(
            `A1:E${LoadSpreadsheet.current.getActiveSheet().rowCount}`,
            false
        );

        focus(LoadSpreadsheet.current.element);

    }

    const cellEditing = (args) => {

        if (args.value !== args.oldValue && !isNaN(args.value)) {

            LoadSpreadsheet.current.updateCell({ value: args.value }, args.address);

            getData()

        }

    };

    const getData = () => {

        // Getting the index of the selected row and storing in a variable
        let cell = LoadSpreadsheet.current.getActiveSheet().activeCell;

        let cellIdx = getRangeIndexes(cell);

        setRowToBeDeleted(cellIdx[0]);

        GetValues().then((DataArray) => {

            ConvertToJson(DataArray).then((TabelObjData) => {

                PerformCalcs(TabelObjData).then((CalcData) => {

                    ConvertUnits(CalcData).then((ConvertedData) => {

                        PopulateLoadSheet(ConvertedData)

                        setLoadGridData(ConvertedData)

                    })

                })

            })

        })

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

        if (args.args.eventArgs && args.args.eventArgs.requestType === 'paste') {
            isPaste = true;
        }

        if (args.action === 'clipboard' && args.args.eventArgs.requestType === 'paste') {
            //Set the type to 'Values' to paste only the values.
            args.args.eventArgs.type = 'Values';
        }

    }

    const beforeCellRenderHandler = (args) => {

        PopulateLoadSheet(LoadGridData);

        // Condition to check whether the rendered element is header cell.
        if (
            args.colIndex === 0 &&
            args.element.classList.contains('e-header-cell')
        ) {
            const text = 'Injection Speed'
            args.element.innerText = text;
        }
        if (
            args.colIndex === 1 &&
            args.element.classList.contains('e-header-cell')
        ) {
            const text = 'Fill Time - In Mold (sec)'
            args.element.innerText = text;
        }
        if (
            args.colIndex === 2 &&
            args.element.classList.contains('e-header-cell')
        ) {
            const text = 'Peak Press at Transfer - In Mold'
            args.element.innerText = text;
        }
        if (
            args.colIndex === 3 &&
            args.element.classList.contains('e-header-cell')
        ) {
            const text = 'Fill Time - Air Shot (sec)'
            args.element.innerText = text;
        }
        if (
            args.colIndex === 4 &&
            args.element.classList.contains('e-header-cell')
        ) {
            const text = 'Peak Press at Transfer - Air Shot'
            args.element.innerText = text;
        }
        if (
            args.colIndex === 5 &&
            args.element.classList.contains('e-header-cell')
        ) {
            const text = "Load Sensitivity"
            args.element.innerText = text;
        }

    }

    return (
        <div className="spreadsheet" id="Load_Sheet" onBlur={getData}>

            <SpreadsheetComponent
                className='equipmentLoadGrid'
                height={200}
                // width={"83vw"}
                width={"100%"}
                onClick={getData}
                cellEdited={getData}
                cellEditing={cellEditing}
                ref={LoadSpreadsheet}
                showFormulaBar={false}
                showSheetTabs={false}
                showRibbon={false}
                dialogBeforeOpen={dialogBeforeOpen.bind(this)}
                scrollSettings={scrollSettings} allowAutoFill={false}
                created={onCreated}
                beforeCellRender={beforeCellRenderHandler}
                beforeCellUpdate={beforeCellUpdate.bind(this)}
                actionBegin={actionBegin.bind(this)} enableContextMenu={false} allowImage={false}>

                <SheetsDirective>

                    <SheetDirective className='equipmentLoadGrid' rowCount={rowCount} colCount={6} isProtected={true} protectSettings={protectSettings}>

                        <ColumnsDirective>
                            <ColumnDirective width={180}></ColumnDirective>
                            <ColumnDirective width={180}></ColumnDirective>
                            <ColumnDirective width={200}></ColumnDirective>
                            <ColumnDirective width={180}></ColumnDirective>
                            <ColumnDirective width={200}></ColumnDirective>
                            <ColumnDirective width={180}></ColumnDirective>
                        </ColumnsDirective>

                    </SheetDirective>

                </SheetsDirective>

            </SpreadsheetComponent>

        </div>
    )
}

export default LoadGrid;