import { useState } from "react";
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import MainButton from "../../components/common/MainButton";
import { IoMdCart } from "react-icons/io";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import Swal from "sweetalert2";

const Login = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "", // API expects username (which is contact_number)
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username/Mobile is Required"),
      password: Yup.string().required("Password is Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await publicAxios.post("/api/mlm/login/", {
          username: values.username,
          password: values.password,
        });

        console.log("Login response:", response.data);

        if (response.data) {
          // Store tokens and user data
          login(
            response.data.user,
            response.data.tokens.access,
            response.data.tokens.refresh
          );

          Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: response.data.message || "Welcome back!",
            timer: 1500,
            showConfirmButton: false,
          });

          // Redirect to agent dashboard
          navigate("/agent/dashboard");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        
        let errorMessage = "Invalid credentials. Please try again.";
        
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = error.response.data.error || "Agent not approved yet";
          } else if (error.response.status === 404) {
            errorMessage = "Agent profile not found";
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          }
        }

        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAgentRegistration = () => {
    window.open("https://initcart.in/becomeAgent", "_blank");
  };

  return (
    <div className="flex w-full" style={{ height: "100svh" }}>
      <div className="hidden lg:flex w-[55%] relative p-5 lg:p-10 bg-gradient-to-br from-[#0165ff] to-[#0053cf] overflow-hidden">
        {/* Branding Text */}
        <div className="relative z-10 text-white flex flex-col justify-center h-full gap-6">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold"
          >
            Welcome to Agent Panel
          </motion.h1>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-gray-200"
          >
            Manage your referrals, customers, and earnings with ease.
          </motion.p>
        </div>

        {/* Optional Decorative Circles */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute -bottom-10 -right-20 w-60 h-60 bg-white opacity-10 rounded-full"
        />
      </div>

      <div className="w-full lg:w-[45%] p-5 lg:p-10 flex flex-col justify-center gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-20"
        >
          {/* Header */}
          <div className="text-center flex flex-col gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2"
            >
              <div className="bg-gradient-to-br from-[#0165ff] to-[#004bb5] rounded-full p-2 shadow-[4px_4px_10px_rgba(0,0,0,0.3), -4px_-4px_10px_rgba(255,255,255,0.2)] transform transition-transform duration-300">
                <IoMdCart color="white" size={22} />
              </div>
              <div className="font-bold text-xl">Ecommerce</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              <div className="font-heading font-bold text-[38px] ">
                Agent Login
              </div>
              <div className="text-gray-500 text-lg">
                Please login to your agent account
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block mb-1 font-medium">
                  Mobile Number
                </label>
                <input
                  type="text"
                  className={`${
                    formik.touched.username && formik.errors.username
                      ? "customInputError"
                      : "customInput"
                  }`}
                  placeholder="Enter your registered mobile number"
                  name="username"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                />
                {formik.touched.username && formik.errors.username && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.username}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={!showPassword ? "password" : "text"}
                    className={`${
                      formik.touched.password && formik.errors.password
                        ? "customInputError"
                        : "customInput"
                    }`}
                    style={{ paddingRight: "50px" }}
                    placeholder="Enter your password"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  <div
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-[50%] transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors duration-300"
                  >
                    {showPassword ? (
                      <FaEye size={19} />
                    ) : (
                      <FaEyeSlash size={19} />
                    )}
                  </div>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.password}
                  </div>
                )}
                <div className="w-full text-right pr-3 text-blue-500 cursor-pointer font-semibold mt-1">
                  Forgot Password?
                </div>
              </div>

              {/* Login Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="select-none cursor-pointer mt-4"
              >
                <MainButton
                  text="Login"
                  loading={loading}
                  disabled={!formik.isValid || loading}
                  submit={() => formik.handleSubmit()}
                  className="hover:scale-103 transition-transform duration-300 w-full"
                />
              </motion.div>
            </form>
          </motion.div>
        </motion.div>

        {/* Attractive Registration Button */}
{/* Attractive Registration Button */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.9, duration: 0.6 }}
  className="w-full flex justify-center items-center mt-6"
>
  <div className="w-full max-w-sm relative text-center">
    
    {/* Decorative gradient line */}
    <div className="absolute inset-x-0 -top-4 flex justify-center">
      <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
    
    <div className="mb-3">
      <span className="text-sm text-gray-500">New to our platform?</span>
    </div>
    
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAgentRegistration}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 
                 hover:from-green-600 hover:to-emerald-700 
                 text-white font-semibold py-3 px-4 rounded-xl 
                 shadow-lg hover:shadow-xl transition-all duration-300 
                 flex items-center justify-center gap-3 group"
    >
      <FaUserPlus className="text-white text-lg group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-base">Register as an Agent</span>
      <div className="w-0 group-hover:w-5 overflow-hidden transition-all duration-300">
        <span className="text-white text-lg">→</span>
      </div>
    </motion.button>
    
    <p className="text-xs text-gray-400 mt-3">
      Start your journey with us today
    </p>
  </div>
</motion.div>
      </div>
    </div>
  );
};

export default Login;