function Board(width=32, height=32, cells) {
  this.width = width
  this.height = height
  this.cells = cells || new Uint8Array(width * height)
}

Board.prototype.indexFor = function([row, col]) {
  if (row < 0 || row >= this.height || col < 0 || col >= this.width)
    return
  return row * this.width + col
}

Board.prototype.get = function (coords) {
  return this.cells[this.indexFor(coords)] || 0
}

Board.prototype.set = function(coords, value) {
  this.cells[this.indexFor(coords)] = value;
}

Board.prototype.livingNeighbors = function([row, col]) {
    var aliveNeighbors = 0
    var neighbors =[
      [row-1,col-1],[row-1,col], [row-1,col+1],
      [row,col-1], [row,col+1],
      [row+1,col-1],[row+1, col], [row+1,col+1]
      ];

    neighbors.forEach(function(el){
      if(this.get(el)){
        aliveNeighbors++
      }
    },this);
    return aliveNeighbors

}

Board.prototype.toggle = function(coords) {
  var val = this.get(coords);
  this.set(coords, !val);
}

function conway(isAlive, numLivingNeighbors) {
  if (isAlive) {
    if (numLivingNeighbors < 2 || numLivingNeighbors > 3) return false;
    return true;
  } else {
    return numLivingNeighbors === 3;
  }
}

function tick(present, future, rules=conway) {
  for (i=0; i < future.width; i++) {
    for (j=0; j < future.height; j++) {
      var numLivingNeighbors = present.livingNeighbors([i,j]);
      future.set([i,j], rules(present.get([i,j]), numLivingNeighbors))
    }
  }

  return [future, present]
}
