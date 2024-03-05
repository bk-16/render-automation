import './App.css';
import { Route, Routes } from "react-router-dom"
import Sidebar from "./components/Sidebar/Sidebar";
import Form from "./components/Form/Form";

function App() {

  return (
    <>
         <Routes>
             <Route path="/" element={<Sidebar />} />
             <Route path="/:id" element={<Sidebar />} />
        {/*     <Route path="/command" element={<Sidebar />} >
                 <Route
                     path="form"
                     element={<Form />}
                 />
             </Route>*/}
        </Routes>
    </>
  );
}

export default App;
