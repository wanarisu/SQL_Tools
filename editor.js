var editor = null;
var folder_path = null; // 開いたフォルダのパス 
var folder_items = null; // フォルダ内のファイル 
var current_fname = null; // 開いたファイル名 
var sidebar = null;
var footer = null;
var change_flg = false;

window.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    let w = BrowserWindow.getFocusedWindow();
    w.on('close', (e) => {
        savefile();
    });

    footer = document.querySelector('#footer');
    sidebar = document.querySelector('#sidebar');
    query_result = document.querySelector('#query_result');

    editor = ace.edit('editor_area');
    editor.setTheme('ace/theme/twilight');

    editor.$blockScrolling = Infinity;
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

    ace.config.loadModule('ace/ext/language_tools', function() {
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        const snippetManager = ace.require("ace/snippets").snippetManager;
        const config = ace.require("ace/config");
        ace.config.loadModule("ace/snippets/javascript", function(m) {
            if (m) {
                snippetManager.files.javascript = m;
                m.snippets = snippetManager.parseSnippetFile(m.snippetText);
                m.snippets.push({
                    "content": "const ${1:variable} = new Animation.base(x, y, z);",
                    "name": "Animation",
                    "tabTrigger": "Animation"
                });
                snippetManager.register(m.snippets, m.scope);
            }
        });
    });

    setMode("sql");

    editor.focus();
    editor.session.getDocument().on('change', (ob) => {
        change_flg = true;
    });

    DisplayDDL();
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

function savefile() {
    if (!change_flg) { return; }
    let fpath = path.join(folder_path, current_fname);
    let data = editor.session.getDocument().getvalue();
    fs.writeFile(fpath, data, (err) => {
        change_flg = false;
    });
}

function doit() {
    /**
     *  array.forEach((value, index, array) => {
     *   console.log(`${value}は、[${array}]の中で ${index} 番目の要素です`);
     *  });
     */
    let ace_lines = document.getElementsByClassName("ace_line");
    let innerText = '';

    for (var i = 0; i < ace_lines.length; ++i) {
        innerText += ace_lines[i].innerText + "\n";
    }
    innerText = innerText.replace(/\n/g, '');
    console.log(innerText);

    let query_title = document.getElementById('query_text');
    let query_result = document.getElementById('result_text');
    let querys = innerText.split(';');

    console.log(querys);

    query_result.innerHTML = '';
    query_title.innerHTML = '';

    queryResultSet = new Object();
    querys.forEach((query, key) => {
        console.log(query);
        sqlite_query(query, function(rows) {
            query_title.innerHTML += '<option value="' + key + '">' + query + '</option>';
            console.log(query_title.innerHTML);
            if (rows.status == '2') {
                queryResultSet[key] = rows.error.detail;
                if (key == 0) {
                    query_result.innerHTML += rows.error.detail;
                }
                return;
            } else if (rows.status == '0') {
                rows = rows.rows;
            } else {
                queryResultSet[key] = rows.rows;
                if (key == 0) {
                    query_result.innerHTML += rows.rows;
                }
                return;
            }

            let keys = Object.keys(rows[0]);
            let th_html = '';
            keys.forEach((value, index, keys) => {
                th_html += '<th>' + value + '</th>';
            });

            let td_html = '<tbody>';
            rows.forEach((value, index, rows) => {
                td_html += '<tr>';
                keys.forEach((key, index2, keys) => {
                    td_html += '<td nowrap>' + value[key] + '</td>';
                });
                td_html += '</tr>';
            });
            td_html += '</tbody>';

            rows = JSON.stringify(rows);

            queryResultSet[key] = '<table class="table table-bordered table-dark"><thead><tr>' + th_html + '</tr></thead>' + td_html + '</table>';

            if (key == 0) {
                query_result.innerHTML += '<table class="table table-bordered table-dark"><thead><tr>' + th_html + '</tr></thead>' + td_html + '</table>';
            }
            return;
        });
    });

    db.close();
}

function DisplayDDL() {
    sqlite_query('select * from sqlite_master', function(rows) {
        let query_result = document.getElementById('sql_ddl');

        if (rows.status == '2') {
            query_result.innerHTML = rows.error.detail;
            return;
        } else if (rows.status == '0') {
            rows = rows.rows;
        } else {
            query_result.innerHTML = rows.rows;
            return;
        }

        let li_html = '';
        rows.forEach((value) => {
            value['sql'] = value['sql'].replace(/  +/g, '');
            value['sql'] = value['sql'].replace(/\n/g, '');
            value['sql'] = value['sql'].replace(/&#009;/g, '');
            value['sql'] = value['sql'].replace('(', '(\n&#009;');
            value['sql'] = value['sql'].replace(/,/g, ',\n&#009;');
            value['sql'] = value['sql'].replace(')', '\n);\n\n');
            li_html += value['sql'];
        });

        query_result.innerHTML = li_html;
        return;
    });
}

function sqlite_query(query, callback) {
    //SELECT文を発行する
    let sc_check = query.substring(0, 6);

    if (sc_check == 'select' || sc_check == 'SELECT') {
        db.all(query, function(err, rows) {
            if (err) {
                //メッセージを表示
                //メッセージオプション
                var callback_val = {
                    status: '2',
                    error: {
                        type: 'info',
                        title: "エラーメッセージ",
                        button: ['OK'],
                        message: 'データ取得エラー',
                        detail: String(err)
                    }
                }

                callback(callback_val);
                return;
            } else {
                //取得したデータを変数に格納しておく
                if (rows == undefined) {
                    callback_val = {
                        status: '1',
                        rows: 'The database update process has been completed successfully.'
                    }
                } else {
                    callback_val = {
                        status: '0',
                        rows: rows
                    }
                }

                callback(callback_val);
            }
        });
    } else {
        db.run(query, function(err, rows) {
            if (err) {
                //メッセージを表示
                //メッセージオプション
                var callback_val = {
                    status: '2',
                    error: {
                        type: 'info',
                        title: "エラーメッセージ",
                        button: ['OK'],
                        message: 'データ取得エラー',
                        detail: String(err)
                    }
                }

                callback(callback_val);
                return;
            } else {
                //取得したデータを変数に格納しておく
                if (rows == undefined) {
                    callback_val = {
                        status: '1',
                        rows: 'The database update process has been completed successfully.'
                    }
                } else {
                    callback_val = {
                        status: '0',
                        rows: rows
                    }
                }

                callback(callback_val);
            }
        });
    }
}