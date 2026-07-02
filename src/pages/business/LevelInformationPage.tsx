import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";

interface LevelInfo {
  id: number;
  levelName: string;
  minSalesRequired: number;
  commissionPercent: number;
  nextLevelTarget: number;
}

const validationSchema = Yup.object({
  levelName: Yup.string().required("Level Name is required"),
  minSalesRequired: Yup.number().required("Minimum Sales Required"),
  // .positive()
  // .integer(),
  commissionPercent: Yup.number().required("Commission % is required"),
  // .min(0)
  // .max(100),
  nextLevelTarget: Yup.number()
    .required("Next Level Target is required")
    // .positive()
    // .integer(),
});

const LevelInformationPage = () => {
  const [levels, setLevels] = useState<LevelInfo[]>([
    {
      id: 1,
      levelName: "Bronze",
      minSalesRequired: 5000,
      commissionPercent: 5,
      nextLevelTarget: 10000,
    },
    {
      id: 2,
      levelName: "Silver",
      minSalesRequired: 10000,
      commissionPercent: 7,
      nextLevelTarget: 20000,
    },
    {
      id: 3,
      levelName: "Gold",
      minSalesRequired: 20000,
      commissionPercent: 10,
      nextLevelTarget: 40000,
    },
  ]);
  const [editingLevel, setEditingLevel] = useState<LevelInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      levelName: editingLevel?.levelName || "",
      minSalesRequired: editingLevel?.minSalesRequired || 0,
      commissionPercent: editingLevel?.commissionPercent || 0,
      nextLevelTarget: editingLevel?.nextLevelTarget || 0,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setIsLoading(true);
      if (editingLevel) {
        // Update existing
        setLevels((prev) =>
          prev.map((lvl) =>
            lvl.id === editingLevel.id ? { ...editingLevel, ...values } : lvl
          )
        );
        Swal.fire(
          "Updated!",
          `"${values.levelName}" updated successfully!`,
          "success"
        );
      } else {
        // Add new
        const newLevel: LevelInfo = {
          id: levels.length + 1,
          ...values,
        };
        setLevels([...levels, newLevel]);
        Swal.fire(
          "Added!",
          `"${values.levelName}" added successfully!`,
          "success"
        );
      }
      setModalOpen(false);
      setEditingLevel(null);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const renderError = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="text-red-500 text-sm mt-1">{formik.errors[field]}</div>
    ) : null;

  return (
    <div className="">
      <DataTable
        title="Level Information"
        data={levels}
        columns={[
          { key: "id", label: "Sr. No." },
          { key: "levelName", label: "Level Name" },
          {
            key: "minSalesRequired",
            label: "Minimum Sales Required",
            render: (item) => `₹ ${item.minSalesRequired.toLocaleString()}`,
          },
          {
            key: "commissionPercent",
            label: "Commission %",
            render: (item) => `${item.commissionPercent}%`,
          },
          {
            key: "nextLevelTarget",
            label: "Next Level Target",
            render: (item) => `₹ ${item.nextLevelTarget.toLocaleString()}`,
          },
        ]}
        onAdd={() => {
          setEditingLevel(null);
          setModalOpen(true);
        }}
        onEdit={(level) => {
          setEditingLevel(level);
          setModalOpen(true);
        }}
        onDelete={(level) => {
          Swal.fire({
            title: "Are you sure?",
            text: `Delete "${level.levelName}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
          }).then((res) => {
            if (res.isConfirmed) {
              setLevels(levels.filter((l) => l.id !== level.id));
              Swal.fire("Deleted!", "Level deleted successfully.", "success");
            }
          });
        }}
        addButtonLabel="Add New Level"
      />

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
            <h2 className="text-xl font-bold mb-6">
              {editingLevel ? "Edit Level" : "Add Level"}
            </h2>

            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block mb-1 font-medium">Level Name</label>
                <input
                  type="text"
                  name="levelName"
                  placeholder="Enter Level Name"
                  value={formik.values.levelName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput ${
                    formik.touched.levelName && formik.errors.levelName
                      ? "customInputError"
                      : ""
                  }`}
                />
                {renderError("levelName")}
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Minimum Sales Required
                </label>
                <input
                  type="number"
                  name="minSalesRequired"
                  placeholder="Enter Minimum Sales"
                  value={formik.values.minSalesRequired}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput ${
                    formik.touched.minSalesRequired &&
                    formik.errors.minSalesRequired
                      ? "customInputError"
                      : ""
                  }`}
                />
                {renderError("minSalesRequired")}
              </div>

              <div>
                <label className="block mb-1 font-medium">Commission %</label>
                <input
                  type="number"
                  name="commissionPercent"
                  placeholder="Enter Commission %"
                  value={formik.values.commissionPercent}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput ${
                    formik.touched.commissionPercent &&
                    formik.errors.commissionPercent
                      ? "customInputError"
                      : ""
                  }`}
                />
                {renderError("commissionPercent")}
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Next Level Target
                </label>
                <input
                  type="number"
                  name="nextLevelTarget"
                  placeholder="Enter Next Level Target"
                  value={formik.values.nextLevelTarget}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`customInput ${
                    formik.touched.nextLevelTarget &&
                    formik.errors.nextLevelTarget
                      ? "customInputError"
                      : ""
                  }`}
                />
                {renderError("nextLevelTarget")}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelInformationPage;
