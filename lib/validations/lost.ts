import { z } from "zod";

export const createLostItemSchema = z.object({
  title:       z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل").max(100),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل").max(500),
  imageUrl:    z.string().min(1, "يرجى رفع صورة للشيء المفقود"),
  lastSeenAt:  z.string().optional(),
  state:       z.string().min(1, "اختر الولاية"),
  city:        z.string().min(1, "اختر المدينة"),
});

export const createLostCarSchema = z.object({
  make:          z.string().min(1, "نوع السيارة مطلوب").max(60),
  model:         z.string().min(1, "الموديل مطلوب").max(60),
  year:          z.coerce.number().int().min(1970).max(2025).optional(),
  color:         z.string().min(1, "اللون مطلوب").max(30),
  plateNumber:   z.string().min(1, "رقم اللوحة مطلوب").max(20),
  chassisNumber: z.string().optional(),
  description:   z.string().optional(),
  imageUrl:      z.string().min(1, "يرجى رفع صورة للسيارة"),
  state:         z.string().min(1, "اختر الولاية"),
  city:          z.string().min(1, "اختر المدينة"),
});

export const createFoundItemSchema = z.object({
  isCar:         z.boolean().default(false),
  title:         z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل").max(100),
  description:   z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل").max(500),
  imageUrl:      z.string().min(1, "يرجى رفع صورة للشيء المعثور عليه"),
  plateNumber:   z.string().optional(),
  chassisNumber: z.string().optional(),
  foundAt:       z.string().optional(),
  state:         z.string().min(1, "اختر الولاية"),
  city:          z.string().min(1, "اختر المدينة"),
});

export const createMissingPersonSchema = z.object({
  name:         z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(80),
  age:          z.coerce.number().int().min(1).max(120).optional(),
  gender:       z.enum(["ذكر", "أنثى", "غير محدد"]).optional(),
  description:  z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل").max(800),
  photoUrl:     z.string().min(1, "صورة المفقود مطلوبة — تساعد كثيراً في التعرف"),
  lastSeenAt:   z.string().optional(),
  lastSeenDate: z.string().optional(),
  state:        z.string().min(1, "اختر الولاية"),
  city:         z.string().min(1, "اختر المدينة"),
});

export const createMessageSchema = z.object({
  receiverId: z.string().cuid("معرّف غير صحيح"),
  targetType: z.enum(["NEED","LOST_ITEM","LOST_CAR","FOUND_ITEM","MISSING_PERSON","CAMPAIGN","USER"]),
  targetId:   z.string().min(1),
  body:       z.string().min(1, "الرسالة لا يمكن أن تكون فارغة").max(1000),
});

export type CreateLostItemInput    = z.infer<typeof createLostItemSchema>;
export type CreateLostCarInput     = z.infer<typeof createLostCarSchema>;
export type CreateFoundItemInput   = z.infer<typeof createFoundItemSchema>;
export type CreateMissingPersonInput = z.infer<typeof createMissingPersonSchema>;
export type CreateMessageInput     = z.infer<typeof createMessageSchema>;
