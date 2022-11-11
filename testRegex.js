// const jwt = require("jsonwebtoken");
// console.log(jwt.sign({ id: 1 }, "testingKey"));

// const path = require("path");

// console.log(
// 	path.extname("index.js"),
// 	new Date().toLocaleDateString().replace("/", "_")
// );
// console.log(new Date());

// const fs = require("fs");

// let file;
// const files = fs.readdirSync("./uploads/audio");
// let id = "blob1663660146583";

// console.log(files);

// (err, files) => {
// 	if (err) return err;
// 	console.log(files);
// 		if (item === "blob1663660146583") {
// 			file = item;
// 		}
// 	for (let item of files) {
// 	}
// 	console.log(file);
// });

// const complaintStatusAsPercentage = (totalNumber, data) => {
//   if (data.constructor !== Array) return; //check whether data is of typeof array
//   if (typeof totalNumber !== "number") return ;

//   const ifDataConsistsOfItemNotNumber = data.some(
//     (dataItem) => typeof dataItem !== "number"
//   ); //check if any array item is not a number.
//   if (ifDataConsistsOfItemNotNumber) return;

//   const oneHunPercent = 100;

//   return data.map((dataItem) => (dataItem / totalNumber) * oneHunPercent); // return [ ]
// };

// console.log(complaintStatusAsPercentage(60, [40, 30, 23]));

