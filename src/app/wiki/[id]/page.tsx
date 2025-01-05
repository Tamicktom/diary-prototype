//* Libraries imports
import { wiki } from "@/lib/wiki";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export default async function WikiPage(props: Props) {
	const params = await props.params;

	const wikiEntry = await wiki.getEntryById(params.id);

	if (!wikiEntry.entry) {
		return <div>Wiki entry not found</div>;
	}

	return (
		<div className="flex flex-col w-full justify-start items-center min-h-svh bg-background">
			<div className="flex flex-col w-full justify-center items-center gap-2 max-w-5xl p-8 border rounded-md">
				<h1>{wikiEntry.entry?.title}</h1>
				<p>{wikiEntry.entry?.content}</p>
			</div>
		</div>
	);
}
