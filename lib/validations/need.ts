import { z } from "zod";

const PAYMENT_METHODS = ["bankak", "fawry", "cashi", "ocash", "e-certi", "bok"] as const;

export const createNeedSchema = z.object({
  type: z.enum(["MEDICINE", "FOOD", "SHELTER", "TRANSPORT", "CASH", "OTHER"], {
    error: "اختر نوع الحوجة",
  }),
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل").max(100),
  description: z.string().min(20, "الوصف يجب أن يكون 20 حرفاً على الأقل").max(1000),
  targetAmount: z
    .number({ error: "أدخل مبلغاً صحيحاً" })
    .int()
    .min(1000, "الحد الأدنى 1000 جنيه")
    .max(100_000_000),
  paymentMethods: z
    .array(z.string())
    .min(1, "اختر طريقة دفع واحدة على الأقل"),
  state: z.string().min(1, "اختر الولاية"),
  city: z.string().min(1, "اختر المدينة"),
  isAnonymous: z.boolean().default(false),
});

export const needFiltersSchema = z.object({
  state: z.string().optional(),
  type: z.enum(["MEDICINE", "FOOD", "SHELTER", "TRANSPORT", "CASH", "OTHER"]).optional(),
  urgent: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const createPaymentSchema = z.object({
  needId: z.string().cuid().optional(),
  campaignId: z.string().cuid().optional(),
  amount: z.number().int().min(1, "المبلغ مطلوب"),
  method: z.string().min(1, "طريقة الدفع مطلوبة"),
  proofImageUrl: z.string().url("رابط إثبات التحويل غير صحيح"),
});

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bankak: "بنكاك",
  fawry: "فوري",
  cashi: "كاشي",
  ocash: "أوكاش",
  "e-certi": "إي-سرتي",
  bok: "بنك أم درمان الوطني",
};

export type CreateNeedInput = z.infer<typeof createNeedSchema>;
export type NeedFilters = z.infer<typeof needFiltersSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const PAYMENT_METHODS_LIST = PAYMENT_METHODS;
