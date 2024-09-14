

export class ServerRouter {

	#paths = {};

	constructor() {}

	GET(path, resource) {

		this.#addResource(path, resource, "GET");	

	}


	POST(path, resource) {

		this.#addResource(path, resource, "POST");

	}

	#addResource(path, resource, methodName) {

		if((typeof path === "string" || path instanceof String) &&(methodName === "GET" || method === "POST") && ((typeof resource === "string" || resource instanceof String) || (typeof resource === "function" && resource.length === 2))) {

		if(this.#paths[path] === undefined) {

			this.#paths[path] = {};

		}

		const methods = this.#paths[path];

		methods[methodName] = resource;

	}

}


	getResource(path, methodName) {

		let resource = undefined

		if(typeof path === "string" && (methodName === "GET" || methodName === "POST") && this.#paths[path] !== undefined) {

			const methods = this.#paths[path];

			resource = methods[methodName];

		}


		return resource;

	}


}
