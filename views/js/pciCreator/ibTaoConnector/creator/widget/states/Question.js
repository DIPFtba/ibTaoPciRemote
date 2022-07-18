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
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!ibTaoConnector/creator/tpl/propertiesForm',
    'ibTaoConnector/runtime/js/itemManager',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, itemMgr, _, $){
    'use strict';

    
    var CbaIbStateQuestion = stateFactory.extend(Question, function init(){

    }, function exit(){

        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);
    });

    CbaIbStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            itemName = interaction.prop('item'),
            entryTask = interaction.prop('task'),
            wrapperwidth = interaction.prop('wrapperwidth'),
            wrapperheight = interaction.prop('wrapperheight');

        let itemData = itemMgr.getConf();
        let items = itemData.items;
        
        let _getTasks = function(itm){
            let _tmp = [];
            for(let i in items){
                if(items[i].name == itm){
                    for(let j in items[i].tasks){
                        _tmp.push(items[i].tasks[j].name);
                    }   
                }
            }
            return _tmp;
        }
        let tasks = _getTasks(itemName);

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            // levels : levelData,
            item: itemName,
            task: entryTask,
            items: items,
            tasks: tasks,
            wrapperwidth: wrapperwidth,
            wrapperheight: wrapperheight
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            // url: function(interaction, value){
            //     // console.log(interaction, value);
            //     interaction.prop('url', value);
            //     interaction.triggerPci('urlchange', [value, null, null]);
            // },
            item: function(interaction, value){
                let tasks = _getTasks(value);
                // console.log(tasks, value, $form);
                let _select = $($form).find("#task");
                if(_select.length>0 && tasks.length>0){
                    _select.empty();
                    for(let task of tasks){
                        _select.append('<option value="'+task+'">'+task+'</option>');
                    }
                }
                interaction.prop('item', value);
                interaction.triggerPci('urlchange', [value, null]);
            },
            task: function(interaction, value){
                console.log(interaction, value);
                interaction.prop('task', value);
                interaction.triggerPci('urlchange', [interaction.prop('item'), value]);
            },
            wrapperwidth: function(interaction, value){
                // console.log(interaction, value);
                interaction.prop('wrapperwidth', value);
                interaction.triggerPci('itempropchange', [value, null]);
            },
            wrapperheight: function(interaction, value){
                // console.log(interaction, value);
                interaction.prop('wrapperheight', value);
                interaction.triggerPci('itempropchange', [null, value]);
            },
        });

    };

    return CbaIbStateQuestion;
});
