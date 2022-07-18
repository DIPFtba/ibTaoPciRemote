<!-- this file contains extra property form sample you may use
The template variables {{VAR_NAME}} are to be passed to the template function through the argument object
-->

<!-- a text input with tooltip and some validation rules -->
<hr/>
<div class="panel">
    <label for="" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text"
           name="identifier"
           value="{{identifier}}"
           placeholder="e.g. RESPONSE"
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>

<!-- a checkbox with a tooltip -->
<hr/>
<div class="panel">
    <label>
        <input name="eliminable" type="checkbox" {{#if eliminable}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Allow elimination"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'If this box is checked the student will be able to eliminate choices.'}}
    </span>
</div>

<!-- a radio group with tooltip -->
<hr/>
<div class="panel">
    <h3>{{__ 'Orientation'}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <span class="tooltip-content">
            {{__ 'Display the choices either horizontally or vertically'}}
        </span>
    <div>
        <label class="smaller-prompt">
            <input type="radio" name="orientation" value="vertical" {{#unless horizontal}}checked{{/unless}} />
            <span class="icon-radio"></span>
            {{__ 'Vertical'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="orientation" value="horizontal" {{#if horizontal}}checked{{/if}} />
            <span class="icon-radio"></span>
            {{__ 'Horizontal'}}
        </label>
    </div>
</div>