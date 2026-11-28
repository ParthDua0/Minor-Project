const expess = require("express");
const router = expess.Router();
const { loginUser, registerUser, sendOtp, verifyOtp, updateUser, userinfo, requestPasswordReset, resetPassword } = require("../controller/UserController");
const { userresumeupload, deleteResume, getResumeLink } = require("../controller/parsingController");
const upload = require("../middleware/upload-middleware");
const authMiddleware = require("../middleware/auth-middleware");
const { createJob, listJobs, matchedJobs, recruiterJobs } = require('../controller/jobController');
const { getQuestions, submitAssessment, myAssessments } = require('../controller/assessmentController');
const { getReadiness } = require('../controller/readinessController');
const { runCode } = require('../controller/compilerController');

router.post("/login", loginUser);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/user-edit" , authMiddleware, updateUser );
router.get("/user-info" , authMiddleware, userinfo );

router.post(
    "/resume",
    authMiddleware,
    upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "file", maxCount: 1 }, 
        { name: "resumeFile", maxCount: 1 }
    ]),
    userresumeupload
);
router.delete("/resume", authMiddleware, deleteResume);
router.get("/resume-link", authMiddleware, getResumeLink);
router.get('/jobs', authMiddleware, listJobs);
router.post('/jobs', authMiddleware, createJob);
router.get('/recruiter/jobs', authMiddleware, recruiterJobs);
router.get('/jobs/matches', authMiddleware, matchedJobs);
router.get('/assessments', authMiddleware, myAssessments);
router.get('/assessments/questions/:skill', authMiddleware, getQuestions);
router.post('/assessments', authMiddleware, submitAssessment);
router.get('/readiness', authMiddleware, getReadiness);
router.post('/compiler/run', authMiddleware, runCode);

module.exports = router;
