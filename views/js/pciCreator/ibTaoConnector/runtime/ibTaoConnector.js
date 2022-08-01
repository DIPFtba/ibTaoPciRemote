/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */
define(['qtiCustomInteractionContext',
        'ibTaoConnector/runtime/js/jquery_2_1_1_amd',
        'ibTaoConnector/runtime/js/renderer',
        'ibTaoConnector/runtime/js/lzstring',
        'OAT/util/event'
    ],
    function(qtiCustomInteractionContext, $, renderer, LZString, event){
    'use strict';

    var ibTaoConnector = {
        id : -1,
        getTypeIdentifier : function(){
            return 'ibTaoConnector';
        },
        /**
         * Render the PCI : 
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config, assetManager){

            console.log("-init-");
            var self = this;

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.config = config || {};
            this.startTime = Date.now();
            this.assetManager = assetManager;

            this.response = new Map();
            this.traceLogs = [];

            renderer.render(this.id, this.dom, this.config, assetManager);

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);

            this.on('urlchange', function(url){
                self.config.url = url || self.config.url;
                renderer.refreshSrc(self.id, self.dom, url);
                // self.scaleContents();
            });
                        
            this.on('itempropchange', function(width, height){
                width = parseInt(width);
                height = parseInt(height);
                if(
                    (self.config.width == width && self.config.height == height) || 
                    width < 100 ||
                    height < 100 ||
                    width > 2560 ||
                    height > 1600
                ){
                        return;
                    // throw new Error("Dimensions out of range.")
                }

                self.config.width = width || self.config.width;
                self.config.height = height || self.config.height;
                renderer.updateIframe(self.id, self.dom, self.config);
            });

            const receive = (type, data) => {

                console.log("receive", type, data);
                // console.log(1);
                
                const scoringResultReturn = (data) => {
                    console.log("getScoringResultReturn", data);
                    let results = data["result"];

                    // let tmp = Object.keys(data["params"][1]["incidents"])[0];
                    // let identifier = tmp.substring(tmp.indexOf("/item")+1).replace("/",".").replace("task=","").replace("item=","");

                    
                    /*  
                    *   for valid indentifier characters, check:
                    *   \vendor\qtism\qtism\qtism\common\utils\data\CharacterMap.php        
                    *   \vendor\qtism\qtism\qtism\runtime\pci\json\Unmarshaller.php
                    */

                    let classes = [];
                    let hits = [];
                    
                    for (let i of Object.keys(results)) {
                        if (i.indexOf("hit.") >= 0 && results[i] == true)
                            hits.push(i.split(".")[1]);
                    }

                    for (let i of Object.keys(results)) {
                        if (i.indexOf("hitClass.") >= 0) {
                            let hit = hits.indexOf(i.split(".")[1]);
                            if (hit >= 0){
                                let text = "";
                                if(typeof results["hitText."+hits[hit]] == "string")
                                    text = results["hitText."+hits[hit]];
                                classes.push({ "class": results[i], "hit": hits[hit], "text": text });
                                this.response.set(results[i] + ".hit", hits[hit]);
                                if(text.length>0)
                                    // this.response.set(identifier + "." + results[i] + ".hitText", text);
                                    this.response.set(results[i] + ".hitText", text);
                            }
                        }
                    }
                }

                const callbacks = {
                    
                    "getScoringResultReturn": scoringResultReturn,
                    "getTasksStateReturn": scoringResultReturn,
                    
                    "traceLogTransmission": (data) => {
                        if(!!data["traceLogData"]){
                            this.traceLogs.push(data["traceLogData"]);
                        }
                    }              
                };
    
                if (typeof callbacks[type] !== 'undefined') {
                    callbacks[type](data);
                }
            };
    
            // listen to messages from parent frame
            window.addEventListener('message', event => {
                let data = JSON.parse(event.data);
                receive(data.eventType, data);
            }, false);

        },


        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){

        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(interaction){

            let _response = {};

            if(this.response.size>0){
                let score = {
                    hits: {}
                }
                this.response.forEach((_hit, _class) => {
                    score.hits[_class] = _hit
                });
                _response['score'] = score;
            }
            
            if(this.traceLogs.length>0){
                // _response['logs'] = zipson.stringify(this.traceLogs);
                _response['logs'] = this.traceLogs;
            }


            return  {
                base : {
                    // string : JSON.stringify(['test', '123']).replace(/"/g,"'")
                    // string : JSON.stringify(_response).replace(/"/g,"'")
                    string : LZString.compressToBase64(JSON.stringify(_response))
                }
            }
        },

        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains 
         * Event listeners are removed and the state and the response are reset
         * 
         * @param {Object} interaction
         */
        destroy : function(){

            var $container = $(this.dom);
            $container.off().empty();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){
            if(state && state.response){
                this.setResponse(state.response);
            }
        },

        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return {response : this.getResponse()};
        }
    };

    qtiCustomInteractionContext.register(ibTaoConnector);
});