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

	return new Response(asdasd(), {
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

// import fs from "node:fs"
import util from "node:util";
// @ts-ignore
function asdasd() {
	const traverse = function (dir, result = []) {
		// list files in directory and loop through
		fs.readdirSync(dir).forEach((file) => {
			// builds full path of file
			const fPath = path.resolve(dir, file);

			// prepare stats obj
			const fileStats = { file, path: fPath };

			// is the file a directory ?
			// if yes, traverse it also, if no just add it to the result
			if (
				fs.statSync(fPath).isDirectory() &&
				!fPath.includes("node_modules") &&
				!fPath.includes(".git")
			) {
				fileStats.type = "dir";
				fileStats.files = [];
				result.push(fileStats);
				return traverse(fPath, fileStats.files);
			}

			fileStats.type = "file";
			result.push(fileStats);
		});
		return result;
	};

	return util.inspect(traverse(process.cwd()), false, null);
}
