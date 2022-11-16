const fs = require("fs");
const AdmZip = require("adm-zip");
const path = require("path");
// const replace = require("replace-in-file");
const URL = require("url").URL;

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { Item } = require("./lib/Item");

const argv = yargs(hideBin(process.argv))
  .alias("u", "url")
  .nargs("u", 1)
  .describe("u", "Remote player URL for the PCI to connect")
  .alias("i", "item")
  .nargs("i", 1)
  .describe("i", "folder containering at least one item to read information from (optional)")
  .alias("o", "output")
  .nargs("o", 1)
  .describe("o", "Output directory (default: current directory)").argv;

let item = null;
let confFile = "../../views/js/pciCreator/ibTaoConnector/confDefault.json";
// let confFile = "./confDefault.json";

let conf = JSON.parse(fs.readFileSync(confFile));


if (!fs.existsSync(argv.i)) {
    console.error("Folder not readable: " + argv.i);
}
else{
    let items = fs.readdirSync(argv.i).filter(i => i.indexOf(".zip")>=0);
    if(items.length==0){
        console.error("Folder does not contain a valid zip file: " + argv.i);
    }
    else {
        try {
            item = new Item(new AdmZip(path.join(argv.i, items[0])));
        } catch (e) {
            console.error(e.message);
        }
    }
}


const stringIsAValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

if (!!argv.u && stringIsAValidUrl(argv.u)) {
    conf.url = argv.u;
//   try {
//     const results = replace.sync({
//       files: confFile,
//       from: /"url":\s?"(.*)"/g,
//       to: '"url": "' + argv.u + '"'
//     });
//     console.log("Replacement results (url):", results);
//   } catch (error) {
//     console.error("Error occurred:", error);
//   }
}

if (!!item) {

    try {
        let _item = item.getTaoConfig()
        conf.iwidth = _item.tasks[0].width;
        conf.iheight = _item.tasks[0].height;
    } catch (error) {
        console.error("Error occurred:", error);
    }
//   try {
//     let _item = item.getTaoConfig()
//     let iwidth = _item.tasks[0].width;
//     let iheight = _item.tasks[0].height;
//     const results_w = replace.sync({
//       files: confFile,
//       from: /"iwidth":\s?(\d+)/g,
//       to: '"iwidth": ' + iwidth 
//     });
//     console.log("Replacement results (iwidth):", results_w);
//     const results_h = replace.sync({
//       files: confFile,
//       from: /"iheight":\s?(\d+)/g,
//       to: '"iheight": ' + iheight 
//     });
//     console.log("Replacement results (iheight):", results_h);
//   } catch (error) {
//     console.error("Error occurred:", error);
//   }
}

fs.writeFileSync(confFile, JSON.stringify(conf));

let pciZip = new AdmZip();
pciZip.addLocalFolder(path.join(__dirname, "../../views/js/pciCreator/ibTaoConnector"));

let outpath = fs.existsSync(argv.o) ? argv.o : "./";
let zipfile = path.join(outpath, "ibTaoGenericIMS.zip");
console.log("creating "+zipfile)
pciZip.writeZip(zipfile);

process.exit();