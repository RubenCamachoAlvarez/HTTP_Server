import * as server from "./scripts/HTTPserver.js";
import * as serverActions from "./scripts/DefaultServerActions.js";

const host = process.env.HOST;
const port = process.env.PORT;


const service = new server.HTTPServer();

service.router.GET("/", "views/index.html");

service.router.GET("/resource1/", (req, res) => {

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
