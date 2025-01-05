//* Libraries imports
import { revalidatePath } from "next/cache";

//* Local imports
import { type DiaryEntry, diary } from "@/lib/diary";
import { saveDiaryEntry } from "@/actions/save-diary-entry";

//* Components imports
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default async function DiaryPage() {
	const entries = await getDiaryEntries();

	async function createDiaryEntry(formData: FormData) {
		"use server";
		const content = formData.get("content");

		if (!content) return;

		const entry: DiaryEntry = {
			id: crypto.randomUUID(),
			date: new Date().toISOString(),
			content: content as string,
			tags: [],
		};

		await saveDiaryEntry(entry);

		revalidatePath("/diary");
	}

	return (
		<div className="flex flex-col w-full justify-start items-center min-h-svh bg-background">
			<div className="flex flex-col w-full justify-start items-center max-w-5xl p-8">
				<form
					action={createDiaryEntry}
					className="flex flex-col w-full justify-center items-end gap-2"
				>
					<Textarea
						id="content"
						name="content"
						placeholder="Write your diary entry here..."
						className="text-black w-full"
					/>
					<Button type="submit">Save</Button>
				</form>

				<div className="flex flex-col w-full justify-start items-center">
					{entries.map((entry) => {
						const date = new Date(entry.date);
						return (
							<div key={entry.id} className="border p-2 rounded-md">
								<p>
									{date.toLocaleDateString("pt-BR", {
										day: "2-digit",
										month: "2-digit",
										year: "numeric",
									})}
								</p>
								<p>{entry.content}</p>
								<span className="flex flex-row justify-start items-center gap-2 border p-2 rounded-md">
									{entry.tags.map((tag) => (
										<span key={tag} className="text-xs text-neutral-400">
											{tag}
										</span>
									))}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

async function getDiaryEntries() {
	const entries = await diary.getEntries();
	return entries;
}
