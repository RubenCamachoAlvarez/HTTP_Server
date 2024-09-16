import * as serverActions from "../scripts/DefaultServerActions.js";
import * as uaParser from "ua-parser-js";

export const rootRequest = (transaction) => {

	const {request, response, IPinformation} = transaction;;

	const defaultResource = serverActions.getClientDefaultResource(IPinformation);

	response.writeHead(307, {"Location" : defaultResource});

	response.end();

};

export const travelsRequest = (transaction) => {

	const {request, response, IPinformation} = transaction;

	const clientUserAgent = new uaParser.UAParser(request.headers["user-agent"]);

	if(["mobile", "table"].includes(clientUserAgent.getDevice().type)) {

		(async () => {

			
			serverActions.GETstaticResource("views/travels/Travels.html");

		})();

	}else{

		(async () => {

			serverActions.sendStaticResourceToClient("files/DesktopMessage.txt", response, "ComunicadoAdministracion.txt");

		})();

	}

};

function showAppropiateContent(continentName, continentPathResource, transaction) {

	const {request, response, IPinformation} = transaction;

	if(IPinformation.continent === continentName) {

		(async () => {

			serverActions.GETstaticResource(continentPathResource, response);


		})();

	}else{

		response.writeHead(403, {"Content-Type" : "text/plain", "Connection" : "close"});

		response.end("NO PUEDES ACCEDER DESDE TU UBICACION");


	}


}

export const northAmerica = (transaction) => {

	showAppropiateContent("North America", "views/continents/NorthAmerica.html", transaction);

}

export const southAmerica = (transaction) => {


	showAppropiateContent("South America", "views/continents/SouthAmerica.html", transaction);

}

export const europe = (transaction) => {

	showAppropiateContent("Europe", "views/continents/Europe.html", transaction);

}

export const africa = (transaction) => {

	showApproapiateContent("Africa", "views/continents/Africa.html", transaction);

}

export const asia = (transaction) => {
	
	showAppropiateContent("Asia", "views/continents/Asia.html", transaction);

} 

export const oceania = (transaction) => {

	showAppropiateContent("Oceania", "views/continents/Oceania.html", transaction);

}
