const express = require("express");
const multer = require("multer");
const libre = require("libreoffice-convert");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const hummus = require("hummus");
const app = express();
const port = 3000;

app.use(cors());

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (_, file, cb) {
    ensureDirectory("docs");
    cb(null, "docs");
  },
  filename: function (_, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const encryptPDF = (inputPdfPath, outputPdfPath, password) => {
  try {
    const pdfReader = hummus.createReader(inputPdfPath);
    const pdfWriter = hummus.createWriter(outputPdfPath, {
      userPassword: password,
      ownerPassword: password,
      userProtectionFlag: 4,
      permissions: {
        printing: "highResolution",
        modifying: false,
        copying: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
        annotating: false,
      },
    });

    for (let i = 0; i < pdfReader.getPagesCount(); i++) {
      pdfWriter.createPDFCopyingContext(pdfReader).appendPDFPageFromPDF(i);
    }

    pdfWriter.end();
    console.log(`PDF encrypted successfully at ${outputPdfPath}`);
    return true;
  } catch (error) {
    console.error("Error in PDF encryption:", error);
    return false;
  }
};

const convertToPDF = (docxBuffer) => {
  return new Promise((resolve, reject) => {
    libre.convert(docxBuffer, ".pdf", undefined, (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });
};

app.post("/home", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const password = req.body.password; // This will be undefined if no password was sent

    if (!file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Input and output paths
    const inputPath = file.path;
    const pdfsDir = path.join(__dirname, "pdfs");
    ensureDirectory(pdfsDir);

    const basePdfPath = path.join(
      pdfsDir,
      `${path.basename(file.originalname, ".docx")}.pdf`
    );

    // Convert DOCX to PDF
    const docxBuffer = fs.readFileSync(inputPath);
    const pdfBuffer = await convertToPDF(docxBuffer);

    fs.writeFileSync(basePdfPath, pdfBuffer);

    let finalPdfPath = basePdfPath;

    if (password && password.trim()) {
      const encryptedPath = path.join(
        pdfsDir,
        `${path.basename(file.originalname, ".docx")}-encrypted.pdf`
      );

      const encryptionSuccess = encryptPDF(
        basePdfPath,
        encryptedPath,
        password
      );

      if (!encryptionSuccess) {
        throw new Error("PDF encryption failed");
      }

      finalPdfPath = encryptedPath;
    }

    // Send the final PDF (either encrypted or unencrypted)
    res.download(finalPdfPath, (err) => {
      if (err) {
        console.error("Error during file download:", err);
        return res.status(500).json({ message: "Error in downloading" });
      }

      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(basePdfPath);
        if (password && password.trim()) {
          fs.unlinkSync(finalPdfPath);
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    });
  } catch (err) {
    console.error("Server Error:", err);

    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.error("Error during error cleanup:", cleanupError);
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on Port ${port}`);
});
