import React, {
  useRef,
  Suspense,
  startTransition,
  useEffect, 
  useState
} from "react";
import "./viewer3D.css";
import Amplify, { API, selectInput, Storage } from "aws-amplify";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import logo from "../../logo.svg";
import "../../App.css";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


const pointer = new THREE.Vector2(-1, 1);


const Viewer3D = () => {

  //State variables
  const [file, setFile] = useState("scene.glb");
  const [data, setData] = useState("");
  const [filename, setFilename] = useState("");
  const [model3d, setModel] = useState("");
  const [wireframeState, setWireframeState] = useState(false);
  const [modelsList, setModelsList] = useState([]);
  const [st, setSt] = useState(false);
  const [facesStore, setfacesStore] = useState([]);


  //global variables
  var gltf = useLoader(GLTFLoader, file);
  var fileURL = "scene.glb";

  
  //Declare scene, rendered and camera
  let myScene = new THREE.Scene();
  var renderer = new THREE.WebGLRenderer();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  let sceneContainer = useRef();



  // const Box = () => {
  //   return (
  //     <mesh>
  //       <boxBufferGeometry attach="geometry" />
  //       <meshLambertMaterial attach="material" color="red" />
  //     </mesh>
  //   );
  // };

  
  // Declare Api paths
  const myAPI = "apid5ee3ce5";
  const pathUpload = "/upload";
  const pathModelFetch = "/modelFetch";
  const pathGetColors = "/getcolors";

  //Function that loads the model and keeps its info
  const onChange = (e) => {

    //Changing the variables that have to do with the model displayed 
    fileURL = URL.createObjectURL(e.target.files[0]);

    startTransition(() => {
      setFile(fileURL);
    });

    setData(e.target.files[0]);
    setFilename(e.target.files[0].name);

    // Refreshing the scene
    sceneContainer.current.innerHTML = "";
    setTimeout(createWorld([]), 1000);

  };

  // Function that saves the model to the cloud
  const onSubmit = async (e) => {
 
    e.preventDefault();
    // In case the user did not upload a model
    if (data === "") {
      return;
    }

    // Storing the model file in S3 storage
    const { key } = await Storage.put(`${uuid()}.gbl`, data, {
      contentType: "3dmodel/glb",
    });

    let modelInfo = {
      body: {
        id: key,
        name: filename,
        user: 0,
        groups: facesStore,
      },
      headers: {},
    };

    // Storing the model information in the DB
    API.post(myAPI, pathUpload, modelInfo)
      .then((response) => {
        
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Loading a model from the cloud
  const loadModel = async (e) => {

    const modelFilePath = e.target.value;
    fileURL = "";

    // Retrieving the model file from the S3 storage
    const fileAccessURL = await Storage.get(modelFilePath, { expires: 60 });

    // Changing the variables for the model displayed 
    fileURL = fileAccessURL;

    startTransition(() => {
      setFile(fileAccessURL);
    });

    // Making a request in the DB to retrieve the model information
    let reqData = { queryStringParameters: { id: modelFilePath } };
    API.get(myAPI, pathGetColors, reqData)
      .then((response) => {

        // When the informations are retrieve display the model
        setfacesStore(response.Item.groups);
        let colorGroups = response.Item.groups;
        sceneContainer.current.innerHTML = "";

        if(colorGroups==undefined)
        {
          createWorld([]);
        }
        else{
          createWorld(colorGroups)
        }
        
      })
      .catch((error) => {
        console.log(error);
      });


    return;
  };



  // Fetching the available models from the cloud
  useEffect(() => {

    const modelFetch = async () => {
      let tempModels = [];
      const user = { id: 0 };
      // Requesting the models that had previously stored
      await API.get(myAPI, pathModelFetch, user)
        .then((response) => {

          // Pushing each model in an array that his elements will be displayed on the drop down menu
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

    createWorld([]);

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

 
    // const myBox = Box();


  }, []);

  const wireframeMode = () => {
    // Refreshing the scene to change the model's wireframe display state
    fileURL = file;
    sceneContainer.current.innerHTML = "";
   
    createWorld([]);
  };

  const createWorld = async (colorArray) => {
    // Function responsible for setting and displaying the scene

    // Arrays used for coloring the model
    let facesOr = [];
    let facesBlue = [];
    let facesGreen = [];
    let facesRed = [];


    // Camera, lights, bg 
    camera.position.z = 10;
    camera.position.x = 5;
    camera.position.y = 7;

    sceneContainer.current.innerHTML = ""; 

    const bgColor = new THREE.Color("rgb(30, 41, 50)");
    myScene.background = bgColor;
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 1000, 100);
    

    const mycolor = new THREE.Color(0xff0000);
    sceneContainer.current.appendChild(renderer.domElement);
    myScene.add(ambientLight);
    myScene.add(spotLight);

    
    // Different materials that will be used for coloring the model
    var materials = [
      new THREE.MeshBasicMaterial(),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x0000ff,
      }),
    ];


    // Adding model to scene
    let myModel = await Model(colorArray);
    myScene.add(myModel);

    // Orbit controlls to rotate and zoom in/out
    const controls = new OrbitControls(camera, renderer.domElement);

    // Raycaster to get the point the user wants to color
    const raycaster = new THREE.Raycaster();

    // For when loading a model that had been previously colored
    // Display the coloring
    if (colorArray.length != 0) {

      myScene.traverse(function (obj) {
        
        if (obj.type == "Mesh") {
          materials[0] = obj.material;
          obj.material = materials;
          let facesVolume = obj.geometry.index.count;
          
          for (let i = 0; i < facesVolume; i += 3) {
            
            if (colorArray[0].includes(i)) {
              obj.geometry.addGroup(i, 3, 1);
            } else if (colorArray[1].includes(i)) {
              obj.geometry.addGroup(i, 3, 2);
            } else if (colorArray[2].includes(i)) {
              obj.geometry.addGroup(i, 3, 3);
              
            } else {
              facesOr.push(i)
              obj.geometry.addGroup(i, 3, 0);
            }
          }
         
        }

      });

      facesRed = colorArray[0]
      facesGreen = colorArray[1]
      facesBlue = colorArray[2]
      setfacesStore([facesRed, facesGreen, facesBlue]);



    
    }

    // When the user clicks paint the face of the model he clicked on
    const onClick = (e) => {

      // Get the point the user clicked 
      var rect = renderer.domElement.getBoundingClientRect();
  
      pointer.x = ((e.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;


      // Raycaster to find the intersection with the model
      raycaster.setFromCamera(pointer, camera);
      var intersects = raycaster.intersectObject(myScene);

      //If there is an intersection
      if (intersects.length > 0) {

        // Setting the color and the face 
        let dropDownValue = window.document.getElementById("colorsList").value;
        let colorC = dropDownValue;
        let facesVolume = intersects[0].object.geometry.index.count;
        let faceNow = intersects[0].faceIndex * 3;

        // Cleaning the previous groups so there won't be doubles
        intersects[0].object.geometry.clearGroups();

        // Adding the correct materials to the object (this executes only the first time)
        if (
          intersects[0].object.material.type == "MeshBasicMaterial" ||
          intersects[0].object.material.type == "MeshStandardMaterial"
        ) {
 
          materials[0] = intersects[0].object.material;
          intersects[0].object.material = materials;
          // setMaterialsState(false);

          // Adding all to all the faces the original color/material
          for (let i = 0; i < facesVolume; i += 3) {
            facesOr.push(i);
          }
    
        }

        // Removing the face selected from its previous group
        let index = facesOr.indexOf(faceNow);
        if (index > -1) {
          facesOr.splice(index, 1);
        }

        index = facesBlue.indexOf(faceNow);
        if (index > -1) {
          facesBlue.splice(index, 1);
        }

        index = facesGreen.indexOf(faceNow);
        if (index > -1) {
          facesGreen.splice(index, 1);
        }

        index = facesRed.indexOf(faceNow);
        if (index > -1) {
          facesRed.splice(index, 1);
        }

        // Assigning the face selected to the correct group
        if (colorC == "blue") {
          facesBlue.push(faceNow);
        } else if (colorC == "green") {
          facesGreen.push(faceNow);
        } else if (colorC == "red") {
          facesRed.push(faceNow);
        }

        // Adding the groups to the model
        for (let i = 0; i < facesVolume; i += 3) {
          if (facesOr.includes(i)) {
            intersects[0].object.geometry.addGroup(i, 3, 0);
          } else if (facesRed.includes(i)) {
            intersects[0].object.geometry.addGroup(i, 3, 1);
          } else if (facesGreen.includes(i)) {
            intersects[0].object.geometry.addGroup(i, 3, 2);
          } else if (facesBlue.includes(i)) {
            intersects[0].object.geometry.addGroup(i, 3, 3);
          }

          
        }

        // Saving the colored faces in case the user wants to upload the colored model
        setfacesStore([facesRed, facesGreen, facesBlue]);
  
      } 
    };

    function animate() {
      // Animation function
      requestAnimationFrame(animate);
      controls.update();
   
      if (st) {
      
        setSt(!st);
      }
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(myScene, camera);
    }

    animate();

    // Event listener for when the user clicks
    window.addEventListener("click", onClick);
    
  };



  const iterate = (obj, statee, itNum) => {
    if (itNum > 6) return;
    itNum++;
    // The function that changes the wireframe mode
    Object.keys(obj).forEach((key) => {
      if (key == "wireframe") {
        obj[key] = statee;
        return;
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        iterate(obj[key], statee, itNum);
      }
    });
  };

 
  const Model = async (colorArray) => {
    // The function that loads the model

    const loader = new GLTFLoader();
    gltf = await loader.loadAsync(fileURL);
    iterate(gltf.scene.children, wireframeState, 0);  
    setModel(gltf.scene);

    return gltf.scene;

  };



  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link); 

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
              <button
                onClick={() => {
                  setWireframeState(!wireframeState);
                  wireframeMode();
                }}
              >
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
              <select
                id="modelsList"
                className=" "
                defaultValue={model3d}
                onChange={loadModel}
              >
                {modelsList.map((model) => {
                  return (
                    <option key={model[1]} value={model[1]}>
                      {model[0]}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <label htmlFor="modelsList">Choose a color: </label>
              <select
                id="colorsList"
                className=" "
                defaultValue={"b"}
                
              >
                {["blue", "green", "red"].map((color) => {
                  return (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  );
                })}
              </select>
            </div>


          </div>
        </div>
      </nav>

      <Suspense>
        <div ref={sceneContainer} className="container"></div>
      </Suspense>
    </div>
  );
};

export default Viewer3D;
