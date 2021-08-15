const readline = require('readline');
const fs = require('fs');
const {config} = require('./config.js');

const unitStartRegex = /CODE_UNIT_STARTED/g;
const unitFinishRegex = /CODE_UNIT_FINISHED/g;
const methodEntryRegex = /METHOD_ENTRY/g;
const methodExitRegex = /METHOD_EXIT/g;

let startFound = false;
let indentLevel = 0;
let outputText = "";

async function processLineByLine() {
   const fileStream = fs.createReadStream(config.logFilePath);

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
            outputText += `${addTabs(indentLevel)}>> ${formatLine(line)}\n`;
            indentLevel++;
         } else if (line.search(unitFinishRegex) > -1) {
            indentLevel && indentLevel--;
            outputText += `${addTabs(indentLevel)}<< ${formatLine(line)}\n`;
         } else if (config.showMethods && line.search(methodEntryRegex) > -1) {
            outputText += `${addTabs(indentLevel)}> ${formatLine(line)}\n`;
            indentLevel++;
         } else if (config.showMethods && line.search(methodExitRegex) > -1) {
            indentLevel && indentLevel--;
            outputText += `${addTabs(indentLevel)}< ${formatLine(line)}\n`;
         } else if (config.includedTextList.length > 0) {
            for (let i = 0; i < config.includedTextList.length; i++) {
               if (line.search(config.includedTextList[i]) > -1) {
                  outputText += `${addTabs(indentLevel + 1)}${config.prefixForIncluded} ${formatLine(line)}\n`;
               }
            }

         }
      } else if (line.search(config.startProcessing) > -1) {
         startFound = true;
      }
   }
}

function formatLine(line) {
   let retVal;
   let sections = line.split('|');

   if (sections[2] === "DEBUG") {
      retVal = sections[3];
   } else if (sections[sections.length - 1].startsWith("__sfdc_trigger")) {
      retVal = sections[sections.length - 2];
   } else {
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
   if (!config.startProcessing) {
      startFound = true;
   }
   await processLineByLine();
   if (config.outputFilePath) {
      fs.writeFileSync(config.outputFilePath, outputText)
   } else {
      console.log(outputText);
   }
}

main();
// let result = readText();
// console.log(result);
