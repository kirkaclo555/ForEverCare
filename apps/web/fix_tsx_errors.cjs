const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdir(dir, function(err, list) {
        if (err) return callback(err);
        var pending = list.length;
        if (!pending) return callback(null);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        if (!--pending) callback(null);
                    });
                } else {
                    if (file.endsWith('.tsx')) {
                        let content = fs.readFileSync(file, 'utf8');
                        let newContent = content
                            .replace(/onKeyUp="([^"]+)"/g, "onKeyUp={() => console.log('$1')}")
                            .replace(/colSpan="(\d+)"/g, "colSpan={$1}")
                            .replace(/maxLength="(\d+)"/g, "maxLength={$1}")
                            .replace(/onInput="([^"]+)"/g, "onInput={() => console.log('$1')}")
                            .replace(/frameBorder="(\d+)"/g, "frameBorder={$1}");
                        
                        if (content !== newContent) {
                            fs.writeFileSync(file, newContent, 'utf8');
                            console.log('Fixed values in', file);
                        }
                    }
                    if (!--pending) callback(null);
                }
            });
        });
    });
}

walk(path.join(__dirname, 'app'), function(err) {
    if (err) throw err;
    console.log('Done');
});
