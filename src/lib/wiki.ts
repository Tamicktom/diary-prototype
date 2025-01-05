//* Libraries imports
import z from "zod";

export const wikiEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().nullable(),
  tags: z.array(z.string()),
});

export type WikiEntry = z.infer<typeof wikiEntrySchema>;

const defaultWikiEntries: WikiEntry[] = [
//   {
//     id: "fa6df0ba-790f-443c-abc7-16e2d7443377",
//     content: `Descrição: Melhor amiga de Sakura Himawari. Presenteou Sakura com um diário fofo de cor-de-rosa com ursinhos. Conhecida por seu hábito de arrastar Sakura para lugares inesperados, como o terraço da escola.
// Personalidade: Extrovertida, animada e espontânea.`,
//     tags: ["Sakura Himawari", "Amigos", "Escola"],
//     title: "Yui-chan",
//   },
//   {
//     id: "773333ce-3d9e-4035-8293-cd3f6e75bb0e",
//     content: `Descrição: Escola onde Sakura Himawari estuda. Tem um ambiente encantador, especialmente durante a primavera, quando pétalas de cerejeira voam pelo ar. Possui um terraço onde os alunos podem relaxar e clubes diversos, como o de música e o de kendo.
// Clubes Populares:

// Clube de Kendo: Liderado por Kaito-senpai.
// Clube de Música: Conhecido pelas performances impressionantes, especialmente pela vocalista Mitsuki-san.`,
//     tags: ["Escola", "Kendo", "Música"],
//     title: "Academia Sakurasou",
//   },
];

class Wiki {
  private wikiEntries: WikiEntry[];

  constructor() {
    this.wikiEntries = defaultWikiEntries;
  }

  async saveNewEntry(entry: WikiEntry) {
    this.wikiEntries.push(entry);
    return {
      status: "success",
      message: "Wiki entry created successfully",
    };
  }

  async updateEntry(entry: WikiEntry) {
    const index = this.wikiEntries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      this.wikiEntries[index] = entry;
      return {
        status: "success",
        message: "Wiki entry updated successfully",
      };
    }

    return {
      status: "error",
      message: "Wiki entry not found",
    };
  }

  async getEntries() {
    return {
      status: "success",
      entries: this.wikiEntries,
    }
  }

  async getEntriesList() {
    return {
      status: "success",
      entries: this.wikiEntries.map((entry) => ({
        title: entry.title,
        id: entry.id,
      })),
    };
  }

  async getEntryById(id: string) {
    return {
      status: "success",
      entry: this.wikiEntries.find((entry) => entry.id === id),
    };
  }
}

export const wiki = new Wiki();
