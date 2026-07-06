import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../services/complaint.service";

interface ComplaintForm {
  complaint_number: string;
  citizen_name: string;
  contact_number: string;
  ward_number: number;
  area: string;
  landmark: string;
  description: string;
  fault_category: string;
}

const NewComplaint = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ComplaintForm>();

  const onSubmit = async (data: ComplaintForm) => {
    try {
      await createComplaint({
        ...data,
        status: "NEW",
      });

      alert("Complaint Registered Successfully");

      reset();

      navigate("/complaints");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-8">

      <h1 className="text-3xl font-bold mb-8">
        Register Complaint
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >

        <input
          {...register("complaint_number")}
          placeholder="Complaint Number"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("citizen_name")}
          placeholder="Citizen Name"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("contact_number")}
          placeholder="Contact Number"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="number"
          {...register("ward_number")}
          placeholder="Ward Number"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("area")}
          placeholder="Area"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("landmark")}
          placeholder="Landmark"
          className="w-full border rounded-lg p-3"
        />

        <input
          {...register("fault_category")}
          placeholder="Fault Category"
          className="w-full border rounded-lg p-3"
        />

        <textarea
          {...register("description")}
          placeholder="Description"
          rows={5}
          className="w-full border rounded-lg p-3"
        />

        <button
          className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg"
        >
          Register Complaint
        </button>

      </form>

    </div>
  );
};

export default NewComplaint;