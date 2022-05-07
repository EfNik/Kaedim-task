import React, { Fragment, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import "./viewer3D.css";
import Amplify, { API, Storage } from "aws-amplify";
import { useEffect, useState } from "react";
// import {useGLTF} from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
// import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import logo from "../../logo.svg";
import "../../App.css";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import Popup from 'reactjs-popup';

function Box() {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" />
      <meshLambertMaterial attach="material" color="red" />
    </mesh>
  );
}

const Viewer3D = () => {
  const [file, setFile] = useState("Dinosaur.glb");
  const [data, setData] = useState("");
  const [filename, setFilename] = useState("");
  const [model3d, setModel] = useState("");
  const [wireframeState, setWireframeState] = useState(false);
  const [modelsList, setModelsList] = useState([]);

  const canvasRef = useRef(null);
  const canvas = canvasRef.current;

  const myAPI = "apid5ee3ce5";
  const pathUpload = "/upload";
  const pathModelFetch = "/modelFetch";

  //Function that loads the model and keeps its info
  const onChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
    setData(e.target.files[0]);
    setFilename(e.target.files[0].name);
    console.log(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    console.log(reader.result);
  };

  // Function that saves the model to the cloud
  const onSubmit = async (e) => {

    e.preventDefault();
    if(data==="")
    {
      return;
      
    }
    
    const { key } = await Storage.put(`${uuid()}.gbl`, data, {
      contentType: "3dmodel/glb",
    });
    console.log(key);
    let modelInfo = {
      body: {
        id: key,
        name: filename,
        user: 0,
      },
      headers: {},
    };

    API.post(myAPI, pathUpload, modelInfo)
      .then((response) => {
        // console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Loading a model from the cloud
  const loadModel = async (e) => {
    // console.log(e.target.value)
    // const modelFilePath = "df565733-2962-4fe0-86b9-34b81cb88382.gbl";
    const modelFilePath = e.target.value;
    const fileAccessURL = await Storage.get(modelFilePath, { expires: 60 });
    // console.log("access url", fileAccessURL);
    setFile(fileAccessURL);
  };

  // Fetching the available models from the cloud
  useEffect(() => {
    // setModels([])
    const modelFetch = async () => {
      let tempModels = [];
      const user = { id: 0 };
      await API.get(myAPI, pathModelFetch, user)
        .then((response) => {
          const size = Object.keys(response.Items).length;
          let newElement = [];

          for (let i = 0; i < size; i++) {
            newElement = [response.Items[i].name, response.Items[i].id];
            tempModels.push(newElement);
          }
          setModelsList(tempModels);

        })
        .catch((error) => {
          console.log(error);
        });
    };
    modelFetch();
  }, []);

  const iterate = (obj, statee) => {
    // The function that changes the wireframe mode
    Object.keys(obj).forEach((key) => {
      if (key == "wireframe") {
        obj[key] = statee;
        return;
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        iterate(obj[key], statee);
      }
    });
  };

  const Model = () => {
    // The function that loads the model
    const gltf = useLoader(GLTFLoader, file);
    iterate(gltf.materials, wireframeState);
    testSomething(gltf);

    return (
      <>
        <primitive position={[0, -2, -1]} object={gltf.scene} scale={1} />
      </>
    );
  };
  

  const testSomething = (obj) => {
    console.log(obj);
  }


  return (
    <div className="text-black bg-white h-15  items-start container">
      {/* The navbar */}
      <nav className="flex items-center justify-between flex-wrap bg-gray-600 p-2 w-screen">
        <div className="flex-shrink-0 mr-4">
          <img src={logo} alt="" className="App-logo h-12 w-12" />
        </div>
        <div className="w-full block flex-grow sm:flex sm:items-start sm:w-auto text-left">
          <div className="text-base sm:flex-grow  justify-start">
            <Link
              to="/"
              className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4"
            >
              Home
            </Link>

            <Link
              to="#"
              className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4"
            >
              3D Viewer
            </Link>

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4">
              <button onClick={() => setWireframeState(!wireframeState)}>
                Wireframe mode
              </button>
            </div>

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 lg:right-0 lg:absolute">
              <form onSubmit={onSubmit}>
                <div className="">
                  <label htmlFor="inputFile">Upload a .glb model</label>
                  <input
                    type="file"
                    className="form-control 
                          invisible"
                    id="inputFile"
                    onChange={onChange}
                    hidden
                  />
                </div>
              </form>
            </div>

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <button onClick={onSubmit}>Save</button>
            </div>

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <label htmlFor="modelsList">Choose a model: </label>
              <select id="modelsList" className=" " defaultValue={model3d} onChange={loadModel} >
                {modelsList.map((model) => {
                  return <option key={model[1]} value={model[1]}>{model[0]}</option>;
                })}
              </select>
            </div>

            {/* <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <button onClick={loadModel}>Load</button>
            </div> */}
          </div>
        </div>
      </nav>

      {/* The viewer */}
      <div className="h-screen w-screen bg-slate-900">
        <Canvas>
          {/* To rotate the object (or the camera to be exact)*/}
          <OrbitControls />

          {/* Background */}
          <Stars />

          {/* Lights */}
          {/* General universal light (the same for all surfaces)*/}
          <ambientLight intensity={0.5} />
          {/* Light from a specific position with specific angle */}
          <spotLight position={[10, 15, 10]} angle={0.3} />

          {/* To show the model */}
          <Suspense>
            <Model />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default Viewer3D;
