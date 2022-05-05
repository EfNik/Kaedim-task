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
  const [filename, setFilename] = useState("");
  const [model3d, setModel] = useState("");
  const [wireframeState, setWireframeState] = useState(false);

  const canvasRef = useRef(null);
  const canvas = canvasRef.current;

  const onChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
    setFilename(e.target.files[0].name);
    console.log(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    console.log(reader.result);
  };

  const onSubmit = async (e) => {
    console.log(filename);
    e.preventDefault();
  };

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

    return (
      <>
        <primitive position={[0, -2, -1]} object={gltf.scene} scale={1} />
      </>
    );
  };

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
              <button onClick={onSubmit}>Submit</button>
            </div>

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
