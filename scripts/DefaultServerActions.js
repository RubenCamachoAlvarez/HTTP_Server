import * as mimeTypes from "mime-types";
import * as serverFileSystem from "./ServerFileSystem.js";
import * as http from "node:http";

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


export async function sendStaticResourceToServer(resourcePath, response, clientFileName) {

	try {

		const data = await serverFileSystem.readServerFile(resourcePath);

		const type = mimeTypes.lookup(resourcePath);

		response.writeHead(200, {"Content-Disposition" : `attachment; filename=${clientFileName}`, "Content-Type" : type, "Connection" : "keep-alive"});

		response.write(data);

		response.end();


	}catch(error) {

		console.error(error.message);

		response.writeHead(500, {"Content-Type" : "text/plain", "Connection" : "close"});

		response.write("Generic Server Error");

		response.end();


	}

}



export async function getIPaddressInformation(address) {

	const url = `http://ip-api.com/json/${address}?fields=country,continent`;

	return new Promise((resolve, reject) => {

		http.get(url, (response) => {

			let data = "";

			response.on("data", (chunk) => {


				data += chunk;

			});

			response.on("end", () => {

				try {

					const result = JSON.parse(data);

					resolve(result);

				}catch(error) {

					reject(error);

				}

			});


		}).on("error", (err) => {

			reject(error);

		});

	});


}
