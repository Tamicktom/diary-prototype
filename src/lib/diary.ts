//* Libraries imports
import z from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";

export const diaryEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
});

export type DiaryEntry = z.infer<typeof diaryEntrySchema>;

const systemPrompt = `
You are a helpful assistant that can help me analyze my diary entries and suggest tags for them.
You will be given a diary entry and you will need to suggest tags for it.
The tags should be related to the content of the diary entry.
Each tag should be a single or compound word, avoid more than 3 words.
The tags should be in the same language as the diary entry.
Don't make more than 5 tags.
`;

class Diary {
  private diaryEntries: DiaryEntry[];

  constructor() {
    this.diaryEntries = [];
  }

  async saveNewEntry(entry: DiaryEntry) {
    const tags: string[] = [];

    await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
            role: "user",
            content: entry.content,
        },
      ],
      tools: {
        tag: tool({
            description: "Tag the diary entry",
            parameters: z.object({
                tags: z.array(z.string()),
            }),
            execute: async (args) => {
                for (const tag of args.tags) {
                    tags.push(tag);
                }
            },
        })
      }
    });

    entry.tags = tags;

    console.log("tags:",tags);

    this.diaryEntries.push(entry);
  }

  async getEntries() {
    return this.diaryEntries;
  }

  async getEntriesByTag(tag: string) {
    return this.diaryEntries.filter((entry) => entry.tags.includes(tag));
  }

  async updateEntry(entry: DiaryEntry) {
    const index = this.diaryEntries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      this.diaryEntries[index] = entry;
    }
  }
}

const diary = new Diary();

export { diary };
