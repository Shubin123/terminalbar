const { ipcRenderer } = require('electron');
const { Terminal } = require('@xterm/xterm');
const { FitAddon } = require('@xterm/addon-fit');
const { spawn } = require('child_process');
// const {hook} = require()

const term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

document.addEventListener('DOMContentLoaded', () => {
  const terminalElement = document.getElementById('terminal');
  if (terminalElement) {
    term.open(terminalElement);
    fitAddon.fit();
    term.focus();

    const shell = spawn('bash', [], { env: process.env, shell: true });


    term.onData(data => {

        term.write(data);
        simpleShell(data);
    
    //   Handle carriage return (Enter key)
    //   console.log(data)
    if (data === '\r') {
        shell.stdin.write('\n');
    } 

      // // // Handle backspace/delete key
      if (data === '\x7F') {
        // term.write('\n');


        console.log(data)
      } 
 
      // // For other data, write it directly to the shell
      else {
        // console.log(data);
        shell.stdin.write(data);

      }


    });

    shell.stdout.on('data', data => {

      term.write(data);
      updateTouchBar(data.toString());


    });

    shell.stderr.on('data', data => {
      term.write(data);
      updateTouchBar(data.toString());

    });

    shell.on('error', (error) => {
      console.error('Shell error:', error);
    });

    shell.on('close', (code) => {
      console.log(`Shell process exited with code ${code}`);
    });

    term.write('Welcome to terminalbar!\r\n');

    window.addEventListener('resize', () => {
      fitAddon.fit();
    });

    // shell.stdin.write('ls\n');
  }
});

function updateTouchBar(data) {
  const touchBarText = data
  console.log('Updating TouchBar:', touchBarText);
  ipcRenderer.send('update-touchbar', { text: touchBarText });
}



function getAllMethods(object) {
  return Object.getOwnPropertyNames(object).filter(function (property) {
    return typeof object[property] == 'function';
  });
}



let lineBuffer = [];
let history = [];
let shellListener = null;
let offset = 0;

async function simpleShell(data) {
    // string splitting is needed to also handle multichar input (eg. from copy)
    // for (let i = 0; i < data.length; ++i) {
        const c = data;
        const i = 0;
        if (c === '\r') {  // <Enter> was pressed case
            offset = 0;
            term.write('\r\n');
            console.log(lineBuffer);

        
        } else if (c === '\x7F') {  // <Backspace> was pressed case
            if (lineBuffer.length) {
                if (offset === 0) {
                    lineBuffer.pop();
                    term.write('\b \b');
                }
                else if (offset < 0 && Math.abs(offset) !== lineBuffer.length) {
                    var insert = "";

                    for (var ci = lineBuffer.length + offset; ci < lineBuffer.length; ci++) {
                        insert += lineBuffer[ci];
                    }

                    lineBuffer.splice(lineBuffer.length + offset - 1, 1);

                    var lefts = "";
                    
                    for (var ci = 0; ci < insert.length; ci++) {
                        lefts += '\x1b[1D';
                    }
                    
                    var termInsert = '\b \b' + insert + ' ' + '\b \b' + lefts;
                    term.write(termInsert);
                }
            }
        } else if (['\x1b[A', '\x1b[B', '\x1b[C', '\x1b[D'].includes(data.slice(i, i + 3))) {  // <arrow> keys pressed
            if (data.slice(i, i + 3) === '\x1b[A') {
                // UP pressed, select backwards from history + erase terminal line + write history entry
            } else if (data.slice(i, i + 3) === '\x1b[B') {
                // DOWN pressed, select forward from history + erase terminal line + write history entry
            }
            else if (data.slice(i, i + 3) === '\x1b[C') {
                if (offset < 0) {
                    term.write('\x1b[1C');
                    offset++;
                }
            }
            else if (data.slice(i, i + 3) === '\x1b[D') {
                if (Math.abs(offset) < lineBuffer.length) {
                    term.write('\x1b[1D');
                    offset--;
                }
            }

            i += 2;
        } else {  // push everything else into the line buffer and echo back to user
            
            var insert = "";
            insert += c;

            for (var ci = lineBuffer.length + offset; ci < lineBuffer.length; ci++) {
                insert += lineBuffer[ci];
            }

            var shift = "";
            
            if (offset < 0) {
                for (var ci = lineBuffer.length + offset; ci < lineBuffer.length; ci++) {
                    shift += "\x1b[1D";
                }
            }
            
            if (offset === 0) {
                lineBuffer.push(c);   
            }
            else if (offset < 0) {
                lineBuffer.splice(lineBuffer.length + offset, 0, c);
            }
            
            var termInsert = insert;
            
            if (offset < 0) {
                termInsert += shift;
            }
            
            term.write(termInsert);
        }
    // }
}