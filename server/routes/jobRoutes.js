const express = require("express");
const router = express.Router();
const { 
  createJob, 
  getJobs, 
  getMyJobs,
  applyToJob, 
  claimJob, 
  acceptApplicant, 
  rejectApplicant,
  getJobApplications,
  completeJob 
} = require("../controllers/jobController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// All job routes require login
router.use(protect);

// Routes relative to /api/jobs
router.post("/", restrictTo("provider"), createJob);      // POST /api/jobs
router.get("/", getJobs);                                // GET /api/jobs
router.get("/my", restrictTo("provider"), getMyJobs);    // GET /api/jobs/my
router.post("/:id/apply", restrictTo("seeker"), applyToJob); // POST /api/jobs/:id/apply
router.post("/:id/claim", restrictTo("seeker"), claimJob);   // POST /api/jobs/:id/claim
router.get("/:id/applications", restrictTo("provider"), getJobApplications); // GET /api/jobs/:id/applications
router.put("/:id/accept", restrictTo("provider"), acceptApplicant); // PUT /api/jobs/:id/accept
router.put("/:id/reject", restrictTo("provider"), rejectApplicant); // PUT /api/jobs/:id/reject
router.put("/:id/complete", restrictTo("provider"), completeJob);   // PUT /api/jobs/:id/complete

module.exports = router;
