import React, {
  Fragment,
  useRef,
  Suspense,
  useLayoutEffect,
  lazy,
  startTransition,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import "./viewer3D.css";
import Amplify, { API, selectInput, Storage } from "aws-amplify";
import { useEffect, useState } from "react";
// import {useGLTF} from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import logo from "../../logo.svg";
import "../../App.css";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import Popup from "reactjs-popup";
import useThree from "use-three";
import { Camera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { waitFor } from "@testing-library/react";

// let myScene = new THREE.Scene();
let myCamera = new THREE.PerspectiveCamera("MyOrbitControlls");

const pointer = new THREE.Vector2(-1, 1);
// let myCanvas = myScene.getObjectById("myThreeJsCanvas");

// myCanvas.initialize();
// myCanvas.animate();
// let renderer = new THREE.WebGLRenderer({antialias:true});

// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// )
// camera.position.z = 2

// function Box() {
//   return (
//     <mesh>
//       <boxBufferGeometry attach="geometry" />
//       <meshLambertMaterial attach="material" color="red" />
//     </mesh>
//   );
// }

const Viewer3D = () => {
  const [file, setFile] = useState("scene.glb");
  const [data, setData] = useState("");
  const [filename, setFilename] = useState("");
  const [model3d, setModel] = useState("");
  const [wireframeState, setWireframeState] = useState(false);
  const [modelsList, setModelsList] = useState([]);
  const [materialsState,setMaterialsState] = useState(true);
  const [objMaterial, setObjMaterial] = useState("")

  const [st, setSt] = useState(false);

  const [gltfModel, setgltfModel] = useState("");

  var gltf = useLoader(GLTFLoader, file);

  var fileURL = "scene.glb";

  var materialObjBasic = "";
  // setgltfModel(gltf);
  // setModel(gltf.scene);

  // Not used
  // const canvasRef = useRef('myThreeJsCanvas');
  // const canvas = canvasRef.current;
  //---
  let myScene = new THREE.Scene();
  var renderer = new THREE.WebGLRenderer();
  const camera1 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  // let myScene = useRef();

  let myCanvas = useRef();
  // let myCamera = useRef();
  // let myBox = useRef();
  let MyOrbitControlls = useRef();
  let sceneContainer = useRef();

  const Box = () => {
    return (
      <mesh>
        <boxBufferGeometry attach="geometry" />
        <meshLambertMaterial attach="material" color="red" />
      </mesh>
    );
  };

  // myCanvas.add( camera );
  // const camera = myScene.camera;
  // console.log(myCanvas)
  // const camera = useThree((state) => state.camera)

  const myAPI = "apid5ee3ce5";
  const pathUpload = "/upload";
  const pathModelFetch = "/modelFetch";

  //Function that loads the model and keeps its info
  const onChange = (e) => {
    console.log(e.target.files[0]);
    fileURL = URL.createObjectURL(e.target.files[0]);
    console.log(fileURL);

    startTransition(() => {
      // sceneContainer.current.removeChild(sceneContainer.current.children[0]);
      // myScene.remove(gltf.scene);
      setFile(fileURL);
    });

    setData(e.target.files[0]);
    setFilename(e.target.files[0].name);
    console.log(file);

    // let reader = new FileReader();

    // console.log(typeof(file),"ppp",file);
    // reader.readAsDataURL(file);
    // console.log(reader.result);
    // gltf = useLoader(GLTFLoader, file);
    // let gg = lazy(Model());
    // lazy(gltf.load( file, (gltf) => {

    //   myScene.add( gltf.scene );

    //   // objectURLs.forEach( ( url ) => URL.revokeObjectURL( url ) );

    // }))

    // Model();
    // renderer.render(myScene,camera)
    // createWorld();
    // createWorld();
    // console.log(gltf.scene)
    // renderer.render(myScene,camera)
    // });

    sceneContainer.current.innerHTML = "";
    // createWorld();
    setTimeout(createWorld, 1000);

    setMaterialsState(true);
    // createWorld();
    // myScene.remove();

    // sceneContainer.current.appendChild(renderer.domElement);
    // renderer.clear();
    // while(myScene.children.length > 0){
    //   myScene.remove(myScene.children[0]);
    // }
  };

  // Function that saves the model to the cloud
  const onSubmit = async (e) => {
    console.log("clicked!");
    e.preventDefault();
    if (data === "") {
      return;
    }

    // const { key } = await Storage.put(`${uuid()}.gbl`, data, {
    //   contentType: "3dmodel/glb",
    // });
    // console.log(key);
    const key = "";
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
    fileURL= ""
    console.log(fileURL)
    const fileAccessURL = await Storage.get(modelFilePath, { expires: 60 });
    fileURL = fileAccessURL;
    console.log(fileURL)
    // console.log("access url", fileAccessURL);
    // setFile(fileAccessURL);

    startTransition(() => {
      setFile(fileAccessURL);

    });
      // fileURL = file
      sceneContainer.current.innerHTML = "";
      // setTimeout(createWorld, 1000);
    createWorld();
      // setMaterialsState(true);
    // });

    return;
  };

  // Fetching the available models from the cloud
  useEffect(() => {
    // createWorld();
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

    createWorld();

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // raycaster.setFromCamera( pointer, camera);
    // const camera1 = new THREE.PerspectiveCamera(
    //   45,
    //   window.innerWidth / window.innerHeight,
    //   1,
    //   1000
    // );
    const myBox = Box();

    const onMouseMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // raycaster.setFromCamera(pointer, myCamera);
      raycaster.setFromCamera(pointer, camera1);
      // const currentMo = myCanvas.getObjectById("currentObject");
      // console.log(currentMo,"------")
      const intersects = raycaster.intersectObjects(myScene);
      // // const intersects = raycaster.intersectObjects(canvas.scene.children);
      if (intersects.length > 0) {
        console.log(intersects);
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    // renderer.render(myScene, myCamera);
  }, []);

  const wireframeMode = () => {
    fileURL = file;
    sceneContainer.current.innerHTML = "";
    // setTimeout(createWorld, 1000);
    createWorld();
  };

  const createWorld = async () => {
    // var renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // sceneContainer.current.appendChild(renderer.domElement);

    // const camera = new THREE.PerspectiveCamera(
    //   45,
    //   window.innerWidth / window.innerHeight,
    //   1,
    //   1000
    // );

    let facesO = []
    let facesc1 = []
    // let facesc2 = []
    // let facesc3 = []


    console.log("1")

    // camera.position.z = 10;
    // camera.position.x = 5;
    // camera.position.y = 7;


    camera.position.z = 10;
    camera.position.x = 5;
    camera.position.y = 7;


    sceneContainer.current.innerHTML = "";
    // renderer.setClearColor( 0x1e2932, 0);
    const bgColor = new THREE.Color("rgb(30, 41, 50)");
    // myScene.background(bgColor);
    myScene.background = bgColor;
    // renderer.render(myScene, camera);

    const ambientLight = new THREE.AmbientLight(0x404040);
    // myScene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 1000, 100);
    // myScene.add(spotLight);

    // iterate(gltf.materials, wireframeState);
    // setgltfModel(gltf);
    // setModel(gltf.scene);
    // myScene.add(gltf.scene);
    // myScene.add(Model());

    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // myScene.add( cube );

    // Model();
    // console.log(model3d)
    // myScene.add(model3d);
    console.log("2")
    const mycolor = new THREE.Color(0xff0000);

    sceneContainer.current.appendChild(renderer.domElement);
    myScene.add(ambientLight);
    myScene.add(spotLight);

    console.log("2.5")
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
    console.log("2.6")
    // console.log(loadModelPromise()); 
    // myScene.add(Model());
    let asd = await Model();
    myScene.add(asd);
    // console.log(objMaterial);
    // console.log(myScene.children)
    console.log("3")
    const controls = new OrbitControls(camera, renderer.domElement);

    const raycaster = new THREE.Raycaster();

    const onClick = (e) => {
      var rect = renderer.domElement.getBoundingClientRect();
      console.log("clicked")
      pointer.x = ((e.clientX - rect.left) / (rect.width - rect.left) ) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / (rect.bottom - rect.top) ) * 2 + 1;

      // raycaster.setFromCamera(pointer, myCamera);
      // raycaster.setFromCamera(pointer, camera);
      // const currentMo = myCanvas.getObjectById("currentObject");
      // console.log(currentMo,"------")
      // const intersects = raycaster.intersectObjects(cube);
      // // // const intersects = raycaster.intersectObjects(canvas.scene.children);
      // if(intersects.length>0){
      //   console.log(intersects);
      // }

      // console.log(myScene)

      raycaster.setFromCamera(pointer, camera);
      var intersects = raycaster.intersectObject(myScene);

      //This works
      if (intersects.length > 0) {
        intersects[0].object.geometry.clearGroups();
        // console.log(Object.keys(intersects[0].object.material).length)
        // intersects[0].object.geometry.addGroup(0, 18, 0);
        // intersects[0].object.geometry.addGroup(18, 18, 2);
        // intersects[0].object.geometry.addGroup(12,12,2);
        console.log(intersects[0])
        if(intersects[0].object.material.type=="MeshBasicMaterial" || intersects[0].object.material.type=="MeshStandardMaterial" )
        {
          // console.log(intersects[0].object.material.type)
          console.log(intersects[0].object.material)
          materials[0] = intersects[0].object.material
          intersects[0].object.material = materials;
          setMaterialsState(false);
        }

        // intersects[0].object.geometry.addGroup(intersects[0].faceIndex, 6, 0);
        // intersects[0].face.materialIndex = 2
        // console.log(intersects[0].object);
        // intersects[0].face.material.color.set(0xff0000);
        // intersects[0].object.material = [intersects[0].object.material, intersects[0].object.material]
        // intersects[0].object.material.add(intersects[0].object.material);
        // iterate2(intersects[0].object.material,mycolor)
        // cube.material.color.set(0xff0000);
        // console.log();
        // console.log(intersects[0]);
        // cube.geometry.faces[1].color.setHex( 0x00ffff );
        // intersects[0].face.color.set(0xff0000)


        let facesVolume = intersects[0].object.geometry.index.count;
        let faceNow  = intersects[0].faceIndex*3;


        for (let i = 0; i < facesVolume; i+=3) {
        facesO.push(i)
        }

        const index = facesO.indexOf(faceNow);
        if (index > -1) {
          facesO.splice(index, 1); 
        }

        facesc1.push(faceNow)

        for (let i = 0; i < facesVolume; i+=3) {
          if(facesc1.includes(i))
          {
            intersects[0].object.geometry.addGroup(i, 3, 3);
          }
          else if(facesO.includes(i)){ 
            intersects[0].object.geometry.addGroup(i, 3, 0);
          }
          
          setWireframeState(true)
        } 
        console.log(facesO,facesc1)
        console.log(intersects[0])

        // for (let i = 0; i < facesVolume; i+=3) {
        //   if(facesc1.indexOf(faceNow))
        //   {
        //     intersects[0].object.geometry.addGroup(i, 3, 3);
        //   }
        //   else if(facesO.indexOf(faceNow)){ 
        //     intersects[0].object.geometry.addGroup(i, 3, 0);
        //   }
          
        //   setWireframeState(true)
        // }
        // console.log(intersects[0]);

      } else {
        // cube.material.color.set(0x00ff00);
      }
    };
    // console.log(wireframeState)

    // console.log(myScene.children[2].children[2])
    // // myScene.object.geometry.addGroup(0,Infinity,2);
    // // myScene.object.material = materials

    function animate() {
      requestAnimationFrame(animate);

      controls.update();

      // console.log(file);

      if (st) {
        console.log(myScene);
        // console.log("myScene")
        setSt(!st);
      }
      // console.log(myScene);

      // raycasting
      // raycaster.setFromCamera(pointer, camera);
      // var intersects = raycaster.intersectObject(myScene);

      // //This works
      // if (intersects.length > 0) {
      //   // iterate2(intersects[0].object.material,mycolor)
      //   // cube.material.color.set(0xff0000);
      //   console.log(intersects[0]);
      // } else {
      //   // cube.material.color.set(0x00ff00);
      // }
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(myScene, camera);
    }

    animate();

    window.addEventListener("click", onClick);
    // renderer.render(myScene, camera);
  };

  // const changeWireframeState = () =>{
  //   if(wireframeState != wireframeStateCu)
  //   {
  //     console.log(gltf);
  //     iterate(gltf.materials,wireframeState)
  //     setWireframeStateCu(wireframeState);

  //   }
  // };

  const iterate2 = (obj,recursionCounter) => {
    // The function that changes the wireframe mode
    if(recursionCounter>3) return;
    console.log(recursionCounter)
    Object.keys(obj).forEach((key) => {
        if (key == "material") {
          console.log(obj[key]);
          return;
        }
        else if (typeof obj[key] === "object" && obj[key] !== null) {
          recursionCounter++;
          iterate(obj[key],recursionCounter);
        }
      
     
    });
  };

  const iterate = (obj, statee, itNum) => {
    if(itNum>6)return;
    itNum++;
    // The function that changes the wireframe mode
    Object.keys(obj).forEach((key) => {
      if (key == "wireframe") {
        obj[key] = statee;
        return;
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        iterate(obj[key], statee,itNum);
      }
    });
  };

  // const Model = () => {
  const Model = async () => {
    // The function that loads the model
    console.log("a")
    console.log(fileURL)
    console.log(file)
    //Issue is here
    // gltf = useLoader(GLTFLoader, fileURL);
    const loader = new GLTFLoader();
    gltf = await loader.loadAsync(fileURL);
    console.log("a2")

      console.log(gltf,"asd")
      console.log("aa")
      // gltf = useLoader(GLTFLoader, file);
      console.log(gltf.scene);
      iterate(gltf.scene.children, wireframeState,0);
      // iterate(gltf.materials, wireframeState);
      console.log("b")
      setgltfModel(gltf);
      setModel(gltf.scene);
      console.log("c")
      return gltf.scene;
    

    // iterate2(gltf.scene.children,0);
 
    // setObjMaterial(gltf.scene.children[2].material)
    // materialObjBasic = gltf.scene.children[2].material;
    // console.log("done");
    // myScene.add(gltf.scene);
    // myCanvas.add(gltf.scene);
    // myCanvas.updateMatrix();


    // return gltf.scene;



    // return (
    //   <>
    //     <primitive position={[0, -2, -1]} object={gltf.scene} scale={1} />
    //   </>
    // );
  };

  // const loadModelPromise = new Promise((resolve,reject) => {


  //   gltf = useLoader(GLTFLoader, fileURL);
  //   iterate(gltf.materials, wireframeState);

  //   setgltfModel(gltf);
  //   setModel(gltf.scene);

  //   resolve(gltf.scene);
  
  // })


  const Camera = () => {
    return (
      <perspectiveCamera
        fov={75}
        aspect={window.innerWidth / window.innerHeight}
        near={0.1}
        far={1000}
      />
    );
  };

  const testSomething = () => {
    // console.log(obj);
    // const myCanvas = new THREE.Scene('myThreeJsCanvas');
    // let scene = window.document.querySelector('canvas');
    // console.log(scene);
    // let object = scene.getObjectById("myThreeJsCanvas");
    // console.log(myCanvas)
    // console.log(myCamera)
    // var geometry = new THREE.BoxGeometry();
    // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // var cube = new THREE.Mesh(geometry, material);
    // myScene.add(cube)

    // var renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // sceneContainer.current.appendChild(renderer.domElement);

    // const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    // camera.position.z = 5;

    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // myScene.add( cube );

    // renderer.render(myScene, camera);
    // setSt(true);
    // console.log(myScene);
    // This works!
    // while(myScene.children.length > 0){
    //   myScene.remove(myScene.children[0]);
    // }

    // console.log(myScene);
    // myScene.remove(gltf.scene);
    // renderer.render(myScene,camera);

    // console.log(myScene);

    // const exporter = new GLTFExporter();
    // exporter.parse(
    //   gltf.scene,
    //   function (result) {
    //     saveArrayBuffer(result, "scece.glb");
    //   },
    //   { binary: true }
    // );
    // myCanvas.current.appendChild(gltfModel);

    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // myScene.add(cube);
  };

  const testSomething2 = () => {
    console.log(gltf.scene)
  };

  function saveArrayBuffer(buffer, filename) {
    save(new Blob([buffer], { type: "application/octet-stream" }), filename);
  }

  function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...
  }

  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link); // Firefox workaround, see #6594

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
                  // createWorld();
                  // onChange();
                  // window.location.reload(false);
                  // iterate(gltf.materials, wireframeState);
                }}
              >
                Wireframe mode
              </button>
            </div>

            {/* <Suspense> */}
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
                    // onChange={function func(e){
                    //   setFile(URL.createObjectURL(e.target.files[0]));
                    //   setData(e.target.files[0]);
                    //   setFilename(e.target.files[0].name);
                    //   Model();
                    //   createWorld();
                    // }}
                    hidden
                  />
                </div>
              </form>
            </div>
            {/* </Suspense> */}

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <button onClick={onSubmit} disabled>
                Save
              </button>
            </div>

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <button onClick={testSomething}>Download</button>
            </div>

            <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <button onClick={testSomething2}>Click</button>
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

            {/* <div className="block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4 ">
              <button onClick={loadModel}>Load</button>
            </div> */}
          </div>
        </div>
      </nav>

      {/* The viewer */}
      {/* <div className="h-screen w-screen bg-slate-900"> */}
      {/* <Canvas ref={myCanvas}> */}

      {/* The camera */}
      {/* <Camera/> */}

      {/* To rotate the object (or the camera to be exact)*/}
      {/* <OrbitControls ref={MyOrbitControlls}/> */}

      {/* Background */}
      {/* <Stars /> */}

      {/* Lights */}
      {/* General universal light (the same for all surfaces)*/}
      {/* <ambientLight intensity={0.5} /> */}
      {/* Light from a specific position with specific angle */}
      {/* <spotLight position={[10, 15, 10]} angle={0.3} /> */}

      {/* To show the model */}
      {/* <Suspense> */}
      {/* <Model id="currentObject"/> */}
      {/* </Suspense> */}

      {/* <Box id="currentObject"/> */}

      {/* </Canvas> */}
      {/* </div> */}
      <Suspense>
        <div ref={sceneContainer} className="container"></div>
      </Suspense>
    </div>
  );
};

export default Viewer3D;
