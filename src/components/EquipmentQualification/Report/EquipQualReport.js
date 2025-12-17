import {
  LineSeries,
  Category,
  DataLabel,
  Legend, Chart, Tooltip
} from "@syncfusion/ej2-react-charts";

import { useEffect, useRef, useState } from 'react';

import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.reports';

import 'stimulsoft-reports-js/Scripts/stimulsoft.viewer';

import { generateInjectionSpeedSection } from "./InjSpeedReport";
import { generateShotRepeatabilitySection } from "./ShotRepeatReport";
import { generateLoadSensitivitySection } from "./LoadSensitivityReport";

Chart.Inject(LineSeries, Category, Legend, DataLabel, Tooltip);

const EquipQualReport = ({ setSession_Id, selectedPrintSections, onClose, MoldName, SessionName }) => {

  const viewerRef = useRef(null);

  const [error, setError] = useState(null);

  const [InjSpeedData, setInjSpeedData] = useState(null);

  const [ShotData, setShotData] = useState([]);

  const [LoadData, setLoadData] = useState([]);

  // Load data from sessionStorage on mount
  useEffect(() => {
    // Load InjSpeed data
    const savedInjSpeedData = sessionStorage.getItem("InjSpeedData");
    if (savedInjSpeedData) {
      try {
        const parsedData = JSON.parse(savedInjSpeedData);
        if (parsedData && parsedData.InjSpeedGridData && Array.isArray(parsedData.InjSpeedGridData)) {
          setInjSpeedData(parsedData);
        }
      } catch (e) {
        console.log("Error loading InjSpeed data:", e);
      }
    }

    // Load Shot data
    const savedShotData = sessionStorage.getItem("ShotData");
    if (savedShotData) {
      try {
        const parsedData = JSON.parse(savedShotData);
        if (parsedData && parsedData.PrintData) {
          setShotData(parsedData.PrintData);
        }
      } catch (e) {
        console.log("Error loading Shot data:", e);
      }
    }

    // Load Load data
    const savedLoadData = sessionStorage.getItem("LoadData");
    if (savedLoadData) {
      try {
        const parsedData = JSON.parse(savedLoadData);
        if (parsedData && parsedData.PrintData) {
          setLoadData(parsedData.PrintData);
        }
      } catch (e) {
        console.log("Error loading Load data:", e);
      }
    }

    setSession_Id("1");
  }, [setSession_Id]);

  // ✅ Reusable function to add a standard title + subtitle band to any page
  const addPageHeader = (page, titleText, subTitleText) => {

    const headerBand = new Stimulsoft.Report.Components.StiPageHeaderBand();

    headerBand.height = 1.4;

    page.components.add(headerBand);

    // Title
    const title = new Stimulsoft.Report.Components.StiText();
    title.left = 0.2;
    title.top = 0.2;
    title.width = page.width - 0.4;
    title.height = 0.4;
    title.text = titleText;
    title.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Center;
    title.font = new Stimulsoft.System.Drawing.Font(
      "Verdana",
      8,
      Stimulsoft.System.Drawing.FontStyle.Bold
    );
    headerBand.components.add(title);

    // Subtitle
    const subTitle = new Stimulsoft.Report.Components.StiText();
    subTitle.left = 0.2;
    subTitle.top = 0.6;
    subTitle.width = page.width - 0.4;
    subTitle.height = 0.4;
    subTitle.text = subTitleText;
    subTitle.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Center;
    subTitle.font = new Stimulsoft.System.Drawing.Font(
      "Verdana",
      8,
      Stimulsoft.System.Drawing.FontStyle.Bold
    );
    headerBand.components.add(subTitle);

    return headerBand;
  };

  // ✅ Reusable function to add a Comments page with dynamic HTML content
  const addCommentsPage = (report, titleText, subTitleText, commentsHtml) => {
    // Create new page
    const commentsPage = new Stimulsoft.Report.Components.StiPage(report);
    commentsPage.orientation = Stimulsoft.Report.Components.StiPageOrientation.Portrait;
    commentsPage.pageWidth = 16.54;
    commentsPage.pageHeight = 11.69;
    commentsPage.margins = new Stimulsoft.Report.Components.StiMargins(0.3, 0.3, 0.3, 0.3);
    report.pages.add(commentsPage);

    // Add header using your existing helper
    const headerBand = addPageHeader(commentsPage, titleText, subTitleText);

    // Add data band for comments
    const dataBand = new Stimulsoft.Report.Components.StiDataBand();
    dataBand.name = `${subTitleText.replace(/\s+/g, '')}DataBand`;
    dataBand.height =
      commentsPage.height -
      headerBand.height -
      (commentsPage.margins.top + commentsPage.margins.bottom) -
      0.5;
    commentsPage.components.add(dataBand);

    // Add styled text
    const commentsText = new Stimulsoft.Report.Components.StiText();
    commentsText.left = 0.5;
    commentsText.top = 0.2;
    commentsText.width = commentsPage.width - 1.0;
    commentsText.height = dataBand.height - 0.4;
    commentsText.allowHtmlTags = true;
    commentsText.wordWrap = true;
    commentsText.horAlignment = Stimulsoft.Base.Drawing.StiTextHorAlignment.Left;

    commentsText.text =
      commentsHtml ||
      ``;

    dataBand.components.add(commentsText);

    return commentsPage;
  };

  useEffect(() => {
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;
    const originalOverflow = document.body.style.overflow;

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    let isCancelled = false;

    const generateReport = async () => {

      try {

        const report = new Stimulsoft.Report.StiReport();
        report.pages.clear();

        // ############################ Equipment Qualification (DATA) ###############

        // Only generate if data exists and has InjSpeedGridData
        if (InjSpeedData && InjSpeedData.InjSpeedGridData && Array.isArray(InjSpeedData.InjSpeedGridData) && InjSpeedData.InjSpeedGridData.length > 0) {
          await generateInjectionSpeedSection({
            report,
            selectedPrintSections,
            InjectionData: InjSpeedData,
            addPageHeader,
            addCommentsPage,
            isCancelled,
            moldName: MoldName || "Sample Mold",
            sessionName: SessionName || "Default Session"
          });
        }

        // ############################ Shot Repeatibility (DATA) ###############

        await generateShotRepeatabilitySection({
          report,
          ShotData,
          addPageHeader,
          addCommentsPage,
          selectedPrintSections,
          isCancelled,
          moldName: MoldName || "Sample Mold",
          sessionName: SessionName || "Default Session"
        });

        // ############################ Load Sensitivity (DATA) ######################

        await generateLoadSensitivitySection({
          report,
          LoadData,
          addPageHeader,
          addCommentsPage,
          selectedPrintSections,
          isCancelled,
          moldName: MoldName || "Sample Mold",
          sessionName: SessionName || "Default Session"
        })

        // Render the report
        if (isCancelled) return;

        report.renderAsync(() => {
          if (isCancelled) return;

          const options = new Stimulsoft.Viewer.StiViewerOptions();
          options.toolbar.showDesignButton = false;
          options.appearance.viewMode = 'Continuous';
          options.appearance.scrollbarsMode = 'Auto';
          options.width = '100%';
          options.height = '100%';

          const viewer = new Stimulsoft.Viewer.StiViewer(
            options,
            'StiViewer',
            false
          );

          // Set custom export name
          report.reportName = "Equipment_Qualification_Report";

          viewer.report = report;

          if (viewerRef.current) {
            viewer.renderHtml(viewerRef.current);
          }

        })

      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      }
    };

    generateReport();

    return () => {
      isCancelled = true;
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
      document.body.style.overflow = originalOverflow;
    };
  }, [InjSpeedData, LoadData, ShotData, MoldName, SessionName, selectedPrintSections]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 150px)',
          margin: 0,
          padding: 0,
          background: '#fff',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close Button - Above Container */}
        {onClose && (
          <div style={{ padding: '8px 0 8px 8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '3px 10px',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: '1px solid #5a6268',
                borderRadius: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: 'inline-block',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#5a6268';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#6c757d';
              }}
              title="Close Report Viewer"
            >
              Close
            </button>
          </div>
        )}
        {/* Viewer Container */}
        <div 
          ref={viewerRef} 
          style={{ 
            width: '100%', 
            height: onClose ? 'calc(100% - 60px)' : '100%',
            flex: 1,
          }} 
        />
      </div>
    </>
  )
}

export default EquipQualReport;
