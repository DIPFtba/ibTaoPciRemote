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
        'ibTaoConnector/runtime/js/itemManager',
        'ibTaoConnector/runtime/js/zipson.min',
        'OAT/util/event',
    ],
    function(qtiCustomInteractionContext, $, renderer, itemMgr, zipson, event){
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
            this.itemData = _.clone(config) || null;
            this.assetManager = assetManager;

            this.response = new Map();
            this.traceLogs = [];

            renderer.render(this.id, this.dom, this.config, assetManager);
            self.scaleContents();

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);

            //listening to dynamic configuration change
            // this.on('levelchange', function(level){
            //     self.config.level = level;
            //     renderer.renderChoices(self.id, self.dom, self.config);
            // });


            const setItemData = function(targetItem){
                
                if(self.itemData.item == targetItem.item && self.itemData.task == targetItem.task)
                    return;

                self.itemData = targetItem;                
                _.assign(self.config, {
                        item: targetItem.item,
                        task: targetItem.task,
                        itemIdx: targetItem.itemIdx,
                        taskIdx: targetItem.taskIdx
                    }
                );                
            }

            this.on('urlchange', function(item, task){
                let targetItem = itemMgr.getItemData(item, task);
                if(!targetItem){
                    return;
                    // throw new Error("Item does not exist.")
                }
                setItemData(targetItem);
                renderer.refreshSrc(self.id, self.dom, self.config, assetManager);
                self.scaleContents();                    
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
                self.scaleContents();
            });


            const stopTask = () => {
                if ((document.getElementById("cbaframe") != null) &&
                    (document.getElementById("cbaframe").contentWindow.flash_communicator != null)) {
                    document.getElementById("cbaframe").contentWindow.flash_communicator.stopTask();
                }
            };

            const receive = (type, data) => {

                console.log("receive", type, data);
                // console.log(1);
                
                const callbacks = {
                    
                    "vo.ToPlayer.CBAEndTaskResponse": (data) => {
                        console.log("vo.ToPlayer.CBAEndTaskResponse", data);
                        let results = data["params"][0];

                        let tmp = Object.keys(data["params"][1]["incidents"])[0];
                        let identifier = tmp.substring(tmp.indexOf("/item")+1).replace("/",".").replace("task=","").replace("item=","");

                        
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
                                    // this.response.set(this.itemData.item + "." + this.itemData.task + "." + results[i], hits[hit]);
                                    this.response.set(identifier + "." + results[i] + ".hit", hits[hit]);
                                    if(text.length>0)
                                        this.response.set(identifier + "." + results[i] + ".hitText", text);
                                }
                            }
                        }
                    },

                    "vo.ToPlayer.EE4CBACommand": (data) => {
                        console.log("vo.ToPlayer.EE4CBACommand", data);
                        if(!data.params)
                            return;
    
                        let targetMap = {
                            "back": "#previous"
                        };
                        let target = "#next";
                        
                        stopTask();

                        if(data.params.length > 0){
                            if(targetMap[data.params[0]])
                                target = targetMap[data.params[0]];
                            
                            let targetItem = null;

                            if(target == "#next"){
                                targetItem = itemMgr.getNext(self.config.item, self.config.task);
                            }

                            else if(target == "#previous"){
                                targetItem = itemMgr.getPrevious(self.config.item, self.config.task);
                            }

                            if(_.isObject(targetItem)){
                                    setItemData(targetItem);
                                    renderer.refreshSrc(self.id, self.dom, self.config, self.assetManager);
                                    self.scaleContents();                
                            }
                            //trigger next tao section
                            else
                            {
                                if($("[data-control='move-forward'").length)
                                    $("[data-control='move-forward'").trigger("click");
                                else if($("[data-control='next-section'").length)
                                    $("[data-control='next-section'").trigger("click");
                            }
                        }
                    },
                    
                    "vo.ToPlayer.CBAEvent": (data) => {
                        if(!!data["params"] && !!data["params"][0]){
                            this.traceLogs.push(data["params"][0]);
                        }
                    },

                    "vo.ToPlayer.DataTransfer": (data) => {
                        console.log(data);
                    }                
                };
    
                if (typeof callbacks[type] !== 'undefined') {
                    callbacks[type](data);
                }
            };
    
            // listen to messages from parent frame
            window.addEventListener('message', event => {
                receive(event.data.type, event.data);
            }, false);

        },

/*
        getItemData: function(callback, assetManager){
            // let _url = this.config.url + "content/items/" + this.config.item + "/"  + this.config.item + ".json";
            let _url = assetManager.resolve('ibTaoConnector/runtime/assets/CBA/content/items/')+this.config.item+"/"+this.config.item+".json";
            $.getJSON(_url, function(data) {
                if(typeof callback == "function")
                    callback(data);
            });
        },
*/

        scaleContents: function(){

            if(this.itemData == null)
                return;

            let width = this.itemData.width;
            let height = this.itemData.height;

            let scale =  (this.config.width / width).toFixed(2);
            // let content = $("#cbaframe").contents();
            let content = $("#cbaframe");
            // $(content).find("body>iframe")
            $(content)
            .css("width", "" + width)
            .css("height", "" + height)
            .css("transform", "scale("+scale+")")
            .css("transform-origin", "top left");
            
            let scroll = "hidden";
            if(this.config.height<(scale*height))
                scroll = "scroll";

            $("#itemwrapper")
            .css("width", "" + this.config.width)
            .css("height", "" + this.config.height)
            .css("overflow-x", "hidden")
            .css("overflow-y", scroll);
        },



        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){

            // var $container = $(this.dom),
            //     value = response && response.base ? parseInt(response.base.integer) : -1;

            // $container.find('input[value="' + value + '"]').prop('checked', true);
        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(interaction){

            //*******  pciCreator.json *******/
            // "response": {
            //     "cardinality": "record",
            //     "identifier": "RESPONSE"
            // },
            // "response": {
            //     "baseType": "string",
            //     "cardinality": "single"
            // },            

            // var $container = $(this.dom),
            //     value = parseInt($container.find('input:checked').val()) || 0;
            
            // console.log(this);

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
                    string : JSON.stringify(_response).replace(/"/g,"'")
                }
            }



        /********* type: record  ***********

            let response =  {
                record : [
                    // {
                    //     name : 'response',
                    //     base : {string : "no data"}
                    // }                    
                ]
            };

            if(this.response.size>0){
                this.response.forEach((_hit, _class) => {
                    let tmp = {};
                    tmp[_class] = _hit;
                    response.record.push({
                        name : _class,
                        base : {string : JSON.stringify(tmp)}
                    });
                })
            }

            if(this.traceLogs.length>0){
                response.record.push({type: "tracelogs", zipson: zipson.stringify(this.traceLogs, true)});
            }

            */

        /* 
            pair / multiple

            let response = {
                list: {
                    pair: [
                    ]
                }
            }

            if(this.response.size>0){
                this.response.forEach((_hit, _class) => {
                    let tmp = [];
                    tmp.push(_class);
                    tmp.push(_hit);
                    response.list.pair.push(tmp);
                })
            }

        */

            // console.log(response);
            return response;
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         * 
         * @param {Object} interaction
         */
        resetResponse : function(){

            var $container = $(this.dom);

            $container.find('input').prop('checked', false);
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