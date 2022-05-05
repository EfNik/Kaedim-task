import Home  from "./Components/Home/Home";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'; 
import Viewer3D from "./Components/Viewer/Viewer3D";
import Amplify, {API, Storage} from 'aws-amplify';


function App() {
  return (
    <Router>
      <div className="App">

        {/* Switch makes sure that only one route shows at the time */}

        <Routes>

          <Route path="/" element={<Home/>} />
          <Route path="/viewer" element={<Viewer3D/>} />
                   
        </Routes>
        
        
      </div>
    </Router>

  )
}

export default App;