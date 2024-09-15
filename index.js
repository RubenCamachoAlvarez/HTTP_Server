import * as server from "./scripts/HTTPserver.js";
import * as serverActions from "./scripts/DefaultServerActions.js";
import * as uaParser from "ua-parser-js";

const host = process.env.HOST;
const port = process.env.PORT;


const service = new server.HTTPServer();

service.router.GET("/", "views/index.html");

service.router.GET("/NorthAmerica", "views/continents/NorthAmerica.html");

service.router.GET("/Descubre_mas", (req, res) => {

	const clientUserAgent = new uaParser.UAParser(req.headers["user-agent"]);

	if(["mobile", "tablet"].includes(clientUserAgent.getDevice().type)) {

		//If the client device is a mobile or tablet


		console.log("Client device is a hand device");

	}else{

		//If the client device is a desktop (in most cases).
		
		console.log("Client device is a desktop");

		(async () => {

			serverActions.sendStaticResourceToServer("files/Comunicado.txt", res, "ComunicadoAdministracion.txt");

			console.log("Se termino de ejecutar mi estimado");

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
