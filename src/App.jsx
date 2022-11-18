import { Fragment, useState } from "react";
import "./App.css";
import PvC from "./components/PvC";
import CvC from "./components/CvC";

function App() {
  const [mode, setMode] = useState("PvC");

  return (
    <main className="container playground">
      <div className="container-control">
        {mode === "PvC" ? (
          <Fragment>
            <h4>Computer Vs Computer</h4>
            <button className="button" onClick={() => setMode("CvC")}>
              Switch
            </button>
          </Fragment>
        ) : (
          <Fragment>
            <h4>Player Vs Computer</h4>
            <button className="button" onClick={() => setMode("PvC")}>
              Switch
            </button>
          </Fragment>
        )}
      </div>
      {mode === "PvC" ? <PvC /> : <CvC />}
    </main>
  );
}

export default App;
