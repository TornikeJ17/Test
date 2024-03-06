import React from "react";
import Typeahead from "./Components/Typeahead";
import "./App.css";

const App = () => {
    return (
        <div className="App-Container">
            <h1>Github User Search</h1>
            <Typeahead />
        </div>
    );
};

export default App;
