import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { complaintSchema, FAULT_CATEGORIES, COMPLAINT_SOURCES } from "../schemas/complaint.schema";
import type { ComplaintFormValues } from "../schemas/complaint.schema";
import { createComplaint } from "../services/complaint.service";

interface Props {
  mode: "citizen" | "admin";
  onSuccess: (complaintNumber: string) => void;
}

const WARDS = Array.from({ length: 60 }, (_, i) => i + 1);

const ComplaintForm = ({ mode, onSuccess }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
  });

  const onSubmit = async (data: ComplaintFormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const complaint = await createComplaint(data);
      reset();
      onSuccess(complaint.complaint_number);
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{serverError}</div>
      )}

      <Field label="Your Name" error={errors.citizen_name?.message}>
        <input {...register("citizen_name")} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none" placeholder="Full name" />
      </Field>

      <Field label="Contact Number" error={errors.contact_number?.message}>
        <input {...register("contact_number")} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none" placeholder="10-digit mobile number" maxLength={10} />
      </Field>

      <Field label="Ward" error={errors.ward_number?.message}>
        <select {...register("ward_number")} defaultValue="" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none">
          <option value="" disabled>Select ward</option>
          {WARDS.map((w) => <option key={w} value={w}>Ward {w}</option>)}
        </select>
      </Field>

      <Field label="Street / Area" error={errors.area?.message}>
        <input {...register("area")} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none" placeholder="e.g. Kadri Temple Road" />
      </Field>

      <Field label="Landmark" error={errors.landmark?.message}>
        <input {...register("landmark")} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none" placeholder="e.g. Near Kadri Park entrance" />
      </Field>

      <Field label="Fault Category" error={errors.fault_category?.message}>
        <select {...register("fault_category")} defaultValue="" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none">
          <option value="" disabled>Select fault type</option>
          {FAULT_CATEGORIES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>

      {mode === "admin" && (
        <Field label="Complaint Source" error={errors.complaint_source?.message}>
          <select {...register("complaint_source")} defaultValue="" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none">
            <option value="" disabled>How was this reported?</option>
            {COMPLAINT_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      )}

      <Field label="Description" error={errors.description?.message} required={false}>
        <textarea {...register("description")} rows={5} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none" placeholder="Describe the issue in detail (optional)" />
      </Field>

      <button type="submit" disabled={submitting} className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium transition">
        {submitting ? "Submitting..." : "Register Complaint"}
      </button>
    </form>
  );
};

const Field = ({ label, error, required = true, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

export default ComplaintForm;