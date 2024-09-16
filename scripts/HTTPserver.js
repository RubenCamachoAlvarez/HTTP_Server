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

		this.on("request", async (request, response) => {

			await this.#establishTCPconnection(request.socket);

			this.#generateHTTPtransaction(request, response);

		});



	}

	async #establishTCPconnection(socket) {

		const {remoteAddress, remotePort} = socket;

		if(!this.#connections.isClientConnected(remoteAddress, remotePort)) {


			await this.#connections.newClient(remoteAddress, remotePort);

			this.#connections.getTCPconnectionInformation(remoteAddress, remotePort).startTimestamp = Date.now();

			this.#logTCPevent(remoteAddress, remotePort, "connection");

			socket.on("close", () => {

				this.#connections.getTCPconnectionInformation(remoteAddress, remotePort).endTimestamp = Date.now();

				this.#logTCPevent(remoteAddress, remotePort, "disconnection");

				this.#connections.removeClient(remoteAddress, remotePort);


			});


		}

	}

	#generateHTTPtransaction(request, response) {

		const {remoteAddress, remotePort} = request.socket;

		const CID = this.#connections.getClientID(remoteAddress, remotePort);

		const TID = this.#connections.newHTTPtransaction(request, response, CID);

		this.#connections.getTransaction(TID).start = Date.now();

		this.#logHTTPevent(TID, "request");

		response.on("finish", () => {

			this.#connections.getTransaction(TID).end = Date.now();

			this.#logHTTPevent(TID, "response");

			this.#connections.removeHTTPtransaction(TID);


		});

		const transaction = this.#connections.getTransaction(TID);

		this.#responseHTTPtransaction(transaction);


	}

	get router() {

		return this.#router;

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

				const transactionInformation = {

					"request" : request,

					"response" : response,

					"IPinformation" : this.#connections.getIPclientInformation(request.socket.remoteAddress)

				};


				resource(transactionInformation);



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

				const userAgent = request.headers["user-agent"];

				message = `Request TCP_connection_ID=${TCPconnectionID} HTTP_transaction_ID=${HTTPtransactionID} ${method} ${path} user-agent=${userAgent} start_UTC=${new Date(startTimestamp).toUTCString()}\n`;

			}else if(HTTPeventName === "response") {

				const response = transaction.response;

				const endTimestamp = transaction.end;

				message = `Response TCP_connetion_ID=${TCPconnectionID} HTTP_transaction_ID=${HTTPtransactionID} ${method} ${path} status_code=${response.statusCode} Duration=${endTimestamp-startTimestamp}ms end_UTC=${new Date(endTimestamp).toUTCString()}\n`;

			}

			(async () => {


				await serverFileSystem.appendFile(serverFilePath, message);

			})();


		}


	}


	#logTCPevent(address, port, TCPevent) {

		if(TCPevent === "connection" ||  TCPevent === "disconnection"){

			const filePath = process.env.CONNECTIONS_LOG;

			const connectionInformation = this.#connections.getTCPconnectionInformation(address, port);

			let message = "";

			if(TCPevent === "connection") {


				message = `Connection established from ${address}:${port} TCP_connection_ID=${connectionInformation.CID} start_UTC=${new Date(connectionInformation.startTimestamp).toUTCString()}\n`;


			}else if(TCPevent === "disconnection") {

				message = `Connection closed with ${address}:${port} TCP_connection_ID=${connectionInformation.CID} duration=${connectionInformation.endTimestamp - connectionInformation.startTimestamp}ms end_UTC=${new Date(connectionInformation.endTimestamp).toUTCString()}\n`;

			}

			(async () => {

				await serverFileSystem.appendFile(filePath, message);

			})();

		}

	}
		


}
