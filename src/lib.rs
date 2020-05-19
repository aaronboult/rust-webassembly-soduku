mod utils;
mod grid;
mod solver;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn generate_grid(visible_cells: u8, unique_solution: bool) -> Vec<u8>{

    let mut soduku_grid = grid::generate_grid(visible_cells);

    let mut solutions = solver::solve(&soduku_grid, unique_solution);

    while solutions.is_err(){

        soduku_grid = grid::generate_grid(visible_cells);
        
        solutions = solver::solve(&soduku_grid, unique_solution);

    }

    let mut compressed_grid: Vec<u8> = vec![];

    for mut row in soduku_grid.grid{

        compressed_grid.append(&mut row);

    }

    for sol in solutions.unwrap(){

        for mut row in sol.grid{

            compressed_grid.append(&mut row);

        }

    }

    // The grid is compressed into a single vector of unsigned
    // 8 bit integers. The grid and all solutions can be read
    // again by reading the intergers in groups of 9, forming rows,
    // then repeating this 9 times to form a grid.
    compressed_grid

}