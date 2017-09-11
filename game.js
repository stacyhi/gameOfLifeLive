var mainElement = document.getElementById('main')
if (mainElement) {
  var game = Life(mainElement)

  document.getElementById('step_btn')
    .addEventListener('click', () => game.step())
  document.getElementById('play_btn')
    .addEventListener('click', game.togglePlaying)
  document.getElementById('clear_btn')
    .addEventListener('click', game.clear)
  document.getElementById('reset_btn')
    .addEventListener('click', game.random)
}

function Life(container, width=12, height=12) {
  var present = new Board(width, height);
  var future = new Board(width, height);

  var table = createTable();
  container.appendChild(table);

  //default cells
  [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]].forEach(el => {
    present.setAlive(el);
    paint()
  })

  table.addEventListener('mousedown', toggleCellFromEvent)

  function createTable() {
    var table = document.createElement('table');       // <table
    table.classList.add('board')
    table.cells = [];                       //   class='board'>
    for (var r = 0; r < height; r++) {
      var tr = document.createElement('tr');           //   <tr>
      for (var c = 0; c < width; c++) {                //     For instance, at r=2, c=3:
        var td = document.createElement('td');         //     <td
        td.id = `${r}-${c}`                            //       id="2-3">
        td.coord = [r, c];
        tr.appendChild(td);                            //     </td>
        table.cells.push(td)
    }
      table.appendChild(tr);                           //   </tr>
    }                                                  //  </table>
    return table
  }

  function toggleCellFromEvent(event) {
    present.toggle(event.target.coord)
    paint()
  }

  function paint() {
    table.cells.forEach(function(el) {
      if (present.get(el.coord)) el.classList.add('alive');
      else el.classList.remove('alive');
    });
  }

  function step(rules) {
    [present, future] = tick(present, future, rules);  // tick is from board.js
    paint();
  }
  var playInterval = null;
  var playbtn = document.getElementById('play_btn');
  function play() {
    if (!playInterval) {
      playInterval = setInterval(step,500);
    }
    playbtn.textContent = 'Pause';
  }

  function stop() {
    clearInterval(playInterval);
    playInterval = null;
    playbtn.textContent = 'Play';
  }

  function togglePlaying() {
    if (playInterval) stop();
    else play();
  }

  function clear() {
    step(function(){return false});
    stop();
  }

  function random() {
    step(function() {return Math.random() <= 0.2});
    play();
  }

  return {play, step, stop, togglePlaying, random, clear}
};
