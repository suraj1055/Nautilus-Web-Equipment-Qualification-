import React, { useState } from "react";
import StudyWeight from "./StudyWeight";
import Dim1 from "./Dim1";
import Dim2 from "./Dim2";
import Notes from "./Notes";

const Tabs = ({ session }) => {
  const [activeTab, setActiveTab] = useState("weight");

  return (
    <div className="tabs-container">
      <div className="tab-bar">
        <button 
          className={activeTab === "weight" ? "active" : ""}
          onClick={() => setActiveTab("weight")}
        >
          Tonnage Study Weight
        </button>
        <button 
          className={activeTab === "dim1" ? "active" : ""}
          onClick={() => setActiveTab("dim1")}
        >
          Tonnage Dim1
        </button>
        <button 
          className={activeTab === "dim2" ? "active" : ""}
          onClick={() => setActiveTab("dim2")}
        >
          Tonnage Dim2
        </button>
        <button 
          className={activeTab === "notes" ? "active" : ""}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "weight" && <StudyWeight sessionId={session?.id} />}
        {activeTab === "dim1" && <Dim1 sessionId={session?.id} />}
        {activeTab === "dim2" && <Dim2 sessionId={session?.id} />}
        {activeTab === "notes" && <Notes sessionId={session?.id} />}
      </div>
    </div>
  );
};

export default Tabs;
