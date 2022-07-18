/**
 * Component to retrieve item configuration files from the execution environment. 
 * 
 * In our case the component is used to get the item configuration files.
 * 
 * For an item named 'ItemA' it expects the item's configuration file at this URL path:
 *  <content root of the application>/content/items/ItemA/ItemA.json
 * 
 * The CBA-React-Runtime component will download resources like images, audio files, video files 
 * for an item named 'ItemA' from URL pathes like this:
 *  <content root of the application>/content/items/ItemA/resources/someVideo.mp3
 *  <content root of the application>/content/items/ItemA/external-resources/someExternalJavaCode.html
 * 
 * To cover both requirements you should 'install' each item you plan to use like this:
 *  - Create a directory bearing the name of the item in the directory <content root of the application>/content/items/. 
 *  - Extract the *.json file and the two directories 'resources' and 'external-resources' from 
 *    the item ZIP file into this item specific directory. 
 * 
 * If you need to change the ./content/items/ structure adapt the variable 'itemsUrlPath' here (for the item configuration file)
 * and/or adapt the code in the controller.js (for the resources download, search for content/item in controller.js).
 * 
 */
const ConfigurationRetriever = {
  
  /**
   * Create a ConfigurationRetriever instance.
   */
  new: function () {
    
    return {

      itemsUrlPath: `../../content/items/`,

      // ---------------- public API -----------------------------------------

      /**
       * Return a promise that downloads the item configuration for the given item.
       *
       * @param {String} itemname The name of the item.
       *  The corresponding *.json file must sit in a directory named as the item and have the item's name with .json appended as extension.
       */
      downloadItem: function (itemname) {
        return this.downloadConfiguration(this.itemsUrlPath, `${itemname}/${itemname}.json`, 'item');
      },

      // -------------- private stuff ----------------------------------------

      /**
       * Return a promise that downloads the configuration for the given type and name.
       *
       * @param {String} urlPath The URL path for the type of configuration file.
       * @param {String} name The name of the configuration file. The corresponding *.json file must have this name with .json appended as extension.
       * @param {String} typeName The name of the type of the configuration file (used for error messages only).
       *  
       */
      downloadConfiguration: function (urlPath, name, typeName) {
        return this.sendJsonDownloadRequest(`${urlPath}${name}`).then(
          (response) => {
            console.log(`Received configuration of ${typeName} ${name}`, response);
            return response;
          },
          (errorParam) => {
            console.info(`Download failed for configuration of ${typeName}  ${name}`, errorParam);
          },
        );
      },


      /**
       * Return a Promise that processes a GET request for the given file.
       *
       * @param {String} filename The name of the file to get.
       */
      sendJsonDownloadRequest: function (filename) {
        return new Promise((resolve, reject) => {
          const xhttp = new XMLHttpRequest();
          xhttp.responseType = 'json';
          xhttp.onload = () => resolve(xhttp.response);
          xhttp.onerror = () => reject(xhttp.statusText);
          xhttp.open('GET', filename, true);
          xhttp.send();
        });
      },


    }
  }
}
