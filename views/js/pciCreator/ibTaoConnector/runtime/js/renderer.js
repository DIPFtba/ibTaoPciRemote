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

      let wrapper = $container.find("#cbaframe")[0];
      let scalingFactor = 1;          

      if(config.width > 0 && config.height > 0){

          let itemWidth = config.iwidth;
          let itemHeight = config.iheight;

          //unscaled, up, down, updown
          let scaling = "down";

          let availHeight =  (window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight;
          let availWidth =  (window.visualViewport && window.visualViewport.width) ? window.visualViewport.width : window.innerWidth;

          if(!!document.querySelector("section.content-wrapper")){
            availHeight = document.querySelector("section.content-wrapper").clientHeight-20;
            availWidth = document.querySelector("section.content-wrapper").clientWidth;
            if(!!document.querySelector("section.content-wrapper").style)
                document.querySelector("section.content-wrapper").style.overflow = "hidden";
          }

          if(!!document.querySelector("div.tao-scope.runtime")){
            document.querySelector("div.tao-scope.runtime").style.padding = "0px";
          }

          availHeight = availHeight<config.height ? availHeight : config.height;
          availWidth = availWidth<config.width ? availWidth : config.width;
          
          if (
            scaling == "unscaled" ||
            ((availHeight < itemHeight || availWidth < itemWidth) &&
              scaling == "up") ||
            (availHeight > itemHeight &&
              availWidth > itemWidth &&
              scaling == "down")
          ) {
            scalingFactor = 1;
          } else {
            let sfh = 1;
            let sfw = 1;
            if (availHeight < itemHeight)
              sfh = Math.ceil((availHeight * 1000) / itemHeight) / 1000;
            if (availWidth < itemWidth)
              sfw = Math.ceil((availWidth * 1000) / itemWidth) / 1000;
            scalingFactor = sfh;
            if (
              (scaling == "down" || scaling == "updown") &&
              (sfh < 1 || sfw < 1)
            )
              scalingFactor = Math.min(sfh, sfw);
          }

          wrapper.style.width = itemWidth+"px";
          wrapper.style.height = itemHeight+"px";
          wrapper.style.transform = "scale("+scalingFactor+")";
          if(!!config.alignh)
            wrapper.style.transformOrigin = "top " + config.alignh;
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