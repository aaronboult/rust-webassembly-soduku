use crate::grid::*;

pub fn solve(grid: &Grid, unique_solution: bool) -> Result<Vec<Grid>, bool>{

    let mut number_of_solutions = 0;

    let mut solutions: Vec<Grid> = vec![];
    
    if try_fill(&mut grid.clone(), &mut number_of_solutions, &mut solutions, unique_solution){

        return Err(true);

    }

    Ok(solutions)

}

fn try_fill(grid: &mut Grid, number_of_solutions: &mut usize, solutions: &mut Vec<Grid>, unique_solution: bool) -> bool{

    for row in 0usize..9usize{

        for col in 0usize..9usize{

            if grid.grid[row][col] == 0{

                for current in 1..=9{ // 1-9 inclusive

                    if check_axis(grid, row, col, current) && check_square(grid, row, col, current){

                        grid.grid[row][col] = current;

                        let halt = try_fill(grid, number_of_solutions, solutions, unique_solution);

                        if halt{

                            return true;

                        }

                        grid.grid[row][col] = 0;

                    }

                }

                return false;

            }

        }

    }

    if !solutions.contains(&grid) && grid.is_full(){

        if unique_solution{

            if *number_of_solutions == 1{
    
                return true;
    
            }

        }
        
        *number_of_solutions += 1;

        solutions.push(grid.clone());

    }

    false

}

fn check_axis(grid: &Grid, row: usize, col: usize, value: u8) -> bool{

    if grid.grid[row].contains(&value){

        return false;

    }

    for row_index in 0..9{

        if grid.grid[row_index][col] == value{

            return false;

        }

    }

    true

}

fn check_square(grid: &Grid, row: usize, col: usize, value: u8) -> bool{

    let square_start_row = row - (row % 3);

    let square_start_col = col - (col % 3);

    for row_offset in 0..3{

        for col_offset in 0..3{

            if grid.grid[square_start_row + row_offset][square_start_col + col_offset] == value{

                return false;

            }

        }

    }

    true

}