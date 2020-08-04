# rust-webassembly-soduku
A browser based Soduku generator and solver using rust and webassembly.

The purpose of this project is not to be a functional game, rather it demonstrates the limitations of generating unique, solvable puzzles at runtime using the backtracking algorithm.

### Build
Install `wasm-pack` and build with `wasm-pack build --target no-modules`
