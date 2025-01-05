import { diary, type DiaryEntry } from "@/lib/diary";
import { revalidatePath } from "next/cache";

export async function saveDiaryEntry(diaryEntry: DiaryEntry) {
    await diary.saveNewEntry(diaryEntry);

    revalidatePath("/diary");

    return { success: true };
}