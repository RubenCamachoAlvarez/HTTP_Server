import * as server from "./scripts/HTTPserver.js";
import * as serverActions from "./scripts/DefaultServerActions.js";
import * as uaParser from "ua-parser-js";

const host = process.env.HOST;
const port = process.env.PORT;

const service = new server.HTTPServer();

service.router.GET("/", async (req, res) => {

	try {

		const {remoteAddress} = req.socket;

		const IPinformation = await serverActions.getIPaddressInformation(remoteAddress);
	
		let newResourcePath = "";

		console.log("IP information:", IPinformation);

		switch(IPinformation.continent) {

			case "North America":

				newResourcePath = "/NorthAmerica";	

				break;

			case "South America":


				newResourcePath = "/SouthAmerica";

				break;

			case "Asia":

				newResourcePath = "/Asia";


				break;

			case "Africa":

				newResourcePath = "/Africa";


				break;

			default: //Oceania

				newResourcePath = "/Oceania";

				break;

		}


		console.log("New location: ", newResourcePath);

		res.writeHead(307, {"Location": newResourcePath});

		res.end();

	}catch(error) {

		console.log(error.message);

		res.writeHead(500, {"Content-Type": "text/plain", "Connection" : "close"});

		res.end("Bad request");

	}


});

service.router.GET("/index", "views/index.html");

service.router.GET("/NorthAmerica", "views/continents/NorthAmerica.html");

service.router.GET("/SouthAmerica", "views/continents/SouthAmerica.html");

service.router.GET("/Asia", "views/continents/Asia.html");

service.router.GET("/Travels", (req, res) => {

	const clientUserAgent = new uaParser.UAParser(req.headers["user-agent"]);

	if(["mobile", "tablet"].includes(clientUserAgent.getDevice().type)) {

		//If the client device is a mobile or tablet


		console.log("Client device is a hand device");

		(async () => {
		
			serverActions.GETstaticResource("views/travels/Travels.html", res);

		})();

	}else{

		//If the client device is a desktop (in most cases).
		
		console.log("Client device is a desktop");

		(async () => {

			serverActions.sendStaticResourceToServer("files/DesktopMessage.txt", res, "ComunicadoAdministracion.txt");

		})();
	

	}

});

service.router.GET("/resource1", (req, res) => {

	const {remoteAddress} = req.socket;

	console.log("Recibi la peticion");

	(async () => {


		try {


			console.log(`Trying to get information about ${remoteAddress}`);

			const IPaddressInformation = await serverActions.getIPaddressInformation(remoteAddress);

			res.writeHead(200, {"Content-Type" : "application/json", "Connection" : "close"});

			res.end(JSON.stringify(IPaddressInformation));

		}catch(error) {

			console.log(`Error message: ${error.message}`);

		}


	})();

});

service.listen(port, host, () => {

	console.log("Listening");


});
