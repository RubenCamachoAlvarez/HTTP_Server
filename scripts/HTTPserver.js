import * as clientConnections from "./ClientConnections.js";
import * as serverRouter from "./ServerRouter.js";
import * as http from "node:http";
import * as serverActions from "./DefaultServerActions.js";
import * as serverFileSystem from "./ServerFileSystem.js";

export class HTTPServer extends http.Server {

	#router = new serverRouter.ServerRouter();

	#connections = new clientConnections.ClientConnections();

	constructor() {

		super();

		this.on("connection", (socket) => {

			const {remoteAddress, remotePort} = socket;

			this.#connections.newClient(remoteAddress, remotePort);

			this.#connections.getTCPconnectionInformation(remoteAddress, remotePort).startTimestamp = Date.now();

			socket.on("close", () => {

				this.#connections.getTCPconnectionInformation(remoteAddress, remotePort).endTimestamp = Date.now();

				this.#connections.removeClient(remoteAddress, remotePort);

			});

		});

		this.on("request", (request, response) => {

			const {remoteAddress, remotePort} = request.socket;
		
			const CID = this.#connections.getClientID(remoteAddress, remotePort);

			const TID = this.#connections.newHTTPtransaction(request, response, CID);

			this.#connections.getTransaction(TID).start = Date.now();

			this.#logHTTPevent(TID, "request");

			this.#handleHTTPtransaction(TID);

			response.on("finish", () => {
				
				this.#connections.getTransaction(TID).end = Date.now();

				this.#logHTTPevent(TID, "response");

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


	#logHTTPevent(HTTPtransactionID, HTTPeventName) {

		if(HTTPeventName === "request" || HTTPeventName === "response"){

			const transaction = this.#connections.getTransaction(HTTPtransactionID);

			const TCPconnectionID = transaction.CID;

			const startTimestamp = transaction.start;

			const serverFilePath = process.env.TRANSACTIONS_LOG;

			const request = transaction.request;

			const method = request.method;

			const path = request.url;

			let message = "";

			if(HTTPeventName === "request") {

				message = `Request TCP_connection_ID=${TCPconnectionID} HTTP_transaction_ID=${HTTPtransactionID} ${method} ${path} start_UTC=${new Date(startTimestamp).toUTCString()}\n`;

			}else if(HTTPeventName === "response") {

				const response = transaction.response;

				const endTimestamp = transaction.end;

				message = `Response TCP_connetion_ID=${TCPconnectionID} HTTP_transaction_ID=${HTTPtransactionID} ${method} ${path} status_code=${response.statusCode} Duration=${endTimestamp-startTimestamp}ms end_UTC=${new Date(endTimestamp).toUTCString()}\n`;

			}

			(async () => {


				serverFileSystem.appendFile(serverFilePath, message);

			})();


		}


	}


	#logTCPevent(address, port, TCPevent) {

		if(TCPevent === "connection" ||  TCPevent === "disconnection"){

			const connectionInformation = this.#connections.getTCPconnectionInformation(address, port);

			let message = "";

			if(TCPevent === "connection") {


				message = `Connection established from ${address}:${port} TCP_connection_id=${connectionInformation.CID} start_UTC=${connectionInformation.startTimestamp}`;


			}else if(TCPevent === "disconnection") {



			}

		}

	}
		


}
