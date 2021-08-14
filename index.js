const readline = require('readline');
const fs = require('fs');

const filePath = "/Users/mikelockett/Desktop/log-sample.txt";
const outputFilePath = "/Users/mikelockett/Desktop/log-sample-output.txt";
const unitStartRegex = /CODE_UNIT_STARTED/g;
const unitFinishRegex = /CODE_UNIT_FINISHED/g;

// to ignore all line before locating specific text, set start
const startProcessing = /Test.startTest/g;
let startFound = false;

const includedTextList = ["resultCcls"];


let indentLevel = 0;
let outputText = "";

const readInterface = readline.createInterface({
   input: fs.createReadStream(filePath),
   //output: process.stdout,
   console: false
});

async function processLineByLine() {
   const fileStream = fs.createReadStream(filePath);

   const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
   });
   // Note: we use the crlfDelay option to recognize all instances of CR LF
   // ('\r\n') in input.txt as a single line break.

   for await (const line of rl) {
      if (startFound) {
         // Each line in input.txt will be successively available here as `line`.
         //console.log(`Line from file: ${line}`);
         if (line.search(unitStartRegex) > -1) {
            outputText += `${addTabs(indentLevel)}> ${formatLine(line)}\n`;
            indentLevel++;
         } else if (line.search(unitFinishRegex) > -1) {
            indentLevel && indentLevel--;
            outputText += `${addTabs(indentLevel)}< ${formatLine(line)}\n`;
         } else if(includedTextList.length > 0){
            for(let i=0; i<includedTextList.length; i++){
               if(line.search(includedTextList[i])>-1){
                  outputText += `${addTabs(indentLevel+1)}** ${formatLine(line)}\n`;
               }
            }

         }
      }
      else if(line.search(startProcessing) > -1){
         startFound=true;
      }
   }
}

function formatLine(line) {
   let retVal;
   let sections = line.split('|');

   if(sections[2]==="DEBUG"){
      retVal = sections[3];
   }
   else if(sections[sections.length - 1].startsWith("__sfdc_trigger")){
      retVal = sections[sections.length - 2];
   }
   else {
      retVal = sections[sections.length - 1];
   }

   return retVal;
}

function addTabs(num) {
   let retVal = "";
   for (let i = 0; i < num; i++) {
      retVal += '\t';
   }
   return retVal;
}

async function main() {
   await processLineByLine();
   if(outputFilePath){
      fs.writeFileSync(outputFilePath, outputText)
   }
   else{
      console.log(outputText);
   }
}

main();
// let result = readText();
// console.log(result);
