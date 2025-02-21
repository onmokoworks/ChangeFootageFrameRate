(function(thisObj) {
    var win = (thisObj instanceof Panel) ? thisObj : new Window("dialog", "フレームレート変更ツール", undefined, {resizeable: true});
    win.orientation = 'column';
    win.alignChildren = ['fill', 'top'];

    var fpsGroup = win.add('group', undefined);
    fpsGroup.orientation = 'row';
    fpsGroup.alignChildren = ["fill", "center"];

    fpsGroup.add('statictext', undefined, '新しいフレームレート:');
    
    // FPSの選択肢
    var fpsOptions = [30, 29.97, 24, 12];

    var fpsDropdownOptions = [];
    for (var i = 0; i < fpsOptions.length; i++) {
        fpsDropdownOptions.push(fpsOptions[i] + ' fps');
    }

    var fpsDropdown = fpsGroup.add('dropdownlist', undefined, fpsDropdownOptions);

    fpsDropdown.selection = 0;

    var chkRecursive = win.add('checkbox', undefined, 'サブフォルダも含めて変更する');

    var runButton = win.add('button', undefined, 'フレームレート変更');
    runButton.onClick = function() {
        if (app.project === null) {
            alert("プロジェクトが開かれていません！");
            return;
        }
        
        var selItems = app.project.selection;
        if (selItems.length === 0) {
            alert("プロジェクトパネルでフッテージまたはコンポジションを選択してください。");
            return;
        }
        
        var newFrameRate = parseFloat(fpsDropdown.selection.text);
        
        if (!confirm("選択中のアイテムのフレームレートを " + newFrameRate + " fps に変更してもよろしいですか？")) {
            return;
        }

        function setFrameRate(item, frameRate) {
            // コンポジションの場合
            if (item instanceof CompItem) {
                // 直接 frameRate を変更
                item.frameRate = newFrameRate;
                return 1;
            }
            // フッテージの場合
            else if (item instanceof FootageItem) {
                // 静止画像の場合はスキップ
                if (item.mainSource.isStill) {
                    return 0;
                } else {
                    item.mainSource.conformFrameRate = newFrameRate;
                }
                return 1;
            }
            // フォルダの場合
            else if (chkRecursive.value && item instanceof FolderItem) {
                var updatedCount = 0;
                for (var i = 1; i <= item.numItems; i++) {
                    updatedCount += setFrameRate(item.item(i), frameRate);
                }
                return updatedCount;
            }
            return 0;
        }
        
        app.beginUndoGroup("フレームレート変更");
        var updatedCount = 0;
        for (var i = 0; i < selItems.length; i++) {
            var item = selItems[i];
            try {
                updatedCount += setFrameRate(item, newFrameRate);
            } catch (e) {
                alert("アイテム「" + item.name + "」のフレームレート変更に失敗しました:\n" + e.toString());
            }
        }
        app.endUndoGroup();
        alert("" + updatedCount + " 個のアイテムのフレームレートを " + newFrameRate + " fps に変更しました。");
    };

    win.layout.layout(true);
    win.onResize = function() {
        win.layout.resize();
    };
    
    if (win instanceof Window) {
        win.center();
        win.show();
    }

    return win;
})(this);