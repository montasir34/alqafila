import { z } from "zod";

export const createCampaignSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل").max(100),
  description: z.string().min(20, "الوصف يجب أن يكون 20 حرفاً على الأقل").max(1000),
  goalAmount: z.number({ error: "أدخل مبلغاً صحيحاً" }).int().min(10000, "الحد الأدنى 10,000 جنيه"),
});

export const createDisbursementSchema = z.object({
  campaignId: z.string().cuid(),
  amount: z.number().int().min(1, "المبلغ مطلوب"),
  recipient: z.string().min(3, "وصف الجهة المستفيدة مطلوب").max(200),
  proofUrl: z.string().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CreateDisbursementInput = z.infer<typeof createDisbursementSchema>;
