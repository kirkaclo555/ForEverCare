const fs = require('fs');
const path = require('path');

function processTag(tag) {
    if (
        tag.includes('type="radio"') ||
        tag.includes('type="checkbox"') ||
        tag.includes('type="hidden"') ||
        tag.includes('type="submit"') ||
        tag.includes('onChange=')
    ) {
        return tag;
    }
    // replace ` value=` with ` defaultValue=`
    return tag.replace(/\svalue=/g, ' defaultValue=');
}

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
                        
                        // match <input ... > or <textarea ... > (allowing self closing or not)
                        let newContent = content.replace(/<(input|textarea)([^>]+)>/g, (match, tagname, attrs) => {
                            // only apply to those having ' value='
                            if (!/\svalue=/.test(attrs)) {
                                return match;
                            }
                            return processTag(match);
                        });
                        
                        if (content !== newContent) {
                            fs.writeFileSync(file, newContent, 'utf8');
                            console.log('Fixed value prop in', file);
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
