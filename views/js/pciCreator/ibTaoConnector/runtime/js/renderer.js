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
define(['ibTaoConnector/runtime/js/jquery_2_1_1_amd', 'OAT/util/html'], function($, html){
    'use strict';

    function updateIframe(id, $container, config){
        // console.log(config);
        if(config.width > 0 && config.height > 0){
            $container.find("#cbaframe")
            // .attr("width", config.width)
            // .attr("height", config.height)
            // .css("width", "100%")
            .css("width", config.width)
            .css("height", config.height);
        }
    }
    
    function refreshSrc(id, $container, url){
        $container.find("#cbaframe").attr("src", url);
    }

    return {
        render : function(id, container, config, assetManager){

            var $container = $(container);

            // renderChoices(id, $container, config);
            // renderLabels(id, $container, config, assetManager);
            // refreshSrc(id, $container, config, assetManager);
            refreshSrc(id, $container, config.url);
            updateIframe(id, $container, config);
            
            //render rich text content in prompt
            //remove it to make it backward compatible ??
            
            // if($container.find('.prompt').length){
            //     html.render($container.find('.prompt'));
            // }
        },
        refreshSrc : function(id, container, url){
            refreshSrc(id, $(container), url);
        },
        updateIframe : function(id, container, config){
            updateIframe(id, $(container), config);
        }
    };
});