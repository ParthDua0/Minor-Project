const expess = require("express");
const router = expess.Router();
const { loginUser, registerUser, sendOtp, verifyOtp } = require("../controller/UserController");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;