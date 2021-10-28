#!/usr/bin/env node

const [,, ...args] = process.argv

import { Client, Environment } from 'square'

const client = new Client({
  environment: Environment.Production,
  accessToken: "EAAAEE6GGo4OzdE-VXS3CIul-M45HavT-npoUdq49_YiS74U7E7JNm3afAXPeWLs"  //process.env.SQUARE_ACCESS_TOKEN,
});

// TODO import via file
var input = ["LOC", "UPC", "QTY"];

var locations = {};

try {
  const response = await client.locationsApi.listLocations();

  for(var i=0; i < response.result.locations.length; i++){
  	locations[response.result.locations[i].name] = response.result.locations[i].id;
  }

} catch(error) {
  console.log(error);
}

console.log(locations);

for(var i=0; i < input.length; i++){
	try {
  	const itemVariation = await client.catalogApi.searchCatalogObjects({
  	  objectTypes: [
  	    'ITEM_VARIATION'
  	  ],
  	  query: {
  	    exactQuery: {
  	      attributeName: 'sku',
  	      attributeValue: input[i][1]
  	    }
  	  }
  	});

  	try {
  		const catalogChange = await client.inventoryApi.batchChangeInventory({
  		  idempotencyKey: (Math.random()*10000).toString(),
  		  changes:[{
			          type: 'PHYSICAL_COUNT',
			          physicalCount: {
			            catalogObjectId: JSON.parse(itemVariation.body).objects[0].id,
			            state: 'IN_STOCK',
			            locationId: locations[input[i][0]],
			            quantity: input[i][2],
			            occurredAt: '2021-10-28T04:01:56Z'
			          }
			        }]
  		});
			console.log("SUCCESS: " + JSON.parse(itemVariation.body).objects[0].id)
		} catch(error) {
  		console.log("ERROR: " + JSON.parse(itemVariation.body).objects[0].id);
		}

	} catch(error) {
  	console.log("ERROR UPC: " + input[i][1]);
	}
}
