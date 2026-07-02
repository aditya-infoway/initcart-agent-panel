import { useState } from "react";
import { IoMdCart } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import MainButton from "../../components/common/MainButton";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const login = useAuthStore((store) => store.login);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      mobile: "",
      referralCode: "",
      password: "",
      confirmPassword: "",
      address: "",
      bankAccount: "",
      ifsc: "",
      pan: "",
      aadhaar: "",
      profilePhoto: "",
      joiningDate: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full Name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number")
        .required("Mobile number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
      address: Yup.string().when("step", {
        is: 2,
        then: (schema) => schema.required("Address is required"),
      }),
      bankAccount: Yup.string().when("step", {
        is: 2,
        then: (schema) => schema.required("Bank Account Number is required"),
      }),
      ifsc: Yup.string().when("step", {
        is: 2,
        then: (schema) => schema.required("IFSC Code is required"),
      }),
      pan: Yup.string().when("step", {
        is: 2,
        then: (schema) =>
          schema
            .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN number")
            .required("PAN Number is required"),
      }),
      aadhaar: Yup.string().when("step", {
        is: 2,
        then: (schema) =>
          schema
            .matches(/^[0-9]{12}$/, "Enter a valid 12-digit Aadhaar number")
            .required("Aadhaar Number is required"),
      }),
      joiningDate: Yup.string().when("step", {
        is: 2,
        then: (schema) =>
          schema
            .required("Joining Date is required")
            .required("Joining Date is required"),
      }),
    }),
    onSubmit: (values) => {
      console.log("Logging here values ", values);

      //   setLoading(true);
      //   setTimeout(() => {
      //     console.log("Registration Submitted", values);
      //     setLoading(false);
      //   }, 2000);
    },
  });

  const nextStep = () => {
    // if (
    //   !formik.errors.fullName &&
    //   !formik.errors.email &&
    //   !formik.errors.mobile &&
    //   !formik.errors.password &&
    //   !formik.errors.confirmPassword
    // ) {
    setStep(2);
    // } else {
    //   formik.handleSubmit(); // trigger validation
    // }
  };

  const prevStep = () => setStep(1);

  return (
    <div className="flex w-full" style={{ height: "100svh" }}>
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[55%] relative p-5 lg:p-10 bg-gradient-to-br from-[#0165ff] to-[#0053cf] overflow-hidden">
        <div className="relative z-10 text-white flex flex-col justify-center h-full gap-6">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold"
          >
            Join as an Agent
          </motion.h1>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-gray-200"
          >
            Register to manage your customers, services, and performance easily.
          </motion.p>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full lg:w-[45%] p-5 lg:p-10 flex flex-col justify-center gap-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-10"
        >
          {/* Header */}
          <div className="text-center flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-gradient-to-br from-[#0165ff] to-[#004bb5] rounded-full p-2 shadow-md">
                <IoMdCart color="white" size={22} />
              </div>
              <div className="font-bold text-xl">Ecommerce Agent</div>
            </div>

            <div className="font-heading font-bold text-[32px]">
              {step === 1 ? "Create Account" : "Complete Details"}
            </div>
            <div className="text-gray-500 text-lg">Step {step} of 2</div>
          </div>

          {/* FORM */}
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-6"
            encType="multipart/form-data"
          >
            {step === 1 ? (
              <>
                {/* STEP 1 FIELDS */}
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Ravi Sharma"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.fullName}
                      className={
                        formik.touched.fullName && formik.errors.fullName
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="ravi@example.com"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      className={
                        formik.touched.email && formik.errors.email
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Mobile Number
                    </label>
                    <input
                      type="number"
                      name="mobile"
                      placeholder="9876543210"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.mobile}
                      className={
                        formik.touched.mobile && formik.errors.mobile
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <div className="relative">
                      <input
                        type={!showPassword ? "password" : "text"}
                        name="password"
                        placeholder="********"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        className={
                          formik.touched.password && formik.errors.password
                            ? "customInputError"
                            : "customInput"
                        }
                      />
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={!showConfirmPassword ? "password" : "text"}
                        name="confirmPassword"
                        placeholder="********"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                        className={
                          formik.touched.confirmPassword &&
                          formik.errors.confirmPassword
                            ? "customInputError"
                            : "customInput"
                        }
                      />
                      <div
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                      >
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                      </div>
                    </div>
                  </div>
                </div>

                <MainButton
                  text="Next"
                  loading={false}
                  submit={nextStep}
                  className="hover:scale-103 transition-transform duration-300"
                />
              </>
            ) : (
              <>
                {/* STEP 2 FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1 font-medium">
                      Referral Code (Parent Agent)
                    </label>
                    <input
                      type="text"
                      name="referralCode"
                      placeholder="AGT001 (optional)"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.referralCode}
                      className="customInput inputOptional"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Address</label>
                    <textarea
                      name="address"
                      placeholder="Junagadh, Gujarat"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.address}
                      className={
                        formik.touched.address && formik.errors.address
                          ? "customInputError h-24"
                          : "customInput h-24"
                      }
                    ></textarea>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Bank Account Number
                    </label>
                    <input
                      type="number"
                      name="bankAccount"
                      placeholder="1234567890123"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.bankAccount}
                      className={
                        formik.touched.bankAccount && formik.errors.bankAccount
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">IFSC Code</label>
                    <input
                      type="text"
                      name="ifsc"
                      placeholder="SBIN0001234"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.ifsc}
                      className={
                        formik.touched.ifsc && formik.errors.ifsc
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">PAN Number</label>
                    <input
                      type="text"
                      name="pan"
                      placeholder="ABCDE1234F"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.pan}
                      className={
                        formik.touched.pan && formik.errors.pan
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Aadhaar Number
                    </label>
                    <input
                      type="number"
                      name="aadhaar"
                      placeholder="123456789012"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.aadhaar}
                      className={
                        formik.touched.aadhaar && formik.errors.aadhaar
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      name="profilePhoto"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        formik.setFieldValue("profilePhoto", file);
                        e.target.classList.toggle("filled", !!file);
                      }}
                      className="customInput cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      onChange={(e) => {
                        formik.handleChange(e);
                        e.target.classList.toggle("filled", !!e.target.value);
                      }}
                      onBlur={formik.handleBlur}
                      value={formik.values.joiningDate}
                      className={
                        formik.touched.joiningDate && formik.errors.joiningDate
                          ? "customInputError"
                          : "customInput"
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-5 gap-5">
                  <MainButton
                    text="Back"
                    loading={false}
                    submit={prevStep}
                    className="hover:scale-103 transition-transform duration-300 bg-gray-400 hover:bg-gray-500"
                  />
                  <MainButton
                    text="Register"
                    loading={loading}
                    disabled={!formik.isValid}
                    // submit={() => formik.handleSubmit()}
                    submit={() => {
                      navigate("/dashboard");
                    }}
                    className="hover:scale-103 transition-transform duration-300"
                  />
                </div>

                <div className="w-full mt-3 flex justify-center gap-2">
                  <div className="text-gray-500">Already have an account?</div>
                  <Link to={"/login"}>
                    <div className="text-blue-500 font-bold">Login</div>
                  </Link>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Registration;
