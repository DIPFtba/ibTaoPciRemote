/**
 * Receive messages via window.postMessage from the task player in the React runtime. 
 * 
 * The component encapsulates the details of the task player communication and 
 *  - delegates requests to the given controller instance or
 *  - logs request that are not handled by the controller to the console.
 */

const TaskPlayerReceiver = {

  /**
   * Create a TaskPlayerReceiver instance.
   * 
   * @paream controller The controller we use to delegate requests to.
   */
  new: function (controller) {
    return {
      controller,
      acceptedUrlsList: [],


      /**
       * Start to receive window.postMessage events.
       */
      startReceiving: function () {
        this.acceptedUrlsList.push(window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''));
        const controllerInstance = this.controller;
        const acceptedUrlsListInstance = this.acceptedUrlsList
        const receiveEventMethod = (event) => this.receiveEvent(event, controllerInstance, acceptedUrlsListInstance);
        window.addEventListener('message', (event) => { receiveEventMethod(event); }, false);
      },


      /**
       * Process an icoming window.postMessage event.
       */
      receiveEvent: function (event, controller, acceptedUrlsList) {

        console.info(`taskPlayerReceiver receives event`, event);

        // check event origin
        if (!acceptedUrlsList.includes(event.origin)) {
          console.log('Ignored event from origin ' + event.origin);
          return;
        }

        if (event.data === '') {
          console.log('Ignored event with empty data');
          return;
        }

        const data = this.parseAsJson(event.data);
        if (data === undefined) {
          console.log('Ignored event with invalid data: ' + event.data);
          return;
        }

        if (data.eventType === undefined) {
          console.log('Ignored event without event type');
          return;
        }

        switch (data.eventType) {
          case 'getUserIdReturn':
            console.log(`Current registered user is ${data.id}`);
            break;
          case 'taskPlayerReady':
            controller.taskPlayerIsReady();
            break;
          case 'loginDialogClosed':
            console.error('Unexpected callback for login-dialog-closed ignored.');
            break;
          case 'taskSwitchRequest':
            switch (data.request) {
              case 'nextTask':
                controller.switchToNextTask();
                break;
              case 'previousTask':
                controller.switchToPreviousTask();
                break;
              case 'goToTask':
                controller.switchToExplicitTask(data.scope, data.item, data.task);
                break;
              case 'cancelTask':
                controller.switchToCancelTask();
                break;
              default:
                console.info(`Denied task switch request: ${data.request}`, data);
            }
            break;
          case 'getTaskReturn':
            console.log(`Currently running task is ${data.scope}/${data.item}/${data.task}`);
            break;
          case 'getTasksStateReturn':
            controller.processTasksStateReturn(data.userId, data.state);
            break;
          case 'getScoringResultReturn':
            controller.processScoringResultReturn(data.result);
            break;
          case 'traceLogTransmission':
            controller.transmitTraceLogData(data);
            break;
          // ignore events that we send ourselves
          case 'addItem':
          case 'clearItems':
          case 'insertMessageInTrace':
          case 'logStateToTrace':
          case 'flushTrace':
          case 'setTraceLogTransmissionChannel':
          case 'setTraceContextId':
          case 'setUserId':
          case 'logout':
          case 'getUserId':
          case 'showLogin':
          case 'startTask':
          case 'stopTask':
          case 'getTask':
          case 'setTaskSequencer':
          case 'setSwitchAvailability':
          case 'getTasksState':
          case 'clearTasksState':
          case 'preloadTasksState':
          case 'sendStatemachineEvent':
          case 'setHeaderButtons':
          case 'setMenuCarousels':
          case 'activateDebuggingWindows':
            break;
          default:
            console.info(`Ignored event with unknown event type: ${data.eventType}`);
            break;
        }

      },


      /**
       * Parse a JSON string to an object.
       * 
       * @param {*} valueString The JSON string representing the object.
       */
      parseAsJson: function (valueString) {
        try {
          return JSON.parse(valueString);
        } catch (err) {
          console.log('Invalid JSON object: ' + valueString, err);
          return undefined;
        }
      },

    }
  }
}