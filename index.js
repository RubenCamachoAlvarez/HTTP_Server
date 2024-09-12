import * as server from "./scripts/HTTPserver.js";

const host = process.env.HOST;
const port = process.env.PORT;


const service = new server.HTTPServer();

service.router.GET("/", "views/index.html");

service.listen(port, host, () => {

	console.log("Listening");

});
