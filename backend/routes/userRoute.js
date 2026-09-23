const expess = require("express");
const router = expess.Router();
const { loginUser, registerUser, sendOtp, verifyOtp, updateUser, userinfo } = require("../controller/UserController");
const { userresumeupload } = require("../controller/parsingController");
const upload = require("../middleware/upload-middleware");
const authMiddleware = require("../middleware/auth-middleware");

router.post("/login", loginUser);
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

module.exports = router;
