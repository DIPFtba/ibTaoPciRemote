<!--
<div class="panel">
    <label for="level">{{__ "Level"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Scale size"}}</span>
    <select name="level" class="select2" data-has-search="false">
        {{#each levels}}
        <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
        {{/each}}
    </select>
</div>
-->


<!--
<div class="panel">
    <label for="url" class="has-icon">{{__ "Base URL"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:last" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'URL of itembuilder interface'}}</div>

    <input type="text"
           name="url"
           value="{{url}}"
           placeholder="http://localhost:89/cba_ib/" 
           data-validate="$notEmpty;">
</div>
-->


<div class="panel">
<!--
    <label for="item" class="has-icon">{{__ "Item name"}}</label>
    <input type="text"
           name="item"
           value="{{item}}"
           placeholder="{{item}}" 
           data-validate="$notEmpty;">
-->
    <label for="item" class="has-icon">{{__ "Item name"}}</label>
    <select id="item" name="item" data-validate="$notEmpty;">
        {{#each items}}
            <option value="{{name}}" {{#if selected}}selected="selected"{{/if}}>{{name}}</option>
        {{/each}}
    </select>
    
</div>

<div class="panel">
    
    <!--
    <label for="task" class="has-icon">{{__ "Entry task"}}</label>
    <input type="text"
           name="task"
           value="{{task}}"
           placeholder="{{task}}" 
           data-validate="$notEmpty;">

    -->
    
    <label for="task" class="has-icon">{{__ "Entry task"}}</label>
    <select id="task" name="task" data-validate="$notEmpty;">
        {{#each tasks}}
            <option value="{{this}}" {{#if selected}}selected="selected"{{/if}}>{{this}}</option>
        {{/each}}
    </select>
    
</div>

<div class="panel">
    <label for="width" class="has-icon">{{__ "Item wrapper width"}}</label>
    <input type="text"
           name="wrapperwidth"
           value="{{wrapperwidth}}"
           placeholder="{{wrapperwidth}}" 
           data-validate="$notEmpty; $numeric;">
</div>

<div class="panel">
    <label for="height" class="has-icon">{{__ "Item wrapper height"}}</label>
    <input type="text"
           name="wrapperheight"
           value="{{wrapperheight}}"
           placeholder="{{wrapperheight}}" 
           data-validate="$notEmpty; $numeric;">
</div>