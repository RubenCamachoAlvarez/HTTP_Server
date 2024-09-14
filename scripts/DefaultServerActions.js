import * as mimeTypes from "mime-types";
import * as serverFileSystem from "./ServerFileSystem.js";

export async function GETstaticResource(pathResource, response) {

	try {

		const data = await serverFileSystem.readServerFile(pathResource);

		const type = mimeTypes.lookup(pathResource);


		response.writeHead(200, {"Content-Type" : type, "Connection" : "keep-alive"});

		response.end(data);


	}catch(error) {

		console.log(error.message);

		response.writeHead(500, {"Content-Type" : "text/plain", "Connection" : "close"});

		response.end("Generic server error");

	}	

}
