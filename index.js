import * as server from "./scripts/HTTPserver.js";
import * as routes from "./routes/DefaultServerRoutes.js";

const host = process.env.HOST;
const port = process.env.PORT;

const service = new server.HTTPServer();

service.router.GET("/", routes.rootRequest);

service.router.GET("/NorthAmerica", routes.northAmerica);

service.router.GET("/SouthAmerica", routes.southAmerica);

service.router.GET("/Asia", routes.asia);

service.router.GET("/Africa", routes.africa);

service.router.GET("/Oceania", routes.oceania);

service.router.GET("/Europe", routes.europe);

service.router.GET("/Travels", routes.travelsRequest);

//service.router.GET("/Travels", "views/travels/Travels.html");

service.router.GET("/Prueba", "views/travels/Travels.html");

service.router.GET("/robots.txt", "files/robots.txt");

service.router.GET("/relleno/Pagina1", "views/page1.html");

service.router.GET("/relleno/Pagina2", "views/page2.html");

service.router.GET("/index", "views/index.html");


service.listen(port, host, () => {

	console.log("Listening");


});

const serverClosing = () => {

	process.exit(0);

}

process.on("SIGINT", serverClosing);

process.on("SIGTERM", serverClosing);
