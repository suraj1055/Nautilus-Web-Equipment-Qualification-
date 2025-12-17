import React, { useState, useRef, useEffect } from "react";
import ShotGrid from "./ShotGrid";
// Syncfusion chart control
import {
  ChartComponent,
  Inject,
  SeriesCollectionDirective,
  SeriesDirective,
  Category,
  DataLabel,
  AxesDirective,
  AxisDirective,
  ScatterSeries,
  Tooltip,
  Legend
} from "@syncfusion/ej2-react-charts";
import AddRow from "./AddRow";
import {
  HtmlEditor,
  RichTextEditorComponent,
  Toolbar,
} from "@syncfusion/ej2-react-richtexteditor";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Button } from "reactstrap";
import EditColumnHeader from "./EditColumnHeader";
import ShotCalcGrid from "./ShotCalcGrid";
import ShotRepGrid from "./ShotRepGrid";

const ShotRepeatability = ({ showAlert, ShotData, ToSaveShotData }) => {
  let ShotSpreadsheet = useRef();

  // To store the session Id
  const [SessionId, setSessionId] = useState("1");

  const [Header1, setHeader1] = useState("Injection Speed Low");
  const [Header2, setHeader2] = useState("Injection Speed Medium");
  const [Header3, setHeader3] = useState("Injection Speed High");

  const [Acceptable_variation, setAcceptable_variation] = useState(null);

  let [Average, setAverage] = useState([]);
  let [Range, setRange] = useState([]);
  let [MaxPart, setMaxPart] = useState([]);
  let [MinPart, setMinPart] = useState([]);
  let [Percentage, setPercentage] = useState([]);

  // State and Event for the comment modal
  const [show, setShow] = useState(false);

  const [EditHeaderModal, setEditHeaderModal] = useState();

  const [EmptyHeaderError, setEmptyHeaderError] = useState(false);

  const toggleEmptyHeaderError = () => setEmptyHeaderError(!EmptyHeaderError);

  const [data, setData] = useState(
    Array.from({ length: 10 }, () => Array(4).fill(""))
  );

  const toggleEditHeaderModal = () => {
    if (!Header1 || !Header2 || !Header3) {
      toggleEmptyHeaderError();
    } else {
      setEditHeaderModal(!EditHeaderModal);

      ShotSpreadsheet.current.refresh();

      setEmptyHeaderError(false);
    }
  };

  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);

  let toolbarSettings = {
    items: [
      "Bold",
      "Italic",
      "Underline",
      "FontSize",
      "FontColor",
      "BackgroundColor",
      "Alignments",
      "OrderedList",
      "UnorderedList",
      "Undo",
      "Redo",
    ],
  };

  // A state variable to store and set the value of textarea
  const [Comment, setComment] = useState("");

  const [Alert, setAlert] = useState(false);

  const [ShotGridData, setShotGridData] = useState([
    {
      "Shot 1": "Shot 1",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 2": "Shot 2",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 3": "Shot 3",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 4": "Shot 4",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 5": "Shot 5",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 6": "Shot 6",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 7": "Shot 7",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 8": "Shot 8",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 9": "Shot 9",
      "value1": null,
      "value2": null,
      "value3": null
    },
    {
      "Shot 10": "Shot 10",
      "value1": null,
      "value2": null,
      "value3": null
    }
  ]);

  const [rowCount, setRowCount] = useState(10);

  const [rowToBeDeleted, setRowToBeDeleted] = useState();

  // Boolean variable to switch between the save and update button
  const [showSave, setShowSave] = useState(true);

  const [args, setArgs] = useState("");

  // As the user enter's the number of row's it get's set in this variable.
  const [row, setRow] = useState(5);

  // Set's the visibility of the modal which we use to get the number of row's to be generated
  const [ShotAddRowModal, setShotAddRowModal] = useState();

  const ToggleAddRowModal = () => {
    setShotAddRowModal(!ShotAddRowModal);
  };

  // This is the event to do the above said thing.
  const addRow = (e) => {
    e.preventDefault();

    // Storing the number entered
    setRow(e.target.value);
  };

  const RenderHeaders = () => {
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

  const increaseRow = () => {
    setRowCount(parseInt(rowCount) + parseInt(row));

    setAlert(true);

    setRow(null);
  };

  const DeleteGridRow = (id) => {

    if (ShotGridData.length !== 2) {

      const newData = [...data];

      newData.splice(rowToBeDeleted, 1);

      setData(newData);

      ShotGridData.splice(rowToBeDeleted, 1);

      setAlert(true);
    };
  };

  // Event to set the data entered in the textarea
  const getComment = (e) => {
    if (e.target) {
      setComment(e.target.value);
    } else {
      setComment(e.value);
      setAlert(true);
    }
  };

  function calculateNiceNumbers(min, max, numTicks) {
    const range = max - min;
    const roughStep = range / numTicks;
    const magnitude = Math.floor(Math.log10(roughStep));
    const magnitudePow = Math.pow(10, magnitude);
    const mantissa = roughStep / magnitudePow;
    let niceStep;

    if (mantissa <= 1.0) {
      niceStep = 1 * magnitudePow;
    } else if (mantissa <= 2.0) {
      niceStep = 2 * magnitudePow;
    } else if (mantissa <= 5.0) {
      niceStep = 5 * magnitudePow;
    } else {
      niceStep = 10 * magnitudePow;
    }

    const niceMin = Math.floor(min / niceStep) * niceStep;
    const niceMax = Math.ceil(max / niceStep) * niceStep;

    const numNiceTicks = Math.floor((niceMax - niceMin) / niceStep) + 1;
    const niceTicks = Array.from(
      { length: numNiceTicks },
      (_, i) => niceMin + i * niceStep
    );

    return {
      min: niceMin,
      max: niceMax,
      step: niceStep,
      ticks: niceTicks,
    };
  }

  function generateChartData(Average, Max, Min, Variation) {
    const result = [];
    let dataPoint = {};

    for (let i = 0; i < Average.length; i++) {
      if (i === 0) {
        dataPoint = {
          col_header: `${Header1} (Col${i + 1})`,
          Average: Average[i],
          min: Min[i],
          max: Max[i],
          Variation: Variation[i],
        };
      } else if (i === 1) {
        dataPoint = {
          col_header: `${Header2} (Col${i + 1})`,
          Average: Average[i],
          min: Min[i],
          max: Max[i],
          Variation: Variation[i],
        };
      } else if (i === 2) {
        dataPoint = {
          col_header: `${Header3} (Col${i + 1})`,
          Average: Average[i],
          min: Min[i],
          max: Max[i],
          Variation: Variation[i],
        };
      }

      result.push(dataPoint);
    }

    return result;
  }

  const [ChartData, setChartData] = useState([]);

  const [PrimaryYNumbers, setPrimaryYNumbers] = useState({
    min: 0,
    max: 0,
    step: 0,
  });

  const [SecondaryYNumbers, setSecondaryYNumbers] = useState({
    min: 0,
    max: 0,
    step: 0,
  });

  // Event to set the Min, Max and Interval of graph i.e scalling the graph
  const scaleGraph = () => {
    if (ShotGridData.length > 0) {
      const outputArray = generateChartData(
        Average,
        MaxPart,
        MinPart,
        Percentage
      );

      let combinedArray = [...Average, ...MaxPart, ...MinPart];

      const minValue = Math.min(...combinedArray);
      const maxValue = Math.max(...combinedArray);

      setChartData(outputArray);

      setPrimaryYNumbers(calculateNiceNumbers(minValue, maxValue, 5));

      let YMargin =
        ((parseFloat(Math.max(...Percentage)) -
          parseFloat(Math.min(...Percentage))) /
          100) *
        10;

      if (parseFloat(Math.min(...Percentage)) > minValue) {
        setSecondaryYNumbers(
          calculateNiceNumbers(
            minValue - YMargin,
            Math.max(...Percentage) + YMargin,
            5
          )
        );
      } else {
        setSecondaryYNumbers(
          calculateNiceNumbers(
            parseFloat(Math.min(...Percentage)) - YMargin,
            Math.max(...Percentage) + YMargin,
            5
          )
        );
      }
    }
  };

  const [ToPlotChart, setToPlotChart] = useState(true);

  useEffect(() => {
    if (ToPlotChart) scaleGraph();

    // eslint-disable-next-line
  }, [ShotGridData, Percentage]);

  useEffect(() => {
    const data = {
      session: SessionId,
      Headers: {
        Header1: Header1,
        Header2: Header2,
        Header3: Header3,
      },
      Acceptable_variation: Acceptable_variation,
      ShotGridData: ShotGridData,
      Comment: Comment ? Comment : "N/A",
      PrintData: {
        Range: Range,
        MaxPart: MaxPart,
        MinPart: MinPart,
        Average: Average,
        Percentage: Percentage,
        session: SessionId,
        Headers: {
          Header1: Header1,
          Header2: Header2,
          Header3: Header3,
        },
        Acceptable_variation: Acceptable_variation,
        ShotGridData: ShotGridData,
        Comment: Comment ? Comment : "N/A",
        PrimaryYNumbers: PrimaryYNumbers,
        SecondaryYNumbers: SecondaryYNumbers,
        ChartData: ChartData,
      }
    };

    showAlert.current = true;

    ShotData.current = data;

    // eslint-disable-next-line
  }, [Header1, Header2, Header3, Acceptable_variation, ShotGridData, Comment]);

  const transformShotData = (input) => {
    return input.map(item => {
      const row = [];

      const shotKey = Object.keys(item).find(key => key.startsWith("Shot"));

      if (shotKey) {
        row.push(item[shotKey]);
      }

      Object.keys(item)
        .filter(key => key.startsWith("value"))
        .sort((a, b) => {
          const numA = parseInt(a.replace("value", ""));
          const numB = parseInt(b.replace("value", ""));
          return numA - numB;
        })
        .forEach(key => row.push(item[key]));

      return row;
    });
  };

  useEffect(() => {
    if (ShotGridData.length > 0) {

      const result = transformShotData(ShotGridData);

      setData(result)
    }
  }, [ShotGridData]);

  // Load data from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("ShotData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.Headers) {
          setHeader1(parsedData.Headers.Header1);
          setHeader2(parsedData.Headers.Header2);
          setHeader3(parsedData.Headers.Header3);
        }
        if (parsedData.ShotGridData) {
          setShotGridData(parsedData.ShotGridData);
          ToSaveShotData.current = false;
          setShowSave(false);
        }
        if (parsedData.Acceptable_variation) setAcceptable_variation(parsedData.Acceptable_variation);
        if (parsedData.Comment) setComment(parsedData.Comment);
      } catch (e) {
        console.log("Error loading saved data:", e);
      }
    }
    // eslint-disable-next-line
  }, []);

  const GetValues = () => {
    return new Promise((resolve, reject) => {
      let TempArray = [];

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
    });
  };

  const getData = () => {

    GetValues().then((DataArray) => {
      ConvertToJson(DataArray).then((TabelObjData) => {

        setShotGridData(TabelObjData);
      });
    });
  };

  return (
    <div>
      <EditColumnHeader
        EditHeaderModal={EditHeaderModal}
        toggleEditHeaderModal={toggleEditHeaderModal}
        setHeader1={setHeader1}
        setHeader2={setHeader2}
        setHeader3={setHeader3}
        Header1={Header1}
        Header2={Header2}
        Header3={Header3}
        RenderHeaders={RenderHeaders}
        Alert={Alert}
        EmptyHeaderError={EmptyHeaderError}
      />
      <div style={{ marginTop: "35px" }}>
        <div className="card equipmentDash p-3 ml-2 mt-4" style={{ backgroundColor: "#e4eae1", marginTop: "25px" }}>
          <section
            className="b-primary b-r-4 mb-2"
          >
            <div className="m1">
              <div className="pt-2 pb-2 pr-2 pl-1">
                <div className="d-flex col-md-12 mb-2">


                  <div className="d-flex col-md-9">
                    <div className="m-1">Acceptable Minimum Variation :</div>

                    <div>
                      <input
                        className="form-control mt-1"
                        onChange={(e) => setAcceptable_variation(e.target.value)}
                        name="Pressure_Units"
                        defaultValue={Acceptable_variation}
                        onKeyPress={(event) => {
                          if (!/[-0.0-9.0]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        type="text"
                      />
                    </div>
                    <div>
                      <button
                        className="btn btn-warning btn-air-warning ml-2 mr-2"
                        type="button"
                        onClick={DeleteGridRow}
                      >
                        Delete Row
                      </button>
                    </div>
                    <div>
                      <button
                        className="btn btn-primary btn-air-primary mr-2"
                        type="button"
                        onClick={toggleEditHeaderModal}
                      >
                        Edit Column Header
                      </button>

                      <AddRow
                        ToggleAddRowModal={ToggleAddRowModal}
                        ShotAddRowModal={ShotAddRowModal}
                        addRow={addRow}
                        increaseRow={increaseRow}
                      />
                    </div>

                    <div>
                      <button
                        className="btn btn-primary btn-air-primary mr-2"
                        type="button"
                        onClick={handleShow}
                      >
                        Comment
                      </button>
                    </div>

                  </div>

                  <div className="d-flex justify-content-end col-md-3">


                    <div>
                      <button
                        className="btn btn-primary btn-air-primary mr-2"
                        onClick={scaleGraph}
                      >
                        Show Graph
                      </button>
                    </div>

                    <Modal isOpen={show} centered>
                      <ModalHeader toggleEditHeaderModal={handleClose}>
                        Add Comment
                      </ModalHeader>
                      <ModalBody>
                        <RichTextEditorComponent
                          change={getComment}
                          value={Comment}
                          saveInterval="1"
                          toolbarSettings={toolbarSettings}
                          height={250}
                        >
                          <Inject services={[Toolbar, HtmlEditor]} />
                        </RichTextEditorComponent>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="dark" onClick={handleClose}>
                          Save & Close
                        </Button>
                      </ModalFooter>
                    </Modal>
                  </div>
                </div>
              </div>

              <div className="d-flex m-2">
                <div
                  className="mt-2 mb-2 ml-2 mr-0 col-md-6"
                  style={{ width: "50%" }}
                >
                  <div className="mb-1" onClick={() => setToPlotChart(false)}>
                    <ShotRepGrid data={data} setData={setData} getData={getData} setRowToBeDeleted={setRowToBeDeleted} ShotGridData={ShotGridData} setAverage={setAverage}
                      setRange={setRange}
                      setMaxPart={setMaxPart}
                      setMinPart={setMinPart}
                      setPercentage={setPercentage} Header1={Header1}
                      Header2={Header2}
                      Header3={Header3} />

                  </div>

                  <div className="mt-3">
                    <ShotCalcGrid
                      Average={Average}
                      MaxPart={MaxPart}
                      MinPart={MinPart}
                      Range={Range}
                      Header1={Header1}
                      Header2={Header2}
                      Header3={Header3}
                      Percentage={Percentage}
                      Acceptable_variation={Acceptable_variation}
                    />
                  </div>
                </div>

                <div className="mt-2 mb-2 col-md-6" style={{ width: "50%" }}>
                  <div className="ml-1">
                    <ChartComponent
                      className="equipmentShortChart"
                      width="100%"
                      height="460"
                      border={{ width: 1, color: "darkblue" }}
                      tooltip={{ enable: true }}
                      primaryXAxis={{
                        valueType: "Category", lineStyle: { color: "black" },
                        labelStyle: { color: "#000" },
                      }}
                      primaryYAxis={{
                        title: "Part Weights",
                        minimum: PrimaryYNumbers.min ? PrimaryYNumbers.min : 0,
                        maximum: PrimaryYNumbers.max ? PrimaryYNumbers.max : 0,
                        interval: PrimaryYNumbers.step ? PrimaryYNumbers.step : 0,
                        lineStyle: { color: "black" },
                        labelStyle: { color: "#000" },
                      }}
                    >
                      <Inject
                        services={[
                          ScatterSeries,
                          Category,
                          DataLabel,
                          Tooltip,
                          Legend,
                        ]}
                      />

                      <AxesDirective>
                        <AxisDirective
                          majorGridLines={{ width: 0 }}
                          title="% Variation"
                          name="secondaryY"
                          opposedPosition={true}
                          minimum={
                            SecondaryYNumbers.min ? SecondaryYNumbers.min : 0
                          }
                          maximum={
                            SecondaryYNumbers.max ? SecondaryYNumbers.max : 0
                          }
                          interval={
                            SecondaryYNumbers.step ? SecondaryYNumbers.step : 0
                          }
                          labelStyle={{ color: "#000" }}
                          lineStyle={{ color: "black" }}
                        />
                      </AxesDirective>

                      <SeriesCollectionDirective>
                        <SeriesDirective
                          dataSource={ChartData}
                          xName="col_header"
                          yName="Average"
                          type="Scatter"
                          name="Average"
                          marker={{ width: 10, height: 10 }}
                          labelStyle={{ color: "#000" }}
                        />

                        <SeriesDirective
                          dataSource={ChartData}
                          xName="col_header"
                          yName="min"
                          type="Scatter"
                          name="Min"
                          marker={{ width: 10, height: 10 }}
                        />

                        <SeriesDirective
                          dataSource={ChartData}
                          xName="col_header"
                          yName="max"
                          type="Scatter"
                          name="Max"
                          marker={{ width: 10, height: 10 }}
                        />

                        <SeriesDirective
                          dataSource={ChartData}
                          xName="col_header"
                          yName="Variation"
                          type="Scatter"
                          name="%Variation"
                          yAxisName="secondaryY"
                          marker={{ width: 10, height: 10 }}
                        />
                      </SeriesCollectionDirective>
                    </ChartComponent>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShotRepeatability;
