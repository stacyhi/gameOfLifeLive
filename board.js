/**
 * Given a width and height, construct a Board.
 * 
 * @param {Int} width 
 * @param {Int} height 
 * @param {Array<Int>} cells the array to use for the cells (default: new Uint8Array(width * height))
 */
function Board(width=32, height=32, cells) {
  this.width = width
  this.height = height
  // We'll store our cells in a 1D typed array.
  // Typed arrays are a lot like normal arrays, but they're
  // (1) much faster, and (2) can only hold one kind of data type.
  // In this case, we're creating a Uint8 typed array, which means
  // it can only hold unsigned, 8-bit integers (ints from 0 to 255).
  //
  // Since we only really need to track 1 bit per cell, this is positively
  // luxurious for our needs.
  this.cells = cells || new Uint8Array(width * height)
}

/**
 * indexFor(coords: [row: int, col: int]) -> int
 * 
 * Given an array of coordinates [row, col], return the index of that cell in this
 * board's cells array.
 */
Board.prototype.indexFor = function([row, col]) {
  // OMG, a destructured parameter! ⬆️⬆️⬆️⬆️⬆️⬆️
  //
  // This digs into the array we were passed, plucks out the first
  // two elements, and names them row and col. Any other elements
  // are ignored.
  //
  // http://2ality.com/2015/01/es6-destructuring.html  
  
  // Return undefined if we're out of bounds
  if (row < 0 || row >= this.height || col < 0 || col >= this.width)
    return  
  return row * this.width + col
}

Board.prototype.coordFor = function(index) {
  var row = Math.floor(index / this.width)
  var col = index % this.width
  if (row < 0 || row >= this.height || col < 0 || col >= this.width)
    return
  return [row, col]
}

/**
 * get(coords: [row: int, col: int]) -> uint8
 * 
 * Get the value of the board at coords.
 */
Board.prototype.get = function (coords) {
  return this.cells[this.indexFor(coords)] || 0
}

/**
 * set(coords: [row: int, col: int], value: uint8)
 * 
 * Set the value of the board at coords to value.
 */
Board.prototype.set = function(coords, value) {
  this.cells[this.indexFor(coords)] = value
  return this
}


/**
 * livingNeighbors(coords: [row: int, col: int])
 * 
 * Return the count of living neighbors around a given coordinate.
 */
Board.prototype.livingNeighbors = function([row, col]) {
  return this.get([row - 1, col - 1]) +
         this.get([row - 1, col]) +
         this.get([row - 1, col + 1]) +

         this.get([row, col - 1]) +
         // Not meeeeeee
         this.get([row, col + 1]) +
         
         this.get([row + 1, col - 1]) +
         this.get([row + 1, col]) +
         this.get([row + 1, col + 1])
}

/**
 * toggle(coords: [row: int, col: int])
 * 
 * Toggle the cell at coords from alive to dead or vice versa.
 */
Board.prototype.toggle = function(coords) {
  this.set(coords, !this.get(coords))
}

/**
 * Give the vitals of a cell (its current state, and how many living neighbors it
 * currently has), return whether it will be alive in the next tick. 
 * 
 * @param {Boolean} isAlive 
 * @param {Number} numLivingNeighbors 
 */
function conway(isAlive, numLivingNeighbors) {
  return isAlive
    ? numLivingNeighbors === 2 || numLivingNeighbors === 3
    : numLivingNeighbors === 3
}

/**
 * Given a present board, a future board, and a rule set, apply
 * the rules to the present and modify the future.
 * 
 * @param {Board} present 
 * @param {Board!} future (is mutated)
 * @param {(Boolean, Int) -> Boolean} rules (default: conway)
 */
function tick(present, future, rules=conway) {
  // This, sadly, drops our typed array on the floor:
  //
  // future.cells = present.cells
  //   .map((cell, index) => rules(...))
  // for (let)

  // Looping over row, col
  for (let r = 0; r < future.height; ++r) {
    for (let c = 0; c < future.width; ++c) {
      var coord = [r, c]
      future.set(
        coord,
        rules(present.get(coord),
              present.livingNeighbors(coord)))
    }
  }

  // Or we could loopi over indexes and reverse
  // to a coordinate:
  //
  // future.cells.forEach((isAlive, index) => {
  //   var coord = future.coordFor(index)
  //   future.set(
  //     future.coordFor(index),
  //     rules(present.get(coord),
  //           present.livingNeighbors(coord)))
  // })

  return [future, present]
}
