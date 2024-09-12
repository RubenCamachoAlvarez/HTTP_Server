
function generateTCPconnectionID() {

	return Math.floor((Math.random() + Date.now()) * Date.now()).toString(16);

}

function generateHTTPtransactionID() {

	return Math.ceil(Math.random * Date.now()).toString(16);

}


export class ClientConnections {

	#clients = {};

	#transactions = {};

	constructor() {}

	newClient(address, port) {

		let CID = null;

		if(this.#clients[address] === undefined ){

			this.#clients[address] = {};
		
		}

		if(this.#clients[address][port] === undefined) {

			CID = generateTCPconnectionID();

			this.#clients[address][port] = {

				"CID" : CID,

				"timestamp" : Date.now()

			};
	
		}

		return CID;

	}


	isClientConnect(address, port) {

		if(this.#clients[address] !== undefined && this.#clients[address][port] !== undefined) {

			return true;
	
		}

		return false;

	}

	removeClient(address, port) {

		if(this.#clients[address][port] !== undefined) {

			delete this.#clients[address][port];

			if(this.#clients[address].length === 0) {

				delete this.#clients[address];

			}

		}
			

	}


	newHTTPtransaction(request, response) {

		const transactionID = generateHTTPtransactionID();

		this.#transactions[transactionID] = {

			"request" : request,

			"response" : response, 

			"start" : null,

			"end" : null

		};

		return transactionID;

	}

	removeHTTPtransaction(transactionID) {

		if(this.#transactions[transactionID] !== undefined) {

			delete this.#transactions[transactionID];

		}

	}

	getTransaction(transactionID) {

		return this.#transactions[transactionID];

	}

}
