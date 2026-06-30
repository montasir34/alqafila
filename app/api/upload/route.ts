import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["proofs", "selfies", "items", "missing", "needs", "ids"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  try {
    const { data, folder } = await req.json() as { data: string; folder: string };

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "مجلد غير مسموح" }, { status: 400 });
    }

    // صور الهويات في مجلد مقيّد
    const uploadFolder =
      folder === "ids" ? "alqafila/ids_restricted" : `alqafila/${folder}`;

    const result = await cloudinary.uploader.upload(data, {
      folder: uploadFolder,
      resource_type: "image",
      max_bytes: 5 * 1024 * 1024,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch {
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}
