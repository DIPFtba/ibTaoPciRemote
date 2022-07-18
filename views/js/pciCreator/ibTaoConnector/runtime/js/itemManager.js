define([
    'json!ibTaoConnector/confDefault.json',
    'json!ibTaoConnector/confSchema.json',
    'ibTaoConnector/runtime/js/ajv.min',
    'lodash'
    ], 
    function(conf, schema, Ajv, _){

        'use strict';
        let ajv = new Ajv();
        var validate = ajv.compile(schema);
        if(!validate(conf)){
            throw new Error("ItebuilderIntegration: Config json file did not validate successfully.");
        }

        let dummy = {
            "item": conf.items[0].name,
            "task": conf.items[0].tasks[0].name,
            "width": conf.items[0].tasks[0].width,
            "height": conf.items[0].tasks[0].height,
            "wrapperwidth": conf.items[0].wrapperwidth,
            "wrapperheight": conf.items[0].wrapperheight,
            "itemIdx": 0,
            "taskIdx": 0
        };

        const _getItemData = function(item, task){
            if(!_.isString(item))
                return false;            
            let _tmp = _.clone(dummy);
            for(let i in conf.items){
                if(conf.items[i].name == item){
                    if(!_.isString(task))
                        task = conf.items[i].tasks[0].name;
                    for(let j in conf.items[i].tasks){
                        if(conf.items[i].tasks[j].name == task){
                            _tmp.item = item;
                            _tmp.task = task;
                            _tmp.width = conf.items[i].tasks[j].width;
                            _tmp.height = conf.items[i].tasks[j].height;
                            _tmp.wrapperwidth = conf.items[i].wrapperwidth;
                            _tmp.wrapperheight = conf.items[i].wrapperheight;
                            _tmp.itemIdx = i;
                            _tmp.taskIdx = j;
                            return _tmp;
                        }
                    }                        
                }
            }
            return false;                
        };

        return {
            
            getConf : function(){
                return conf;
            },

            getItemData : _getItemData,

            getDefaultEntrypoint : function(){
                let _tmp = _.clone(dummy);
                let _itemData = _getItemData(conf.default.item, conf.default.task);
                if(_itemData)
                    return _itemData;
                return _tmp;
            },

            getNext : function(item, task, loop){

                if(!_.isString(item) || !_.isString(task))
                    return false;
                
                let _tmp = _.clone(dummy);
                for(let i in conf.items){
                    if(conf.items[i].name == item){
                        for(let j in conf.items[i].tasks){
                            if(conf.items[i].tasks[j].name == task){
                                if(j<conf.items[i].tasks.length-1){
                                    _tmp.itemIdx = parseInt(i);
                                    _tmp.taskIdx = parseInt(j)+1;        
                                    _tmp.item = conf.items[i].name;
                                    _tmp.task = conf.items[i].tasks[_tmp.taskIdx].name;
                                    _tmp.width = conf.items[i].tasks[_tmp.taskIdx].width;
                                    _tmp.height = conf.items[i].tasks[_tmp.taskIdx].height;
                                }
                                else if(i<conf.items.length-1){
                                    _tmp.itemIdx = parseInt(i)+1;
                                    _tmp.item = conf.items[_tmp.itemIdx].name;
                                    _tmp.task = conf.items[_tmp.itemIdx].tasks[0].name;
                                    _tmp.width = conf.items[_tmp.itemIdx].tasks[0].width;
                                    _tmp.height = conf.items[_tmp.itemIdx].tasks[0].height;
                                    _tmp.wrapperwidth = conf.items[_tmp.itemIdx].wrapperwidth;
                                    _tmp.wrapperheight = conf.items[_tmp.itemIdx].wrapperheight;
                                }
                                else if(!loop)
                                    return false;                                    
                            }
                        }
                    }
                }
                return _tmp;
            },

            getPrevious : function(item, task){

                if(!_.isString(item) || !_.isString(task))
                    return false;
                
                let _tmp = _.clone(dummy);
                for(let i in conf.items){
                    if(conf.items[i].name == item){
                        for(let j in conf.items[i].tasks){
                            if(conf.items[i].tasks[j].name == task){
                                if(j>0){
                                    _tmp.itemIdx = parseInt(i);
                                    _tmp.taskIdx = parseInt(j)-1;        
                                    _tmp.item = conf.items[i].name;
                                    _tmp.task = conf.items[i].tasks[_tmp.taskIdx].name;
                                    _tmp.width = conf.items[i].tasks[_tmp.taskIdx].width;
                                    _tmp.height = conf.items[i].tasks[_tmp.taskIdx].height;
                                }
                                else if(i>0){
                                    _tmp.itemIdx = parseInt(i)-1; 
                                    _tmp.item = conf.items[_tmp.itemIdx].name;
                                    _tmp.task = conf.items[_tmp.itemIdx].tasks[0].name;
                                    _tmp.width = conf.items[_tmp.itemIdx].tasks[0].width;
                                    _tmp.height = conf.items[_tmp.itemIdx].tasks[0].height;
                                    _tmp.wrapperwidth = conf.items[_tmp.itemIdx].wrapperwidth;
                                    _tmp.wrapperheight = conf.items[_tmp.itemIdx].wrapperheight;
                                }
                            }
                        }
                    }
                }
                return _tmp;
            }
        };
});