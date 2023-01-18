<div class="panel">
    <label for="url" class="has-icon">{{__ "Base URL"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:last" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'URL of itembuilder interface'}}</div>

    <input type="text"
           name="url"
           value="{{url}}"
           placeholder="http://localhost:3000" 
           data-validate="$notEmpty;">
</div>

<div class="panel">
    <label for="width" class="has-icon">{{__ "Item wrapper width"}}</label>
    <input type="text"
           name="width"
           value="{{width}}"
           placeholder="{{width}}" 
           data-validate="$notEmpty; $numeric;">
</div>

<div class="panel">
    <label for="height" class="has-icon">{{__ "Item wrapper height"}}</label>
    <input type="text"
           name="height"
           value="{{height}}"
           placeholder="{{height}}" 
           data-validate="$notEmpty; $numeric;">
</div>

<div class="panel">
    <label for="iwidth" class="has-icon">{{__ "Item width"}}</label>
    <input type="text"
           name="iwidth"
           value="{{iwidth}}"
           placeholder="{{iwidth}}" 
           data-validate="$notEmpty; $numeric;">
</div>

<div class="panel">
    <label for="iheight" class="has-icon">{{__ "Item height"}}</label>
    <input type="text"
           name="iheight"
           value="{{iheight}}"
           placeholder="{{iheight}}" 
           data-validate="$notEmpty; $numeric;">
</div>

<div class="panel">
    <label for="alignh">{{__ "horizontal alignment"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "horizontal alignment"}}</span>
    <select name="alignh" class="select2" data-has-search="false">
        {{#each alignh}}
          <option value="{{key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
        {{/each}}
    </select>
</div>

<div class="panel">
 <label>
    <input name="navigationLock" type="checkbox" {{#if navigationLock}}checked="checked"{{/if}}/>
    <span class="icon-checkbox"></span>
        {{__ "Navigation lock"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'If this box is checked it prevents to move out if the PCI is not responded, displaying an informational message.'}}
    </span>
</div>