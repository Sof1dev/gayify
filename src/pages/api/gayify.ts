import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_TRANSPARENCY = 0.4;
export const prerender = false;
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

	const url = new URL("../../../public/favicon.webp", import.meta.url);

	console.log(url);

	return new Response(JSON.stringify(getAllFilesInCWD()), {
		status: 400,
	});
	const flagPath = path.join(process.cwd(), "gay_flag.webp");
	const flag = fs.readFileSync(url.pathname);

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

function traverseDirectory(dir: any, fileArray: any) {
	const files = fs.readdirSync(dir);
	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stats = fs.statSync(filePath);
		if (stats.isDirectory()) {
			traverseDirectory(filePath, fileArray);
		} else {
			fileArray.push(filePath);
		}
	});
}

function getAllFilesInCWD() {
	const fileArray: string[] = [];
	const cwd = process.cwd();
	traverseDirectory(cwd, fileArray);
	return fileArray;
}
