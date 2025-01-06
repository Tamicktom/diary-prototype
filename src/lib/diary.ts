//* Libraries imports
import z from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";

import { wiki, wikiEntrySchema } from "./wiki";

export const diaryEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
});

export type DiaryEntry = z.infer<typeof diaryEntrySchema>;

const tagsPrompt = `
You are a helpful assistant that can help me analyze my diary entries and suggest tags for them.
You will be given a diary entry and you will need to suggest tags for it.
The tags should be related to the content of the diary entry.
Each tag should be a single or compound word, avoid more than 3 words.
The tags should be in the same language as the diary entry.
Don't make more than 5 tags.
`;

const wikiPrompt = `
You are a helpful assistant that can help me analyze my diary entries and suggest wiki entries for them.
You will be given a diary entry and you will need to suggest wiki entries for it.
Check if the wiki entrie for that topic already exists.
If it does, read it and update it with the new information, if it doesn't, create a new one.
You can create multiple wiki entries.
The wiki entries should be in the same language as the diary entry.
When writing the wiki entries, use the same tone and style as the diary entry. (first person if the diary entry is in first person, third person if the diary entry is in third person)

Rules for what should become a wiki entry:

1. Important entities (people, places, projects)
2. Important concepts
3. Important events
4. Important dates
5. Important things I learned

Take one step for each wiki entry.
`;

class Diary {
  private diaryEntries: DiaryEntry[];

  constructor() {
    this.diaryEntries = [];
  }

  async saveNewEntry(entry: DiaryEntry) {
    const tags: string[] = [];

    //* Generate tags
    await generateText({
      model: openai("gpt-4o-mini"),
      maxSteps: 1,
      messages: [
        {
          role: "system",
          content: tagsPrompt,
        },
        {
          role: "user",
          content: `Title: ${entry.title}\nContent: ${entry.content}`,
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
        }),
      },
    });

    //* Generate wiki entries
    await generateText({
      model: openai("gpt-4o-mini"),
      maxSteps: 20,
      messages: [
        {
          role: "system",
          content: wikiPrompt,
        },
        {
          role: "user",
          content: `Title: ${entry.title}\nContent: ${entry.content}`,
        },
      ],
      tools: {
        listWikiEntries: tool({
          description: "List all wiki entries by title and id",
          parameters: z.object({}),
          execute: async () => {
            console.log("Getting wiki entries");
            return await wiki.getEntriesList();
          },
        }),
        getWikiEntryById: tool({
          description: "Get a wiki entry by id",
          parameters: z.object({
            id: z.string(),
          }),
          execute: async (args) => {
            console.log("Getting wiki entry by id", args.id);
            return await wiki.getEntryById(args.id);
          },
        }),
        createWikiEntry: tool({
          description: "Create a wiki entry",
          parameters: wikiEntrySchema.omit({ id: true }),
          execute: async (args) => {
            console.log("Creating wiki entry", args);
            const id = crypto.randomUUID();
            return await wiki.saveNewEntry({ ...args, id });
          },
        }),
        updateWikiEntry: tool({
          description: "Update a wiki entry",
          parameters: wikiEntrySchema,
          execute: async (args) => {
            console.log("Updating wiki entry", args);
            return await wiki.updateEntry(args);
          },
        }),
      },
    });

    //* Save the entry
    entry.tags = tags;
    this.diaryEntries.push(entry);

    console.log("Wiki entries:", await wiki.getEntries());
  }

  async getEntries() {
    return this.diaryEntries;
  }

  async getEntriesList() {
    return this.diaryEntries.map((entry) => ({
      title: entry.title,
      id: entry.id,
    }));
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
