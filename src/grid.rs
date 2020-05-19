extern crate rand;
use rand::{thread_rng, Rng};

use std::fmt::{Display, Formatter, Result};

#[derive(Clone)]
pub struct Grid {
    pub grid: Vec<Vec<u8>>,
}

impl PartialEq for Grid{

    fn eq(&self, other: &Self) -> bool{

        for row in 0..9{

            for col in 0..9{

                if self.grid[row][col] != other.grid[row][col]{

                    return false;

                }

            }

        }

        true

    }

}

impl Display for Grid{

    fn fmt(&self, f: &mut Formatter) -> Result{

        for row in 0..9{

            write!(f, "[").expect("Error writing to buffer");

            for col in 0..9{

                write!(f, "{}, ", self.grid[row][col]).expect("Error writing to buffer");

            }

            write!(f, "]\n").expect("Error writing to buffer");

        }

        write!(f, "")

    }

}

impl Grid{

    pub fn is_full(&self) -> bool{

        for row in 0..9{

            for col in 0..9{

                if self.grid[row][col] == 0{

                    return false;

                }

            }

        }

        true

    }

}



pub fn generate_grid(number_of_visible: u8) -> Grid {

    let mut template = generate_row_template();
    // let mut template: Vec<u8> = vec![1,2,3,4,5,6,7,8,9];

    let mut grid: Vec<Vec<u8>> = vec![];

    for _ in 0..3{

        for block in 0..3{

            grid.push(template.clone());

            if block != 3{

                let mut last_block: Vec<u8> = template[6..].into();
                
                let mut first_two_blocks: Vec<u8> = template[..6].into();

                last_block.reverse();
                
                for cell in &last_block{

                    first_two_blocks.insert(0, *cell);

                }

                template = first_two_blocks;

            }

        }

        let last_cell = template[8];

        template = template[..8].into();

        template.insert(0, last_cell);

    }

    clear_random_cells(&mut grid, number_of_visible);

    Grid{
        grid: grid,
    }

}

fn generate_row_template() -> Vec<u8>{

    let mut random_generator = thread_rng();

    let mut vector: Vec<u8> = vec![];

    let mut value: u8;

    for _ in 0..9{

        value = random_generator.gen_range(1, 10); // 1-9 inclusive

        // Ensures the generated number is unique in the vector
        while vector.iter().filter(|&n| *n == value).count() >= 1 {

            value = random_generator.gen_range(1, 10); // 1-9 Inclusive

        }
            
        vector.push(value);

    }

    vector
}

fn clear_random_cells(grid: &mut Vec<Vec<u8>>, number_of_visible: u8){

    struct Coordinate{ x: usize, y: usize }

    impl PartialEq for Coordinate{
        fn eq(&self, other: &Self) -> bool{
            self.x == other.x && self.y == other.y
        }
    }

    let mut coordinates: Vec<Coordinate> = vec![];

    let mut random_generator = thread_rng();

    for _ in 0..number_of_visible{

        let mut generated_coordinate = Coordinate{
            x: random_generator.gen_range(0, 9), // 0-8 inclusive
            y: random_generator.gen_range(0, 9), // 0-8 inclusive
        };

        while coordinates.contains(&generated_coordinate){

            generated_coordinate = Coordinate{
                x: random_generator.gen_range(0, 9), // 0-8 inclusive
                y: random_generator.gen_range(0, 9), // 0-8 inclusive
            };

        }

        coordinates.push(generated_coordinate);

    }

    for row in 0..9{

        for col in 0..9{

            if !coordinates.contains(&Coordinate{ x: col, y: row }){

                grid[row][col] = 0;

            }

        }

    }

}