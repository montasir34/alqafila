import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(60),
    email: z.string().email("بريد إلكتروني غير صحيح"),
    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .max(72),
    confirmPassword: z.string(),
    state: z.string().min(1, "اختر الولاية"),
    city: z.string().min(1, "اختر المدينة"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const contributorSchema = z.object({
  idImageUrl: z.string().min(1, "صورة الهوية مطلوبة"),
  selfieUrl: z.string().min(1, "الصورة الشخصية مطلوبة"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContributorInput = z.infer<typeof contributorSchema>;
