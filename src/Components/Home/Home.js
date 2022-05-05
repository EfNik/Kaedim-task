import logo from '../../logo.svg';
import '../../App.css';
import React,{useEffect , useState} from 'react';
import { Link } from 'react-router-dom';


const Home = () => {

  return (
    <div className="App">
      {/* The navbar */}
      <nav className='flex items-center justify-between flex-wrap bg-gray-600 p-2'>
        <div className='flex-shrink-0 mr-4'>
          <img src={logo} alt="" className="App-logo h-12 w-12" />
        </div>
        <div className='w-full block flex-grow sm:flex sm:items-start sm:w-auto text-left'>
          <div className='text-base sm:flex-grow'>
            <Link to="#" className='block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4'>
              Home
            </Link>
            <Link to="/viewer" className='block mt-4 sm:inline-block sm:mt-0 text-cyan-300 hover:text-white mr-4'>
              3D Viewer
            </Link>
          </div>
        </div>
      </nav>
      
      {/* The background image */}
      <div className='bg-fixed h-screen App-header bg-cover ' style={{backgroundImage: "url('./img2.jpg')"}}>

          {/* Basic middle grey area */}
          <div className='bg-slate-600 h-5/6 w-10/12 rounded-t-lg'>
              
              {/* Cards */}
              <div className='container mt-5 px-12 py-12'>
                 {/* Flex on screens >= medium */}
                 <div className='md:flex space-x-12'>
                   {/* Who am I card */}
                  <div
                    className="flex-1 text-gray-700 text-center bg-gray-400 px-5 py-5 m-2 rounded">
                    <div className="lg:flex lg:items-center">
                      <div className="lg:flex-shrink-0">
                        <img className="rounded-full lg:w-64 " src="./me2.jpg" alt="" />
                      </div>
                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <div
                          className="uppercase tracking-wide text-sm text-blue-600 font-bold">
                          Who am I?
                        </div>
                        <div className='text-base text-white  '>
                          I am Stratos Nikolakeas, a final year student at the department of electrical and computer engineering...
                        </div>
                        
                      </div>
                    </div>

                  </div>

                   {/* What is this card */}
                   <div
                    className="flex-1 text-gray-700 text-center bg-gray-400 px-5 py-5 m-2 rounded">
                    <div className="lg:flex lg:items-center">
                      <div className="lg:flex-shrink-0">
                        <img className="rounded-full lg:w-64" src="./Kaedim-logo.jpg" alt="" />
                      </div>
                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <div
                          className="uppercase tracking-wide text-sm text-blue-600 font-bold">
                          What is this?
                        </div>
                        <div className='text-base text-white  '>
                          A 3D viewer web app that was created as part of my preparation for an interview at Kaedim.
                        </div>
                        
                      </div>
                    </div>

                  </div>

                  
                </div>
            </div>

              
              <Link className='object-contain bg-blue-500 hover:bg-blue-400 rounded-lg px-2 py-1' to="/viewer">3D Viewer</Link>
              
              
          </div>
       
      </div>
      <div className='bg-slate-600 w-full p-8 bg-cover'>
          <div className='flex items-center md:flex justify-center'>
            <div className='text-white mr-12'>
              POWERED BY 
            </div>
                    
            <img className='block max-h-20 mx-2' src='logo192.png'/>

            <img className='block max-h-20 mx-2' src='./logos/three-js-logo2.png'/>

            <img className='block max-h-20 mx-2' src='./logos/tailwind-css-logo.png'/>

            <img className='block max-h-20 mx-2' src='./logos/lg1.png'/>

            <img className='block max-h-20 mx-2' src='./logos/express.png'/>
            
          </div>
      </div>
    </div>
    
  );
}

export default Home;