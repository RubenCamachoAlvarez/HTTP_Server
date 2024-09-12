import * as fsp from "node:fs/promises";

export async function readServerFile(resourcePath) {

	const serverFilePath = process.env.STATIC_RESOURCES_PATH + resourcePath;

	return fsp.readFile(serverFilePath);

}

export async function appendFile(path, text) {

	return fsp.appendFile(path, text);

}
