import * as clientConnections from "./ClientConnections.js";
import * as serverRouter from "./ServerRouter.js";
import * as http from "node:http";
import * as serverActions from "./DefaultServerActions.js";

export class HTTPServer extends http.Server {

	#router = new serverRouter.ServerRouter();

	#connections = new clientConnections.ClientConnections();

	constructor() {

		super();

		this.on("connection", (socket) => {

			const {remoteAddress, remotePort} = socket;

			this.#connections.newClient(remoteAddress, remotePort);

			socket.on("close", () => {

				this.#connections.removeClient(remoteAddress, remotePort);

			});

		});

		this.on("request", (request, response) => {

			const TID = this.#connections.newHTTPtransaction(request, response);

				this.#connections.getTransaction(TID).start = Date.now();

				this.#handleHTTPtransaction(TID);

			response.on("finish", () => {

				this.#connections.getTransaction(TID).end = Date.now();

				this.#connections.removeHTTPtransaction(TID);

			});

		});



	}

	get router() {

		return this.#router;

	}


	#handleHTTPtransaction(HTTPtransactionID) {

		const transaction = this.#connections.getTransaction(HTTPtransactionID);

		if(transaction !== undefined) {

			
			this.#responseHTTPtransaction(transaction);


		}

		

	}

	#responseHTTPtransaction(transaction) {

		const request = transaction.request;

		const response = transaction.response;

		const requestedPath = request.url;

		const method = request.method;

		const resource = this.#router.getResource(requestedPath, method);

		if(resource !== undefined) {

			if(method === "GET" && typeof resource === "string") {


				(async () => {

					serverActions.GETstaticResource(resource, response);

				})();
		

			}else if (typeof resource === "function" && (method === "GET" || method === "POST")) {


				resource(request, response);


			}else {

				response.writeHead(400, {"Content-Type" : "text/plain", "Connection" : "close"});

				response.end("Bad request");

			}

		}else{

			response.writeHead(404, {"Content-Type" : "text/plain", "Connection" : "close"});

			response.end("Resource not found");

		}

	}

		


}
