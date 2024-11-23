
import React from 'react';
import { AiOutlineFilePdf } from 'react-icons/ai'; 

export default function Navbar() {
  return (
    <>
      <div className="max-w-screen-2xl mx-auto container px-6 py-3 shadow-lg h-16 bg-orange-500"> 
          <div className="flex justify-start items-center space-x-2"> 
          <AiOutlineFilePdf className="text-white text-2xl" /> 
          <h1 className="text-white text-2xl font-semibold">Doc2PDF</h1> 
        </div>
      </div>
    </>
  );
}
