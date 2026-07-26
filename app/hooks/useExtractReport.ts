import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../lib/axiosInstance";
import { useToast } from "../components/ToastProvider";

const schema = yup.object({
  file: yup.mixed<FileList>()
    .test("required", "You need to provide a file", (value) => {
      return value && value.length > 0;
    })
    .test("fileSize", "The file is too large", (value) => {
      return value && value[0] && value[0].size <= 20000000; // 20MB limit
    })
    .test("type", "We only support pdf", (value) => {
      return value && value[0] && value[0].type === "application/pdf";
    }),
}).required();

export function useExtractReport() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  const onSubmit = async (data: any) => {
    if (!data.file || data.file.length === 0) return;
    const file: File = data.file[0];

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post("/api/reports/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const responseData = response.data;

      if (responseData.success) {
        // The draft (extracted data + the file itself) is now persisted server-side,
        // so the review page just fetches it by id — nothing to hand off here.
        router.push(`/admin/review/${responseData.draftId}`);
      } else {
        toast.error("Extraction failed: " + responseData.error);
      }
    } catch (err: any) {
      toast.error("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return { 
    form, 
    loading, 
    onSubmit: form.handleSubmit(onSubmit) 
  };
}
