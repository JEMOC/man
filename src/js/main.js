var jsonp = function () {
    var script = document.createElement('script');
    script.src = 'http://localhost:8080/getTree?callback=jptree';
    !window.jptree && (window.jptree = function (data) {
        console.log(data);
        var tree = document.querySelector('.tree');
        var view = document.querySelector('.view');
        data.forEach((item) => {
            var node = document.createElement('div');
            if (item.type == 'dir') {
                node.innerHTML = item.name;
                tree.appendChild(node);
                view.appendChild(node.cloneNode(true));
            } else {
                node.innerHTML = item.filetype == '' ? item.name : item.name + '.' + item.filetype;
                view.appendChild(node);
            }
        })
    })
    document.querySelector('body').appendChild(script);
}

jsonp();