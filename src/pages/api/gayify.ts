import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_TRANSPARENCY = 0.4;

export const POST: APIRoute = async ({ request }) => {
	const formData = await request.formData();

	const file: File = formData.get("file") as File;

	let transparency: number;
	try {
		transparency = Number.parseInt(
			formData.get("transparency")?.toString() || "",
		);
	} catch {
		transparency = DEFAULT_TRANSPARENCY;
	}

	const sharpFile = sharp(await file.arrayBuffer());

	let fileMetadata: sharp.Metadata;

	try {
		fileMetadata = await sharpFile.metadata();
	} catch {
		return new Response("", {
			status: 400,
		});
	}

	return new Response(
		`
	${fs.readdirSync(process.cwd()).join(",")}\n
		${process.cwd()}
	`,
		{
			status: 400,
		},
	);
	const flagPath = path.join(process.cwd(), "gay_flag.webp");
	const flag = fs.readFileSync(flagPath);

	const resizedFlag = await sharp(flag)
		.resize({
			height: fileMetadata.height,
			width: fileMetadata.width,
			fit: "fill",
		})
		// TODO: add try here to check if transparency/100 is 0-1
		.ensureAlpha(transparency / 100)
		.toBuffer();

	const outputBuffer = await sharp(await file.arrayBuffer())
		.composite([
			{
				input: resizedFlag,
				blend: "over",
			},
		])
		.sharpen()
		.toFormat("webp")
		.toBuffer();

	const final = new Blob([outputBuffer], { type: "image/webp" });

	return new Response(final);
};
