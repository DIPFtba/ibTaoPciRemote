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
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _, $){
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
            url = interaction.prop('url'),
            width = interaction.prop('width'),
            height = interaction.prop('height');

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            url: url,
            width: width,
            height: height
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            url: function(interaction, value){
                // console.log(interaction, value);
                interaction.prop('url', value);
                interaction.triggerPci('urlchange', [value]);
            },

            width: function(interaction, value){
                // console.log(interaction, value);
                interaction.prop('width', value);
                interaction.triggerPci('itempropchange', [value, null]);
            },
            height: function(interaction, value){
                // console.log(interaction, value);
                interaction.prop('height', value);
                interaction.triggerPci('itempropchange', [null, value]);
            },
        });

    };

    return CbaIbStateQuestion;
});
