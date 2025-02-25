const express = require("express");
const adminAuthenticate = require("../middlewares/adminMiddleware");
const multer = require("multer"); // Make sure this is correctly imported
const fs = require("fs");
const path = require("path");
const router = express.Router();

const adminController = require("../controllers/adminController");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const { problem_id } = req.body;
      const destinationPath = path.join(__dirname, '../problems', `${problem_id}`);

      // Create the directory if it doesn't exist
      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
      }

      // Save all uploaded files in the 'inputs' directory
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Optional: Filter files (e.g., only .txt files)
    const allowedExtensions = ['.txt', '.cpp', '.java'];
    if (!allowedExtensions.includes(path.extname(file.originalname))) {
        return cb(new Error('Only .txt, .cpp, and .java files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.post("/register-admin", adminController.registerAdmin);

router.post("/login", adminController.loginAdmin);

router.get("/users", adminAuthenticate, adminController.getAllUsers);

router.get("/teams", adminAuthenticate, adminController.getAllTeams);

router.post("/problems", adminAuthenticate, adminController.addProblem);

router.put("/problems/:id", adminAuthenticate, adminController.putProblem);

router.delete("/problems/:id", adminAuthenticate, adminController.deleteProblem);

router.post('/upload-testcases', adminAuthenticate, upload.array('files'), adminController.uploadTestcases);

router.get("/submissions", adminAuthenticate, adminController.getAllSubmissions);

router.get("/stats", adminAuthenticate, adminController.getStats);

// router.post("/add-solution/", adminAuthenticate, upload.array('files'), adminController.addSolution);

module.exports = router;
