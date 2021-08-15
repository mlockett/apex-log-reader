const config = {
   // log to read from
   logFilePath: "/Users/mikelockett/Desktop/log-sample.txt",

   // path to write to
   outputFilePath: "/Users/mikelockett/Desktop/log-sample-output.txt",

   // show method calls
   showMethods: true,

   // to ignore all line before locating specific text, set start
   startProcessing: /Test.startTest/g,

   // always include lines that contain text in any of the entries below
   // use strings or regexes
   includedTextList: ["resultCcls"],

   // prefix to make it easy to find
   prefixForIncluded: "^^^"
};

module.exports.config = config;