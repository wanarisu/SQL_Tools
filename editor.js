var editor = null;
window.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    editor = ace.edit('editor_area');
    editor.focus();
}