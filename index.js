const Koa = require('koa');
const Router = require('koa-router');
const Static = require('koa-static');
const {
    exec
} = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

let app = new Koa();
let router = new Router();



var readFile = function (path) {
    return new Promise((resove, reject) => {
        if (utils.isExit(path)) {
            reject();
            return;
        }

        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            resove(data);
        })

    })
}

var exe = function (commands) {
    return new Promise((resolve, reject) => {
        exec(commands, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stdout);
        })
    })
}

var stat = function (path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(stats);
        })
    })
}


var utils = {
    isFile: function (path) {
        return this.isExit(path) && fs.statSync(path).isFile();
    },
    isDir: function (path) {
        return this.isExit(path) && fs.statSync(path).isDirectory();
    },
    isExit: function (path) {
        return fs.existsSync(path) || path.existsSync(path);
    }
}

async function getRoot() {
    let stdout = await exe('ls');
    let data = await concat(stdout);
    return data;
}

async function concat(str) {
    let list = str.trim().split('\n');
    let data = [];
    for (let name of list) {
        let p = path.join(__dirname, name);
        let d = {};
        let stats = await stat(path.join(__dirname, name));
        if (utils.isDir(p)) {
            d.type = 'dir';
            d.name = name;
        } else {
            let reg = /\./,
                _name;
            reg.test(name) ? (_name = name.split(reg), d.name = _name[0], d.filetype = _name[1]) : (d.name = name, d.filetype = '');
            d.size = stats.size;
            d.bstamp = stats.birthtimeMs;
            d.cstamp = stats.ctimeMs;
        }
        data.push(d);
    }
    return data;
}





app.use(Static(path.join(__dirname, 'src')))

router.get('/', async (ctx, next) => {
    var html = '';
    readFile(path.join(__dirname, 'src/index.html')).then((data) => {
        ctx.body = data;
    })
})

router.get('/getTree', async (ctx, next) => {
    let query = ctx.query;
    let data = await getRoot();
    query.callback ? (ctx.body = `${query.callback}(${JSON.stringify(data)})`) : ctx.body = data;
})

app.use(router.routes());


app.listen(8080, () => {
    console.log('listenning 8080');
})