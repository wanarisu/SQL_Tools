var editor = null;
var folder_path = null; // 開いたフォルダのパス 
var folder_items = null; // フォルダ内のファイル 
var current_fname = null; // 開いたファイル名 
var sidebar = null;
var footer = null;

window.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    let w = BrowserWindow.getFocusedWindow();
    w.on('close', (e) => {
        savefile();
    });

    footer = document.querySelector('#footer');
    sidebar = document.querySelector('#sidebar');

    editor = ace.edit('editor_area');
    editor.setTheme('ace/theme/textmate');

    setMode("text");

    editor.focus();
    editor.session.getDocument().on('change', (ob) => {
        change_flg = true;
    });
}

function setTheme(tname) {
    editor.setTheme('ace/theme/' + tname);
}

function setMode(mname) {
    editor.session.setMode('ace/mode/' + mname);
}

function setFontSize(n) {
    editor.setFontSize(n);
}

function openfolder() {
    let w = BrowserWindow.getFocusedWindow();
    let result = dialog.showOpenDialogSync(w, {
        properties: ['openDirectory']
    });
    if (result != undefined) {
        folder_path = result[0];
        loadPath();
        footer.textContent = 'open dir:"' + folder_path + '".';
    }
}

function loadPath() {
    fs.readdir(folder_path, function(err, files) {
        folder_items = files;
        let tag = '<ul>';
        for (const n in files) {
            tag += '<li id="item ' + n + '" onclick="openfile(' + n + ')" >' + files[n] + '</li>';
        }
        tag += '</ul>';
        sidebar.innerHTML = tag;
    });
}

function openfile(n) {
    savefile();
    current_fname = folder_items[n];
    let fpath = path.join(folder_path, current_fname);
    fs.readFile(fpath, (err, result) => {
        if (err == null) {
            let data = result.toString();
            editor.session.getDocument().setValue(data);
            change_flg = false;
            footer.textContent = ' "' + fpath + '" loaded.';
            setExt(current_fname);
        } else {
            dialog.showErrorBox(err.code + err.errno, err.message);
        }
    });
}

function setExt(fname) {
    let ext = path.extname(fname);
    switch (ext) {
        case '.txt':
            setMode('text');
            break;
        case '.js':
            setMode('javascript');
            break;
        case '.json':
            setMode('javascript');
            break;
        case '.html':
            setMode('html');
            break;
        case '.py':
            setMode('python');
            break;
        case '.php':
            setMode('php');
            break;
    }
}

var change_flg = false;

function savefile() {
    if (!change_flg) { return; }
    let fpath = path.join(folder_path, current_fname);
    let data = editor.session.getDocument().getvalue();
    fs.writeFile(fpath, data, (err) => {
        change_flg = false;
    });
}