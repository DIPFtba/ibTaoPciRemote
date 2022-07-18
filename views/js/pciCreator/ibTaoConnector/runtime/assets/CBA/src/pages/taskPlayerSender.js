/**
 * Send messages via window.postMessage to the task player in the React runtime. 
 * 
 * The component provides convenience methods that encapsulate 
 * the keywords and specific message structures used in the task player communication. 
 */
const TaskPlayerSender = {

  /**
   * Create a TaskPlayerSender instance.
   * 
   * @param {*} runtimeWindow The window that contains the react runtime.
   */
  new: function (runtimeWindow) {
    return {

      /**
        * The window that contains the React runtime.
        */
      reactRuntimeWindow: runtimeWindow,


      // ---------------------- public API -----------------------------------------------------

      // ===  configuration control =========================================

      sendAddItem: function (itemConfig, resourcePath, externalResourcePath) {
        this.sendMessageToTaskPlayer({
          eventType: 'addItem',
          itemConfig,
          resourcePath,
          externalResourcePath
        });
      },

      sendClearItems: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'clearItems',
        });
      },


      // ===  trace control =================================================

      sendInsertMessageInTrace: function (message) {
        this.sendMessageToTaskPlayer({
          eventType: 'insertMessageInTrace',
          message,
        });
      },

      sendFlushTrace: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'flushTrace'
        });
      },

      sendLogStateToTrace: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'logStateToTrace'
        });
      },

      sendSetTraceLogTransmissionChannel: function (
        channel,
        targetWindowType,
        targetOrigin,
        transmitUrl,
        interval
      ) {
        this.sendMessageToTaskPlayer({
          eventType: 'setTraceLogTransmissionChannel',
          channel,
          targetWindowType,
          targetOrigin,
          transmitUrl,
          interval
        });
      },

      sendSetHttpTraceLogTransmissionChannel(transmitUrl, interval) {
        this.sendSetTraceLogTransmissionChannel('http', undefined, undefined, transmitUrl, interval);
      },

      sendSetConsoleTraceLogTransmissionChannel(interval) {
        this.sendSetTraceLogTransmissionChannel('console', undefined, undefined, undefined, interval);
      },

      sendSetPostMessageTraceLogTransmissionChannel(interval) {
        this.sendSetTraceLogTransmissionChannel('postMessage', 'parent', '*', undefined, interval);
      },

      sendSetTraceContextId: function (contextId) {
        this.sendMessageToTaskPlayer({
          eventType: 'setTraceContextId',
          contextId,
        });
      },

      sendLogControllerVersion: function (controllerVersion) {
        this.sendMessageToTaskPlayer({
          eventType: 'insertMessageInTrace',
          message: `Controller version: ${controllerVersion}`,
        });
      },


      // ===  user control ==================================================

      sendSetUserId: function (username) {
        this.sendMessageToTaskPlayer({
          eventType: 'setUserId',
          id: username,
        });
      },

      sendLogout: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'logout',
        });
      },

      sendGetUserId: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'getUserId',
        });
      },

      sendShowLoginDialog: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'showLogin',
          titleLabel: 'Login',
          fieldLabel: 'Username: ',
          buttonLabel: 'Ok',
        });
      },

      // ===  task control ==================================================

      sendSetTaskSequencer: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'setTaskSequencer',
          targetWindowType: 'parent',
          targetOrigin: '*',
        });
      },

      sendStartTask: function (scope, item, task) {
        this.sendMessageToTaskPlayer({
          eventType: 'startTask',
          scope,
          item,
          task
        });
      },

      sendStopTask: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'stopTask'
        });
      },

      sendSwitchAvailabilityNextTask: function (value) {
        this.sendSwitchAvailability('nextTask', value);
      },

      sendSwitchAvailabilityPreviousTask: function (value) {
        this.sendSwitchAvailability('previousTask', value);
      },

      sendSwitchAvailabilityExplicitTask: function (scope, item, task) {
        this.sendMessageToTaskPlayer({
          eventType: 'setSwitchAvailability',
          request: 'goToTask',
          value: true,
          scope,
          item,
          task
        });
      },

      sendSwitchAvailabilityCancelTask: function (value) {
        this.sendSwitchAvailability('cancelTask', value);
      },

      sendMessagesToStopTask: function () {
        this.sendStopTask();
        this.sendSwitchAvailabilityCancelTask(false);
      },

      sendMessagesToStartTask: function (scope, item, task) {
        this.sendStartTask(scope, item, task);
        this.sendSwitchAvailabilityCancelTask(true);
      },


      // ===  task state control ============================================

      sendGetTasksState: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'getTasksState'
        });
      },

      sendClearTasksState: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'clearTasksState'
        });
      },

      sendPreloadTasksState: function (state) {
        this.sendMessageToTaskPlayer({
          eventType: 'preloadTasksState',
          state
        });
      },

      // ===  scoring control ============================================

      sendGetScoringResult: function () {
        this.sendMessageToTaskPlayer({
          eventType: 'getScoringResult'
        });
      },

      // ===  state machine control =========================================

      sendSendStatemachineEvent: function (event) {
        this.sendMessageToTaskPlayer({
          eventType: 'sendStatemachineEvent',
          event
        });
      },

      // ===  header control ================================================

      sendSetHeaderButtons: function (headerButtons) {
        this.sendMessageToTaskPlayer({
          eventType: 'setHeaderButtons',
          headerButtons
        });
      },

      sendSetMenuCarousels: function (course, scopes) {
        this.sendMessageToTaskPlayer({
          eventType: 'setMenuCarousels',
          course,
          scopes
        });
      },

      // ===  developer mode control ========================================

      sendActivateDebuggingWindows: function (score, trace, statemachine) {
        this.sendMessageToTaskPlayer({
          eventType: 'activateDebuggingWindows',
          score,
          trace,
          statemachine
        });
      },




      // ---------------------- private stuff -----------------------------------------------------




      sendSwitchAvailability: function (switchType, value) {
        this.sendMessageToTaskPlayer({
          eventType: 'setSwitchAvailability',
          request: switchType,
          value
        });
      },

      /**
       * Send a message to the task player in the React runtime. 
       * 
       * @param {*} message The action message to forward to the React runtime given as an object structure.
       */
      sendMessageToTaskPlayer: function (message) {

        // TODO: use proper URI for domain of message target 
        const postMessageString = this.stringify(message);
        if (postMessageString !== undefined) {
          this.reactRuntimeWindow.postMessage(postMessageString, '*')
        }
      },

      /**
       * Build the JSON string representation of the given object.
       * 
       * @param {*} jsonObject The object to be represented as JSON string.
       */
      stringify: function (jsonObject) {
        try {
          return JSON.stringify(jsonObject);
        } catch (err) {
          console.log('Cannot stringify JSON object: ' + jsonObject, err);
          return undefined;
        }

      },

    }
  }
}

