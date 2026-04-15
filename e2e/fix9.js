const fs = require('fs');
const path = require('path');

const dir = 'e2e/specs/httpCache';
const files = fs.readdirSync(dir);
for (const file of files) {
    if (!file.endsWith('.js')) continue;
    let text = fs.readFileSync(path.join(dir, file), 'utf-8');

    // The previous regex in fix8 to catch response was faulty
    // because it relied on `apiPost(.*?);\n    {\n`
    // `await apiPost(request, '/api/activities', {` was spread on multiple lines!

    // It's much simpler: just replace `await apiPost(` with `const response = await apiPost(`
    // IF the next block requires `response`.
    // We already replaced `.then` with `});\n{`. So after `});` there is `{` and then `response`.
    // Let's just fix the missing `response` variables.
}
