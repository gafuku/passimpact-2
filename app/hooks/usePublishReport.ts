import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../lib/axiosInstance";
import { useToast } from "../components/ToastProvider";

const lineItemSchema = yup.object().shape({
  label: yup.string().required("Label is required"),
  value: yup.number().typeError("Must be a number").required("Value is required"),
});

const newInstitutionSchema = yup.object().shape({
  name: yup.string().required("Institution name is required"),
  shortName: yup.string().required("Short name is required"),
  type: yup.string().required("Type is required"),
  location: yup.string().required("Location is required"),
});

const schema = yup.object({
  institutionMode: yup.mixed<"existing" | "new">().oneOf(["existing", "new"]).required(),
  institutionId: yup.string().when("institutionMode", {
    is: "existing",
    then: (s) => s.required("Select an institution"),
    otherwise: (s) => s.optional(),
  }),
  newInstitution: newInstitutionSchema.when("institutionMode", {
    is: "new",
    then: (s) => s.required(),
    otherwise: (s) => s.optional(),
  }),

  year: yup.number().typeError("Must be a number").required(),
  fy: yup.string().required("Fiscal year is required"),
  fiscalYearEnd: yup.string().required("Fiscal year end is required"),
  published: yup.string().required("Publish date is required"),
  auditOpinion: yup.string().required("Audit opinion is required"),

  totalRevenue: yup.number().typeError("Must be a number").required(),
  totalExpenses: yup.number().typeError("Must be a number").required(),
  netPosition: yup.number().typeError("Must be a number").required(),
  privateGiftsOperating: yup.number().typeError("Must be a number").required(),

  totalAssets: yup.number().typeError("Must be a number").required(),
  totalLiabilities: yup.number().typeError("Must be a number").required(),
  totalNetAssets: yup.number().typeError("Must be a number").required(),
  totalDebt: yup.number().typeError("Must be a number").required(),

  endowment: yup.number().typeError("Must be a number").required(),
  lockboxEndowmentTotal: yup.number().typeError("Must be a number").required(),
  lockboxPermanentlyRestricted: yup.number().typeError("Must be a number").required(),
  lockboxBoardDesignated: yup.number().typeError("Must be a number").required(),
  lockboxSpendingRate: yup.number().typeError("Must be a number").required(),
  lockboxAnnualPayout: yup.number().typeError("Must be a number").required(),

  revenueBySource: yup.array().of(lineItemSchema).default([]),
  expenseByFunction: yup.array().of(lineItemSchema).default([]),
}).required();

type FormValues = yup.InferType<typeof schema>;

export function usePublishReport(draftId: string, defaultValues: FormValues) {
  const router = useRouter();
  const toast = useToast();

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const { fields: revenueFields, append: appendRevenue, remove: removeRevenue } = useFieldArray({
    control: form.control,
    name: "revenueBySource"
  });

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control: form.control,
    name: "expenseByFunction"
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await axiosInstance.post("/api/reports/publish", { ...data, draftId }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = response.data;

      if (result.success) {
        toast.success(`${result.institution?.name ?? "Report"} ${data.fy} published successfully!`);
        router.push("/admin/review");
      } else {
        toast.error("Failed to publish: " + result.error);
      }
    } catch (err: any) {
      toast.error("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return {
    form,
    revenueFields,
    appendRevenue,
    removeRevenue,
    expenseFields,
    appendExpense,
    removeExpense,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
