import './PDFGenerator.css'

const PDFLoader = ({ ShowPrintPart, title }) => {
    return (
        <div>{ShowPrintPart && (
            <div style={{
                position: "fixed",
                top: 0, left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
            }}>
                <div id="PDFGenerator" style={{ display: "flex", alignItems: "center" }}>
                    <div className="loader-spinner" />
                    {title}
                </div>
            </div>
        )}</div>
    )
}

export default PDFLoader