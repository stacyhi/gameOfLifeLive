# Game of Life

* [Learning Objectives](#learning-objectives)
* [Overview](#overview)
    - [What is the Game of Life?](#what-is-the-game-of-life)
    - [How to play the game](#how-to-play-the-game)
* [Board model](#board-model)
    - [`conway`](#conway)
    - [`tick`](#tick)
* [View Controller](#view-controller)
    - [Table](#table)
    - [Control panel](#control-panel)
    - [`step`](#step)
    - [`paint`](#paint)
    - [`play`, `stop`, `togglePlaying`](#play-stop-toggleplaying)
    - [`clear` and `random`](#clear-and-random)
    - [Tips](#tips)
* [Bonus](#bonus)
    - [Shape Loader](#shape-loader)
* [Conclusion](#conclusion)

## Learning Objectives
   * Read and write grid data in a 1D array
   * Implement a cell reducer for a cellular automata
   * Manipulate DOM elements to match the state of a model
   * [Attach events to DOM elements](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
   * Use intervals to manage animations
   * Using [Event.target](https://developer.mozilla.org/en-US/docs/Web/API/Event/target) to handle events via bubbling
   * [Default arguments](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
   * [Array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

## Overview
We are going to program a JavaScript version of the Game of Life. Along the way, we'll continue learning and practicing functional programming, DOM manipulation, and more.

**To run the tests:**
> testem

**To view the game:**
Open index.html in your browser.

### What is the Game of Life?
[Conway's Game of Life](http://en.wikipedia.org/wiki/Conway's_Game_of_Life) is a set of rules governing the destruction, persistence, or propagation of neighboring cells in a grid — a pseudo-simulation of life. It was created by John Horton Conway in 1970, in an effort to simplify a concept by the mathematician John von Neumann in the 1940s. The intent and power of the game is not in realistically simulating life, but rather in serving as a simple system that produces complex behavior. In fact, the Game of Life is a [universal Turing machine](http://en.wikipedia.org/wiki/Turing_machine), capable of modeling any algorithmic calculation.

Here is an [example video](http://www.youtube.com/watch?v=C2vgICfQawE) showing many of the complex patterns that the Game of Life can produce.

### How to play the game
The game of life is played on a 2D board (easily modeled as an array), where each cell has two possible states: *living* or *dead*. For each iteration of the board state, the destiny of each cell is determined by these four rules:

  1. Any live cell with two or three live neighbors lives on to the next generation.
  2. Any live cell with fewer than two live neighbors dies, as if caused by under-population.
  3. Any live cell with more than three live neighbors dies, as if by overcrowding.
  4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

The initial pattern constitutes the *seed* of the system. The first generation is created by applying the above rules simultaneously to every cell in the seed — in other words, each generation is a pure function of the preceding one. The discrete moment at which all the births and deaths actually occur is often called a *tick*. The rules are applied repeatedly to create further generations (one new generation per tick).

## Board model
For this workshop, we're going to store the board in a 1D typed array. This may seem strange, given
that the board is conceptually 2D. For instance, why not do this?

```javascript
// Not what we're doing:
var notOurBoard = [[0, 1, 0],
                   [0, 0, 1],
                   [1, 1, 1]]
```

We could, but there are some drawbacks to this approach. Initializing an array of arrays is harder
than initializing a 1D array. Also, importantly, a 1D typed array provides about the most efficient
memory access you can get in Javascript. So our board will be laid out more like this:

```javascript
 var board = [0, 1, 0,
              0, 0, 1,
              1, 1, 1]
 ```

If you know the width and height of the board, you can map a coordinate `[row, col]`
to a 1D index. It would be cumbersome to do this manually everywhere we touch the board, so
we're going to write a little class to handle those operations.

We've started it for you in [board.js](board.js). The tests are in [board.test.js](board.test.js)—you'll
want to run `testem` and use those tests to guide your work.

### `conway`
The `conway` function is where we actually define the rules of our game of life. `conway` is a function that operates on a single cell. It takes two parameters: the cell's current state, and its living neighbors, and it returns the cell's next state:

```javascript
// conway(isAlive: Boolean, numLivingNeighbors: Int) -> isAlive: Boolean
function conway(isAlive, numLivingNeighbors) { ... }
```

There's something a little recursive about this function. It both takes and returns `isAlive`,
suggesting that we might want to feed its output back into its input.

I'm calling this out because you're going to see functions with the general form `(state, input) -> state`
over and over again. They are known as *reducers*, and they are one of the fundamental building
blocks of functional programming.

### `tick`
You'll notice that the `tick` function in [board.js](board.js) takes a `rules` argument, whose
default value is `conway`:

```javascript
function tick(present, future, rules=conway) { ... }
```

This pattern abstracts away the rules from the thing that applies the rules, making the `tick`
function more generally useful than it would otherwise be. In particular, we might describe operations
like randomizing and clearing the board in terms of different rules.

## View Controller

`game.js` contains logic to manipulate the view—that is, the HTML elements on the page. There
are no tests for this, because the tests would end up being fairly opaque.

### Table
We've already provided you with some code that creates a `<table>` of the appropriate size, puts it
on the page, and listens for mousedown events.

You'll need to fix `toggleCellFromEvent` to figure out which actual cell was tapped and toggle that
cell. Right now, we always toggle the state of the cell at (0,0).

Until you write `paint`, it won't be immediately obvious what's going on. You might want to add some `console.log`s to get a sense of what's happening.

### Control Panel
The starting point provides a control panel with five buttons:

  * Step
  * Play
  * Pause
  * Reset Random
  * Clear

You need to implement all five of these actions for the game. Step is wired up, but the others aren't yet.

### `step`

The game must evolve, visually, step by step. The `step` function has been provided for you in `game.js`,
but I want us to look at it for a moment. Step calls `tick`, and then does something very strange with the return value:

```javascript
[present, future] = tick(present, future)
```

This is a [destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment). We are capturing the return value of `tick` into the local variables `present`
and `future`. We could write it out long form like so:

```javascript
var result = tick(present, future)
present = result[0]
future = result[1]
```

Here's the order in which things happen:

  1. `tick` is called. `tick` reads from `present`, applies `rules` (unspecified, so we use the `conway` rules), and writes to `future`.
  2. `tick` returns `[future, present]`
  3. We use destructuring to assign `[present, future]` to the return value of `tick`, which
     is `[future, present]`. **This swaps the board buffers.**

The buffer swap is important. The `step` function *advances time*. After `tick` is called, what was future is now present. And what was present is now irrelevant, so we can repurpose it as `future`. Its contents are irrelevant—it's just a big blank slate where we can store the data for the next tick.

This technique, called [*double-buffering*](https://en.wikipedia.org/wiki/Multiple_buffering#Double_buffering_in_computer_graphics), allows us to avoid allocating an endless series of arrays to hold board data. Instead, we only allocate two, and swap between them.

At the end of `step`, `present` represents the current state of the game, which we want to display on the DOM.

### `paint`
Up to this point, our game has, visually, been pretty sad. `paint` is going to change that. This function
takes whatever is in `present`—the current state of the game—and adjusts the DOM to match it.

You can take a few approaches to this. You might find all the `<td>` elements under the `<table>`, and
ensure that they have the `alive` class if and only if their `coord` is alive in the `present`.

Querying for all the `<td>`s is kindof expensive though, so you may alternately decide to hold on to them
in an array when we create them in `createTable`.

There are other approaches, of course.

### `play`, `stop`, `togglePlaying`
Once you have a working step function, you should fill in the `play` function to run `step` every 100 milliseconds or so. You can make this time variable if you want to check the evolution of the game. `stop`
should stop playing if we already are, and `togglePlaying` should start us if we're stopped, and stop us if
we're started.

### `clear` and `random`
Remember how `tick` takes a `rules` argument? Can you describe clearing the board or randomizing the board
as a `rules` function?

### Tips
A number of things to keep in mind as you work on the view controller:

- Be careful with what `this` might be for any given function invocation. It is advised that you `console.log(this)` before you try to use it in a new function to ensure it is what you expect it to be.

- Based on the rules of the game (amount of alive neighbors), cells will change their state. They, however, *should not* change their state until _after_ you've computed alive neighbors for all other cells on the board. If you switch a cell's state too soon, you will be essentially corrupting the intended next generation for the cells around it.

- If you set up a horizontal line of 3 alive cells, the next step of this shape would be a vertical line of 3 alive cells. Each step should toggle this shape back and forth. This shape is known as a ["Blinker"](https://upload.wikimedia.org/wikipedia/commons/9/95/Game_of_life_blinker.gif) and is a very useful shape to test with in order to know if your generations are working correctly.

- Every time you save your code and refresh, you may find yourself having to click on a bunch of cells in order to test if your step function produces the next generation in an expected way. Consider temporarily putting a few lines into one of your initialization functions (`createAndShowBoard`, `setupBoardEvents`) that will set the status of a particular set of cells to alive so you don't have to spend the time clicking yourself.

## Bonus

### Shape loader
How many interesting "starting positions" were you able to come up with with your pair partner?

Turns out that there are tons of really cool starting positions that others have developed and shared with us. One large resource of these is [this website](http://www.bitstorm.org/gameoflife/lexicon/). Different starting positions are available to download in the `.cells` files, where dots represent "dead cells" and 0's represent alive cells.

For example, the Acorn pattern:
![Acorn pattern](http://www.bitstorm.org/gameoflife/lexicon/cells/acorn.png)
is described in a file [acorn.cells](http://www.bitstorm.org/gameoflife/lexicon/cells/acorn.cells) as:
```
!Name: acorn
!
.O.....
...O...
OO..OOO
```

You can also check out the GOL wiki [here](http://conwaylife.com/wiki/Main_Page) and download hundreds of known pattern files as a zip.

1. Download some interesting looking `.cells` files, and load them into your app as JS strings (note that you can open the `.cells` file in your editor, just like any other text file). You can load your .cells file content to your JS manually for now (meaning manually copy-paste patterns into your code, maybe as an array of starting patterns?).
1. Add an upload button.
1. Wire it up to a function that reads an uploaded starting pattern into your app so you can play them in your Game of Life engine.

Check out the first couple sections of the Mozilla docs' [guide on working with file inputs](https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications). Also, you'll find that the [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) is essential here.

### Canvas

Change the view controller to use a [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) rather than a `<table>` to display the game. You'll need to modify `toggleCellFromEvent`, `createTable`, and `paint` to work with the canvas.

Drawing lots of small things with canvas is generally much faster than drawing them with the DOM.

If you're feeling particularly ambitious, you might use a [`webgl`](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial) canvas context to render the game, rather than a `2d` context. This would be the fastest rendering path by far—with `webgl`, we could upload the
boards to the GPU's memory, and write small programs (shaders) that run on the GPU to draw each cell.

The ultimate conclusion of this approach would be to run the game of life itself on the GPU. This would leave
the CPU almost completely free, and would mean that almost no data is transferred to or from the GPU every
frame. Essentially, after setup, the only thing we'd have to do each frame is tell the GPU, "ok, [go](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays)".

## Conclusion
This workshop is a classic exercise in writing game logic and combining it with DOM manipulation, particularly event listeners, to create a user interface. Keys to success when creating your Game of Life included writing utility functions to keep your code DRY, and the careful application of event listeners (and `this`) to update DOM elements. On top of that, you had even more practice with vanilla Javascript DOM manipulation and functional programming. Whew!

### Main Takeaways
* Conway's Game of Life is one example of a cellular automaton. It has a particular set of rules that govern the state of each cell in a grid, depending on the state of its neighbors.
* In order to write logic to control this particular game play, you must first capture the game state of _each_ cell, and _then_ update them.
* Event listeners/click handlers help to create an interactive user interface, but pay close attention to the value of `this` when using them.
* In general, you should aim for DRY and well-organized code.
