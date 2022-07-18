/**
 * Component that controls the operations of the task player in the React runtime library.
 * 
 * The main sequence of actions is:
 *  - configure trace settings in the task player
 *  - initialize the delegation of the task switch and cancel task requests to the execution environment platform
 *  - initialize task runner context in the task player 
 *  - load the item configuration for the specified item from the server (ConfigurationRetriever)
 *  - send the item configuration to the task player
 *  - start the specified task in the task player
 *  - process requests coming in from the task player: switch to another task, cancel task etc. (TaskPlayerReceiver)
 *  - at a stop task request coming in from the execution environment stop the task running in the task player. 
 */
const Controller = {
  /**
   * Create a controller instance.
   * 
   * @param {*} taskPlayerSender The sender that we will use to send messages to the task player.
   * @param {*} configurationRetriever Retrieves configuration data (course, test, item etc.) from the server.
   * @param {String} itemName The name of the item containing the task to start.
   * @param {String} taskName The name of the task to start.
   * @param {String} preloadKey The key for the preload data to be obtained via extCBASnapshotForStart call.
   */
  new: function (taskPlayerSender, configurationRetriever, itemName, taskName, preloadKey) {
    return {

      isCancelling: false,
      taskStopResult: {},

      // ------------- API for emulator page -----------------------------------------------------------------

      cancelTask: function () {
        this.isCancelling = true;
        this.taskStopResult = {};
        taskPlayerSender.sendGetScoringResult();
        taskPlayerSender.sendMessagesToStopTask();
        taskPlayerSender.sendGetTasksState();
        taskPlayerSender.sendLogout();
      },

      requestSnapshot: function () {
        taskPlayerSender.sendGetTasksState();
      },

      // ------------- API for task player receiver ---------------------------------------------------------------
      taskPlayerIsReady: function () {
        this.setTraceConfiguration();
        this.runTaskInItem(itemName, taskName, preloadKey === undefined ? undefined : parent.controller.getItem().extCBASnapshotForStart(preloadKey));
      },

      switchToNextTask: function () {
        console.log(parent);
          // parent.controller.getItem().extEE4CBACommand('Next');
          window.parent.postMessage(        {
              type: "vo.ToPlayer.EE4CBACommand",
              params: ["next"]
            }, 
            "*" 
          );
      },
      
      switchToPreviousTask: function () {
        console.log(parent);
        // parent.controller.getItem().extEE4CBACommand('Back');
        window.parent.postMessage(        {
          type: "vo.ToPlayer.EE4CBACommand",
          params: ["back"]
        }, 
        "*" 
      );

      },
      
      switchToCancelTask: function () {
        console.log(parent);
        // parent.controller.getItem().extEE4CBACommand('Cancel');
        window.parent.postMessage(        {
          type: "vo.ToPlayer.EE4CBACommand",
          params: ["cancel"]
        }, 
        "*" 
      );
        
      },

      switchToExplicitTask: function (scope, item, task) {
        alert(`Switch to explicit task not supported by execution environment.`);
      },

      processTasksStateReturn: function (userId, tasksData) {
        if (this.isCancelling) {
          if (this.taskStopResult.scoring !== undefined) {
            this.isCancelling = false;
            // parent.controller.getItem().extCBAEndTaskResponse(this.taskStopResult.scoring, tasksData);
            window.parent.postMessage({
              type: "vo.ToPlayer.CBAEndTaskResponse",
              params: [this.taskStopResult.scoring, tasksData]
            }, 
            "*" 
          );
    
            this.taskStopResult = {};
          } else {
            this.taskStopResult.tasksData = tasksData;
          }
        } else {
          // parent.controller.getItem().extCBASnapshotResponse(tasksData);
          window.parent.postMessage(        {
            type: "vo.ToPlayer.CBASnapshotResponse",
            params: [tasksData]
          }, 
          "*" 
        );
      }
      },

      processScoringResultReturn: function (scoringResult) {
        if (this.isCancelling) {
          if (this.taskStopResult.tasksData !== undefined) {
            this.isCancelling = false;
            // parent.controller.getItem().extCBAEndTaskResponse(scoringResult, this.taskStopResult.tasksData);
            window.parent.postMessage({
              type: "vo.ToPlayer.CBAEndTaskResponse",
              params: [this.taskStopResult.scoring, tasksData]
            }, 
            "*" 
          );
            this.taskStopResult = {};
          } else {
            this.taskStopResult.scoring = scoringResult;
          }
        } else {
          console.error(`Unexpected transmision of scoring result received by controller`, scoringResult);
        }
      },

      transmitTraceLogData: function (traceData) {
        console.log(parent);
        // parent.controller.getItem().extCBAEvent(traceData);
        window.parent.postMessage({
          type: "vo.ToPlayer.CBAEvent",
          params: [traceData]
        }, 
        "*" 
      );
  },

      // --------------- private stuff ---------------------------------------

      /**
       * Initialize the trace feedback coming in from the task player.
       */
      setTraceConfiguration: function () {
        taskPlayerSender.sendSetPostMessageTraceLogTransmissionChannel(5000);
        taskPlayerSender.sendSetTraceContextId('noSessionYet');
      },

      /**
       * Obtain the item configuration and run the given task preloaded with the given data.
       *
       * @param {String} itemName
       * @param {String} taskName
       */
      runTaskInItem: function (itemName, taskName, preloadData) {
        const username = 'unspecifiedUser';

        // 'log in' given user
        taskPlayerSender.sendSetUserId(username);

        taskPlayerSender.sendGetUserId();

        // Dump our version information to the trace log
        taskPlayerSender.sendLogControllerVersion('Flash Adapter Controller - 0.1');

        // Establish ourselves as task sequencer
        taskPlayerSender.sendSetTaskSequencer();

        // Clear all other item configurations.
        taskPlayerSender.sendClearItems();

        if (preloadData !== undefined) {
          taskPlayerSender.sendPreloadTasksState(preloadData);
        }

        // download the required item and start required task.
        const loadItemConfigurationMethod = this.loadItemConfiguration;
        const runTaskInItemConfigurationMethod = this.runTaskInItemConfiguration;
        Promise.resolve()
          .then(() => loadItemConfigurationMethod(itemName))
          .then((loadedItem) => runTaskInItemConfigurationMethod(loadedItem, taskName))
          .catch((errorParam) => {
            console.info(`Item configuration download failed for item ${itemName}:`, errorParam);
          });
      },


      /**
       * Return a Promise that downloads the configuration for the named item.
       */
      loadItemConfiguration: function (itemName) {
        return configurationRetriever.downloadItem(itemName)
        .then((itemConfiguration) => {
          if (itemConfiguration === null) {
            throw new Error(`Item definition not available for item ${item}`);
          }
          return itemConfiguration;
        })
      },

      /**
       * Run the given task defined in the given item configuration structure.
       * 
       * The method 
       *  - sends the item configuration to the task player
       *  - tells the task player to start the specified task 
       * 
       * @param {*} itemConfiguration The configuration structure of the item that contains the task to run.
       * @param {String} taskName The name of the task to run.
       */
      runTaskInItemConfiguration: function (itemConfiguration, taskName) {

        // Note: If you need to change the ./content/items/ structure don't forget to also check the configurationRetriever.js 
        //       which downloads the item's configuration file.
        const itemRoot = `../../content/items/${itemConfiguration.name}`;
        taskPlayerSender.sendAddItem(
          itemConfiguration,
          `${itemRoot}/resources`,
          `${itemRoot}/external-resources`)

        taskPlayerSender.sendSetTraceContextId('unspecifiedSession');

        taskPlayerSender.sendSetHeaderButtons([]);

        taskPlayerSender.sendSetMenuCarousels([], []);

        taskPlayerSender.sendActivateDebuggingWindows(
          true,
          true,
          true);

        taskPlayerSender.sendSwitchAvailabilityNextTask(true);
        taskPlayerSender.sendSwitchAvailabilityPreviousTask(true);

        taskPlayerSender.sendMessagesToStartTask('unspecifiedTest', itemConfiguration.name, taskName);
      },

    }
  }
}
