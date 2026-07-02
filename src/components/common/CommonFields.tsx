// src/components/vendor/CommonFields.tsx
import React from "react";

interface CommonFieldsProps {
  formik: any;
}

const CommonFields: React.FC<CommonFieldsProps> = ({ formik }) => {
  const renderError = (field: string) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="text-red-500 text-sm mt-1">{formik.errors[field]}</div>
    ) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Service Name */}
      <div>
        <label className="block mb-1 font-medium">Service Name</label>
        <input
          type="text"
          name="serviceName"
          value={formik.values.serviceName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.serviceName && formik.errors.serviceName
              ? "customInputError"
              : ""
          }`}
          placeholder="Enter Service Name"
        />
        {renderError("serviceName")}
      </div>

      {/* Short Description */}
      <div className="md:col-span-2">
        <label className="block mb-1 font-medium">Short Description</label>
        <textarea
          name="shortDescription"
          value={formik.values.shortDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={2}
          className={`customInput ${
            formik.touched.shortDescription && formik.errors.shortDescription
              ? "customInputError"
              : ""
          }`}
          placeholder="Short summary about your service"
        />
        {renderError("shortDescription")}
      </div>

      {/* Full Description */}
      <div className="md:col-span-2">
        <label className="block mb-1 font-medium">Full Description</label>
        <textarea
          name="fullDescription"
          value={formik.values.fullDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={3}
          className={`customInput ${
            formik.touched.fullDescription && formik.errors.fullDescription
              ? "customInputError"
              : ""
          }`}
          placeholder="Describe your service in detail"
        />
        {renderError("fullDescription")}
      </div>

      {/* Price / Charges */}
      <div>
        <label className="block mb-1 font-medium">Price / Charges</label>
        <input
          type="number"
          name="price"
          value={formik.values.price}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.price && formik.errors.price ? "customInputError" : ""
          }`}
          placeholder="Enter amount"
        />
        {renderError("price")}
      </div>

      {/* Offer */}
      <div>
        <label className="block mb-1 font-medium">Offer / Discount (%)</label>
        <input
          type="number"
          name="offer"
          value={formik.values.offer || ""}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.offer && formik.errors.offer ? "customInputError" : ""
          }`}
          placeholder="Optional"
        />
        {renderError("offer")}
      </div>

      {/* GST */}
      <div>
        <label className="block mb-1 font-medium">GST / Tax (%)</label>
        <select
          name="gst"
          value={formik.values.gst}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.gst && formik.errors.gst ? "customInputError" : ""
          }`}
        >
          <option value="18%">18%</option>
          <option value="12%">12%</option>
          <option value="5%">5%</option>
        </select>
        {renderError("gst")}
      </div>

      {/* Contact Person */}
      <div>
        <label className="block mb-1 font-medium">Contact Person Name</label>
        <input
          type="text"
          name="contactPerson"
          value={formik.values.contactPerson}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.contactPerson && formik.errors.contactPerson
              ? "customInputError"
              : ""
          }`}
          placeholder="Rahul Sharma"
        />
        {renderError("contactPerson")}
      </div>

      {/* Contact Number */}
      <div>
        <label className="block mb-1 font-medium">Contact Number</label>
        <input
          type="number"
          name="contactNumber"
          value={formik.values.contactNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.contactNumber && formik.errors.contactNumber
              ? "customInputError"
              : ""
          }`}
          placeholder="9876543210"
        />
        {renderError("contactNumber")}
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.email && formik.errors.email ? "customInputError" : ""
          }`}
          placeholder="info@vendor.com"
        />
        {renderError("email")}
      </div>

      {/* Address */}
      <div className="md:col-span-2">
        <label className="block mb-1 font-medium">Address / Location</label>
        <input
          type="text"
          name="address"
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.address && formik.errors.address ? "customInputError" : ""
          }`}
          placeholder="123 MG Road, Delhi"
        />
        {renderError("address")}
      </div>

      {/* City */}
      <div>
        <label className="block mb-1 font-medium">City</label>
        <select
          name="city"
          value={formik.values.city}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.city && formik.errors.city ? "customInputError" : ""
          }`}
        >
          <option value="">Select City</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Surat">Surat</option>
          <option value="Vadodara">Vadodara</option>
          <option value="Rajkot">Rajkot</option>
          <option value="Gandhinagar">Gandhinagar</option>
        </select>
        {renderError("city")}
      </div>

      {/* State */}
      <div>
        <label className="block mb-1 font-medium">State</label>
        <select
          name="state"
          value={formik.values.state}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.state && formik.errors.state ? "customInputError" : ""
          }`}
        >
          <option value="">Select State</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Delhi">Delhi</option>
        </select>
        {renderError("state")}
      </div>

      {/* Pincode */}
      <div>
        <label className="block mb-1 font-medium">Pincode</label>
        <input
          type="number"
          name="pincode"
          value={formik.values.pincode}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.pincode && formik.errors.pincode ? "customInputError" : ""
          }`}
          placeholder="110001"
        />
        {renderError("pincode")}
      </div>

      {/* Video URL */}
      <div>
        <label className="block mb-1 font-medium">Video URL (optional)</label>
        <input
          type="text"
          name="videoUrl"
          value={formik.values.videoUrl || ""}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.videoUrl && formik.errors.videoUrl ? "customInputError" : ""
          }`}
          placeholder="https://youtu.be/demo"
        />
        {renderError("videoUrl")}
      </div>

      {/* Timings */}
      <div>
        <label className="block mb-1 font-medium">Timings</label>
        <input
          type="text"
          name="timings"
          value={formik.values.timings}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.timings && formik.errors.timings ? "customInputError" : ""
          }`}
          placeholder="6 AM – 10 PM"
        />
        {renderError("timings")}
      </div>

      {/* Terms */}
      <div className="md:col-span-2">
        <label className="block mb-1 font-medium">Terms & Conditions</label>
        <textarea
          name="terms"
          value={formik.values.terms}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={2}
          className={`customInput ${
            formik.touched.terms && formik.errors.terms ? "customInputError" : ""
          }`}
          placeholder="Enter terms here"
        />
        {renderError("terms")}
      </div>

      {/* Active Status */}
      <div>
        <label className="block mb-1 font-medium">Active Status</label>
        <select
          name="activeStatus"
          value={formik.values.activeStatus}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`customInput ${
            formik.touched.activeStatus && formik.errors.activeStatus
              ? "customInputError"
              : ""
          }`}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        {renderError("activeStatus")}
      </div>
    </div>
  );
};

export default CommonFields;
