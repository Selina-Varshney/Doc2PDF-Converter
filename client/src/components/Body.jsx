
import React, { useState } from "react";

const ClipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

export default function Body() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setSelectedFile(file);
        setStatus({ message: "", type: "" });
      } else {
        setStatus({ 
          message: "Please select a valid .docx file", 
          type: "error" 
        });
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatus({ 
        message: "Please select a file", 
        type: "error" 
      });
      return;
    }

    setLoading(true);
    setStatus({ message: "Converting file...", type: "info" });

    const formData = new FormData();
    formData.append("file", selectedFile);
    
    if (password.trim()) {
      formData.append("password", password);
    }

    try {
      const response = await fetch("http://localhost:3000/home", {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Conversion failed');
      }

      const blob = await response.blob();

    
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const error = JSON.parse(text);
        setStatus({ 
          message: error.message || "Conversion failed", 
          type: "error" 
        });
        return;
      }

      // download
      const fileNameSuffix = password.trim() ? "-protected" : "";
      const fileName = `${selectedFile.name.replace(/\.[^/.]+$/, "")}${fileNameSuffix}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      
      
      window.URL.revokeObjectURL(url);
      link.parentNode.removeChild(link);

      // Reset form
      setSelectedFile(null);
      setPassword("");
      setStatus({ 
        message: `File converted ${password.trim() ? 'and protected ' : ''}successfully!`, 
        type: "success" 
      });
      
      // Reset file input
      const fileInput = document.getElementById("inputfile");
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Conversion error:", error);
      setStatus({ 
        message: error.message || "Failed to convert file. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto container px-6 py-3">
      <div className="flex h-screen items-center justify-center">
        <div className="bg-orange-100 shadow-lg px-6 py-8 md:px-12 md:py-14 rounded-lg max-w-4xl mx-auto my-16">
          <h1 className="text-3xl font-bold text-orange-800">DOC2PDF Converter</h1>
          <p className="text-xl text-orange-600 mt-2 mb-6">
            Convert your documents (.docx) to PDF with optional password protection
          </p>

          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              accept=".docx"
              className="hidden"
              id="inputfile"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="inputfile"
              className={`w-full flex items-center justify-center px-4 py-6 
                ${selectedFile ? 'bg-green-500' : 'bg-orange-400'} 
                text-xl text-white shadow-lg cursor-pointer 
                hover:bg-opacity-90 duration-300 rounded-lg`}
            >
              <span className="mr-2"><ClipIcon /></span>
              {selectedFile ? selectedFile.name : "Choose a .docx file"}
            </label>
            
            <input
              type="password"
              placeholder="Enter password (optional)"
              className="border rounded-lg px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <button
              disabled={!selectedFile || loading}
              className={`w-full text-white ${
                loading ? 'bg-gray-400 cursor-wait' : 
                !selectedFile ? 'bg-gray-400' : 
                'bg-pink-800 hover:bg-pink-900'
              } duration-300 font-bold px-4 py-2 rounded-lg`}
              onClick={handleSubmit}
            >
              {loading ? "Converting..." : "Convert to PDF"}
            </button>

            {status.message && (
              <div className={`w-full p-4 rounded-lg ${
                status.type === 'error' ? 'bg-red-100 text-red-700' :
                status.type === 'success' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {status.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}