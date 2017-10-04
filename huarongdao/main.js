var cvs = document.getElementById('canvas'),
    ctx = cvs.getContext('2d');

function clear() {
    ctx.save();
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, 200, 250);
    ctx.restore();
}

function drawRect(x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#f3a7a7';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#b11111';
    ctx.fillRect(x+1, y+2, w-2, h-3);
    ctx.fillStyle = '#e30d0d';
    ctx.fillRect(x+2, y+4, w-4, h-7);
    ctx.fillStyle = '#f9d3d3';
    ctx.fillRect(x+1, y, w-2, 2);
    ctx.restore();
}

/*
 0  1  2  3
 4  5  6  7
 8  9  10 11
 12 13 14 15
 16 17 18 19
*/
var blocks = new Array(20),
    plates = [],
    active = null,
    oMove = {
        dir: 0,
        x: 0,
        y: 0,
        dis: 0
    },
    initData = [
    [0, 1, 2],
    [1, 2, 2],
    [3, 1, 2],
    [8, 1, 2],
    [9, 2, 1],
    [11, 1, 2],
    [13, 1, 1],
    [14, 1, 1],
    [16, 1, 1],
    [19, 1, 1],
];
blocks[17] = blocks[18] = null;

function Plate(data) {
    this.x = data[0]%4;
    this.y = Math.floor(data[0]/4);
    this.w = data[1];
    this.h = data[2];
    
    this.add();
}
Plate.prototype = {
    draw: function() {
        var arr = [this.x*50, this.y*50, this.w*50, this.h*50];
        if (this === active) {
            arr[oMove.dir] += oMove.dis;
        }
        drawRect(arr[0], arr[1], arr[2], arr[3]);
    },
    getBlocks: function() {
        var arr = [];
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {
                arr.push((this.y+j)*4+(this.x+i));
            }
        }
        return arr;
    },
    remove: function() {
        var arr = this.getBlocks();
        for (var i = 0; i < arr.length; i++) {
            blocks[arr[i]] = null;
        }
    },
    add: function() {
        var arr = this.getBlocks();
        for (var i = 0; i < arr.length; i++) {
            blocks[arr[i]] = this;
        }
    },
    update: function(x, y) {
        if (typeof y === 'undefined') {
            y = Math.floor(x/4);
            x = x % 4;
        }
        this.remove();
        this.x = x;
        this.y = y;
        this.add();
    },
    move: function(dx, dy) {
        dx = this.adjustX(dx);
        dy = this.adjustY(dy);
        var dir = Math.abs(dx) > Math.abs(dy) ? 0 : 1,
            dis = dir ? dy : dx,
            dis2 = dir ? dx : dy;
        if (dir === oMove.dir) {
            oMove.dis = dis;
        } else if (dis2 < 10) {
            oMove.dir = dir;
            oMove.dis = dis;
        } else {
            oMove.dis = dis2;
        }
    },
    adjustX: function(dx) {
        var x = this.x,
            y = this.y;
        if (dx < 0) {
            if ( x===0 || blocks[x+y*4-1] || (this.h===2 && blocks[x+y*4+3]) ) {
                return 0;
            } else if (dx < -50) {
                if (x===1 || blocks[x+y*4-2]) {
                    return -50;
                } else if (dx < -100) {
                    return -100;
                }
            }
        } else {
            x += this.w-1;
            if ( x===3 || blocks[x+y*4+1] || (this.h===2 && blocks[x+y*4+5]) ) {
                return 0;
            } else if (dx > 50) {
                if (x===2 || blocks[x+y*4+2]) {
                    return 50;
                } else if (dx > 100) {
                    return 100;
                }
            }
        }
        return dx;
    },
    adjustY: function(dy) {
        var x = this.x,
            y = this.y;
        if (dy < 0) {
            if ( y===0 || blocks[x+y*4-4] || (this.w===2 && blocks[x+y*4-3]) ) {
                return 0;
            } else if (dy < -50) {
                if (y===1 || blocks[x+y*4-8]) {
                    return -50;
                } else if (dy < -100) {
                    return -100;
                }
            }
        } else {
            y += this.h-1;
            if ( y===4 || blocks[x+y*4+4] || (this.w===2 && blocks[x+y*4+5]) ) {
                return 0;
            } else if (dy > 50) {
                if (y===3 || blocks[x+y*4+8]) {
                    return 50;
                } else if (dy > 100) {
                    return 100;
                }
            }
        }
        return dy;
    }
}

for (var i = 0; i < initData.length; i++) {
    plates.push(new Plate(initData[i]));
}
function draw() {
    clear();
    for (var i = 0; i < plates.length; i++) {
        plates[i].draw();
    }
}
draw();

cvs.addEventListener('mousedown', function(e) {
    var x = e.offsetX, y = e.offsetY;
    if (x < 0 || x > 199 || y < 0 || y > 249)
        return;
    oMove.x = x;
    oMove.y = y;
    oMove.dis = 0;
    x = Math.floor(x/50);
    y = Math.floor(y/50);
    active = blocks[x+y*4];
});

var oHtml = document.documentElement;
oHtml.addEventListener('mousemove', function(e) {
    if (!active)
        return;
    var x = e.pageX - cvs.offsetLeft - cvs.clientLeft,
        y = e.pageY - cvs.offsetTop - cvs.clientTop,
        dx = x - oMove.x,
        dy = y - oMove.y;
    active.move(dx, dy);
    draw();
});
oHtml.addEventListener('mouseup', function(e) {
    if (!active)
        return;
    var x = active.x,
        y = active.y;
    if (oMove.dir) {
        y += Math.round(oMove.dis/50);
    } else {
        x += Math.round(oMove.dis/50);
    }
    active.update(x, y);
    active = null;
    draw();
});


























