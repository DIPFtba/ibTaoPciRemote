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