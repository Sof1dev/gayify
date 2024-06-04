import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const prerender = false;
const TRANSPARENCY = 0.4;

export const POST: APIRoute = async ({ request }) => {
	const formData = await request.formData();
	console.log(formData);

	const file = formData.get("file") as File;

	const sharpFile = sharp(await file.arrayBuffer());
	const fileMetadata = await sharpFile.metadata();

	const flagPath = path.join(process.cwd(), "gay_flag.webp");
	const flag = fs.readFileSync(flagPath);

	const resizedFlag = await sharp(flag)
		.resize({
			height: fileMetadata.height,
			width: fileMetadata.width,
			fit: "fill",
		})
		.ensureAlpha(TRANSPARENCY)
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
