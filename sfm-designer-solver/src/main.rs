mod int_set;
mod model;

use model::Solutions;

fn main() {
    let max_size = 10;
    let mut largest = 1;
    println!("// DO NOT EDIT.");
    println!("// This file was automatically generated by sfm-designer-solver.");
    println!("//");
    println!("// Each key in the solution is the number of reflections in the interferometer.");
    println!("const SOLUTIONS = {{");
    for size in 2..=max_size {
        let solutions = Solutions::find_starting_at(size, largest);
        println!("  {}: [", size);
        solutions.iter().enumerate().for_each(|(index, lengths)| {
            println!(
                "    {{ value: {}, solution: {:?}, name: '{:?}' }},",
                index,
                lengths.lengths().as_slice(),
                lengths.lengths().as_slice(),
            )
        });
        println!("  ],");
        if let Some(new_largest) = solutions
            .iter()
            .filter_map(|lengths| lengths.lengths().iter().max())
            .max()
        {
            largest = *new_largest;
        }
        largest = largest.max(size);
    }
    println!("}};");
    println!();
    println!("export default SOLUTIONS;");
}
