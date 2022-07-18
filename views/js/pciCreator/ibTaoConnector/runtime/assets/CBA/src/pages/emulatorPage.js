/**
 * Java Script code emulating the old flash communicator API. 
 * 
 * Together with the emulatorPage.html this code emulates the old flash communicator API: 
 *  - It receives action requests from the execution environment (via the global flash_communicator constant)
 *    and forwards these requests via a task player sender component to the task player in the React runtime.
 *  - The controller established by the emulator page delegates requests coming from the React runtime to the 
 *    execution environment via the extCBA... methods expected in the parent global context.
 * 
 * Use the emulatorPage.html as src of an IFrame and provide parameters in the src URL that specify the task to be run (see details below).
 * Implement the extCBA... methods in the global context of the parent page.
 * Call the flash_communicator.stopTask() and flash_communicator.requestSnapshot() as you need to.
 * 
 * See the platformPage.html and platformPage.js files for a simplified example how to use the emulator. 
 * 
 * === NOTE: =============================================================================================================== 
 * The emulation of the flash communicator API differs from the original API in two areas:
 *  - Retrieval and preloading of snapshots works without introducing snapshot URLs:
 *     + The emulator puts the snapshot data directly into the second parameter of the extCBAEndTaskResponse and 
 *       in the extCBASnapshotResponse call. (The old flash communicator API gave a URL there.)
 *     + To flash_communicator.requestSnapshotUrl method is renamed to flash_communicator.requestSnapshot() to reflect this. 
 *     + The emulator expects the execution environment to provide a new API method extCBASnapshotForStart(preloadKey) 
 *       that it uses to fetch the snapshot data to preload a new task run. It obtains the preload key from the parameters 
 *       of the URL given as src for its IFrame.
 *  - The emulator expects these URL parameters in the src attribute for the emulator's IFrame:
 *     + itemName: The name of the item that contains the task to be run.
 *     + taskName: The name of the task to be run.
 *     + preloadKey: (optional) The key to retrieve the snapshot data that should be preloaded for the task run. 
 * 
 *     Here is an example for the src URL:
 *      ./src/pages/emulatorPage.html?itemName=ItemA&taskName=TaskA&preloadKey=SnapshotA
 * 
 *     If you need to change the parameter names adapt the initialization parameters of the controller at the end of this file 
 *     accordingly. 
 * 
 * For details on how to install items for use by the emulator see the header comment in configurationRetriever.js.
 * 
 * The emulator's page establishes a controller to drive the task player in the React runtime.
 * This controller is connected to:
 *  - The HTTP server (via a configuration retrieval component) for downloading item configuration data.
 *  - The task player (via a task player sender and a task player receiver component) to send commands to the task player 
 *    and process requests and returns from the task player. 
 * 
 */

// -------------- global functions (emulate flash_communicator API) -----------------------------------------

flash_communicator = {
  stopTask: function () { controller.cancelTask(); },
  requestSnapshot: function () { controller.requestSnapshot(); }
}


// -------------- private function definitions --------------------------------------------------------------


const EmulatorPage = {

  getParametersFromUrlSearchPart(search) {
    var query = search.substr(1);
    var result = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
    }

}

// --------------- commands executed immediately ------------------------------------------------------

const taskPlayerSender = TaskPlayerSender.new(document.getElementsByTagName("iframe")[0].contentWindow);
const parameters = EmulatorPage.getParametersFromUrlSearchPart(window.location.search);
const controller = Controller.new(taskPlayerSender, ConfigurationRetriever.new(), parameters.itemName, parameters.taskName, parameters.preloadKey);
const taskPlayerReceiver = TaskPlayerReceiver.new(controller);
taskPlayerReceiver.startReceiving();
